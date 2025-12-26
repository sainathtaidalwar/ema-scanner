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
        print("Fetching fresh pairs from Binance... (Step 1/2)")
        t0 = time.time()
        pairs = scanner.fetch_top_volume_pairs(client_sync, limit=limit)
        print(f"Fetched {len(pairs)} pairs in {time.time() - t0:.2f}s (Step 2/2)")
        if pairs:
            pairs_cache['data'] = pairs
            pairs_cache['timestamp'] = current_time
    except Exception as e:
        print(f"Error fetching pairs: {e}")
        pairs = []
        
    return jsonify({'pairs': pairs})

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    symbols = data.get('symbols', [])
    # In V2, 'config' is now 'strategy' in internal logic, but frontend might send complex dict
    strategy = data.get('config', {}) 
    
    if not symbols:
        return jsonify({"error": "No symbols provided"}), 400

    try:
        # Run async scan with new engine
        results = asyncio.run(scanner.scan_market_async(symbols, strategy))
        return jsonify({"results": results})
    except Exception as e:
        print(f"Scan Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```
