from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
response = client.delete("/api/scan/")
print("DELETE /api/scan/:", response.status_code, response.json() if response.content else response.text)
print("Headers:", response.headers)
