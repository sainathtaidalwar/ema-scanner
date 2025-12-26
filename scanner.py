import ccxt.async_support as ccxt
import pandas as pd
import numpy as np
import time
import sys
import asyncio

# --- Configuration ---
# Increased to 300 to support EMA 200 and Volume MA 30 accurately
CANDLE_LIMIT = 300 
TIMEFRAMES = {'4h': '4h', '1h': '1h', '15m': '15m'}

def get_binance_client_sync():
    import ccxt as ccxt_sync
    return ccxt_sync.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'future'}
    })

def fetch_top_volume_pairs(client_sync, limit=75):
    try:
        tickers = client_sync.fetch_tickers()
        usdt_pairs = {s: t for s, t in tickers.items() if '/USDT' in s and t['quoteVolume'] is not None}
        sorted_pairs = sorted(usdt_pairs.values(), key=lambda x: x['quoteVolume'], reverse=True)
        return [p['symbol'] for p in sorted_pairs[:limit]]
    except Exception as e:
        print(f"Error fetching top pairs: {e}")
        return []

# --- Optimized Indicator Functions ---

def calculate_ema(series, span):
    return series.ewm(span=span, adjust=False).mean()

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_adx(df, period=14):
    plus_dm = df['high'].diff()
    minus_dm = df['low'].diff()
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm > 0] = 0
    
    tr1 = pd.DataFrame(df['high'] - df['low'])
    tr2 = pd.DataFrame(abs(df['high'] - df['close'].shift(1)))
    tr3 = pd.DataFrame(abs(df['low'] - df['close'].shift(1)))
    frames = [tr1, tr2, tr3]
    tr = pd.concat(frames, axis=1, join='inner').max(axis=1)
    atr = tr.ewm(alpha=1/period, adjust=False).mean()
    
    plus_di = 100 * (plus_dm.ewm(alpha=1/period, adjust=False).mean() / atr)
    minus_di = 100 * (abs(minus_dm).ewm(alpha=1/period, adjust=False).mean() / atr)
    
    dx = (abs(plus_di - minus_di) / abs(plus_di + minus_di)) * 100
    adx = dx.ewm(alpha=1/period, adjust=False).mean()
    return adx, plus_di, minus_di

def calculate_rvol(df, period=30):
    # RVOL = Current Volume / Average Volume of last 30 periods
    avg_vol = df['volume'].rolling(window=period).mean()
    rvol = df['volume'] / avg_vol
    return rvol

def calculate_bb(series, length=20, std=2):
    sma = series.rolling(window=length).mean()
    std_dev = series.rolling(window=length).std()
    upper = sma + (std_dev * std)
    lower = sma - (std_dev * std)
    return upper, sma, lower

def calculate_squeeze(df, length=20, std=2):
    # Bollinger Bands
    upper, middle, lower = calculate_bb(df['close'], length, std)
    
    # Keltner Channels (using ATR) - Simplified Squeeze: just use BB Width percentile or raw width
    # Professional Squeeze often uses BB inside Keltner, but simple BB Width contraction is good proxy
    # Width = (Upper - Lower) / Middle
    bb_width = (upper - lower) / middle
    
    # Check if width is in the lowest X percentile (e.g., dynamic) or below a threshold
    # For this scanner, we will return the width and let the rule decide, 
    # OR we implement a basic "is_squeezing" if width < 0.05 (5% spread)
    return bb_width

# --- Core Async Logic ---

