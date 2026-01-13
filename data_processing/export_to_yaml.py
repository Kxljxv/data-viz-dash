import asyncio
import aiohttp
import json
import yaml
import os
import sys
from tqdm.asyncio import tqdm

# --- KONFIGURATION ---
# Die zentrale Datei mit den Cookies für alle Domains
COOKIES_FILE = "cookies.yaml"

# Quellen-Definitionen mit ihren jeweiligen Basis-URLs und dem Schlüssel in der cookies.yaml
SOURCES = {
    "bund": {
        "base_url": "https://antraege.gruene.de/rest",
        "cookie_key": "antraege.gruene.de"
    },
    "berlin": {
        "base_url": "https://berlin.antragsgruen.de/rest",
        "cookie_key": "berlin.antragsgruen.de"
    }
}

# Die Liste der zu verarbeitenden Konvent-Slugs (url_path)
# Diese werden in allen konfigurierten Quellen gesucht.
TARGET_SLUGS = [
    "bdk41",
    "bdk42",
    "ao-bdk",
    "43bdk",
    "44bdk",
    "45bdk",
    "46bdk",
    "47bdk",
    "48bdk",
    "49bdk",
    "50bdk",
    "aobdk2025",
    "51bdk",

    "wahlprogramm-2016",
    "ldk2017",
    "ldk18",
    "ldk-2018-2",
    "LDK191",
    "ldk192",
    "ldk20",
    "programm21",
    "LDK214",
    "ldk221"
    "LA_September_22",
    "LA_Oktober_22"
    "LA_November_2022",
    "LDK23-1",
    "LA2023-1",
    "LDK23-2",
    "LA2023-2",
    "LA2023-3",
    "LA2023-4",
    "LDK23-3",
    "LA2023-5"
    "LA2023-6",
    "LA2024-1",
    "LA2024-2",
    "LDK24-1",
    "LA2024-3",
    "LA2024-4",
    "LDK24-2",
    "LDK2024-3",
    "LA25-1",
    "LA2025-2",
    "LDK25-1",
    "LA25-3",
    "LDK25-2",
    "LA25-4",
    "LDK26-1"

    # Hier können manuell weitere Slugs (z.B. von Berlin) hinzugefügt werden
]

# Name der Ausgabedatei
OUTPUT_FILE = "exportierte_konvente.yaml"

# Maximale Anzahl paralleler Anfragen pro Quelle
MAX_CONCURRENT_REQUESTS = 5
# ---------------------

def load_all_cookies(file_path):
    """Lädt alle Cookies aus der zentralen YAML-Datei."""
    try:
        with open(file_path, "r", encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"[-] Fehler beim Laden der Cookies aus {file_path}: {e}")
        return {}

