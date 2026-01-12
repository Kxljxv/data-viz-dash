import asyncio
import aiohttp
import time
import sys
import os
import random
import json
from datetime import datetime
from tqdm.asyncio import tqdm

# Import shared configuration from the root directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import common

# --- CONFIGURATION SECTION ---
CONVENTION_ID = common.CONVENTION_ID
BASE_URL = common.BASE_URL
# The correct REST URL is domain/rest/convention_id
REST_API_URL = f"https://berlin.antragsgruen.de/rest/{CONVENTION_ID}"

# We use a known motion slug to trigger the redirect logic for IDs.
# If an ID belongs to a different motion, the server will redirect us there.
# If the ID doesn't exist, it usually redirects to the motion page or base URL.
PROBE_MOTION_SLUG = "kapitel-1-berlin-bleibt-lebenswert-8504"
PROBE_URL_TEMPLATE = f"{BASE_URL}/{PROBE_MOTION_SLUG}/" + "{id}"

# STATE MANAGEMENT & OUTPUT FILES (Relative to script location)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CHECKED_IDS_FILE = os.path.join(SCRIPT_DIR, "valid_chapter_ids.txt")
VALID_URLS_OUTPUT_FILE = os.path.join(SCRIPT_DIR, "valid_url_mappings.txt")
CLEAN_URLS_OUTPUT_FILE = os.path.join(SCRIPT_DIR, "valid_final_urls.txt")
HIDDEN_AMENDMENTS_FILE = os.path.join(SCRIPT_DIR, "hidden_unscreened_amendments.txt")

# ANTI-BLOCKING & SPEED SETTINGS
MAX_CONCURRENCY = 40              # Safer concurrency
REQUEST_TIMEOUT = 15              # Increased timeout
MAX_RETRIES = 3                   # Retries for 503/Timeout
SCAN_WINDOW = 5000
SCAN_DOWNWARDS = 2000
BATCH_SIZE = 500                  # Process in batches

# --- HELPERS ---

def load_checked_ids() -> set:
    if not os.path.exists(CHECKED_IDS_FILE):
        return set()
    try:
        with open(CHECKED_IDS_FILE, 'r') as f:
            return {int(line.strip()) for line in f if line.strip().isdigit()}
    except Exception as e:
        print(f"Warning: Could not load {CHECKED_IDS_FILE}: {e}", file=sys.stderr)
        return set()

def save_new_valid_id(amendment_id):
    with open(CHECKED_IDS_FILE, 'a') as f:
        f.write(f"{amendment_id}\n")

async def get_public_amendment_ids(session):
    """Fetches all IDs that are currently visible in the public REST API."""
    print(f"[*] Fetching public IDs from {REST_API_URL}...")
    public_ids = set()
    try:
        async with session.get(REST_API_URL, headers=common.get_headers()) as resp:
            if resp.status == 200:
                data = await resp.json()
                motion_links = data.get('motion_links', [])
                
                # For each motion, fetch its amendments
                for motion in motion_links:
                    motion_rest_url = motion.get('url_json')
                    if not motion_rest_url: continue
                    
                    async with session.get(motion_rest_url, headers=common.get_headers()) as mresp:
                        if mresp.status == 200:
                            mdata = await mresp.json()
                            am_links = mdata.get('amendment_links', [])
                            for am in am_links:
                                am_id = am.get('id')
                                if am_id:
                                    public_ids.add(int(am_id))
                
                print(f"[*] Found {len(public_ids)} publicly visible amendment IDs.")
    except Exception as e:
        print(f"[-] Error fetching public IDs: {e}")
    return public_ids

