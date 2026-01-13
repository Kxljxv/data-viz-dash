import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'antragsgruen_global.db')

def inspect():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("--- Statistik ---")
    cursor.execute("SELECT count(*) FROM conventions")
    print(f"Konvente: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT count(*) FROM amendments")
    print(f"Amendments gesamt: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT count(id) FROM amendments WHERE discovery_method = 'PROBE_FOUND'")
    print(f"Gefundene versteckte Amendments (Probe): {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT MAX(id) FROM amendments")
    print(f"Höchste ID: {cursor.fetchone()[0]}")
    
    print("\n--- Letzte 5 Amendments ---")
    cursor.execute("SELECT id, convention_slug, is_public, discovery_method FROM amendments ORDER BY id DESC LIMIT 5")
    for row in cursor.fetchall():
        print(row)
    
    conn.close()

if __name__ == "__main__":
    inspect()
