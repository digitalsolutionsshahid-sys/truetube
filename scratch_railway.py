import urllib.request
import json

TOKEN = "fd2ae7b2-0037-4211-a166-d70e7e1c6ce2"
PROJECT_ID = "53aaac81-5cdd-4cd8-8f1a-cc180029e1b4"
SERVICE_ID = "85f0bed5-dd73-4db1-a23d-c5431b5ec90d"
ENV_ID = "cf353953-397b-4fa5-8eda-12e14e51d9f1"
URL = "https://backboard.railway.app/graphql/v2"

def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "Railway-CLI/5.63.1",
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

query = """
query GetDeployments($serviceId: String!, $environmentId: String!) {
  deployments(input: { serviceId: $serviceId, environmentId: $environmentId }) {
    edges {
      node {
        id
        status
        createdAt
        meta
      }
    }
  }
}
"""
res = gql(query, {"serviceId": SERVICE_ID, "environmentId": ENV_ID})
edges = res["data"]["deployments"]["edges"]
for e in edges[:5]:
    n = e["node"]
    commit = n["meta"].get("commitHash")
    c_short = commit[:7] if commit else "None"
    print(f"Deployment: {n['id']} | Status: {n['status']} | Commit: {c_short} | Msg: {n['meta'].get('commitMessage')}")
