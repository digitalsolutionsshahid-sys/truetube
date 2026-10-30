import urllib.request, json
TOKEN = 'a6d5b69c-36a3-4f7e-be07-d8a5441daed6'
SERVICE_ID = '85f0bed5-dd73-4db1-a23d-c5431b5ec90d'
ENV_ID = 'cf353953-397b-4fa5-8eda-12e14e51d9f1'
PROJECT_ID = '53aaac81-5cdd-4cd8-8f1a-cc180029e1b4'

query = """
query GetVariables($projectId: String!, $environmentId: String!, $serviceId: String!) {
  variables(projectId: $projectId, environmentId: $environmentId, serviceId: $serviceId)
}
"""
req = urllib.request.Request(
    'https://backboard.railway.app/graphql/v2',
    data=json.dumps({'query': query, 'variables': {'projectId': PROJECT_ID, 'environmentId': ENV_ID, 'serviceId': SERVICE_ID}}).encode(),
    headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    vars_dict = res.get('data', {}).get('variables', {})
    print(list(vars_dict.keys()))
