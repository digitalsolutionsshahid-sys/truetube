import urllib.request
import json

TOKEN = 'a6d5b69c-36a3-4f7e-be07-d8a5441daed6'

query = """
query IntrospectDeploy {
  __type(name: "Mutation") {
    fields {
      name
      args {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
}
"""

req = urllib.request.Request(
    'https://backboard.railway.app/graphql/v2',
    data=json.dumps({'query': query}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    fields = data.get('data', {}).get('__type', {}).get('fields', [])
    for f in fields:
        if 'deploy' in f['name'].lower():
            print(f['name'], f['args'])
