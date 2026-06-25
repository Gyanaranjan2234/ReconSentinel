import urllib.request, urllib.error
try: print(urllib.request.urlopen('http://127.0.0.1:8000/api/scan/').read())
except urllib.error.HTTPError as e: print(e.read().decode())
