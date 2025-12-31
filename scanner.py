import ccxt.async_support as ccxt
import pandas as pd
import numpy as np
import time
import sys
from datetime import datetime, timedelta
import asyncio
import yfinance as yf

# --- Configuration ---
TOP_N_COINS = 75  # Scan top volume coins
TIMEFRAMES = {'4h': '4h', '1h': '1h', '15m': '15m'}
EMA_PERIODS = [21, 50, 100]
RSI_PERIOD = 14
ADX_PERIOD = 14

NIFTY_TOTAL = [
    # NIFTY 50
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
    'LICI.NS', 'LT.NS', 'AXISBANK.NS', 'HCLTECH.NS', 'BAJFINANCE.NS',
    'MARUTI.NS', 'ASIANPAINT.NS', 'SUNPHARMA.NS', 'TITAN.NS', 'ULTRACEMCO.NS',
    'TATASTEEL.NS', 'NTPC.NS', 'POWERGRID.NS', 'M&M.NS', 'TATAMOTORS.NS',
    'ADANIENT.NS', 'BAJAJFINSV.NS', 'ADANIPORTS.NS', 'JSWSTEEL.NS', 'COALINDIA.NS',
    'HDFCLIFE.NS', 'ONGC.NS', 'GRASIM.NS', 'BAJAJ-AUTO.NS', 'TECHM.NS',
    'BRITANNIA.NS', 'WIPRO.NS', 'HEROMOTOCO.NS', 'HINDALCO.NS', 'DRREDDY.NS',
    'CIPLA.NS', 'TATACONSUM.NS', 'BPCL.NS', 'DIVISLAB.NS', 'EICHERMOT.NS',
    'APOLLOHOSP.NS', 'SBILIFE.NS', 'UPL.NS', 'INDUSINDBK.NS',
    # NIFTY NEXT 50 & LIQUID MIDCAPS
    'ZOMATO.NS', 'JIOFIN.NS', 'TRENT.NS', 'HAL.NS', 'BEL.NS', 'VBL.NS',
    'ADANIENSOL.NS', 'ADANIGREEN.NS', 'ADANIPOWER.NS', 'ATGL.NS', 'ABB.NS',
    'SIEMENS.NS', 'DLF.NS', 'PIDILITIND.NS', 'IOC.NS', 'SBICARD.NS',
    'GAIL.NS', 'CHOLAFIN.NS', 'BANKBARODA.NS', 'CANBK.NS', 'PNB.NS',
    'IDFCFIRSTB.NS', 'JINDALSTEL.NS', 'SHRIRAMFIN.NS', 'TVSMOTOR.NS', 'VEDL.NS',
    'HAVELLS.NS', 'AMBUJACEM.NS', 'INDIGO.NS', 'NAUKRI.NS', 'ICICIPRULI.NS',
    'DABUR.NS', 'GODREJCP.NS', 'BERGEPAINT.NS', 'MARICO.NS', 'SRF.NS',
    'MOTHERSON.NS', 'ICICIGI.NS', 'BOSCHLTD.NS', 'MCDOWELL-N.NS', 'ALKEM.NS',
    'LTIM.NS', 'UNIONBANK.NS', 'ABCAPITAL.NS', 'RECLTD.NS', 'PFC.NS',
    'IRCTC.NS', 'POLYCAB.NS', 'AUBANK.NS', 'BHARATFORG.NS', 'ASTRAL.NS',
    'PERSISTENT.NS', 'MRF.NS', 'LTTS.NS', 'CUMMINSIND.NS', 'ASHOKLEY.NS',
    'CONCOR.NS', 'TATACOMM.NS', 'OBEROIRLTY.NS', 'APOLLOTYRE.NS', 'JUBLFOOD.NS',
    'BANDHANBNK.NS', 'IDEA.NS', 'YESBANK.NS', 'IDFC.NS', 'BHEL.NS', 'NMDC.NS',
    'ZEEL.NS', 'GMRINFRA.NS', 'SAIL.NS', 'NATIONALUM.NS', 'HINDPETRO.NS',
    'GUJGASLTD.NS', 'IGL.NS', 'PETRONET.NS', 'MGL.NS', 'BIOCON.NS', 'SYNGENE.NS',
    'LAURUSLABS.NS', 'GLENMARK.NS', 'LUPIN.NS', 'TORNTPHARM.NS', 'ABFRL.NS',
    'BATAINDIA.NS', 'PAGEIND.NS', 'PEL.NS', 'PVRINOX.NS', 'SUNTV.NS',
    'EXIDEIND.NS', 'AMARAJABAT.NS', 'BALKRISIND.NS', 'COFORGE.NS', 'MPHASIS.NS'
]

