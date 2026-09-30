import urllib.request
import json

TOKEN = "fd2ae7b2-0037-4211-a166-d70e7e1c6ce2"
DEPLOYMENT_ID = "8aba1586-5573-437a-9efc-36de17d0997c"
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

# Try querying deployment logs
q = """
query GetLogs($deploymentId: String!) {
  deploymentLogs(deploymentId: $deploymentId, limit: 50) {
    timestamp
    message
    severity
  }
}
"""
try:
    res = gql(q, {"deploymentId": DEPLOYMENT_ID})
    logs = res.get("data", {}).get("deploymentLogs", [])
    print(f"Got {len(logs)} log entries:")
    for log in logs:
        print(f"[{log.get('timestamp')}] {log.get('message')}")
except Exception as e:
    print("Error querying logs:", e)
