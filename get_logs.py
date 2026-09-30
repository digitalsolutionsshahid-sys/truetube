import urllib.request
import json

TOKEN = "fd2ae7b2-0037-4211-a166-d70e7e1c6ce2"
DEPLOYMENT_ID = "3bacdf7b-5542-495f-80be-dae1b0afbb64"
URL = "https://backboard.railway.app/graphql/v2"

query = """
query GetLogs($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId, limit: 30) {
    timestamp
    message
  }
}
"""

req = urllib.request.Request(
    URL,
    data=json.dumps({"query": query, "variables": {"deploymentId": DEPLOYMENT_ID}}).encode(),
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json", "User-Agent": "Railway-CLI/5.63.1"}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    for log in res.get("data", {}).get("deploymentLogs", []):
        print(f"[{log.get('timestamp')}] {log.get('message')}")
