"""
One-time migration script: fixes stored port 443 service name from 'http' → 'https'
in all existing ScanResult records in the database.
"""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import ScanResult
from sqlalchemy.orm.attributes import flag_modified

PORT_SERVICE_MAP = {
    21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns",
    80: "http", 110: "pop3", 143: "imap", 443: "https",
    465: "smtps", 587: "smtp", 993: "imaps", 995: "pop3s",
    3306: "mysql", 3389: "rdp", 5432: "postgresql",
    6379: "redis", 8080: "http-proxy", 8443: "https", 27017: "mongodb",
}

db = SessionLocal()
try:
    records = db.query(ScanResult).all()
    patched = 0
    for record in records:
        if not record.results or "hosts" not in record.results:
            continue
        changed = False
        for host in record.results.get("hosts", []):
            for port in host.get("ports", []):
                port_num = int(port.get("port", 0))
                if port_num in PORT_SERVICE_MAP:
                    correct_service = PORT_SERVICE_MAP[port_num]
                    if port.get("service") != correct_service:
                        print(f"  Record #{record.id} ({record.target}): port {port_num} '{port['service']}' -> '{correct_service}'")
                        port["service"] = correct_service
                        changed = True
        if changed:
            flag_modified(record, "results")
            patched += 1

    db.commit()
    print(f"\nDone. Patched {patched} scan record(s).")
finally:
    db.close()
