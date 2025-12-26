import ccxt.async_support as ccxt
import pandas as pd
import asyncio
import sys

# Windows Loop Fix
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

def calculate_ema(series, span):
    return series.ewm(span=span, adjust=False).mean()

async def debug_symbol(symbol):
    client = ccxt.binance({'options': {'defaultType': 'future'}})
    print(f"\n--- DEBUGGING {symbol} ---")
    
    # 1. Fetch 4H
    print("Fetching 4h...")
    ohlcv = await client.fetch_ohlcv(symbol, '4h', limit=50)
    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    
    # Check Sort Order
    print(f"First Candle: {df.iloc[0]['timestamp']}")
    print(f"Last Candle:  {df.iloc[-1]['timestamp']}")
    
    # Calculate EMAs
    df['ema21'] = calculate_ema(df['close'], 21)
    df['ema50'] = calculate_ema(df['close'], 50)
    df['ema100'] = calculate_ema(df['close'], 100)
    
    curr = df.iloc[-1]
    prev = df.iloc[-2]

    print(f"\n[4H DATA] Price: {curr['close']}")
    print(f"EMA21:  {curr['ema21']:.4f}")
    print(f"EMA50:  {curr['ema50']:.4f}")
    print(f"EMA100: {curr['ema100']:.4f}")
    
    long_cond = (curr['ema21'] > curr['ema50'] > curr['ema100']) and (curr['close'] > curr['ema21'])
    short_cond = (curr['ema21'] < curr['ema50'] < curr['ema100']) and (curr['close'] < curr['ema21'])
    
    print(f"Long Cond (21>50>100 & C>21): {long_cond}")
    print(f"Short Cond (21<50<100 & C<21): {short_cond}")
    
    if not (long_cond or short_cond):
        print("FAIL at 4H")
        await client.close()
        return

    side = 'LONG' if long_cond else 'SHORT'
    print(f"4H Result: {side}")

    # 2. Fetch 1H
    print("\nFetching 1h...")
    ohlcv_1h = await client.fetch_ohlcv(symbol, '1h', limit=50)
    df_1h = pd.DataFrame(ohlcv_1h, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df_1h['ema21'] = calculate_ema(df_1h['close'], 21)
    df_1h['ema50'] = calculate_ema(df_1h['close'], 50)
    
    curr_1h = df_1h.iloc[-1]
    print(f"[1H DATA] Price: {curr_1h['close']}")
    print(f"EMA21: {curr_1h['ema21']:.4f}")
    print(f"EMA50: {curr_1h['ema50']:.4f}")
    
    if side == 'LONG':
        pass_1h = curr_1h['ema21'] > curr_1h['ema50']
    else:
        pass_1h = curr_1h['ema21'] < curr_1h['ema50']
        
    print(f"1H Stack Correct? {pass_1h}")

    await client.close()

async def main():
    # Test a few major pairs
    await debug_symbol('BTC/USDT')
    await debug_symbol('ETH/USDT')
    await debug_symbol('SOL/USDT')
    await debug_symbol('XRP/USDT')

if __name__ == "__main__":
    asyncio.run(main())
