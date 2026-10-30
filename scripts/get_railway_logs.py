import urllib.request
import json
import sys

TOKEN = 'a6d5b69c-36a3-4f7e-be07-d8a5441daed6'
DEPLOYMENT_ID = 'ee4ee47c-422a-471a-a0cc-601278f5893e'

query = """
query GetLogs($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId, limit: 1000) {
    message
    severity
    timestamp
  }
}
"""

req = urllib.request.Request(
    'https://backboard.railway.app/graphql/v2',
    data=json.dumps({'query': query, 'variables': {'deploymentId': DEPLOYMENT_ID}}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        logs = res.get('data', {}).get('deploymentLogs', [])
        for log in logs[-40:]:
            print(f"[{log.get('severity')}] {repr(log.get('message'))}")
        if not logs:
            print("No logs or empty response:", res)

except urllib.error.HTTPError as e:
    print('HTTP ERROR:', e.code, e.read().decode())
except Exception as e:
    print('Error:', e)