async def fetch_ohlcv_async(client, symbol, timeframe, limit=CANDLE_LIMIT):
    try:
        ohlcv = await client.fetch_ohlcv(symbol, timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except Exception as e:
        # print(f"Error {timeframe} {symbol}: {e}")
        return None

def evaluate_rule(df, rule):
    # rule = { "indicator": "RVOL", "params": {...}, "operator": ">", "value": 1.5 }
    curr = df.iloc[-1]
    
    indic = rule.get('indicator')
    params = rule.get('params', {})
    operator = rule.get('operator')
    val = float(rule.get('value', 0))
    
    measured_val = 0
    
    if indic == 'RVOL':
        period = int(params.get('period', 30))
        rvol_series = calculate_rvol(df, period)
        measured_val = rvol_series.iloc[-1]
        
    elif indic == 'RSI':
        period = int(params.get('period', 14))
        rsi_series = calculate_rsi(df['close'], period)
        measured_val = rsi_series.iloc[-1]
        
    elif indic == 'ADX':
        period = int(params.get('period', 14))
        adx, _, _ = calculate_adx(df, period)
        measured_val = adx.iloc[-1]
        
    elif indic == 'BB_WIDTH': # Squeeze metric
        length = int(params.get('length', 20))
        mult = float(params.get('mult', 2.0))
        bb_width_series = calculate_squeeze(df, length, mult)
        measured_val = bb_width_series.iloc[-1]

    # Evaluation
    # If operator is 'CROSS', it's harder, for now supports > < >= <=
    if operator == '>': return measured_val > val, measured_val
    if operator == '<': return measured_val < val, measured_val
    if operator == '>=': return measured_val >= val, measured_val
    if operator == '<=': return measured_val <= val, measured_val
    
    return False, measured_val

async def check_dynamic_strategy(client, symbol, strategy):
    # strategy = { "rules": [...] }
    result = { 'Symbol': symbol, 'Pass': False, 'Side': 'NEUTRAL' }
    
    # 1. Fetch Standard Data (15m is master for now, could act as Multi-TF later)
    # For V2, we assume the user is scanning on 15m primarily, or we can make it dynamic
    # To keep it simple: We scan 15m for the "Setup"
    df = await fetch_ohlcv_async(client, symbol, '15m', limit=CANDLE_LIMIT)
    if df is None or len(df) < 50: return None

    # 4H Context (Optional, kept for the 'Change' calc and trends if needed)
    df_4h = await fetch_ohlcv_async(client, symbol, '4h', limit=50)

    # 2. Basic Stats
    curr = df.iloc[-1]
    result['Price'] = curr['close']
    
    if df_4h is not None and len(df_4h) >= 7:
        start_price = df_4h.iloc[-7]['close']
        result['24h Change'] = round(((curr['close'] - start_price) / start_price) * 100, 2)
    else:
        result['24h Change'] = 0.0

    # 3. Evaluate Rules
    # If NO rules, we return the default "EMA Stack" logic? 
    # Or we assume the Strategy Builder sent specific rules.
    # Let's support a "Legacy Mode" if 'rules' is empty
    
    rules = strategy.get('rules', [])
    
    if not rules:
        # LEGACY MODE (The strict EMA logic)
        # We can re-implement or just say "No Rules"
        # For safety, let's just return price info if no rules, or implement a default
        result['Pass'] = True
        return result

    # Dynamic Evaluation
    # Default Side inference (naive): if we have a > rule on Price vs EMA, likely Long
    # We will just mark Side as 'SIGNAL' unless rule specifies
    
    all_passed = True
    details = []
    
    for rule in rules:
        passed, val = evaluate_rule(df, rule)
        result[f"{rule['indicator']}"] = round(val, 2)
        if not passed:
            all_passed = False
            # Don't break immediately if we want debug info, but for speed: break?
            # break 
    
    # Heuristic for Side:
    # If 24h change is pos, assume Long bias? 
    # Or let the UI handle "Long/Short" logic?
    # Let's deduce Side from Price vs EMA 50 if present, else 24h change
    ema50 = calculate_ema(df['close'], 50).iloc[-1]
    result['Side'] = 'LONG' if curr['close'] > ema50 else 'SHORT'
    
    if all_passed:
        result['Pass'] = True
        return result
    else:
        return None

async def scan_market_async(symbols, strategy=None):
    if strategy is None: strategy = {}
    
    client = ccxt.binance({'enableRateLimit': False, 'options': {'defaultType': 'future'}})
    
    tasks = [check_dynamic_strategy(client, sym, strategy) for sym in symbols]
    print(f"Scanning {len(symbols)} pairs with Dynamic Engine...")
    
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    await client.close()
    
    results = []
    for res in responses:
        if isinstance(res, dict) and res.get('Pass'):
            results.append(res)
            
    return results

def main():
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    client_sync = get_binance_client_sync()
    pairs = fetch_top_volume_pairs(client_sync)
    
    # Test Payload
    test_strat = {
        "rules": [
            { "indicator": "RVOL", "operator": ">", "value": 1.0 },
            { "indicator": "RSI", "operator": "<", "value": 70 } # Broad filter test
        ]
    }
    
    results = asyncio.run(scan_market_async(pairs, test_strat))
    print(results)

if __name__ == "__main__":
    main()
