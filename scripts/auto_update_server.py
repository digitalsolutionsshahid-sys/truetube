import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

RAILWAY_GRAPHQL = "https://backboard.railway.com/graphql/v2"
RAILWAY_TOKEN = os.environ.get("RAILWAY_TOKEN", "fd2ae7b2-0037-4211-a166-d70e7e1c6ce2")
SERVICE_ID = os.environ.get("RAILWAY_SERVICE_ID", "85f0bed5-dd73-4db1-a23d-c5431b5ec90d")
HEALTH_URL = "https://truetube-production.up.railway.app/api/health"

def fetch_latest_pypi_version(package_name: str) -> str | None:
    url = f"https://pypi.org/pypi/{package_name}/json"
    req = urllib.request.Request(url, headers={"User-Agent": "TrueTube-AutoUpdater/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data.get("info", {}).get("version")
    except Exception as e:
        print(f"[!] Error fetching PyPI info for {package_name}: {e}")
        return None

def get_current_pinned_version(requirements_path: str, package_name: str) -> str | None:
    if not os.path.exists(requirements_path):
        return None
    with open(requirements_path, "r", encoding="utf-8") as f:
        content = f.read()
    # Match patterns like yt-dlp[default]>=2026.08.19 or yt-dlp>=2026.08.19
    match = re.search(rf"{re.escape(package_name)}(?:\[\w+\])?>=([0-9\.]+)", content)
    if match:
        return match.group(1)
    return None

def parse_version_tuple(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in re.findall(r"\d+", v))

def is_newer_version(latest: str, current: str) -> bool:
    try:
        return parse_version_tuple(latest) > parse_version_tuple(current)
    except Exception:
        return latest != current

def update_requirements_file(requirements_path: str, package_name: str, new_version: str) -> bool:
    with open(requirements_path, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = rf"({re.escape(package_name)}(?:\[\w+\])?>=)[0-9\.]+"
    new_content, count = re.subn(pattern, rf"\g<1>{new_version}", content)
    if count > 0 and new_content != content:
        with open(requirements_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False

def query_railway_graphql(query: str, variables: dict | None = None) -> dict | None:
    headers = {
        "Authorization": f"Bearer {RAILWAY_TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "Railway-CLI/5.63.1",
    }
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    req = urllib.request.Request(RAILWAY_GRAPHQL, data=json.dumps(payload).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"[!] Railway GraphQL error: {e}")
        return None

def get_latest_deployment_id() -> str | None:
    query = """
    query GetLatestDeployment($serviceId: String!) {
        deployments(first: 1, input: { serviceId: $serviceId }) {
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
    res = query_railway_graphql(query, {"serviceId": SERVICE_ID})
    if res and "data" in res:
        edges = res.get("data", {}).get("deployments", {}).get("edges", [])
        if edges:
            return edges[0].get("node", {}).get("id")
    return None

def trigger_railway_redeploy(deployment_id: str) -> str | None:
    query = """
    mutation Redeploy($id: String!) {
        deploymentRedeploy(id: $id, usePreviousImageTag: false) {
            id
            status
            createdAt
        }
    }
    """
    res = query_railway_graphql(query, {"id": deployment_id})
    if res and "data" in res:
        dep = res.get("data", {}).get("deploymentRedeploy")
        if dep:
            return dep.get("id")
    return None

def check_railway_health() -> bool:
    try:
        with urllib.request.urlopen(HEALTH_URL, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            print(f"[*] Health Check Response: {data}")
            return data.get("status") == "ok"
    except Exception as e:
        print(f"[!] Health check failed: {e}")
        return False

def main():
    print("=" * 60)
    print("TrueTube 24-Hour Automated Server Update & Maintenance")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    print("=" * 60)

    # 1. Locate requirements.txt
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    requirements_path = os.path.join(repo_root, "server", "requirements.txt")

    # 2. Check yt-dlp upstream version on PyPI
    current_ytdlp = get_current_pinned_version(requirements_path, "yt-dlp")
    latest_ytdlp = fetch_latest_pypi_version("yt-dlp")

    print(f"[*] yt-dlp Current Pinned: {current_ytdlp}")
    print(f"[*] yt-dlp Latest on PyPI: {latest_ytdlp}")

    has_update = False
    if latest_ytdlp and current_ytdlp and is_newer_version(latest_ytdlp, current_ytdlp):
        print(f"[+] Found newer yt-dlp version: {latest_ytdlp}! Updating requirements.txt...")
        if update_requirements_file(requirements_path, "yt-dlp", latest_ytdlp):
            has_update = True
            print("[+] Successfully updated server/requirements.txt")
    else:
        print("[*] yt-dlp is already at the latest upstream version.")

    # 3. Always perform 24-hour maintenance / redeploy check
    force_redeploy = "--force-redeploy" in sys.argv or "--daily-maintenance" in sys.argv or has_update
    if force_redeploy:
        print("[*] Initiating Railway redeploy with clean container rebuild...")
        latest_dep_id = get_latest_deployment_id()
        if latest_dep_id:
            print(f"[*] Current active deployment: {latest_dep_id}")
            new_dep_id = trigger_railway_redeploy(latest_dep_id)
            if new_dep_id:
                print(f"[+] Successfully triggered new Railway deployment: {new_dep_id}")
            else:
                print("[!] Failed to trigger Railway deployment via GraphQL.")
        else:
            print("[!] Could not retrieve latest deployment ID.")
    else:
        print("[*] Checking existing server health...")
        if check_railway_health():
            print("[+] Server is online, healthy, and operational.")
        else:
            print("[!] Server health check reported issues. Attempting recovery redeploy...")
            latest_dep_id = get_latest_deployment_id()
            if latest_dep_id:
                trigger_railway_redeploy(latest_dep_id)

    print("=" * 60)
    print("Automated update cycle completed.")
    print("=" * 60)

if __name__ == "__main__":
    main()