# --- Exchange Configuration ---
EXCHANGE_CONFIG = {
    'binance': {
        'type': 'future',
        'options': {'defaultType': 'future'}
    },
    'bybit': {
        'type': 'linear',
        'options': {'defaultType': 'linear'} 
    },
    'mexc': {
        'type': 'swap',
        'options': {'defaultType': 'swap'} 
    },
    'nse': {
        'type': 'stock',
        'options': {}
    }
}

def get_exchange_client_sync(exchange_id):
    """Factory for sync clients"""
    import ccxt
    
    if exchange_id not in EXCHANGE_CONFIG:
        raise ValueError(f"Unsupported exchange: {exchange_id}")
        
    config = EXCHANGE_CONFIG[exchange_id]
    
    # Stocks don't use CCXT
    if exchange_id == 'nse':
        return None

    exchange_class = getattr(ccxt, exchange_id)
    
    return exchange_class({
        'enableRateLimit': True,
        'options': config['options']
    })

def fetch_top_volume_pairs_sync(exchange_id='binance', limit=TOP_N_COINS):
    """Fetches top pairs for specific exchange"""
    if exchange_id == 'nse':
        return NIFTY_TOTAL[:limit]

    print(f"DEBUG: Starting fetch_top_volume_pairs_sync for {exchange_id}") # DEBUG
    try:
        client = get_exchange_client_sync(exchange_id)
        
        print(f"DEBUG: Loading markets for {exchange_id}...") # DEBUG
        # Critical for MEXC: specific markets must be loaded first
        client.load_markets() 
        print(f"DEBUG: Markets loaded. Fetching tickers...") # DEBUG
        
        tickers = client.fetch_tickers()
        print(f"DEBUG: Tickers fetched. Count: {len(tickers) if tickers else 'None'}") # DEBUG
        
        # Filtering logic needs to be robust across exchanges
        # Binance/Bybit/MEXC Futures usually have /USDT
        
        quote_currency = 'USDT'
            
        pairs = []
        for symbol, ticker in tickers.items():
            # Robust check: allow 'BTC/USDT' or 'BTCUSDT'
            is_valid_symbol = (f'/{quote_currency}' in symbol or symbol.endswith(quote_currency))
            
            if is_valid_symbol and ticker.get('quoteVolume'):
                pairs.append({'symbol': symbol, 'volume': ticker['quoteVolume']})
                
        # Sort by volume
        sorted_pairs = sorted(pairs, key=lambda x: x['volume'], reverse=True)
        return [p['symbol'] for p in sorted_pairs[:limit]]
        
    except Exception as e:
        print(f"Error fetching top pairs for {exchange_id}: {e}")
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

def fetch_stock_ohlcv(symbol, timeframe):
    """Fetch Stock Data using yfinance with resampling"""
    try:
        # Map timeframe to yfinance arguments
        # yfinance intervals: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
        period = "5d" # Default small period for speed
        interval = "15m"
        
        if timeframe == '4h':
            interval = "1h"
            period = "1mo" # Need more data to resample 4h
        elif timeframe == '1h':
            interval = "1h"
            period = "1mo"
        elif timeframe == '15m':
            interval = "15m"
            period = "1wk" # 1 week of 15m data is enough
            
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            return None
            
        # Clean headers (lowercase)
        df.reset_index(inplace=True)
        df.columns = df.columns.str.lower()
        
        # Ensure UTC timezone naive for consistency or just drop Timezone
        if 'date' in df.columns:
            df.rename(columns={'date': 'timestamp'}, inplace=True)
        elif 'datetime' in df.columns:
             df.rename(columns={'datetime': 'timestamp'}, inplace=True)
             
        # Remove timezone if present
        if pd.api.types.is_datetime64_any_dtype(df['timestamp']):
            df['timestamp'] = df['timestamp'].dt.tz_localize(None)

        # Resample for 4H logic
        if timeframe == '4h':
            # Resample 1H to 4H
            df.set_index('timestamp', inplace=True)
            logic = {'open': 'first', 'high': 'max', 'low': 'min', 'close': 'last', 'volume': 'sum'}
            df = df.resample('4h').agg(logic)
            df.dropna(inplace=True)
            df.reset_index(inplace=True)
            
        return df[['timestamp', 'open', 'high', 'low', 'close', 'volume']]
        
    except Exception as e:
        print(f"YFinance Error {symbol} {timeframe}: {e}")
        return None

async def fetch_ohlcv_async(client, symbol, timeframe, is_stock=False):
    if is_stock:
        # Run blocking yfinance in a thread
        return await asyncio.to_thread(fetch_stock_ohlcv, symbol, timeframe)
        
    # Crypto Logic
    try:
        ohlcv = await client.fetch_ohlcv(symbol, timeframe, limit=150)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except Exception as e:
        # print(f"Error fetching {timeframe} for {symbol}: {e}")
        return None