async def fetch_json(session, url, semaphore, retries=3):
    """Ruft JSON-Daten von einer URL ab, gesteuert durch ein Semaphore und mit Retry-Logik."""
    async with semaphore:
        for i in range(retries):
            try:
                # Timeout erhöhen auf 30 Sekunden
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 404:
                        # 404 ist bei "screened only" oft ein Zeichen für nicht-öffentliche Daten
                        return None
                    elif response.status == 429:
                        # Too Many Requests - etwas länger warten
                        wait_time = (i + 1) * 10
                        print(f"\n[!] Rate Limit (429) bei {url}. Warte {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        print(f"[-] Status {response.status} für {url}")
                        return None
            except (asyncio.TimeoutError, aiohttp.ClientError) as e:
                wait_time = (i + 1) * 2
                if i < retries - 1:
                    print(f"[!] {type(e).__name__} bei {url}. Retry {i+1}/{retries} in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    print(f"[-] Fehler nach {retries} Versuchen bei {url}: {type(e).__name__}")
                    return None
            except Exception as e:
                print(f"[-] Unerwarteter Fehler bei {url}: {type(e).__name__} - {str(e)}")
                return None
        return None

async def process_amendment(session, am_link_data, semaphore, prefix=""):
    """Verarbeitet ein einzelnes Amendment."""
    # Nutze url_json aus den Link-Daten falls vorhanden, sonst konstruiere sie
    url = am_link_data.get("url_json")
    am_id = am_link_data.get("id")
    
    if not url and am_id:
        # Fallback (sollte bei korrekter API-Nutzung nicht nötig sein)
        return None

    data = await fetch_json(session, url, semaphore)
    if not data:
        return None
    
    # ID mit Präfix versehen (außer für Personen, aber hier geht es um das Amendment-Objekt selbst)
    prefixed_am_id = f"{prefix}/{am_id}" if prefix and am_id else am_id

    # Struktur gemäß muster_struktur.yaml
    # Supporters als Liste von Strings formatieren
    formatted_supporters_am = []
    for s in data.get("supporters", []):
        if isinstance(s, dict):
            name = s.get("name")
            org = s.get("organization")
            if name and org:
                formatted_supporters_am.append(f"{name} ({org})")
            elif name:
                formatted_supporters_am.append(name)
        elif isinstance(s, str):
            formatted_supporters_am.append(s)

    am_struct = {
        "type": data.get("type"),
        "id": prefixed_am_id,
        "prefix": data.get("prefix"),
        "title": data.get("title"),
        "title_with_prefix": data.get("title_with_prefix"),
        "first_line": data.get("first_line"),
        "status_id": data.get("status_id"),
        "status_title": data.get("status_title"),
        "date_published": data.get("date_published"),
        "supporters": formatted_supporters_am,
        "initiators": {
            "type": data.get("initiators", {}).get("type") if isinstance(data.get("initiators"), dict) else None,
            "name": data.get("initiators", {}).get("name") if isinstance(data.get("initiators"), dict) else None,
            "organization": data.get("initiators", {}).get("organization") if isinstance(data.get("initiators"), dict) else None,
        },
        "initiators_html": data.get("initiators_html"),
        "sections": [
            {
                s.get("title", "unnamed"): {
                    "type": s.get("type"),
                    "title": s.get("title"),
                    "html": s.get("html")
                }
            } for s in data.get("sections", [])
        ],
        "proposed_procedure": str(data.get("proposed_procedure")) if data.get("proposed_procedure") else None,
        "url_json": data.get("url_json"),
        "url_html": data.get("url_html")
    }
    return {str(prefixed_am_id): am_struct}


async def process_motion(session, motion_link_data, semaphore, prefix=""):
    """Verarbeitet eine einzelne Motion und deren Amendments."""
    url = motion_link_data.get("url_json")
    motion_id = motion_link_data.get("id")
    
    if not url:
        return None

    data = await fetch_json(session, url, semaphore)
    if not data:
        return None
    
    # ID mit Präfix versehen
    prefixed_motion_id = f"{prefix}/{motion_id}" if prefix and motion_id else motion_id

    # Amendments abrufen
    am_links = data.get("amendment_links") or data.get("amendments") or []
    
    am_tasks = []
    for am in am_links:
        if isinstance(am, dict):
            am_tasks.append(process_amendment(session, am, semaphore, prefix))
    
    # Nutze tqdm für den Fortschritt der Amendments, falls es viele sind
    if len(am_tasks) > 5:
        processed_ams = await tqdm.gather(
            *am_tasks, 
            desc=f"        Lade {len(am_tasks)} Amendments für Motion {motion_id}", 
            leave=False,
            disable=None
        )
    else:
        processed_ams = await asyncio.gather(*am_tasks)
        
    am_list = [am for am in processed_ams if am]

    # Supporters als Liste von Strings formatieren
    formatted_supporters_mo = []
    for s in data.get("supporters", []):
        if isinstance(s, dict):
            name = s.get("name")
            org = s.get("organization")
            if name and org:
                formatted_supporters_mo.append(f"{name} ({org})")
            elif name:
                formatted_supporters_mo.append(name)
        elif isinstance(s, str):
            formatted_supporters_mo.append(s)

    motion_struct = {
        "type": data.get("type"),
        "id": prefixed_motion_id,
        "agenda_item": data.get("agenda_item"),
        "prefix": data.get("prefix"),
        "title": data.get("title"),
        "title_with_intro": data.get("title_with_intro"),
        "title_with_prefix": data.get("title_with_prefix"),
        "status_id": data.get("status_id"),
        "status_title": data.get("status_title"),
        "date_published": data.get("date_published"),
        "supporters": formatted_supporters_mo,
        "initiators": {
            "type": data.get("initiators", {}).get("type") if isinstance(data.get("initiators"), dict) else None,
            "name": data.get("initiators", {}).get("name") if isinstance(data.get("initiators"), dict) else None,
            "organization": data.get("initiators", {}).get("organization") if isinstance(data.get("initiators"), dict) else None,
        },
        "initiators_html": data.get("initiators_html"),
        "sections": [
            {
                s.get("title", "unnamed"): {
                    "type": s.get("type"),
                    "title": s.get("title"),
                    "html": s.get("html"),
                    "layout_right": s.get("layout_right", False)
                }
            } for s in data.get("sections", [])
        ],
        "proposed_procedure": str(data.get("proposed_procedure")) if data.get("proposed_procedure") else None,
        "amendments": am_list
    }
    return {str(prefixed_motion_id): motion_struct}


async def process_convention(session, conv_info, semaphore, prefix=""):
    """Verarbeitet einen Konvent und alle darin enthaltenen Motions."""
    slug = conv_info.get("url_path")
    print(f"[*] Verarbeite Konvent: {slug}...")
    
    # Nutze url_json aus den Konvent-Informationen
    url = conv_info.get("url_json")
    if not url:
        print(f"[-] Keine url_json für {slug} gefunden.")
        return None

    conv_data = await fetch_json(session, url, semaphore)
    if not conv_data:
        print(f"[-] Konvent-Details für {slug} konnten nicht geladen werden.")
        return None
    
    # ID mit Präfix versehen
    prefixed_slug = f"{prefix}/{slug}" if prefix else slug

    # Motions-Links finden
    motion_links = conv_data.get("motion_links") or conv_data.get("motions") or []
    
    motion_tasks = []
    for m in motion_links:
        if isinstance(m, dict):
            motion_tasks.append(process_motion(session, m, semaphore, prefix))
    
    # Nutze tqdm für den Fortschritt der Motions innerhalb eines Konvents
    processed_motions = await tqdm.gather(
        *motion_tasks, 
        desc=f"      Lade Motions für {slug}", 
        leave=False,
        disable=None
    )
    motion_list = [m for m in processed_motions if m]
    
    print(f"    [+] {len(motion_list)} öffentliche Motions in {slug} gefunden.")
    
    conv_struct = {
        "title": conv_info.get("title"),
        "title_short": conv_info.get("title_short"),
        "date_published": conv_info.get("date_published"),
        "url_path": prefixed_slug,
        "url_json": conv_info.get("url_json"),
        "url_html": conv_info.get("url_html"),
        "content": {
            "motions": motion_list
        }
    }
    return {str(prefixed_slug): conv_struct}

async def main():
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    
    # Header setzen (User-Agent ist oft nötig)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # Bestehende Daten laden, falls vorhanden, um Duplikate zu vermeiden
    if os.path.exists(OUTPUT_FILE):
        print(f"[*] Lade bestehende Daten aus {OUTPUT_FILE}...")
        try:
            with open(OUTPUT_FILE, "r", encoding='utf-8') as f:
                final_data = yaml.safe_load(f) or {}
            print(f"[+] {len(final_data)} Konvente bereits in lokaler Datei vorhanden.")
        except Exception as e:
            print(f"[-] Fehler beim Laden von {OUTPUT_FILE}: {e}")
            final_data = {}
    else:
        final_data = {}
    
    # Alle Cookies auf einmal laden
    all_cookies_data = load_all_cookies(COOKIES_FILE)
    
    # Über alle konfigurierten Quellen iterieren
    for source_name, config in SOURCES.items():
        base_url = config["base_url"]
        cookie_key = config["cookie_key"]
        
        print(f"\n[***] Verarbeite Quelle: {source_name} ({base_url}) [***]")
        
        # Cookies für diese spezifische Quelle extrahieren
        cookies = all_cookies_data.get(cookie_key, {})
        if not cookies:
            print(f"[!] Warnung: Keine Cookies für {cookie_key} in {COOKIES_FILE} gefunden.")
        
        async with aiohttp.ClientSession(cookies=cookies, headers=headers) as session:
            # 1. Alle verfügbaren Konvente dieser Quelle abrufen
            print(f"[*] Rufe Konvent-Liste von {base_url} ab...")
            all_conventions = await fetch_json(session, base_url, semaphore)
            
            if not all_conventions or not isinstance(all_conventions, list):
                print(f"[-] Konvent-Liste von {source_name} konnte nicht geladen werden.")
                continue

            # 2. Nur die Ziel-Slugs filtern, die in dieser Quelle vorhanden sind
            target_convs = [c for c in all_conventions if c.get("url_path") in TARGET_SLUGS]
            
            if not target_convs:
                print(f"[-] Keine der Ziel-Slugs in {source_name} gefunden.")
                continue

            # 3. Konvente dieser Quelle verarbeiten
            for conv_link in tqdm(target_convs, desc=f"Fortschritt {source_name}"):
                 slug = conv_link.get("url_path")
                 if not slug:
                     continue
                 
                 # Prüfen, ob dieser Konvent bereits geladen wurde (mit Quelle als Präfix)
                 prefixed_slug = f"{source_name}/{slug}" if source_name else slug
                 if prefixed_slug in final_data:
                     continue
                     
                 result = await process_convention(session, conv_link, semaphore, source_name)
                 if result:
                     final_data.update(result)
        
    # 4. Als YAML speichern
    if final_data:
        print(f"\n[*] Speichere insgesamt {len(final_data)} Konvente in {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            yaml.dump(final_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        print(f"[+] Fertig! Daten wurden in {OUTPUT_FILE} gespeichert.")
    else:
        print("\n[-] Keine Daten zum Speichern gefunden.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[!] Abgebrochen durch Benutzer.")
