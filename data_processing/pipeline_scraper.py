import os
import requests
import yaml
import re
import time
import asyncio
import aiohttp
import aiofiles
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STARTING_PAGES_DIR = os.path.join(SCRIPT_DIR, "html_starting_pages")
AMENDMENTS_HTML_DIR = os.path.join(SCRIPT_DIR, "amendments_html")
YAML_FILE = os.path.join(SCRIPT_DIR, "amendments_pipeline.yaml")

URLS = [
    "https://antraege.gruene.de/43bdk/",
    "https://antraege.gruene.de/44bdk/",
    "https://antraege.gruene.de/45bdk/",
    "https://antraege.gruene.de/46bdk/",
    "https://antraege.gruene.de/47bdk/",
    "https://antraege.gruene.de/48bdk/",
    "https://antraege.gruene.de/49bdk/",
    "https://antraege.gruene.de/50bdk/",
    "https://antraege.gruene.de/51bdk/",
    "https://berlin.antragsgruen.de/LDK20",
    "https://berlin.antragsgruen.de/LDK23-1",
    "https://berlin.antragsgruen.de/LDK23-2",
    "https://berlin.antragsgruen.de/LDK23-3",
    "https://berlin.antragsgruen.de/LDK24-1",
    "https://berlin.antragsgruen.de/LDK24-2",
    "https://berlin.antragsgruen.de/LDK25-1",
    "https://berlin.antragsgruen.de/LDK25-2",
    "https://berlin.antragsgruen.de/LDK26-1",
    "https://berlin.antragsgruen.de/LA25-3",
    "https://berlin.antragsgruen.de/LA25-4",
    "https://berlin.antragsgruen.de/LA26-1"
]

MAX_WORKERS = 20
RE_ID_CLEAN = re.compile(r'[^a-z0-9-]')

