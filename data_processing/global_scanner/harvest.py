import asyncio
import sys
import os
import json
from datetime import datetime

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common
import database

async def harvest_public_data():
    database.init_db()
    
    async with await common.create_aiohttp_session() as session:
        # 1. Alle Konvente von der Haupt-REST-API laden
        base_rest = "https://berlin.antragsgruen.de/rest"
        print(f"[*] Lade Konvente von {base_rest}...")
        
        async with session.get(base_rest, headers=common.get_headers()) as resp:
            if resp.status != 200:
                print(f"[-] Fehler beim Laden der Konvente: {resp.status}")
                return
            
            data = await resp.json()
            
            # DEBUG: What does the raw data look like?
            print(f"[*] Raw data sample: {str(data)[:200]}")
            
            # If data is a list of strings (slugs), convert to list of dicts
            if isinstance(data, list) and all(isinstance(i, str) for i in data):
                conv_list = [{'slug': s, 'title': s} for s in data]
            else:
                conv_list = data.get('conventions', []) if isinstance(data, dict) else data
            
            # DEBUG: Print the first 5 slugs to verify
            print(f"[*] Slugs found: {[ (c.get('slug') or c.get('url_path')) for c in conv_list[:5]]}")
            print(f"[+] {len(conv_list)} Konvente gefunden.")

        conn = database.get_db_connection()
        cursor = conn.cursor()

        for conv in conv_list:
            # The API uses 'url_path' as the slug in some versions
            slug = conv.get('slug') or conv.get('url_path')
            title = conv.get('title')
            if not slug: continue
            
            print(f"[*] Verarbeite Konvent: {slug}")
            
            # Konvent in DB anlegen/aktualisieren
            cursor.execute('''
                INSERT OR IGNORE INTO conventions (slug, title, last_harvested)
                VALUES (?, ?, datetime('now'))
            ''', (slug, title))
            conn.commit()
            
            # Öffentliche IDs für diesen Konvent laden
            conv_url = f"https://berlin.antragsgruen.de/rest/{slug}"
            try:
                async with session.get(conv_url, headers=common.get_headers()) as cresp:
                    if cresp.status != 200:
                        print(f"    [-] Fehler beim Laden von {slug}: {cresp.status}")
                        continue
                    
                    cdata = await cresp.json()
                    
                    if isinstance(cdata, dict):
                        print(f"    [*] Keys in convention response: {list(cdata.keys())}")
                    elif isinstance(cdata, list):
                        print(f"    [*] Convention response is a list with {len(cdata)} items")
                    if isinstance(cdata, dict) and 'motion_links' not in cdata:
                        # Try to find motion_links in common places
                        motion_links = cdata.get('motions', []) or cdata.get('data', {}).get('motion_links', [])
                    else:
                        motion_links = cdata.get('motion_links', [])
                    
                    # DEBUG: How many motions?
                    if motion_links:
                        print(f"    [*] Found {len(motion_links)} motions.")
                    
                    current_max_id = 0
                    first_probe_slug = None
                    
                    for motion in motion_links:
                                # Slug extrahieren (aus 'slug' oder 'url_json')
                                m_slug = motion.get('slug')
                                if not m_slug and motion.get('url_json'):
                                    m_slug = motion.get('url_json').split('/')[-1]
                                
                                if not m_slug:
                                    # Fallback: ID als Slug verwenden, falls vorhanden
                                    m_slug = str(motion.get('id'))
                                
                                if not m_slug: continue
                                if not first_probe_slug: first_probe_slug = m_slug
                                
                                # Check if amendments are already in the motion object
                                # Some versions use 'amendments', some 'amendment_links'
                                am_links = motion.get('amendment_links', []) or motion.get('amendments', [])
                                
                                if am_links:
                                    # print(f"    [+] Found {len(am_links)} amendments in convention response for motion {m_slug}")
                                    pass
                                else:
                                    # Amendments pro Motion separat laden
                                    m_url = motion.get('url_json') or f"https://berlin.antragsgruen.de/rest/{slug}/motion/{m_slug}"
                                    try:
                                        async with session.get(m_url, headers=common.get_headers()) as mresp:
                                            if mresp.status == 200:
                                                mdata = await mresp.json()
                                                am_links = mdata.get('amendment_links', []) or mdata.get('amendments', [])
                                                # if am_links:
                                                #     print(f"    [+] Found {len(am_links)} amendments for motion {m_slug}")
                                    except Exception as e:
                                        print(f"    [-] Fehler beim Laden der Motion {m_slug}: {e}")
                                
                                for am in am_links:
                                    try:
                                        am_id = int(am.get('id'))
                                        if am_id > current_max_id: current_max_id = am_id
                                        
                                        # Amendment in DB speichern
                                        cursor.execute('''
                                            INSERT OR REPLACE INTO amendments 
                                            (id, convention_slug, motion_slug, is_public, discovery_method, discovery_date)
                                            VALUES (?, ?, ?, ?, ?, datetime('now'))
                                        ''', (am_id, slug, m_slug, True, 'REST_PUBLIC'))
                                    except (ValueError, TypeError):
                                        continue
                    
                    # Konvent-Metadaten aktualisieren
                    cursor.execute('''
                        UPDATE conventions 
                        SET max_id = ?, probe_motion_slug = ?, last_harvested = datetime('now')
                        WHERE slug = ?
                    ''', (current_max_id, first_probe_slug, slug))
                    
                    if current_max_id > 0:
                        print(f"    [+] {slug}: Max-ID {current_max_id}, Probe-Slug: {first_probe_slug}")
                    conn.commit()
            except Exception as e:
                print(f"    [-] Fehler bei {slug}: {e}")

        conn.close()
        print("\n[+] Phase 1 (Harvesting) abgeschlossen.")

if __name__ == "__main__":
    asyncio.run(harvest_public_data())
