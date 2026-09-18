import json
import time
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

key_file = "green-force-pwa-2025-firebase-adminsdk-fbsvc-01d92f9a8e.json"
creds = service_account.Credentials.from_service_account_file(
    key_file,
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

creds.refresh(Request())
token = creds.token
headers = {"Authorization": f"Bearer {token}"}

project_id = "green-force-pwa-2025"
site_id = "green-force-pwa-2025"

# 1. Obtener versión activa
active_version_name = None
r_rel = requests.get(f"https://firebasehosting.googleapis.com/v1beta1/projects/{project_id}/sites/{site_id}/releases?pageSize=5", headers=headers)
if r_rel.status_code == 200:
    releases = r_rel.json().get("releases", [])
    if releases:
        active_version_name = releases[0].get("version", {}).get("name")
        print(f"Versión activa actual: {active_version_name}")

# 2. Obtener todas las versiones
r = requests.get(f"https://firebasehosting.googleapis.com/v1beta1/projects/{project_id}/sites/{site_id}/versions?pageSize=100", headers=headers)
versions = r.json().get("versions", [])
print(f"Versiones encontradas en Firebase Hosting: {len(versions)}")

deleted_count = 0
for v in versions:
    v_name = v.get("name")
    if v_name != active_version_name:
        del_url = f"https://firebasehosting.googleapis.com/v1beta1/{v_name}"
        try:
            res = requests.delete(del_url, headers=headers)
            if res.status_code in [200, 204]:
                deleted_count += 1
                print(f"Eliminada versión antigua: {v_name}")
            time.sleep(0.2)
        except Exception as e:
            print(f"Error borrando {v_name}:", e)

print(f"✅ Se eliminaron {deleted_count} versiones antiguas en Firebase Hosting.")
