import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "antragsgruen_global.db")

def find_motion():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Finde einen Konvent und eine zugehörige ID/Motion
    cursor.execute("""
        SELECT DISTINCT motion_slug
        FROM amendments
        WHERE convention_slug = 'wahlprogramm-2016'
        AND motion_slug IS NOT NULL
        LIMIT 5
    """)
    rows = cursor.fetchall()
    for row in rows:
        print(f"Motion Slug: {row[0]}")
        
    conn.close()

if __name__ == "__main__":
    find_motion()