def create_session():
    """Creates a requests Session with retry logic."""
    session = requests.Session()
    retry = Retry(
        total=3,
        read=3,
        connect=3,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

SESSION = create_session()

def slugify(text):
    """Converts text to lowercase, replaces spaces with hyphens, and removes special characters."""
    if not text:
        return ""
    text = text.lower().replace(' ', '-')
    return RE_ID_CLEAN.sub('', text)

def download_starting_pages():
    """Step 1: Download all starting pages."""
    print("Step 1: Downloading starting pages...")
    os.makedirs(STARTING_PAGES_DIR, exist_ok=True)
    
    def download(url):
        convention_id = url.strip('/').split('/')[-1]
        filename = os.path.join(STARTING_PAGES_DIR, f"{convention_id}.html")
        if os.path.exists(filename):
            return  # Skip if exists
        try:
            response = SESSION.get(url, timeout=30)
            response.raise_for_status()
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(response.text)
        except Exception as e:
            print(f"Error downloading {url}: {e}")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        list(tqdm(executor.map(download, URLS), total=len(URLS), desc="Downloading Overviews"))

def extract_amendments_from_starting_pages():
    """Step 2 & 3: Create YAML from starting pages and identify 'isperson'."""
    print("Step 2 & 3: Extracting amendments and identifying applicants...")
    all_data = {}
    
    # Create a mapping of convention_id -> base_url to handle different domains
    url_map = {}
    for u in URLS:
        cid = u.strip('/').split('/')[-1]
        # Ensure base URL ends with / so yarl.URL.join works correctly for relative paths
        url_map[cid] = u if u.endswith('/') else u + '/'
    
    files = [f for f in os.listdir(STARTING_PAGES_DIR) if f.endswith(".html")]
    
    for filename in tqdm(files, desc="Parsing Starting Pages"):
        convention_id = filename.replace(".html", "")
        filepath = os.path.join(STARTING_PAGES_DIR, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'lxml')
            
        # Parse logic (similar to previous script but looking for author info)
        # We need to inspect the HTML structure for 'author'.
        # Based on Antragsgrün, the author is often in a column or subtitle.
        # If not found, we mark as unknown.
        
        # NOTE: I am making an assumption here about the structure. 
        # I will extract what I can.
        
        # Rows
        motion_rows = soup.find_all('li', class_=re.compile(r'motionRow\d+'))
        
        # Determine the correct base URL for this convention
        base_url_str = url_map.get(convention_id)
        if not base_url_str:
            # Fallback for safety, though it should be in url_map
            base_url_str = f"https://antraege.gruene.de/{convention_id}/"
            
        from yarl import URL
        base_u = URL(base_url_str)

        for row in motion_rows:
            # Try to find author in the row
            # Usually in .motionApplicant or similar?
            # Let's look for text patterns or classes.
            # In the user's description: "If the 'author' attribute contains '(dort beschlossen am:' it is no person."
            # This implies the author text is visible.
            
            author_text = ""
            # Heuristic: Find all text in the row and see if we can identify the applicant.
            # Often it's in a span class="motionApplications" or similar.
            # Let's try to grab the whole text of the row for now if specific class is missing,
            # or better, check specific classes.
            
            # Common classes: motionPrefix, motionTitle, motionApplicant...
            # If motionApplicant exists:
            applicant_tag = row.find(class_=re.compile(r'motionApplicant|applicant', re.I))
            if applicant_tag:
                author_text = applicant_tag.get_text(strip=True)
            else:
                # Fallback to p.info (seen in 43bdk.html)
                info_tag = row.find('p', class_='info')
                if info_tag:
                    author_text = info_tag.get_text(strip=True)
            
            # Motions
            link_tag = row.find('a', class_=re.compile(r'motionLink\d+'))
            if link_tag:
                url = str(base_u.join(URL(link_tag.get('href'))))
                title_tag = link_tag.find('span', class_='motionTitle')
                title = title_tag.get_text().strip() if title_tag else "Unknown"
                
                # Check isperson
                is_person = True
                if "beschlossen am:" in author_text:
                    is_person = False
                
                # We need a unique ID
                # Slugify convention + label/title?
                # The label is usually prefix + title.
                prefix_tag = link_tag.find('span', class_='motionPrefix')
                prefix = prefix_tag.get_text().strip() if prefix_tag else ""
                label = f"{prefix}: {title}" if prefix else title
                
                amendment_id = f"{slugify(convention_id)}-{slugify(label)}"
                
                all_data[amendment_id] = {
                    'convention': convention_id,
                    'url': url,
                    'label': label,
                    'author': author_text,
                    'isperson': is_person,
                    'type': 'motion'
                }

            # Amendments
            # Amendments are usually nested in the motion row
            amendment_rows = row.find_all('li', class_=re.compile(r'amendmentRow\d+'))
            for am_row in amendment_rows:
                am_link_tag = am_row.find('a', class_=re.compile(r'amendmentTitle'))
                if am_link_tag:
                    am_url = str(base_u.join(URL(am_link_tag.get('href'))))
                    am_title = am_link_tag.get_text().strip()
                    
                    # Applicant for amendment?
                    # Sometimes listed in the row too.
                    am_applicant_tag = am_row.find(class_=re.compile(r'motionApplicant|applicant', re.I))
                    if am_applicant_tag:
                        am_author_text = am_applicant_tag.get_text(strip=True)
                    else:
                        am_info_tag = am_row.find('p', class_='info')
                        am_author_text = am_info_tag.get_text(strip=True) if am_info_tag else ""
                    
                    am_is_person = True
                    if "beschlossen am:" in am_author_text:
                        am_is_person = False
                        
                    am_id = f"{slugify(convention_id)}-{slugify(am_title)}"
                    
                    all_data[am_id] = {
                        'convention': convention_id,
                        'url': am_url,
                        'label': am_title,
                        'author': am_author_text,
                        'isperson': am_is_person,
                        'type': 'amendment'
                    }

    save_yaml(all_data)
    return all_data

async def download_amendment_htmls_async(data):
    """Step 4: Download HTMLs for 'isperson' amendments asynchronously."""
    print("Step 4: Downloading amendment HTMLs (Async)...")
    os.makedirs(AMENDMENTS_HTML_DIR, exist_ok=True)
    
    items_to_download = [
        (aid, info['url']) for aid, info in data.items() 
        if info.get('isperson', False)
    ]
    
    # Filter out existing files first to avoid unnecessary tasks
    to_do = []
    for aid, url in items_to_download:
        filename = os.path.join(AMENDMENTS_HTML_DIR, f"{aid}.html")
        if not os.path.exists(filename):
            to_do.append((aid, url))
    
    if not to_do:
        print("All amendment HTMLs already exist.")
        return

    import random
    
    # Low concurrency to avoid IP-level blocks, but fresh sessions to avoid session limits
    semaphore = asyncio.Semaphore(8) 
    
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
    ]

    async def fetch_fresh(aid, url, pbar):
        filename = os.path.join(AMENDMENTS_HTML_DIR, f"{aid}.html")
        for attempt in range(5):
            try:
                async with semaphore:
                    # New session and random UA for EVERY request to stay "fresh"
                    ua = random.choice(user_agents)
                    headers = {"User-Agent": ua, "Connection": "close"} # Connection: close helps reset state
                    
                    async with aiohttp.ClientSession(headers=headers) as session:
                        async with session.get(url, timeout=20) as response:
                            if response.status == 404:
                                pbar.update(1)
                                return
                            if response.status == 429:
                                raise aiohttp.ClientResponseError(
                                    response.request_info, response.history,
                                    status=429, message="Too Many Requests"
                                )
                            
                            response.raise_for_status()
                            content = await response.read()
                            async with aiofiles.open(filename, mode='wb') as f:
                                await f.write(content)
                            pbar.update(1)
                            return
            except Exception as e:
                status = getattr(e, 'status', None)
                if status == 429:
                    wait_time = (2 ** attempt) + 10 # Aggressive wait on 429
                    await asyncio.sleep(wait_time)
                elif attempt == 4:
                    pbar.update(1)
                else:
                    await asyncio.sleep(2)

    # No batching needed here as we use fresh sessions per request
    with tqdm(total=len(to_do), desc="Downloading HTMLs (Fresh Mode)") as pbar:
        tasks = [fetch_fresh(aid, url, pbar) for aid, url in to_do]
        await asyncio.gather(*tasks)

