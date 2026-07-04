import requests
import time
import sys

res = requests.post("http://localhost:8000/api/scan/", json={
    "target": "scanme.nmap.org",
    "port_range": "1-1024",
    "threads": 8,
    "aggressive_mode": False,
    "ping_discovery": True
})

print("POST status:", res.status_code)
print("POST body:", res.text)
if res.status_code != 201:
    sys.exit(1)

scan_id = res.json()["id"]

for i in range(5):
    time.sleep(1)
    res2 = requests.get(f"http://localhost:8000/api/scan/progress/{scan_id}")
    print("GET progress:", res2.status_code, res2.text)