async def probe_id(session, am_id, semaphore, public_ids):
    """
    Probes a single ID using HEAD request to detect existence via redirects.
    Includes retry logic for transient errors (Timeout, 503).
    """
    url = PROBE_URL_TEMPLATE.format(id=am_id)
    
    for attempt in range(MAX_RETRIES + 1):
        async with semaphore:
            # Small random delay to avoid burst detection, increasing with retries
            wait_time = random.uniform(0.1, 0.5) * (attempt + 1)
            await asyncio.sleep(wait_time)
            
            try:
                # We use allow_redirects=False to catch the 302/301 ourselves
                async with session.head(url, headers=common.get_headers(), allow_redirects=False, timeout=REQUEST_TIMEOUT) as resp:
                    
                    # 1. SUCCESS: Redirect to actual amendment
                    if resp.status in (301, 302):
                        final_url = resp.headers.get('Location', '')
                        if final_url and f"/{CONVENTION_ID}/" in final_url and str(am_id) in final_url:
                            is_hidden = am_id not in public_ids
                            result_msg = f"FOUND: {am_id} -> {final_url}"
                            if is_hidden:
                                result_msg += " [HIDDEN/UNSCREENED]"
                                with open(HIDDEN_AMENDMENTS_FILE, 'a') as f:
                                    f.write(f"{datetime.now()}: {am_id} | {final_url}\n")
                            
                            tqdm.write(f"✅ {result_msg}")
                            save_new_valid_id(am_id)
                            with open(VALID_URLS_OUTPUT_FILE, 'a') as f:
                                f.write(f"ID: {am_id} | Final: {final_url} | Hidden: {is_hidden}\n")
                            with open(CLEAN_URLS_OUTPUT_FILE, 'a') as f:
                                f.write(f"{final_url}\n")
                            return True
                    
                    # 2. SUCCESS: Direct hit
                    elif resp.status == 200:
                        tqdm.write(f"✅ FOUND (Direct): {am_id}")
                        save_new_valid_id(am_id)
                        return True
                    
                    # 3. SUCCESS: Restricted access but exists
                    elif resp.status == 403:
                        tqdm.write(f"⚠️  FOUND (Forbidden): {am_id} - Likely exists but restricted")
                        save_new_valid_id(am_id)
                        return True
                    
                    # 4. TRANSIENT ERROR: Retry for 503 (Service Unavailable)
                    elif resp.status == 503:
                        if attempt < MAX_RETRIES:
                            continue # Retry
                        else:
                            tqdm.write(f"❌ ERROR 503: {am_id} failed after {MAX_RETRIES} retries.")
                            return False
                    
                    # 5. DEFINITELY NOT FOUND: 404 or other non-existent status
                    return False

            except (asyncio.TimeoutError, aiohttp.ClientError) as e:
                if attempt < MAX_RETRIES:
                    continue # Retry
                else:
                    # tqdm.write(f"❌ TIMEOUT/ERROR: {am_id} - {type(e).__name__}")
                    return False
            except Exception as e:
                # Critical unexpected error
                # tqdm.write(f"[-] Unexpected error for {am_id}: {e}")
                return False
    return False

async def main():
    checked_ids = load_checked_ids()
    max_id = max(checked_ids) if checked_ids else 99000
    min_id = min(checked_ids) if checked_ids else 98000
    
    # We want to scan:
    # 1. Everything from min_id - SCAN_DOWNWARDS to max_id + SCAN_WINDOW
    # 2. Skipping IDs already in checked_ids
    
    start_range = max(1, min_id - SCAN_DOWNWARDS)
    end_range = max_id + SCAN_WINDOW
    
    ids_to_probe = [i for i in range(start_range, end_range + 1) if i not in checked_ids]
    
    print(f"[*] Total known valid IDs: {len(checked_ids)}")
    print(f"[*] Scanning range: {start_range} to {end_range} ({len(ids_to_probe)} new IDs to probe)")
    
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    
    async with await common.create_aiohttp_session() as session:
        # Step 1: Get all currently public IDs to identify hidden ones
        public_ids = await get_public_amendment_ids(session)
        
        print(f"[*] Starting probe of {len(ids_to_probe)} IDs...")
        tasks = [probe_id(session, am_id, semaphore, public_ids) for am_id in ids_to_probe]
        
        # Using tqdm.gather for a progress bar
        results = await tqdm.gather(*tasks, desc="Probing IDs", unit="id")
        found_count = sum(1 for r in results if r)
        
        print(f"[*] Scan complete. Found {found_count} new IDs.")

if __name__ == "__main__":
    asyncio.run(main())
