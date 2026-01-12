import sqlite3
import yaml
import json
import os
from datetime import datetime

# --- KONFIGURATION ---
YAML_FILE = "exportierte_konvente.yaml"
SQLITE_AMENDMENTS = "amendments.sqlite"
SQLITE_PERSONS = "persons.sqlite"

def load_yaml(file_path):
    """Lädt die YAML-Datei."""
    print(f"[*] Lade {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def create_amendments_db(db_path):
    """Erstellt die SQLite-Datenbank für Amendments."""
    print(f"[*] Erstelle Datenbank: {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("DROP TABLE IF EXISTS amendments")
    cursor.execute("""
    CREATE TABLE amendments (
        convention_id TEXT,
        motion_id TEXT,
        amendment_id INTEGER PRIMARY KEY,
        convention_title TEXT,
        convention_title_short TEXT,
        convention_url_path TEXT,
        convention_url_json TEXT,
        convention_url_html TEXT,
        motion_type TEXT,
        motion_prefix TEXT,
        amendment_type TEXT,
        amendment_prefix TEXT,
        amendment_title TEXT,
        amendment_title_with_prefix TEXT,
        amendment_first_line INTEGER,
        amendment_status_id INTEGER,
        amendment_status_title TEXT,
        amendment_date_published TEXT,
        amendment_supporters TEXT, -- Als JSON-String gespeichert
        amendment_supporters_amount INTEGER,
        amendment_initiators TEXT, -- Als JSON-String gespeichert
        amendment_initator_amount INTEGER,
        amendment_proposed_procedure TEXT,
        amendment_url_json TEXT,
        amendment_url_html TEXT
    )
    """)
    conn.commit()
    return conn

def create_persons_db(db_path):
    """Erstellt die SQLite-Datenbank für Personen."""
    print(f"[*] Erstelle Datenbank: {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("DROP TABLE IF EXISTS persons")
    cursor.execute("""
    CREATE TABLE persons (
        person_id TEXT PRIMARY KEY,
        person_type TEXT,
        person_name TEXT,
        person_organization TEXT, -- Als JSON-String gespeichert (Liste von Strings)
        supported_amendments TEXT, -- Als JSON-String gespeichert [(id, date), ...]
        initiated_amendments TEXT, -- Als JSON-String gespeichert [(id, date), ...]
        person_supported_amount INTEGER,
        person_initiated_amount INTEGER
    )
    """)
    conn.commit()
    return conn

def get_person_id(name, organization=None):
    """Erzeugt eine eindeutige ID für eine Person basierend nur auf dem Namen."""
    return name.strip().lower().replace(" ", "_")

def process_data(data):
    """Transformiert die YAML-Daten in die gewünschte Struktur."""
    amendments_to_insert = []
    persons_map = {} # person_id -> person_data

    for conv_slug, conv in data.items():
        conv_info = {
            "convention_id": conv_slug,
            "convention_title": conv.get("title"),
            "convention_title_short": conv.get("title_short"),
            "convention_url_path": conv.get("url_path"),
            "convention_url_json": conv.get("url_json"),
            "convention_url_html": conv.get("url_html")
        }
        
        # Mittelwert für das Veröffentlichungsdatum berechnen
        all_dates = []
        motions = conv.get("content", {}).get("motions", [])
        for motion_dict in motions:
            for motion in motion_dict.values():
                for am_dict in motion.get("amendments", []):
                    for am in am_dict.values():
                        dt_str = am.get("date_published")
                        if dt_str:
                            try:
                                # Versuche das Datum zu parsen (ISO Format erwartet)
                                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
                                all_dates.append(dt.timestamp())
                            except ValueError:
                                continue
        
        conv_date_fallback = None
        if all_dates:
            avg_timestamp = sum(all_dates) / len(all_dates)
            conv_date_fallback = datetime.fromtimestamp(avg_timestamp).isoformat()
            print(f"[*] Fallback-Datum für {conv_slug}: {conv_date_fallback}")

        print(f"[*] Verarbeite {len(motions)} Motions in {conv_slug}...")
        for motion_dict in motions:
            # Debugging: print(f"Motion Keys: {motion_dict.keys()}")
            for motion_id, motion in motion_dict.items():
                motion_info = {
                    "motion_id": motion_id,
                    "motion_type": motion.get("type"),
                    "motion_prefix": motion.get("prefix")
                }
                
                amendments = motion.get("amendments", [])
                if amendments:
                    print(f"    [+] {len(amendments)} Amendments in Motion {motion_id}")
                for am_dict in amendments:
                    # am_dict ist { am_id: { ... } }
                    for am_id, am in am_dict.items():
                        # Nur Amendments von Personen verarbeiten
                        initiator = am.get("initiators", {})
                        init_type = initiator.get("type")
                        if init_type is None:
                            # Manchmal ist initiators ein dict mit null-Werten
                            # Wir prüfen initiators_html als Fallback
                            init_html = am.get("initiators_html", "")
                            if init_html and "(" in init_html:
                                init_type = "person"
                        
                        if init_type != "person":
                            continue
                        
                        # Datum mit Fallback
                        am_date = am.get("date_published") or conv_date_fallback
                        
                        # Supporters und Initiators verarbeiten
                        # Da das YAML-Skript die Supporters als Strings speichert, 
                        # müssen wir sie hier wieder parsen oder die Originallogik nutzen.
                        # HINWEIS: Das aktuelle export_to_yaml.py speichert "Name (Org)" Strings.
                        # Wir versuchen diese zu parsen.
                        
                        raw_supporters = am.get("supporters", [])
                        parsed_supporters = []
                        for s_str in raw_supporters:
                            if "(" in s_str and s_str.endswith(")"):
                                name = s_str[:s_str.rfind("(")].strip()
                                org = s_str[s_str.rfind("(")+1:-1].strip()
                            else:
                                name = s_str.strip()
                                org = None
                            
                            p_id = get_person_id(name, org)
                            parsed_supporters.append({
                                "type": "person",
                                "name": name,
                                "organization": org
                            })
                            
                            # Person in persons_map aktualisieren
                            if p_id not in persons_map:
                                persons_map[p_id] = {
                                    "person_id": p_id,
                                    "person_type": "person",
                                    "person_name": name,
                                    "person_organizations": set(),
                                    "supported_amendments": [],
                                    "initiated_amendments": []
                                }
                            if org:
                                persons_map[p_id]["person_organizations"].add(org)
                            persons_map[p_id]["supported_amendments"].append((am_id, am_date))

                        # Initiator verarbeiten
                        init_name = initiator.get("name")
                        init_org = initiator.get("organization")
                        
                        if not init_name:
                            # Fallback aus initiators_html
                            init_html = am.get("initiators_html", "")
                            if "(" in init_html:
                                init_name = init_html[:init_html.rfind("(")].strip()
                                init_org = init_html[init_html.rfind("(")+1:-1].strip()
                            else:
                                init_name = init_html.strip()
                        
                        parsed_initiators = [{
                            "type": init_type,
                            "name": init_name,
                            "organization": init_org
                        }]
                        
                        if init_type == "person" and init_name:
                            p_id = get_person_id(init_name, init_org)
                            if p_id not in persons_map:
                                persons_map[p_id] = {
                                    "person_id": p_id,
                                    "person_type": "person",
                                    "person_name": init_name,
                                    "person_organizations": set(),
                                    "supported_amendments": [],
                                    "initiated_amendments": []
                                }
                            if init_org:
                                persons_map[p_id]["person_organizations"].add(init_org)
                            persons_map[p_id]["initiated_amendments"].append((am_id, am_date))

                        # Amendment-Eintrag erstellen
                        am_row = {
                            **conv_info,
                            **motion_info,
                            "amendment_id": am_id,
                            "amendment_type": am.get("type"),
                            "amendment_prefix": am.get("prefix"),
                            "amendment_title": am.get("title"),
                            "amendment_title_with_prefix": am.get("title_with_prefix"),
                            "amendment_first_line": am.get("first_line"),
                            "amendment_status_id": am.get("status_id"),
                            "amendment_status_title": am.get("status_title"),
                            "amendment_date_published": am_date,
                            "amendment_supporters": json.dumps(parsed_supporters),
                            "amendment_supporters_amount": len(parsed_supporters),
                            "amendment_initiators": json.dumps(parsed_initiators),
                            "amendment_initator_amount": len(parsed_initiators),
                            "amendment_proposed_procedure": am.get("proposed_procedure"),
                            "amendment_url_json": am.get("url_json"),
                            "amendment_url_html": am.get("url_html")
                        }
                        amendments_to_insert.append(am_row)

    return amendments_to_insert, list(persons_map.values())

def insert_amendments(conn, amendments):
    """Fügt Amendments in die Datenbank ein."""
    print(f"[*] Füge {len(amendments)} Amendments ein...")
    cursor = conn.cursor()
    fields = [
        "convention_id", "motion_id", "amendment_id", "convention_title", 
        "convention_title_short", "convention_url_path", "convention_url_json", 
        "convention_url_html", "motion_type", "motion_prefix", "amendment_type", 
        "amendment_prefix", "amendment_title", "amendment_title_with_prefix", 
        "amendment_first_line", "amendment_status_id", "amendment_status_title", 
        "amendment_date_published", "amendment_supporters", "amendment_supporters_amount", 
        "amendment_initiators", "amendment_initator_amount", "amendment_proposed_procedure", 
        "amendment_url_json", "amendment_url_html"
    ]
    placeholders = ", ".join(["?"] * len(fields))
    sql = f"INSERT INTO amendments ({', '.join(fields)}) VALUES ({placeholders})"
    
    data = []
    for am in amendments:
        data.append(tuple(am.get(f) for f in fields))
    
    cursor.executemany(sql, data)
    conn.commit()

def insert_persons(conn, persons):
    """Fügt Personen in die Datenbank ein."""
    print(f"[*] Füge {len(persons)} Personen ein...")
    cursor = conn.cursor()
    sql = """
    INSERT INTO persons (
        person_id, person_type, person_name, person_organization, 
        supported_amendments, initiated_amendments, 
        person_supported_amount, person_initiated_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    data = []
    for p in persons:
        data.append((
            p["person_id"],
            p["person_type"],
            p["person_name"],
            json.dumps(list(p["person_organizations"])),
            json.dumps(p["supported_amendments"]),
            json.dumps(p["initiated_amendments"]),
            len(p["supported_amendments"]),
            len(p["initiated_amendments"])
        ))
    
    cursor.executemany(sql, data)
    conn.commit()

def main():
    if not os.path.exists(YAML_FILE):
        print(f"[-] Datei {YAML_FILE} nicht gefunden. Bitte führen Sie zuerst export_to_yaml.py aus.")
        return

    data = load_yaml(YAML_FILE)
    amendments, persons = process_data(data)
    
    am_conn = create_amendments_db(SQLITE_AMENDMENTS)
    insert_amendments(am_conn, amendments)
    am_conn.close()
    
    p_conn = create_persons_db(SQLITE_PERSONS)
    insert_persons(p_conn, persons)
    p_conn.close()
    
    print("[+] Fertig! SQLite-Datenbanken wurden erstellt.")

if __name__ == "__main__":
    main()
