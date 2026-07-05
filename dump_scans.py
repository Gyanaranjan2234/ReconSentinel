import sqlite3

try:
    conn = sqlite3.connect('backend/data/recon.db')
    cur = conn.cursor()
    cur.execute("SELECT id, results FROM scans ORDER BY created_at DESC LIMIT 5")
    rows = cur.fetchall()
    for row in rows:
        print(f"ID: {row[0]}")
        print(f"Results: {row[1]}")
        print("-" * 40)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
