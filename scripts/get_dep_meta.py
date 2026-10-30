import urllib.request
import json

TOKEN = 'a6d5b69c-36a3-4f7e-be07-d8a5441daed6'
DEP_ID = 'ee4ee47c-422a-471a-a0cc-601278f5893e'

query = """
query GetDep($id: String!) {
  deployment(id: $id) {
    id
    status
    meta
  }
}
"""

req = urllib.request.Request(
    'https://backboard.railway.app/graphql/v2',
    data=json.dumps({'query': query, 'variables': {'id': DEP_ID}}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)

with urllib.request.urlopen(req) as resp:
    print(resp.read().decode())
