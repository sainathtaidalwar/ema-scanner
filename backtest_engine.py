import pandas as pd
# import pandas_ta as ta # Removed to avoid import error
import yfinance as yf
import ccxt
import numpy as np

def calculate_ema(series, period):
    return series.ewm(span=period, adjust=False).mean()

def fetch_data_ccxt(symbol, limit=1000):
    print(f"Fetching CCXT data for {symbol}...")
    ex = ccxt.binance()
    ohlcv = ex.fetch_ohlcv(symbol, '15m', limit=limit)
    df_15m = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df_15m['timestamp'] = pd.to_datetime(df_15m['timestamp'], unit='ms')
    df_15m.set_index('timestamp', inplace=True)
    
    # Calculate indicators
    df_15m['ema21'] = calculate_ema(df_15m['close'], 21)
    df_15m['ema50'] = calculate_ema(df_15m['close'], 50)
    
    # Resample for 1H
    logic = {'open': 'first', 'high': 'max', 'low': 'min', 'close': 'last', 'volume': 'sum'}
    df_1h = df_15m.resample('1h').agg(logic).dropna()
    df_1h['ema21'] = calculate_ema(df_1h['close'], 21)
    df_1h['ema50'] = calculate_ema(df_1h['close'], 50)
    
    # Resample for 4H
    df_4h = df_15m.resample('4h').agg(logic).dropna()
    df_4h['ema21'] = calculate_ema(df_4h['close'], 21)
    df_4h['ema50'] = calculate_ema(df_4h['close'], 50)
    df_4h['ema100'] = calculate_ema(df_4h['close'], 100)
    
    return df_15m, df_1h, df_4h

def fetch_data_yf(symbol, period="60d"):
    print(f"Fetching YFinance data for {symbol}...")
    # Fetch 15m data (base)
    # Note: YFinance mostly blocked in cloud environments, use locally.
    try:
        df_15m = yf.download(symbol, interval="15m", period=period, progress=False)
        if df_15m.empty: return None, None, None
        df_15m.columns = df_15m.columns.str.lower()
        if isinstance(df_15m.columns, pd.MultiIndex):
            df_15m.columns = [c[0] for c in df_15m.columns]
        df_15m.rename(columns={'date': 'timestamp', 'datetime': 'timestamp'}, inplace=True)
        # df_15m.set_index('timestamp', inplace=True) # It's already indexed by datetime?
        # Check index
        if 'timestamp' in df_15m.columns:
            df_15m.set_index('timestamp', inplace=True)
            
        df_15m.dropna(inplace=True)

        # Calculate indicators
        df_15m['ema21'] = calculate_ema(df_15m['close'], 21)
        df_15m['ema50'] = calculate_ema(df_15m['close'], 50)
        
        # Resample for 1H
        logic = {'open': 'first', 'high': 'max', 'low': 'min', 'close': 'last', 'volume': 'sum'}
        df_1h = df_15m.resample('1h').agg(logic).dropna()
        df_1h['ema21'] = calculate_ema(df_1h['close'], 21)
        df_1h['ema50'] = calculate_ema(df_1h['close'], 50)
        
        # Resample for 4H
        df_4h = df_15m.resample('4h').agg(logic).dropna()
        df_4h['ema21'] = calculate_ema(df_4h['close'], 21)
        df_4h['ema50'] = calculate_ema(df_4h['close'], 50)
        df_4h['ema100'] = calculate_ema(df_4h['close'], 100)
        
        return df_15m, df_1h, df_4h
    except Exception as e:
        print(f"YFinance Failed: {e}")
        return None, None, None