def download_amendment_htmls(data):
    """Wrapper to run the async downloader."""
    asyncio.run(download_amendment_htmls_async(data))

def extract_supporters_and_update_yaml(data):
    """Step 5: Extract supporters from HTMLs and update YAML."""
    print("Step 5: Extracting supporters...")
    
    updates_count = 0
    
    for aid, info in tqdm(data.items(), desc="Processing HTMLs"):
        if not info.get('isperson', False):
            continue
            
        filename = os.path.join(AMENDMENTS_HTML_DIR, f"{aid}.html")
        if not os.path.exists(filename):
            continue
            
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'lxml')
                
            # Extract Applicant Details (Name/KV) if missing or partial
            # Extract Supporters
            supporters = []
            
            # Find supporters section
            section = soup.find("section", {"class": "fullList hidden"})
            if not section:
                section = soup.find("section", {"class": "supporters"})
            
            if section:
                items = section.find_all("li")
                seen = set()
                for item in items:
                    full_text = item.get_text(" ", strip=True)
                    # Split Name (KV)
                    parts = re.split(r"\s*\(", full_text)
                    name = parts[0].strip()
                    kv = parts[1].strip().rstrip(")") if len(parts) > 1 else ""
                    
                    if name and (name, kv) not in seen:
                        seen.add((name, kv))
                        supporter_id = slugify(name)
                        supporters.append({
                            'id': supporter_id,
                            'name': name,
                            'kv': kv
                        })
            
            # Also extract accurate applicant info from the page
            applicant_name = info.get('author', "")
            applicant_kv = ""
            
            table = soup.find("table", {"class": "motionDataTable"})
            if table:
                applicant_row = table.find("th", string=lambda t: t and "Antragsteller" in t)
                if applicant_row:
                    applicant_cell = applicant_row.find_next("td")
                    if applicant_cell:
                        full_text = applicant_cell.get_text(" ", strip=True)
                        parts = re.split(r"\s*\(", full_text)
                        applicant_name = parts[0].strip()
                        if len(parts) > 1:
                            applicant_kv = re.split(r"\s*\)", parts[1])[0].strip()

            # Update Data
            data[aid]['applicant_details'] = {
                'id': slugify(applicant_name),
                'name': applicant_name,
                'kv': applicant_kv
            }
            data[aid]['supporters'] = supporters
            updates_count += 1

            if updates_count % 500 == 0:
                save_yaml(data)
                print(f" (Auto-saved at {updates_count} updates)")

        except Exception as e:
            # print(f"Error processing {filename}: {e}")
            pass

    print(f"Updated {updates_count} entries with supporters.")
    save_yaml(data)

def save_yaml(data):
    """Atomic YAML save."""
    temp_file = YAML_FILE + ".tmp"
    try:
        with open(temp_file, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, sort_keys=False, width=1000)
        
        if os.path.exists(YAML_FILE):
            os.remove(YAML_FILE)
        os.rename(temp_file, YAML_FILE)
    except Exception as e:
        print(f"Error saving YAML: {e}")

def main():
    # 1. Download Starting Pages
    download_starting_pages()
    
    # 2 & 3. Extract to YAML
    data = extract_amendments_from_starting_pages()
    
    # 4. Download HTMLs
    download_amendment_htmls(data)
    
    # 5. Extract Supporters
    extract_supporters_and_update_yaml(data)

if __name__ == "__main__":
    main()
