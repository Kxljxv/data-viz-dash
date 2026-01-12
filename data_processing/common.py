import sqlite3
import os
import re
import requests
import random
import time
from datetime import datetime
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Anti-ban dependencies
try:
    from fake_useragent import UserAgent
    ua = UserAgent(fallback='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
except ImportError:
    class UserAgent:
        def __init__(self, **kwargs): pass
        def random(self): return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    ua = UserAgent()

# Configuration
CONVENTION_ID = "LDK26-1" # User provided
BASE_URL = f"https://berlin.antragsgruen.de/{CONVENTION_ID}"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "live_data.sqlite")
SNAPSHOT_DIR = os.path.join(BASE_DIR, "snapshots")
HTML_DIR = os.path.join(BASE_DIR, "amendment_htmls")
BRUTE_FORCED_URLS_PATH = os.path.join(BASE_DIR, "ammendment_urls", "valid_final_urls.txt")

# Anti-ban settings
MIN_DELAY = 1.0
MAX_DELAY = 3.0

COOKIES_FILE = os.path.join(BASE_DIR, "cookies.json")

def load_cookies():
    """Loads cookies from a local cookies.json file if it exists."""
    if os.path.exists(COOKIES_FILE):
        try:
            import json
            with open(COOKIES_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"[-] Warning: Could not load cookies from {COOKIES_FILE}: {e}")
    return {}

def random_sleep():
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

def get_headers():
    headers = {'User-Agent': ua.random}
    # If we have a CSRF token in cookies, some systems require it in headers too
    cookies = load_cookies()
    if '_csrf' in cookies:
        headers['X-CSRF-Token'] = cookies['_csrf']
    return headers

# Ensure directories exist
os.makedirs(SNAPSHOT_DIR, exist_ok=True)
os.makedirs(HTML_DIR, exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS amendments (
            id TEXT PRIMARY KEY,
            url TEXT,
            applicant_name TEXT,
            applicant_kv TEXT,
            status_list TEXT,
            status_timeline TEXT,
            created TEXT,
            submitted TEXT,
            supporter_list TEXT,
            earlier_supporters TEXT,
            last_time_checked TEXT,
            html_path TEXT,
            long_label TEXT,
            short_label TEXT,
            applicant_id TEXT
        )
    ''')
    conn.commit()
    conn.close()

def create_session():
    session = requests.Session()
    
    # Load and apply cookies
    cookies = load_cookies()
    if cookies:
        session.cookies.update(cookies)
        print(f"[*] Session initialized with {len(cookies)} cookies.")
    
    retry = Retry(
        total=3,
        read=3,
        connect=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

async def create_aiohttp_session():
    """Creates an aiohttp session with pre-loaded cookies."""
    import aiohttp
    cookies = load_cookies()
    session = aiohttp.ClientSession(cookies=cookies)
    if cookies:
        print(f"[*] Aiohttp session initialized with {len(cookies)} cookies.")
    return session

RE_ID_CLEAN = re.compile(r'[^a-z0-9-]')

def slugify(text):
    if not text:
        return ""
    text = text.lower().replace(' ', '-')
    return RE_ID_CLEAN.sub('', text)

def convert_to_iso(dt_str):
    """Converts 'DD.MM.YYYY, HH:MM' to ISO 9075 'YYYY-MM-DD HH:MM:00'"""
    if not dt_str:
        return None
    try:
        # Example: 05.01.2026, 20:44
        dt = datetime.strptime(dt_str.strip(), "%d.%m.%Y, %H:%M")
        return dt.strftime("%Y-%m-%d %H:%M:00")
    except Exception:
        return None
