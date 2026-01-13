import asyncio
import aiohttp
import sqlite3
import json
import sys
import os
from datetime import datetime

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common
import database

# Konfiguration
CONCURRENT_CHECKS = 100  # Erhöht für mehr Speed
BATCH_SIZE = 20         # Größere Batches für schnellere Lokalisation
MAX_RETRIES = 2         # Weniger Retries für mehr Durchsatz

async def check_id_exists(session, slug, motion_slug, amendment_id, semaphore):
    """
    Prüft, ob eine ID existiert, indem sie gegen einen Konvent und eine Motion abgefragt wird.
    """
    if not motion_slug:
        return False, False
        
    url = f"https://berlin.antragsgruen.de/rest/{slug}/motion/{motion_slug}/amendment/{amendment_id}"
    async with semaphore:
        for attempt in range(MAX_RETRIES):
            try:
                async with session.get(url, headers=common.get_headers(), timeout=10) as resp:
                    if resp.status == 200:
                        return True, True
                    if resp.status == 404:
                        try:
                            data = await resp.json()
                            msg = data.get('message', '')
                            if "gehört nicht zum Antrag" in msg or "does not belong to this application" in msg:
                                return True, False
                            if "nicht gefunden" in msg or "not found" in msg:
                                return False, False
                        except:
                            # Falls kein JSON zurückkommt, ist es wahrscheinlich ein echter 404
                            return False, False
                    return False, False
            except Exception as e:
                if attempt == MAX_RETRIES - 1:
                    print(f"      [!] Fehler bei ID {amendment_id} auf {slug}: {e}")
                await asyncio.sleep(1 * (attempt + 1))
        return False, False

async def locate_id(session, amendment_id, batches, conv_data, semaphore):
    """
    Sucht die ID in den verschiedenen Batches von Konventen.
    """
    for batch in batches:
        tasks = []
        for conv_slug in batch:
            motion_slug = conv_data.get(conv_slug)
            tasks.append(check_id_exists(session, conv_slug, motion_slug, amendment_id, semaphore))
        
        results = await asyncio.gather(*tasks)
        
        for idx, (exists, is_here) in enumerate(results):
            if exists:
                return batch[idx]
    return None

async def probe_id(session, am_id, probe_master, probe_master_motion, batches, conv_data, semaphore, cursor, conn, fast_mode=False):
    """
    Verarbeitet eine einzelne ID.
    """
    exists, is_in_master = await check_id_exists(session, probe_master, probe_master_motion, am_id, semaphore)
    
    if exists:
        target_slug = probe_master
        print(f"    [!] ID {am_id} gefunden in: {target_slug}")
        cursor.execute('''
            INSERT OR REPLACE INTO amendments 
            (id, convention_slug, is_public, discovery_method, discovery_date)
            VALUES (?, ?, ?, ?, datetime('now'))
        ''', (am_id, target_slug, False, 'PROBE_FOUND'))
        
        cursor.execute('''
            UPDATE conventions SET max_id = MAX(max_id, ?) WHERE slug = ?
        ''', (am_id, target_slug))
        return True
    
    if fast_mode:
        # Im Fast-Mode (nur Master) markieren wir die ID für diesen Master als geprüft
        cursor.execute('''
            INSERT OR REPLACE INTO check_log (amendment_id, convention_slug, status, check_date)
            VALUES (?, ?, 'NOT_FOUND', datetime('now'))
        ''', (am_id, probe_master))
        return False

    # Nicht im Master. Suche in anderen Batches.
    target_slug = await locate_id(session, am_id, batches, conv_data, semaphore)
    
    if target_slug:
        print(f"    [!] ID {am_id} gefunden in: {target_slug}")
        cursor.execute('''
            INSERT OR REPLACE INTO amendments 
            (id, convention_slug, is_public, discovery_method, discovery_date)
            VALUES (?, ?, ?, ?, datetime('now'))
        ''', (am_id, target_slug, False, 'PROBE_FOUND'))
        
        cursor.execute('''
            UPDATE conventions SET max_id = MAX(max_id, ?) WHERE slug = ?
        ''', (am_id, target_slug))
        return True
    else:
        # Gar nicht gefunden
        cursor.execute('''
            INSERT OR REPLACE INTO check_log (amendment_id, status, check_date)
            VALUES (?, 'NOT_FOUND', datetime('now'))
        ''', (am_id,))
    return False

async def probe_range(start_id, end_id, fast_mode=True):
    database.init_db()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT slug, probe_motion_slug FROM conventions ORDER BY slug ASC") # Alphabetisch oder nach ID? ldk2016 ist wahlprogramm-2016
    conv_rows = cursor.fetchall()
    all_slugs = [row[0] for row in conv_rows]
    conv_data = {row[0]: row[1] for row in conv_rows}
    
    if not all_slugs:
        print("[-] Keine Konvente in der Datenbank.")
        return
    
    # Sicherstellen, dass der gewünschte Master verwendet wird
    probe_master = "ldk2017"
    if probe_master not in conv_data:
        probe_master = all_slugs[0]
        
    probe_master_motion = conv_data[probe_master]
    
    # Bereits bekannte IDs laden, um sie zu überspringen
    cursor.execute("SELECT id FROM amendments")
    known_ids = set(row[0] for row in cursor.fetchall())
    
    # Bereits geprüfte (nicht gefundene) IDs laden (nur für diesen Master im Fast-Mode)
    if fast_mode:
        cursor.execute("SELECT amendment_id FROM check_log WHERE status = 'NOT_FOUND' AND convention_slug = ?", (probe_master,))
    else:
        cursor.execute("SELECT amendment_id FROM check_log WHERE status = 'NOT_FOUND'")
    checked_ids = set(row[0] for row in cursor.fetchall())
    
    # Andere Slugs für Batches
    other_slugs = [s for s in all_slugs if s != probe_master]
    batches = [other_slugs[i:i + BATCH_SIZE] for i in range(0, len(other_slugs), BATCH_SIZE)]
    
    semaphore = asyncio.Semaphore(CONCURRENT_CHECKS)
    
    print(f"[*] Starte Probing von ID {start_id} bis {end_id} (Master: {probe_master}, FastMode: {fast_mode})...")
    
    async with await common.create_aiohttp_session() as session:
        tasks = []
        for am_id in range(start_id, end_id + 1):
            if am_id in known_ids or am_id in checked_ids:
                continue
            
            tasks.append(probe_id(session, am_id, probe_master, probe_master_motion, batches, conv_data, semaphore, cursor, conn, fast_mode=fast_mode))
            
            if len(tasks) >= CONCURRENT_CHECKS:
                await asyncio.gather(*tasks)
                tasks = []
                conn.commit()
                print(f"[*] Fortschritt: {am_id} / {end_id} geprüft.")

        if tasks:
            await asyncio.gather(*tasks)
            conn.commit()
    
    conn.close()
    print(f"[+] Probing bis ID {end_id} abgeschlossen.")

if __name__ == "__main__":
    # Beispiel-Range: Wir suchen ab der höchsten bekannten ID + 1
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MAX(id) FROM amendments")
    max_id = cursor.fetchone()[0] or 0
    conn.close()
    
    start = 6000
    end = 7500 # Scannt den Bereich von ldk2017
    asyncio.run(probe_range(start, end, fast_mode=True))
