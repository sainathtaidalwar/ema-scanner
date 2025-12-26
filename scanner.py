import ccxt.async_support as ccxt
import pandas as pd
import numpy as np
import time
import sys
from datetime import datetime
import asyncio

# --- Configuration ---
TOP_N_COINS = 75  # Scan top volume coins
TIMEFRAMES = {'4h': '4h', '1h': '1h', '15m': '15m'}
EMA_PERIODS = [21, 50, 100]
RSI_PERIOD = 14
ADX_PERIOD = 14

def get_binance_client_sync():
    # Helper for synchronous tasks (like fetching pairs initially) if needed
    import ccxt as ccxt_sync
    return ccxt_sync.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'future'}
    })

def fetch_top_volume_pairs(client_sync, limit=TOP_N_COINS):
    try:
        tickers = client_sync.fetch_tickers()
        usdt_pairs = {s: t for s, t in tickers.items() if '/USDT' in s and t['quoteVolume'] is not None}
        sorted_pairs = sorted(usdt_pairs.values(), key=lambda x: x['quoteVolume'], reverse=True)
        return [p['symbol'] for p in sorted_pairs[:limit]]
    except Exception as e:
        print(f"Error fetching top pairs: {e}")
        return []

# Optimized: Only calculate indicators if needed
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

async def fetch_ohlcv_async(client, symbol, timeframe, limit=150):
    try:
        ohlcv = await client.fetch_ohlcv(symbol, timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except Exception as e:
        print(f"Error fetching {timeframe} for {symbol}: {e}")
        return None

async def check_conditions_async(client, symbol, config):
    # print(f"Checking {symbol}...") # Debug
    
    result = {
        'Symbol': symbol,
        'Side': 'NEUTRAL',
        '4H EMA Stack': 'FAIL',
        '1H EMA Stack': 'FAIL',
        '15m EMA Stack': 'FAIL',
        'Pass': False
    }

    # --- STEP 1: 4H Timeframe (Fail Fast) ---
    df_4h = await fetch_ohlcv_async(client, symbol, '4h')
    if df_4h is None: 
        # print(f"{symbol} 4H fetch failed")
        return None
    
    # ... rest of logic ...

    df_4h['ema21'] = calculate_ema(df_4h['close'], 21)
    df_4h['ema50'] = calculate_ema(df_4h['close'], 50)
    df_4h['ema100'] = calculate_ema(df_4h['close'], 100)
    
    curr_4h = df_4h.iloc[-1]
    
    long_4h = (curr_4h['ema21'] > curr_4h['ema50'] > curr_4h['ema100']) and (curr_4h['close'] > curr_4h['ema21'])
    short_4h = (curr_4h['ema21'] < curr_4h['ema50'] < curr_4h['ema100']) and (curr_4h['close'] < curr_4h['ema21'])

    if long_4h:
        result['Side'] = 'LONG'
        result['4H EMA Stack'] = 'PASS'
    elif short_4h:
        result['Side'] = 'SHORT'
        result['4H EMA Stack'] = 'PASS'
    else:
        # print(f"{symbol} 4H Trend Failed")
        return None # FAIL FAST


    # --- STEP 2: 1H Timeframe (Fail Fast) ---
    df_1h = await fetch_ohlcv_async(client, symbol, '1h')
    if df_1h is None: return None

    df_1h['ema21'] = calculate_ema(df_1h['close'], 21)
    df_1h['ema50'] = calculate_ema(df_1h['close'], 50)
    curr_1h = df_1h.iloc[-1]
    
    if result['Side'] == 'LONG':
        if not (curr_1h['ema21'] > curr_1h['ema50']): return None
    elif result['Side'] == 'SHORT':
        if not (curr_1h['ema21'] < curr_1h['ema50']): return None
    
    result['1H EMA Stack'] = 'PASS'


    # --- STEP 3: 15m Timeframe (Final Check) ---
    df_15m = await fetch_ohlcv_async(client, symbol, '15m')
    if df_15m is None: return None

    df_15m['ema21'] = calculate_ema(df_15m['close'], 21)
    df_15m['ema50'] = calculate_ema(df_15m['close'], 50)
    
    # Calc indicators only if we made it this far
    df_15m['rsi'] = calculate_rsi(df_15m['close'], RSI_PERIOD)
    adx, plus_di, minus_di = calculate_adx(df_15m, ADX_PERIOD)
    df_15m['adx'] = adx
    df_15m['plus_di'] = plus_di
    df_15m['minus_di'] = minus_di
    
    curr_15m = df_15m.iloc[-1]

    if result['Side'] == 'LONG':
        if not ((curr_15m['ema21'] > curr_15m['ema50']) and (curr_15m['close'] > curr_15m['ema50'])):
            return None
    elif result['Side'] == 'SHORT':
        if not ((curr_15m['ema21'] < curr_15m['ema50']) and (curr_15m['close'] < curr_15m['ema50'])):
            return None

    result['15m EMA Stack'] = 'PASS'

    # --- Optional Filters ---
    result['RSI (15m)'] = round(curr_15m['rsi'], 2)
    result['ADX (15m)'] = round(curr_15m['adx'], 2)
    
    # RSI
    if config.get('use_rsi'):
        if result['Side'] == 'LONG' and result['RSI (15m)'] <= 50: return None
        if result['Side'] == 'SHORT' and result['RSI (15m)'] >= 50: return None

    # ADX
    if config.get('use_adx'):
        if result['ADX (15m)'] <= 20: return None
        if result['Side'] == 'LONG' and not (curr_15m['plus_di'] > curr_15m['minus_di']): return None
        if result['Side'] == 'SHORT' and not (curr_15m['minus_di'] > curr_15m['plus_di']): return None

    result['Pass'] = True
    return result

async def scan_market_async(symbols, config=None):
    if config is None:
        config = {'use_rsi': False, 'use_adx': False}
    
    # Initialize Async Client
    client = ccxt.binance({
        'enableRateLimit': True,
        'options': {'defaultType': 'future'}
    })
    
    tasks = []
    # Create tasks for all symbols
    for sym in symbols:
        tasks.append(check_conditions_async(client, sym, config))
        
    print(f"Scanning {len(symbols)} pairs asynchronously...")
    
    results = []
    # Gather results concurrently
    # return_exceptions=True prevents one error from killing others
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    for res in responses:
        if isinstance(res, dict) and res.get('Pass'):
            results.append(res)
        # We silently ignore Nones (failed checks) and Exceptions (errors)
            
    await client.close()
    return results

def main():
    # Fix for Windows AsyncIO Loop
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    print("Initializing Binance Client (Sync for Setup)...")
    client_sync = get_binance_client_sync()
    pairs = fetch_top_volume_pairs(client_sync)
    print(f"Fetched {len(pairs)} pairs.")
    
    config = {'use_rsi': False, 'use_adx': False}
    
    start = time.time()
    # Run Async Loop
    results = asyncio.run(scan_market_async(pairs, config))
    end = time.time()
    
    print(f"Scan completed in {end - start:.2f} seconds.")
    
    if not results:
        print("No pairs found.")
        return

    df_res = pd.DataFrame(results)
    df_res = df_res.sort_values(by=['Side', 'Symbol'], ascending=[True, True])
    final_cols = ['Symbol', 'Side', '4H EMA Stack', '1H EMA Stack', '15m EMA Stack', 'RSI (15m)', 'ADX (15m)']
    
    print("\n" + "="*80)
    print("EMA TREND SCANNER RESULTS")
    print("="*80)
    print(df_res[final_cols].to_string(index=False))
    print("="*80)

if __name__ == "__main__":
    main()
