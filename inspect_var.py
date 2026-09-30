import urllib.request
import json

TOKEN = "fd2ae7b2-0037-4211-a166-d70e7e1c6ce2"
URL = "https://backboard.railway.app/graphql/v2"

query = """
query IntrospectVariableUpsert {
  __type(name: "VariableUpsertInput") {
    inputFields {
      name
      type { name kind ofType { name kind } }
    }
  }
}
"""

req = urllib.request.Request(
    URL,
    data=json.dumps({"query": query}).encode(),
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json", "User-Agent": "Railway-CLI/5.63.1"}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    print(json.dumps(res, indent=2))
