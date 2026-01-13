import time
import os
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
from common import (
    HTML_DIR, get_db_connection, create_session, slugify, random_sleep, get_headers, convert_to_iso
)

def run():
    print("Starting Fetch Initial Details...")
    session = create_session()
    
    while True:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Find amendments needing details (applicant_name is NULL)
            cursor.execute("SELECT * FROM amendments WHERE applicant_name IS NULL")
            rows = cursor.fetchall()
            
            if not rows:
                conn.close()
                time.sleep(5)
                continue
                
            print(f"Found {len(rows)} amendments needing initial details.")
            
            for row in rows:
                aid = row['id']
                url = row['url']
                print(f"Fetching details for {aid}...")
                
                try:
                    random_sleep()
                    response = session.get(url, headers=get_headers())
                    response.raise_for_status()
                    html_content = response.text
                    
                    # Save HTML
                    safe_aid = aid.replace("/", "__")
                    html_path = os.path.join(HTML_DIR, f"{safe_aid}.html")
                    with open(html_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                        
                    soup = BeautifulSoup(html_content, 'lxml')
                    
                    # Parse Labels
                    long_label = ""
                    short_label = ""
                    header_tag = soup.find("div", class_="primaryHeader")
                    if header_tag:
                        h1_tag = header_tag.find("h1")
                        if h1_tag:
                            long_label = h1_tag.get_text(strip=True)
                            short_label = long_label.split(":")[0].strip()

                    # Parse Applicant
                    applicant_name = "Unknown"
                    applicant_kv = ""
                    applicant_id = ""
                    
                    table = soup.find("table", {"class": "motionDataTable"})
                    if table:
                        applicant_row = table.find("th", string=lambda t: t and "Antragsteller" in t)
                        if applicant_row:
                            applicant_cell = applicant_row.find_next("td")
                            if applicant_cell:
                                full_text = applicant_cell.get_text(" ", strip=True)
                                parts = re.split(r"\s*\(", full_text)
                                applicant_name = parts[0].strip()
                                if applicant_name:
                                    applicant_id = f"prs-{slugify(applicant_name)}"
                                if len(parts) > 1:
                                    applicant_kv = re.split(r"\s*\)", parts[1])[0].strip()

                    # Parse Status and Submission Date
                    status = "Unknown"
                    submission_date_raw = ""
                    status_type = ""
                    if table:
                        status_row = table.find("th", string=lambda t: t and "Status" in t)
                        if status_row:
                            status_cell = status_row.find_next("td")
                            if status_cell:
                                status = status_cell.get_text(strip=True)
                        
                        submitted_row = table.find("th", string=lambda t: t and ("Eingereicht" in t or "Angelegt" in t))
                        if submitted_row:
                            submitted_cell = submitted_row.find_next("td")
                            if submitted_cell:
                                submission_date_raw = submitted_cell.get_text(strip=True)
                                status_type = submitted_row.get_text(strip=True).replace(":", "")
                    
                    submitted_iso = convert_to_iso(submission_date_raw)
                    now_dt = datetime.now()
                    now_str_pretty = now_dt.strftime("%d.%m.%Y, %H:%M")
                    now_iso = now_dt.strftime("%Y-%m-%d %H:%M:00")
                    
                    # status_list for legacy compatibility, status_timeline as requested
                    status_list = [[status, now_str_pretty]]
                    status_timeline = []
                    
                    # If we have a submission/creation date, use it as the first entry in the timeline
                    if submission_date_raw:
                        status_timeline.append({
                            "status": status_type if status_type else "Eingereicht/Angelegt",
                            "timestamp": submission_date_raw
                        })
                    
                    # Add current status to timeline
                    status_timeline.append({
                        "status": status,
                        "timestamp": now_str_pretty
                    })
                    
                    # Parse Supporters
                    supporter_list = {}
                    section = soup.find("section", {"class": "fullList hidden"})
                    if not section:
                        section = soup.find("section", {"class": "supporters"})
                    
                    if section:
                        items = section.find_all("li")
                        for item in items:
                            full_text = item.get_text(" ", strip=True)
                            parts = re.split(r"\s*\(", full_text)
                            name = parts[0].strip()
                            kv = parts[1].strip().rstrip(")") if len(parts) > 1 else ""
                            
                            if name:
                                s_id = f"prs-{slugify(name)}"
                                supporter_list[s_id] = {
                                    "name": name,
                                    "kv": kv,
                                    "time_supported": now_str_pretty # Initial load time
                                }

                    # Update DB
                    last_checked = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    earlier_supporters = {}
                    
                    cursor.execute('''
                        UPDATE amendments 
                        SET applicant_name = ?, applicant_kv = ?, status_list = ?, 
                            status_timeline = ?, supporter_list = ?, earlier_supporters = ?, 
                            last_time_checked = ?, html_path = ?, long_label = ?, 
                            short_label = ?, applicant_id = ?, submitted = ?
                        WHERE id = ?
                    ''', (
                        applicant_name, applicant_kv, json.dumps(status_list),
                        json.dumps(status_timeline), json.dumps(supporter_list), 
                        json.dumps(earlier_supporters), last_checked, html_path, 
                        long_label, short_label, applicant_id, submitted_iso, aid
                    ))
                    conn.commit()
                    print(f"Updated {aid}")
                    
                except Exception as e:
                    print(f"Error fetching {aid}: {e}")
                
                time.sleep(1) # Polite delay
                
            conn.close()
            
        except Exception as e:
            print(f"Error in fetch_initial_details: {e}")
            time.sleep(10)

if __name__ == "__main__":
    run()
