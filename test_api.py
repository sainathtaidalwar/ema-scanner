import requests

try:
    print("Testing /api/pairs...")
    resp = requests.get('http://127.0.0.1:5000/api/pairs?limit=5')
    print(f"Status: {resp.status_code}")
    data = resp.json()
    pairs = data.get('pairs', [])
    print(f"Pairs count: {len(pairs)}")
    if len(pairs) > 0:
        print("First 5 pairs:", pairs[:5])
    else:
        print("ERROR: No pairs returned!")

except Exception as e:
    print(f"Connection Failed: {e}")
