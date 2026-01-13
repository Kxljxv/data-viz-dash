import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "antragsgruen_global.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Tabelle für Konvente (Slugs)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conventions (
            slug TEXT PRIMARY KEY,
            title TEXT,
            max_id INTEGER DEFAULT 0,
            probe_motion_slug TEXT,
            last_harvested TIMESTAMP
        )
    ''')
    
    # 2. Tabelle für Amendments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS amendments (
            id INTEGER PRIMARY KEY,
            convention_slug TEXT,
            motion_slug TEXT,
            is_public BOOLEAN,
            discovery_method TEXT,
            discovery_date TIMESTAMP,
            FOREIGN KEY (convention_slug) REFERENCES conventions (slug)
        )
    ''')
    
    # 3. Tabelle für State-Tracking (welche ID wurde in welchem Konvent geprüft?)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS check_log (
            amendment_id INTEGER,
            convention_slug TEXT,
            status TEXT, -- 'NOT_FOUND', 'FOUND', 'ERROR'
            check_date TIMESTAMP,
            PRIMARY KEY (amendment_id, convention_slug)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    return sqlite3.connect(DB_PATH)

if __name__ == "__main__":
    init_db()
    print(f"[+] Datenbank initialisiert unter {DB_PATH}")
