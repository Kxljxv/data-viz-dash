import asyncio
import aiohttp
import sqlite3
import os
import sys
from datetime import datetime

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common
import database

# Konfiguration
CONCURRENT_CHECKS = 100
MAX_RETRIES = 2
BUFFER = 500 # Wie weit wir über die höchste bekannte ID eines Konvents hinaus scannen

async def check_id(session, slug, motion_slug, am_id, semaphore):
    if not motion_slug:
        return False
    
    url = f"https://berlin.antragsgruen.de/rest/{slug}/motion/{motion_slug}/amendment/{am_id}"
    async with semaphore:
        for attempt in range(MAX_RETRIES):
            try:
                async with session.get(url, headers=common.get_headers(), timeout=10) as resp:
                    if resp.status == 200:
                        return True
                    if resp.status == 404:
                        try:
                            data = await resp.json()
                            msg = data.get('message', '')
                            if "gehört nicht zum Antrag" in msg or "does not belong to this application" in msg:
                                return True
                        except:
                            pass
                    return False
            except:
                await asyncio.sleep(0.5 * (attempt + 1))
        return False

async def scan_convention(session, slug, motion_slug, start_id, end_id, semaphore, cursor, conn):
    print(f"[*] Scanne {slug} im Bereich {start_id} bis {end_id}...")
    
    # Bereits bekannte IDs in DIESEM Konvent laden
    cursor.execute("SELECT id FROM amendments WHERE convention_slug = ?", (slug,))
    known_in_conv = set(row[0] for row in cursor.fetchall())
    
    # Bereits als NOT_FOUND markierte IDs für diesen Konvent laden
    cursor.execute("SELECT amendment_id FROM check_log WHERE convention_slug = ? AND status = 'NOT_FOUND'", (slug,))
    checked_in_conv = set(row[0] for row in cursor.fetchall())
    
    tasks = []
    found_count = 0
    
    for am_id in range(start_id, end_id + 1):
        if am_id in known_in_conv or am_id in checked_in_conv:
            continue
            
        async def process_id(aid):
            nonlocal found_count
            if await check_id(session, slug, motion_slug, aid, semaphore):
                cursor.execute('''
                    INSERT OR REPLACE INTO amendments 
                    (id, convention_slug, is_public, discovery_method, discovery_date)
                    VALUES (?, ?, ?, ?, datetime('now'))
                ''', (aid, slug, False, 'SMART_SCAN'))
                found_count += 1
                return True
            else:
                cursor.execute('''
                    INSERT OR REPLACE INTO check_log (amendment_id, convention_slug, status, check_date)
                    VALUES (?, ?, 'NOT_FOUND', datetime('now'))
                ''', (aid, slug))
                return False

        tasks.append(process_id(am_id))
        
        if len(tasks) >= CONCURRENT_CHECKS:
            await asyncio.gather(*tasks)
            tasks = []
            conn.commit()
            print(f"    - Fortschritt: {am_id} / {end_id}")
            
    if tasks:
        await asyncio.gather(*tasks)
        conn.commit()
        
    if found_count > 0:
        print(f"    [+] {found_count} neue Amendments in {slug} gefunden!")

async def main():
    database.init_db()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    # Alle Konvente mit ihren Ranges holen
    cursor.execute("""
        SELECT c.slug, c.probe_motion_slug, MIN(a.id), MAX(a.id)
        FROM conventions c
        LEFT JOIN amendments a ON a.convention_slug = c.slug
        GROUP BY c.slug
        ORDER BY MIN(a.id) ASC
    """)
    conventions = cursor.fetchall()
    
    semaphore = asyncio.Semaphore(CONCURRENT_CHECKS)
    
    async with await common.create_aiohttp_session() as session:
        last_max = 0
        for i, (slug, motion_slug, min_id, max_id) in enumerate(conventions):
            if not motion_slug:
                continue
                
            # Bereich festlegen: 
            # Start ist entweder 1 oder kurz nach dem Ende des vorherigen Konvents
            start = max(1, last_max + 1)
            
            # Ende ist entweder das bekannte Max + Buffer, 
            # oder wenn wir das nächste Min kennen, kurz davor.
            if i < len(conventions) - 1 and conventions[i+1][2] is not None:
                next_min = conventions[i+1][2]
                end = next_min - 1
            else:
                end = (max_id or start) + BUFFER
            
            if end < start:
                end = start + BUFFER
                
            await scan_convention(session, slug, motion_slug, start, end, semaphore, cursor, conn)
            
            if max_id:
                last_max = max(last_max, max_id)
            else:
                last_max = max(last_max, end)

    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
