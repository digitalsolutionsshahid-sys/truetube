import urllib.request
import json
import http.cookiejar

TOKEN = "fd2ae7b2-0037-4211-a166-d70e7e1c6ce2"
PROJECT_ID = "53aaac81-5cdd-4cd8-8f1a-cc180029e1b4"
SERVICE_ID = "85f0bed5-dd73-4db1-a23d-c5431b5ec90d"
ENV_ID = "cf353953-397b-4fa5-8eda-12e14e51d9f1"
URL = "https://backboard.railway.app/graphql/v2"

# 1. Fetch fresh visitor cookies from youtube
cj = http.cookiejar.MozillaCookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
req = urllib.request.Request(
    'https://www.youtube.com',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'}
)
opener.open(req)

# Build Netscape cookie file content
lines = [
    "# Netscape HTTP Cookie File",
    "# http://curl.haxx.se/rfc/cookie_spec.html",
    "# This is a generated file!  Do not edit.",
    ""
]
for c in cj:
    secure = "TRUE" if c.secure else "FALSE"
    domain = c.domain
    initial_dot = "TRUE" if domain.startswith(".") else "FALSE"
    path = c.path
    expires = str(c.expires) if c.expires else "0"
    lines.append(f"{domain}\t{initial_dot}\t{path}\t{secure}\t{expires}\t{c.name}\t{c.value}")

cookie_content = "\n".join(lines) + "\n"
print("Setting YOUTUBE_COOKIES (length:", len(cookie_content), "):")
print(cookie_content[:200])

mutation = """
mutation UpsertVar($input: VariableUpsertInput!) {
  variableUpsert(input: $input)
}
"""

payload = {
    "query": mutation,
    "variables": {
        "input": {
            "projectId": PROJECT_ID,
            "serviceId": SERVICE_ID,
            "environmentId": ENV_ID,
            "name": "YOUTUBE_COOKIES",
            "value": cookie_content,
        }
    }
}

req_gql = urllib.request.Request(
    URL,
    data=json.dumps(payload).encode(),
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json", "User-Agent": "Railway-CLI/5.63.1"}
)

with urllib.request.urlopen(req_gql) as resp:
    res = json.loads(resp.read().decode())
    print("Response:", json.dumps(res, indent=2))
