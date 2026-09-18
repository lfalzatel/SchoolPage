import json
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

project_id = "green-force-pwa-2025"
url = f"https://storage.googleapis.com/storage/v1/b?project={project_id}"

headers = {"Authorization": f"Bearer {token}"}
r = requests.get(url, headers=headers)

print("BUCKETS LIST STATUS:", r.status_code)
print("RESPONSE:", json.dumps(r.json(), indent=2))
