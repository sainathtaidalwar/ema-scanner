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

# Use Sync client for fetching pairs initially
client_sync = scanner.get_binance_client_sync()

# Simple In-Memory Cache
pairs_cache = {
    'data': [],
    'timestamp': 0
}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@app.route('/api/pairs', methods=['GET'])
def get_pairs():
    """Fetch top volume pairs (cached every 1 hour)"""
    global pairs_cache
    
    current_time = time.time()
    limit = request.args.get('limit', default=75, type=int)
    
    # Check cache (only valid if limit matches or cache is larger, simplified to 1 hour expiry)
    if pairs_cache['data'] and (current_time - pairs_cache['timestamp'] < 3600):
        # Optimization: Just return cached data sice limit is usually static
        return jsonify({'pairs': pairs_cache['data'][:limit]})

    try:
        print("Fetching fresh pairs from Binance...")
        pairs = scanner.fetch_top_volume_pairs(client_sync, limit=limit)
        if pairs:
            pairs_cache['data'] = pairs
            pairs_cache['timestamp'] = current_time
    except Exception as e:
        print(f"Error fetching pairs: {e}")
        pairs = []
        
    return jsonify({'pairs': pairs})

# Scan Results Cache (Global)
# This prevents 1000 users from triggering 1000 concurrent scans.
# Instead, the first user triggers a scan, and the next 999 get the cached result.
scan_cache = {
    'results': [],
    'timestamp': 0,
    'config_hash': ''
}

@app.route('/api/scan', methods=['POST'])
def scan_pairs():
    """
    Scan a list of pairs with provided configuration.
    Uses global caching to serve high traffic.
    """
    global scan_cache
    
    data = request.json
    symbols = data.get('symbols', [])
    config = data.get('config', {})
    
    # Create simple hash of config to ensure cache validity
    current_config_hash = str(sorted(config.items()))
    current_time = time.time()
    
    # 1. Check Cache (Expiry: 60 seconds)
    # If we have results, they are fresh (<60s), and the config hasn't changed... return cache.
    if (scan_cache['results'] and 
        (current_time - scan_cache['timestamp'] < 60) and 
        scan_cache['config_hash'] == current_config_hash):
        
        print("Serving cached scan results...")
        return jsonify({'results': scan_cache['results']})
    
    # 2. If Cache Miss, Run Scanner
    print(f"Cache miss or stale. Scanning {len(symbols)} pairs...")
    
    try:
        results = asyncio.run(scanner.scan_market_async(symbols, config))
        
        # Update Cache
        if results:
            scan_cache['results'] = results
            scan_cache['timestamp'] = current_time
            scan_cache['config_hash'] = current_config_hash
            
    except Exception as e:
        print(f"Async Scan Error: {e}")
        results = []
        
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
