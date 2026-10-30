import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
TOKEN = 'a6d5b69c-36a3-4f7e-be07-d8a5441daed6'
DEP_ID = '9a8d45d4-1515-4530-9456-82a306cad1c4'

query = """
query GetBuildLogs($deploymentId: String!) {
  buildLogs(deploymentId: $deploymentId, limit: 100) {
    message
    severity
  }
}
"""

req = urllib.request.Request(
    'https://backboard.railway.app/graphql/v2',
    data=json.dumps({'query': query, 'variables': {'deploymentId': DEP_ID}}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        logs = res.get('data', {}).get('buildLogs', [])
        for log in logs[-20:]:
            print(f"[{log.get('severity')}] {repr(log.get('message'))}")
except Exception as e:
    print('Error:', e)
