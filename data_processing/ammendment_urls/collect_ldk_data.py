import sys
import os

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import asyncio
import aiohttp
import random
from datetime import datetime
import common  # Import our shared logic for headers and session management

# Configuration
GLOBAL_REST_URL = "https://berlin.antragsgruen.de/rest"
BASE_DOMAIN = "https://berlin.antragsgruen.de"
CONVENTION_FILTER = "ldk"
CONCURRENT_REQUESTS = 10
SCAN_WINDOW = 200 # How many IDs to probe past the highest known ID per convention

async def fetch_ldk_conventions(session):
    """Fetches all conventions from the global REST API and filters by 'ldk' in ID."""
    # Since the public API root is disabled, we use a fallback list or try to guess common ones.
    # In this specific case, we know LDK26-1 exists.
    print(f"[*] Fetching global conventions (Fallback mode due to disabled API root)...")
    
    # Example list of known/suspected LDK conventions
    known_conventions = ["LDK26-1", "LDK25-2", "LDK25-1", "LDK24-2", "LDK24-1"]
    conventions = []
    
    for conv_id in known_conventions:
        rest_url = f"{BASE_DOMAIN}/rest/{conv_id}"
        try:
            async with session.get(rest_url, headers=common.get_headers()) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    conventions.append({
                        'id': conv_id,
                        'rest_url': rest_url,
                        'title': data.get('title', conv_id)
                    })
                    print(f"  [+] Found convention: {conv_id}")
        except:
            continue
            
    print(f"[*] Found {len(conventions)} active LDK conventions.")
    return conventions

async def get_amendments_for_convention(session, conv):
    """Fetches all publicly screened amendments for a specific convention."""
    conv_id = conv['id']
    rest_url = conv['rest_url']
    print(f"[*] Fetching amendments for {conv_id}...")
    
    screened_amendments = []
    public_ids = set()
    motion_slugs = [] # Still needed for probing later
    
    try:
        async with session.get(rest_url, headers=common.get_headers()) as resp:
            if resp.status == 200:
                data = await resp.json()
                motion_links = data.get('motion_links', [])
                
                # For each motion, get its amendments
                for motion in motion_links:
                    slug = motion.get('slug')
                    if slug:
                        motion_slugs.append(slug)
                        
                    motion_rest_url = motion.get('url_json')
                    if not motion_rest_url: continue
                    
                    async with session.get(motion_rest_url, headers=common.get_headers()) as mresp:
                        if mresp.status == 200:
                            mdata = await mresp.json()
                            am_links = mdata.get('amendment_links', [])
                            for am in am_links:
                                am_id = int(am.get('id'))
                                public_ids.add(am_id)
                                screened_amendments.append({
                                    'id': am_id,
                                    'title': am.get('title'),
                                    'status': 'screened',
                                    'motion_slug': motion.get('slug')
                                })
        
        print(f"[*] {conv_id}: Found {len(screened_amendments)} screened amendments.")
        return screened_amendments, public_ids, motion_slugs
    except Exception as e:
        print(f"[-] Error fetching amendments for {conv_id}: {e}")
        return [], set(), []

async def probe_unscreened_ids(session, conv_id, start_id, end_id, public_ids, motion_slug, semaphore):
    """Probes a range of IDs to find hidden (unscreened) amendments."""
    unscreened = []
    
    # We use a known motion slug to trigger redirects
    # URL template: domain/conv_id/motion_slug/ID
    probe_url_template = f"{BASE_DOMAIN}/{conv_id}/{motion_slug}/"
    
    async def check_id(am_id):
        if am_id in public_ids:
            return None
            
        url = f"{probe_url_template}{am_id}"
        async with semaphore:
            await asyncio.sleep(random.uniform(0.1, 0.3))
            try:
                # Use HEAD and no redirects to detect existence
                async with session.head(url, headers=common.get_headers(), allow_redirects=False, timeout=5) as resp:
                    if resp.status in (301, 302):
                        location = resp.headers.get('Location', '')
                        if f"/{conv_id}/" in location and str(am_id) in location:
                            print(f"  [!] Found hidden ID {am_id} in {conv_id}")
                            return {
                                'id': am_id,
                                'url': location,
                                'status': 'unscreened'
                            }
            except:
                pass
        return None

    tasks = [check_id(i) for i in range(start_id, end_id)]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r]

async def process_convention(session, conv, semaphore):
    """Full workflow for one convention: fetch public, then find hidden."""
    conv_id = conv['id']
    screened, public_ids, motion_slugs = await get_amendments_for_convention(session, conv)
    
    if not motion_slugs or not public_ids:
        return {'id': conv_id, 'amendments': screened}
        
    # Heuristic: Scan a window around the highest known ID
    max_id = max(public_ids)
    # Also scan a bit below just in case, and above
    start_id = max(max_id - 100, 1000)
    end_id = max_id + SCAN_WINDOW
    
    print(f"[*] {conv_id}: Probing IDs {start_id} to {end_id} for hidden amendments...")
    
    # Use the first motion slug as probe template
    unscreened = await probe_unscreened_ids(session, conv_id, start_id, end_id, public_ids, motion_slugs[0], semaphore)
    
    all_amendments = screened + unscreened
    print(f"[*] {conv_id}: Total {len(all_amendments)} amendments ({len(unscreened)} hidden).")
    
    return {
        'id': conv_id,
        'title': conv['title'],
        'amendments': all_amendments,
        'stats': {
            'screened': len(screened),
            'unscreened': len(unscreened)
        }
    }

async def main():
    semaphore = asyncio.Semaphore(CONCURRENT_REQUESTS)
    
    async with await common.create_aiohttp_session() as session:
        conventions = await fetch_ldk_conventions(session)
        
        results = []
        for conv in conventions:
            res = await process_convention(session, conv, semaphore)
            results.append(res)
            
        # Export results
        output_file = "all_ldk_amendments.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
            
        print(f"\n[SUCCESS] Data for {len(results)} conventions saved to {output_file}")

if __name__ == "__main__":
    asyncio.run(main())