async def check_conditions_async(client, symbol, config, exchange_id='binance'):
    # print(f"Checking {symbol}...") # Debug
    is_stock = (exchange_id == 'nse')
    
    result = {
        'Symbol': symbol.replace('.NS', ''), # Clean up for UI
        'Exchange': exchange_id, # Source Verification
        'Side': 'NEUTRAL',
        '4H EMA Stack': 'FAIL',
        '1H EMA Stack': 'FAIL',
        '15m EMA Stack': 'FAIL',
        'Pass': False
    }

    # --- STEP 1: 4H Timeframe (Fail Fast) ---
    df_4h = await fetch_ohlcv_async(client, symbol, '4h', is_stock)
    if df_4h is None or len(df_4h) < 20: 
        # print(f"{symbol} 4H fetch failed or not enough data")
        return None
    
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
    df_1h = await fetch_ohlcv_async(client, symbol, '1h', is_stock)
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
    df_15m = await fetch_ohlcv_async(client, symbol, '15m', is_stock)
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

    # --- Setup Type Classification ---
    setup_type = 'MOMENTUM'
    if result['Side'] == 'LONG':
        if curr_15m['close'] < curr_15m['ema21']:
            setup_type = 'PULSE' # Deep pullback into the zone
    elif result['Side'] == 'SHORT':
        if curr_15m['close'] > curr_15m['ema21']:
            setup_type = 'PULSE' # Deep pullback into the zone
            
    result['Type'] = setup_type

    # --- Optional Filters ---
    result['RSI (15m)'] = round(curr_15m['rsi'], 2)
    result['ADX (15m)'] = round(curr_15m['adx'], 2)
    result['Price'] = round(curr_15m['close'], 2)
    
    # Calculate 24h Change
    if len(df_4h) > 6:
        price_24h_ago = df_4h['close'].iloc[-7] 
        change = ((curr_15m['close'] - price_24h_ago) / price_24h_ago) * 100
        result['24h Change'] = round(change, 2)
    else:
        result['24h Change'] = 0.0
    
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

async def scan_market_async(exchange_id, symbols, config=None):
    if config is None:
        config = {'use_rsi': False, 'use_adx': False}
    
    if exchange_id not in EXCHANGE_CONFIG:
        print(f"Invalid exchange: {exchange_id}")
        return []

    client = None
    if exchange_id != 'nse':
        ex_config = EXCHANGE_CONFIG[exchange_id]
        exchange_class = getattr(ccxt, exchange_id)
        client = exchange_class({
            'enableRateLimit': True, 
            'options': ex_config['options']
        })
    
    # Concurrency Control
    concurrency_limit = 20
    if exchange_id == 'mexc':
        concurrency_limit = 6
    elif exchange_id == 'bybit':
        concurrency_limit = 5
    elif exchange_id == 'nse':
        concurrency_limit = 10 # Yahoo can be rate limited
        
    sem = asyncio.Semaphore(concurrency_limit) 

    async def protected_check(sym):
        async with sem:
            if exchange_id == 'mexc':
                await asyncio.sleep(0.5)
            # Add small delay for NSE to avoid Yahoo rate limits?
            if exchange_id == 'nse':
                await asyncio.sleep(0.1)
                
            return await check_conditions_async(client, sym, config, exchange_id)

    tasks = []
    scan_targets = symbols
    
    # Cap Binance/MEXC for safer demo
    if exchange_id == 'binance' and len(symbols) > 100:
        scan_targets = symbols[:100]
    elif exchange_id == 'mexc' and len(symbols) > 75:
        scan_targets = symbols[:75]
        
    for sym in scan_targets:
        tasks.append(protected_check(sym))
        
    print(f"Scanning {len(scan_targets)} pairs on {exchange_id} with concurrency {concurrency_limit}...")
    
    results = []
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    for res in responses:
        if isinstance(res, dict) and res.get('Pass'):
            results.append(res)
            
    if client:
        await client.close()
        
    return results

def main():
    # Fix for Windows AsyncIO Loop
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    print("Initializing Client (Test Mode)...")
    try:
        # Test NSE
        pairs = fetch_top_volume_pairs_sync('nse', limit=10)
        print(f"Fetched {len(pairs)} stock tickers: {pairs}")
        
        config = {'use_rsi': False, 'use_adx': False}
        
        start = time.time()
        results = asyncio.run(scan_market_async('nse', pairs, config))
    except Exception as e:
        print(e)
        return
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
