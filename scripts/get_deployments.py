import urllib.request
import json

TOKEN = 'a6d5b69c-36a3-4f7e-be07-d8a5441daed6'
SERVICE_ID = '85f0bed5-dd73-4db1-a23d-c5431b5ec90d'
ENV_ID = 'cf353953-397b-4fa5-8eda-12e14e51d9f1'

query = """
query GetDeployments($serviceId: String!, $environmentId: String!) {
  deployments(input: {serviceId: $serviceId, environmentId: $environmentId}, first: 5) {
    edges {
      node {
        id
        status
        createdAt
      }
    }
  }
}
"""

req = urllib.request.Request(
    'https://backboard.railway.app/graphql/v2',
    data=json.dumps({'query': query, 'variables': {'serviceId': SERVICE_ID, 'environmentId': ENV_ID}}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        edges = res.get('data', {}).get('deployments', {}).get('edges', [])
        for e in edges:
            print(e['node'])
except Exception as e:
    print('Error:', e)
