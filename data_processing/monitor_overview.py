import time
import os
import re
from datetime import datetime
from bs4 import BeautifulSoup
from common import (
    CONVENTION_ID, BASE_URL, SNAPSHOT_DIR, BRUTE_FORCED_URLS_PATH,
    get_db_connection, init_db, create_session, slugify, random_sleep, get_headers
)
from yarl import URL

def run():
    print(f"Starting Monitor Overview for {CONVENTION_ID}...")
    init_db()
    session = create_session()
    
    while True:
        try:
            print(f"[{datetime.now()}] Fetching overview...")
            random_sleep()
            response = session.get(BASE_URL, headers=get_headers())
            response.raise_for_status()
            
            # Save snapshot
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            snapshot_path = os.path.join(SNAPSHOT_DIR, f"{timestamp}.html")
            with open(snapshot_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
                
            # Parse
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract amendments (similar logic to pipeline_scraper.py)
            motion_rows = soup.find_all('li', class_=re.compile(r'motionRow\d+'))
            
            new_count = 0
            conn = get_db_connection()
            cursor = conn.cursor()
            
            base_u = URL(BASE_URL + "/") # Ensure trailing slash for join
            
            for row in motion_rows:
                # Check if it's a person (isprs)
                # Look for applicant text
                applicant_tag = row.find(class_=re.compile(r'motionApplicant|applicant|info', re.I))
                author_text = applicant_tag.get_text(strip=True) if applicant_tag else ""
                
                # print(f"Checking motion: {author_text}")

                # Motions and Amendments
                # Motions
                link_tag = row.find('a', class_=re.compile(r'motionLink\d+'))
                if link_tag and "beschlossen am:" not in author_text:
                    href = link_tag.get('href')
                    url = str(base_u.join(URL(href)))
                    
                    title_tag = link_tag.find('span', class_='motionTitle')
                    title = title_tag.get_text().strip() if title_tag else "Unknown"
                    
                    prefix_tag = link_tag.find('span', class_='motionPrefix')
                    prefix = prefix_tag.get_text().strip() if prefix_tag else ""
                    
                    # Use the numeric ID from the URL as the amendment_id
                    u_parts = href.rstrip('/').split('/')
                    bf_code = u_parts[-1]
                    amendment_id = f"{CONVENTION_ID}/{bf_code}"
                    
                    # Insert if new
                    cursor.execute("SELECT 1 FROM amendments WHERE id = ?", (amendment_id,))
                    if not cursor.fetchone():
                        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        cursor.execute(
                            "INSERT INTO amendments (id, url, created) VALUES (?, ?, ?)",
                            (amendment_id, url, now_str)
                        )
                        new_count += 1
                        print(f"New motion found: {amendment_id}")

                # Nested Amendments (amendmentRow)
                amendment_rows = row.find_all('li', class_=re.compile(r'amendmentRow\d+'))
                for am_row in amendment_rows:
                    am_link_tag = am_row.find('a', class_=re.compile(r'amendmentTitle'))
                    if am_link_tag:
                        am_href = am_link_tag.get('href')
                        am_url = str(base_u.join(URL(am_href)))
                        am_title = am_link_tag.get_text().strip()
                        
                        am_applicant_tag = am_row.find(class_=re.compile(r'motionApplicant|applicant|info', re.I))
                        am_author_text = am_applicant_tag.get_text(strip=True) if am_applicant_tag else ""
                        
                        if "beschlossen am:" in am_author_text:
                            continue

                        # Use the numeric ID from the URL as the amendment_id
                        am_u_parts = am_href.rstrip('/').split('/')
                        am_bf_code = am_u_parts[-1]
                        am_id = f"{CONVENTION_ID}/{am_bf_code}"
                        
                        cursor.execute("SELECT 1 FROM amendments WHERE id = ?", (am_id,))
                        if not cursor.fetchone():
                            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            cursor.execute(
                                "INSERT INTO amendments (id, url, created) VALUES (?, ?, ?)",
                                (am_id, am_url, now_str)
                            )
                            new_count += 1
                            print(f"New amendment found: {am_id}")

            conn.commit()
            conn.close()
            
            print(f"Overview check complete. {new_count} new amendments.")

            # Ingest brute-forced URLs
            if os.path.exists(BRUTE_FORCED_URLS_PATH):
                print(f"Checking brute-forced URLs from {BRUTE_FORCED_URLS_PATH}...")
                with open(BRUTE_FORCED_URLS_PATH, 'r', encoding='utf-8') as f:
                    bf_urls = [line.strip() for line in f if line.strip()]
                
                if bf_urls:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    bf_new_count = 0
                    for bf_url in bf_urls:
                        # Check if URL already exists
                        cursor.execute("SELECT 1 FROM amendments WHERE url = ?", (bf_url,))
                        if not cursor.fetchone():
                            # Generate a temporary ID based on the last part of the URL
                            # URL format: https://.../LDK26-1/path/ID
                            u_parts = bf_url.rstrip('/').split('/')
                            bf_code = u_parts[-1]
                            bf_id = f"{CONVENTION_ID}/{bf_code}"
                            
                            # Double check if this ID exists (might have different URL)
                            cursor.execute("SELECT 1 FROM amendments WHERE id = ?", (bf_id,))
                            if not cursor.fetchone():
                                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                cursor.execute(
                                    "INSERT INTO amendments (id, url, created) VALUES (?, ?, ?)",
                                    (bf_id, bf_url, now_str)
                                )
                                bf_new_count += 1
                                print(f"New brute-forced URL found: {bf_id}")
                    
                    conn.commit()
                    conn.close()
                    if bf_new_count > 0:
                        print(f"Brute-force check complete. {bf_new_count} new amendments added.")

            time.sleep(60) # Check every minute
            
        except Exception as e:
            print(f"Error in monitor_overview: {e}")
            time.sleep(60)

if __name__ == "__main__":
    run()