def run_backtest(symbol):
    if '/' in symbol:
        df_15m, df_1h, df_4h = fetch_data_ccxt(symbol)
    else:
        df_15m, df_1h, df_4h = fetch_data_yf(symbol)
        
    if df_15m is None: 
        print(f"No data for {symbol}.")
        return

    # Align data (merge lower timeframe with higher timeframe state)
    # We use merge_asof 'forward'?? No. 'backward' to avoid lookahead.
    # We want valid 4h candle at T to be available at T (close time).
    # But strictly, at 10:15, the 10:00-14:00 candle is NOT closed.
    # So we should use the PREVIOUS closed candle. shift(1).
    
    df_1h_shifted = df_1h.shift(1) # Uses COMPLETED candle
    df_4h_shifted = df_4h.shift(1) # Uses COMPLETED candle
    
    # Rename columns to avoid ambiguity
    df_1h_shifted.columns = [f"{c}_1h" for c in df_1h_shifted.columns]
    df_4h_shifted.columns = [f"{c}_4h" for c in df_4h_shifted.columns]
    
    # Merge
    # Note: timestamps match or are close. asof merge on index.
    df = pd.merge_asof(df_15m, df_1h_shifted, left_index=True, right_index=True)
    df = pd.merge_asof(df, df_4h_shifted, left_index=True, right_index=True)
    
    df.dropna(inplace=True)
    
    # Run Simulation
    balance = 10000
    position = None # { 'entry': float, 'sl': float, 'tp': float, 'side': 'LONG' }
    trades = []
    
    print(f"Simulating trades on {len(df)} candles...")
    
    for time, row in df.iterrows():
        # Check Exits if in position
        if position:
            if row['low'] <= position['sl']:
                # SL Hit
                exit_price = position['sl'] # Assume filled at SL
                pnl = (exit_price - position['entry']) / position['entry'] * 100
                balance_change = balance * (pnl/100)
                trades.append({'time': time, 'type': 'SL', 'pnl_pct': pnl, 'balance': balance + balance_change})
                balance += balance_change
                position = None
            elif row['high'] >= position['tp']:
                # TP Hit
                exit_price = position['tp']
                pnl = (exit_price - position['entry']) / position['entry'] * 100
                trade_pnl = pnl
                balance_change = balance * (pnl/100)
                trades.append({'time': time, 'type': 'TP', 'pnl_pct': pnl, 'balance': balance + balance_change})
                balance += balance_change
                position = None
            continue # Don't enter if in position (simple)
            
        # Check Entry Conditions (LONG Only for now)
        # 4H Condition: Close > 21 > 50 > 100 AND Price > 21
        # Note: row['close_4h'] and row['ema21_4h'] are from PREVIOUS closed candle.
        # Strict logic: current 4h trend is bullish based on completed candles.
        
        long_4h = (row['ema21_4h'] > row['ema50_4h'] > row['ema100_4h']) and (row['close_4h'] > row['ema21_4h'])
        long_1h = (row['ema21_1h'] > row['ema50_1h'])
        
        # 15m Condition: EMA21 > EMA50 AND Close > EMA50
        long_15m = (row['ema21'] > row['ema50']) and (row['close'] > row['ema50'])
        
        if long_4h and long_1h and long_15m:
            # ENTRY
            entry_price = row['close']
            sl = entry_price * 0.98 # 2% SL
            tp = entry_price * 1.04 # 4% TP (1:2 RR)
            
            position = {
                'entry': entry_price,
                'sl': sl,
                'tp': tp,
                'side': 'LONG'
            }
            # print(f"Entry {time} @ {entry_price}")

    # Stats
    wins = len([t for t in trades if t['pnl_pct'] > 0])
    losses = len([t for t in trades if t['pnl_pct'] <= 0])
    total = len(trades)
    win_rate = (wins / total * 100) if total > 0 else 0
    
    print("-" * 30)
    print(f"RESULTS FOR {symbol}")
    print(f"Total Trades: {total}")
    print(f"Win Rate: {win_rate:.2f}%")
    print(f"Final Balance: ${balance:.2f} (Start: $10000)")
    print("-" * 30)

if __name__ == "__main__":
    # print("Running Stock Backtest (Note: May require running locally if blocked in cloud)")
    # run_backtest("RELIANCE.NS") 
    
    print("\nRunning Crypto Backtest (via CCXT)...")
    run_backtest("BTC/USDT")
    # run_backtest("ETH/USDT")
    # run_backtest("SOL/USDT")
