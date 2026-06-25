import sqlite3
import json
import os

os.chdir('backend')
conn = sqlite3.connect('netreconx.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

# Try to get the latest scans
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%scan%'")
table_name = cursor.fetchone()

if table_name:
    table = table_name[0]
    print(f"Using table: {table}")
    
    # Get all scans in reverse order
    cursor.execute(f'SELECT id, target, status, results FROM "{table}" ORDER BY id DESC LIMIT 5')
    rows = cursor.fetchall()
    
    for row in rows:
        scan_id, target, status, results_json = row
        results = json.loads(results_json) if results_json else {}
        print(f"\nScan ID: {scan_id}, Target: {target}")
        print(f"  Status: {status}")
        print(f"  Progress: {results.get('progress', 'N/A')}%")
        print(f"  Stage: {results.get('stage', 'N/A')}")
        if 'hosts' in results:
            print(f"  Hosts found: {len(results['hosts'])}")

conn.close()


