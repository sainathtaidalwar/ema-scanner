from flask import Flask, jsonify, request
from flask_cors import CORS
import scanner
import asyncio
import sys
import time

app = Flask(__name__)
CORS(app) # Enable CORS for all domains

# Fix for Windows AsyncIO Loop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Client is now dynamic in scanner.py
# No global client needed

# Segmented Cache by Exchange
pairs_cache = {}
# Structure: {'binance': {'data': [], 'timestamp': 0}, 'bybit': ...}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@app.route('/api/pairs', methods=['GET'])
def get_pairs():
    """Fetch top volume pairs (cached every 1 hour per exchange)"""
    global pairs_cache
    
    current_time = time.time()
    limit = request.args.get('limit', default=75, type=int)
    exchange_id = request.args.get('exchange', default='binance', type=str).lower()
    
    # Initialize cache scope if needed
    if exchange_id not in pairs_cache:
        pairs_cache[exchange_id] = {'data': [], 'timestamp': 0}
    
    # Check cache
    cache_scope = pairs_cache[exchange_id]
    if cache_scope['data'] and (current_time - cache_scope['timestamp'] < 3600):
        return jsonify({'pairs': cache_scope['data'][:limit]})

    try:
        print(f"Fetching fresh pairs from {exchange_id}...")
        # Note: We need to update scanner.fetch_top_volume_pairs to accept exchange_id
        pairs = scanner.fetch_top_volume_pairs_sync(exchange_id, limit=limit)
        if pairs:
            cache_scope['data'] = pairs
            cache_scope['timestamp'] = current_time
    except Exception as e:
        print(f"Error fetching pairs for {exchange_id}: {e}")
        # Return the error to the frontend for debugging
        return jsonify({'pairs': [], 'error': str(e), 'status': 'error'})
        
    return jsonify({'pairs': pairs, 'status': 'success'})

# Segmented Result Cache
scan_cache = {}
# Structure: {'binance': {'results': [], 'timestamp': 0, 'config_hash': ''}, ...}

@app.route('/api/scan', methods=['POST'])
def scan_pairs():
    """
    Scan with multi-exchange support and caching.
    """
    global scan_cache
    
    data = request.json
    symbols = data.get('symbols', [])
    config = data.get('config', {})
    exchange_id = data.get('exchange', 'binance').lower()
    
    # Initialize cache scope
    if exchange_id not in scan_cache:
        scan_cache[exchange_id] = {'results': [], 'timestamp': 0, 'config_hash': ''}
        
    cache_scope = scan_cache[exchange_id]

    current_config_hash = str(sorted(config.items()))
    current_time = time.time()
    
    # 1. Check Cache
    if (cache_scope['results'] and 
        (current_time - cache_scope['timestamp'] < 60) and 
        cache_scope['config_hash'] == current_config_hash):
        
        print(f"Serving cached scan results for {exchange_id}...")
        return jsonify({'results': cache_scope['results']})
    
    # 2. Cache Miss
    print(f"Scanning {len(symbols)} pairs on {exchange_id}...")
    
    try:
        results = asyncio.run(scanner.scan_market_async(exchange_id, symbols, config))
        
        if results:
            cache_scope['results'] = results
            cache_scope['timestamp'] = current_time
            cache_scope['config_hash'] = current_config_hash
            
    except Exception as e:
        print(f"Scan Error ({exchange_id}): {e}")
        results = []
        
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
