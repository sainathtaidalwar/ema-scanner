from flask import Flask, jsonify, request
from flask_cors import CORS
import scanner
import asyncio
import sys

app = Flask(__name__)
CORS(app) # Enable CORS for all domains

# Fix for Windows AsyncIO Loop
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Use Sync client for fetching pairs initially
client_sync = scanner.get_binance_client_sync()

@app.route('/api/pairs', methods=['GET'])
def get_pairs():
    """Fetch top volume pairs or accept custom limit"""
    limit = request.args.get('limit', default=75, type=int)
    pairs = scanner.fetch_top_volume_pairs(client_sync, limit=limit)
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
