import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "antragsgruen_global.db")

def find_gaps():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM amendments ORDER BY id")
    ids = [row[0] for row in cursor.fetchall()]
    
    if not ids:
        print("Keine IDs gefunden.")
        return
        
    gaps = []
    for i in range(len(ids) - 1):
        if ids[i+1] - ids[i] > 1:
            gaps.append((ids[i], ids[i+1]))
            
    print(f"Gefundene Lücken: {len(gaps)}")
    for start, end in gaps[:10]:
        print(f"Lücke zwischen {start} und {end} (Größe: {end - start - 1})")
        
    conn.close()

if __name__ == "__main__":
    find_gaps()
