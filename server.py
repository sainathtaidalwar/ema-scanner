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

@app.route('/api/scan', methods=['POST'])
def scan_pairs():
    """
    Scan a list of pairs with provided configuration.
    """
    data = request.json
    symbols = data.get('symbols', [])
    config = data.get('config', {})
    
    print(f"Scanning {len(symbols)} pairs with config: {config}")
    
    # Run async scanner
    try:
        results = asyncio.run(scanner.scan_market_async(symbols, config))
    except Exception as e:
        print(f"Async Scan Error: {e}")
        results = []
        
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
