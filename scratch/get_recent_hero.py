import urllib.request
import json
import ssl
import base64

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

cloud_name = "dtr3yvjac"
api_key = "453843776219872"
api_secret = "WDP5Pmku01sVxQJ2pD_npSNL5wA"

credentials = base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()

url = f"https://api.cloudinary.com/v1_1/{cloud_name}/resources/image?type=upload&prefix=portfolio/&max_results=50&direction=desc"

req = urllib.request.Request(url, headers={
    'Authorization': f'Basic {credentials}'
})

try:
    res = urllib.request.urlopen(req, context=ctx)
    data = json.loads(res.read().decode())
    
    resources = data.get('resources', [])
    print("Most recent uploads in portfolio/:")
    for r in resources[:15]:
        print(f"{r['public_id']} ({r['created_at']}) -> {r['secure_url']}")
except Exception as e:
    print(f"Error: {e}")
