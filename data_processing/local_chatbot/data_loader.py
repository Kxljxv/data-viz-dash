import sqlite3
import json
import os
import yaml
import pickle
import time
from lxml import etree

class DataLoader:
    def __init__(self, static_data_path):
        self.static_data_path = static_data_path
        self.persons_db_path = os.path.join(static_data_path, "database", "persons.sqlite")
        self.amendments_db_path = os.path.join(static_data_path, "database", "amendments.sqlite")
        self.gexf_path = os.path.join(static_data_path, "bdk_all", "bdk_all.gexf")
        self.yaml_path = os.path.join(os.path.dirname(static_data_path), "data_processing", "exportierte_konvente.yaml")
        
        self.regression_data = {} # name -> float
        self.initiated_content_cache = {} # name -> list of strings
        self._load_gexf_regression_data()
        self._load_yaml_initiated_data()

    def _load_yaml_initiated_data(self):
        """Lädt initiierte Anträge und deren HTML aus der YAML-Datei mit Caching."""
        # Pfade berechnen
        yaml_file = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(self.static_data_path)), "data_processing", "exportierte_konvente.yaml"))
        cache_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "initiated_cache.pkl")
        
        if not os.path.exists(yaml_file):
            print(f"WARNUNG: YAML Datei nicht gefunden unter {yaml_file}")
            return

        # Prüfen ob Cache existiert und aktuell ist (Zeitstempel-Vergleich)
        if os.path.exists(cache_file) and os.path.getmtime(cache_file) > os.path.getmtime(yaml_file):
            print("Lade YAML-Daten aus Cache (schnell)...")
            try:
                with open(cache_file, 'rb') as f:
                    self.initiated_content_cache = pickle.load(f)
                print(f"Cache geladen: {len(self.initiated_content_cache)} Initiatoren gefunden.")
                return
            except Exception as e:
                print(f"Fehler beim Laden des Cache: {e}. Lade YAML neu...")

        print("Lade YAML Initiatoren-Daten (erster Start oder Update, das kann dauern)...")
        start_time = time.time()
        try:
            # Schnelleres Laden: Wir nutzen CLoader falls verfügbar
            try:
                from yaml import CLoader as Loader
            except ImportError:
                from yaml import Loader
                
            with open(yaml_file, 'r', encoding='utf-8') as f:
                data = yaml.load(f, Loader=Loader)
                
            for bdk_id, bdk_data in data.items():
                if 'content' in bdk_data and 'motions' in bdk_data['content']:
                    for motion_entry in bdk_data['content']['motions']:
                        for m_id, m_data in motion_entry.items():
                            if 'amendments' in m_data:
                                for am_entry in m_data['amendments']:
                                    for am_id, am_data in am_entry.items():
                                        init_html = am_data.get('initiators_html', '')
                                        if init_html:
                                            name = init_html.split('(')[0].strip()
                                            if name:
                                                if name.lower() not in self.initiated_content_cache:
                                                    self.initiated_content_cache[name.lower()] = []
                                                
                                                sections = am_data.get('sections', [])
                                                am_text = ""
                                                for sec in sections:
                                                    if isinstance(sec, dict) and 'Antragstext' in sec:
                                                        am_text = sec['Antragstext'].get('html', '')
                                                        break
                                                
                                                if am_text:
                                                    self.initiated_content_cache[name.lower()].append({
                                                        'title': am_data.get('title_with_prefix', f"Antrag {am_id}"),
                                                        'html': am_text
                                                    })
            
            # Cache speichern
            with open(cache_file, 'wb') as f:
                pickle.dump(self.initiated_content_cache, f)
            
            end_time = time.time()
            print(f"YAML geladen und Cache erstellt in {end_time - start_time:.2f}s: {len(self.initiated_content_cache)} Initiatoren gefunden.")
        except Exception as e:
            print(f"Fehler beim Laden der YAML: {e}")

    def _load_gexf_regression_data(self):
        """Lädt Regressions-Positionen aus der GEXF-Datei mit Caching."""
        cache_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gexf_cache.pkl")
        
        if not os.path.exists(self.gexf_path):
            print(f"WARNUNG: GEXF Datei nicht gefunden unter {self.gexf_path}")
            return

        # Cache-Check
        if os.path.exists(cache_file) and os.path.getmtime(cache_file) > os.path.getmtime(self.gexf_path):
            print("Lade GEXF-Daten aus Cache (schnell)...")
            try:
                with open(cache_file, 'rb') as f:
                    self.regression_data = pickle.load(f)
                print(f"Cache geladen: {len(self.regression_data)} Knoten mit Regressions-Position.")
                return
            except Exception as e:
                print(f"Fehler beim Laden des GEXF-Cache: {e}")

        print("Lade GEXF Daten (erster Start oder Update)...")
        start_time = time.time()
        try:
            # Iteratives Parsen für Speichereffizienz
            context = etree.iterparse(self.gexf_path, events=('end',), tag='{http://gexf.net/1.3}node')
            ns = {'g': 'http://gexf.net/1.3'}
            
            count = 0
            for event, elem in context:
                label = elem.get('label')
                reg_pos = None
                attvalues = elem.findall('g:attvalues/g:attvalue', ns)
                for att in attvalues:
                    if att.get('for') == 'attr_regression_pos':
                        try:
                            reg_pos = float(att.get('value'))
                        except (ValueError, TypeError):
                            pass
                        break
                
                if reg_pos is not None and label:
                    self.regression_data[label.lower()] = reg_pos
                    count += 1
                
                elem.clear()
                while elem.getprevious() is not None:
                    del elem.getparent()[0]
            
            del context
            
            # Cache speichern
            with open(cache_file, 'wb') as f:
                pickle.dump(self.regression_data, f)
                
            end_time = time.time()
            print(f"GEXF geladen und Cache erstellt in {end_time - start_time:.2f}s: {count} Knoten mit Regressions-Position.")
            
        except Exception as e:
            print(f"Fehler beim Laden der GEXF: {e}")

    def get_amendment_details(self, amendment_ids):
        """Holt Titel für eine Liste von Antrags-IDs."""
        if not amendment_ids or not os.path.exists(self.amendments_db_path):
            return {}
            
        conn = sqlite3.connect(self.amendments_db_path)
        cursor = conn.cursor()
        
        details = {}
        # IDs müssen Strings sein für SQL IN clause construction oder executemany
        # Einfacher: Loop oder IN clause mit placeholders
        if len(amendment_ids) > 100:
             # Limitieren um Fehler zu vermeiden
             amendment_ids = amendment_ids[:100]
             
        placeholders = ','.join('?' * len(amendment_ids))
        query = f"SELECT amendment_id, amendment_title, convention_title FROM amendments WHERE amendment_id IN ({placeholders})"
        
        try:
            cursor.execute(query, amendment_ids)
            for row in cursor.fetchall():
                # Wir speichern Tupel (Titel, Konvent)
                details[str(row[0])] = {'title': row[1], 'convention': row[2]}
        except Exception as e:
            print(f"Fehler beim Laden der Antragsdetails: {e}")
            
        conn.close()
        return details

    def get_person_data(self, name_query):
        """Sucht nach einer Person und gibt alle relevanten Daten zurück."""
        if not os.path.exists(self.persons_db_path):
            return None

        conn = sqlite3.connect(self.persons_db_path)
        cursor = conn.cursor()
        
        # Case-insensitive Suche
        cursor.execute("SELECT * FROM persons WHERE person_name LIKE ? LIMIT 1", (f"%{name_query}%",))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return None
            
        # Zeile entpacken (Schema: id, type, name, org, supported, initiated, ...)
        # Wir nehmen an, dass die Spaltenreihenfolge stabil ist, wie im 'sqlite3' Befehl gesehen
        p_id = row[0]
        p_name = row[2]
        p_org_json = row[3]
        p_supp_json = row[4]
        
        # KV extrahieren
        try:
            orgs = json.loads(p_org_json)
            kv = orgs[0] if orgs and isinstance(orgs, list) else str(p_org_json)
        except:
            kv = str(p_org_json)
            
        # Unterstützte Anträge IDs extrahieren
        amendment_ids = []
        try:
            supported_list = json.loads(p_supp_json)
            # Format ist [[id, date], ...]
            if supported_list and isinstance(supported_list, list):
                # Nimm die letzten 20 Anträge
                amendment_ids = [str(item[0]) for item in supported_list[-20:]]
        except:
            pass
            
        conn.close()
        
        # Details zu Anträgen holen
        amendment_details = self.get_amendment_details(amendment_ids)
        
        amendment_titles = []
        conventions = set()
        
        for aid in amendment_ids:
            detail = amendment_details.get(aid)
            if detail:
                amendment_titles.append(detail['title'])
                if detail['convention']:
                    conventions.add(detail['convention'])
            else:
                amendment_titles.append(f"ID {aid}")
        
        # Regression Position aus GEXF Daten
        reg_pos = self.regression_data.get(p_name.lower())
        
        # Initiierte Anträge aus YAML
        initiated_data = self.initiated_content_cache.get(p_name.lower(), [])
        
        return {
            "name": p_name,
            "kv": kv,
            "supported_amendments": amendment_titles,
            "total_supported": len(amendment_titles),
            "supported_conventions": list(conventions),
            "regression_pos": reg_pos,
            "initiated_amendments": initiated_data
        }

