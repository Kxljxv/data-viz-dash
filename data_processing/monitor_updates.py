import time
import os
import json
import re
import sqlite3
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from common import (
    HTML_DIR, get_db_connection, create_session, slugify, random_sleep, get_headers
)

def parse_dt(dt_str):
    try:
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except:
        return datetime.min

def run():
    print("Starting Monitor Updates...")
    session = create_session()
    
    while True:
        try:
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get amendments that have been initialized
            cursor.execute("SELECT * FROM amendments WHERE applicant_name IS NOT NULL OR long_label IS NOT NULL")
            rows = cursor.fetchall()
            
            if not rows:
                conn.close()
                time.sleep(10)
                continue
                
            # Sort in python to handle complex sorting if needed, or just by last_time_checked
            # We want to check the one that was checked longest ago
            rows = sorted(rows, key=lambda r: parse_dt(r['last_time_checked']))
            
            for row in rows:
                aid = row['id']
                url = row['url']
                last_checked_str = row['last_time_checked']
                last_checked_dt = parse_dt(last_checked_str)
                
                print(f"Checking updates for {aid} (Last checked: {last_checked_str})...")
                
                try:
                    random_sleep()
                    response = session.get(url, headers=get_headers())
                    response.raise_for_status()
                    html_content = response.text
                    
                    # We don't necessarily need to overwrite the HTML file every time
                    # fetch_initial_details.py handles the initial download.
                    # if row['html_path']:
                    #     with open(row['html_path'], 'w', encoding='utf-8') as f:
                    #         f.write(html_content)
                    
                    soup = BeautifulSoup(html_content, 'lxml')
                    
                    # Parse current status
                    current_status = "Unknown"
                    table = soup.find("table", {"class": "motionDataTable"})
                    if table:
                        status_row = table.find("th", string=lambda t: t and "Status" in t)
                        if status_row:
                            status_cell = status_row.find_next("td")
                            if status_cell:
                                current_status = status_cell.get_text(strip=True)
                                
                    # Update Status List and Timeline
                    status_list = json.loads(row['status_list']) if row['status_list'] else []
                    status_timeline = json.loads(row['status_timeline']) if row['status_timeline'] else []
                    
                    last_status = status_list[-1][0] if status_list else None
                    
                    now_dt = datetime.now()
                    now_str_pretty = now_dt.strftime("%d.%m.%Y, %H:%M")
                    
                    status_changed = False
                    if current_status != last_status:
                        status_list.append([current_status, now_str_pretty])
                        status_timeline.append({
                            "status": current_status,
                            "timestamp": now_str_pretty
                        })
                        status_changed = True
                        print(f"Status changed for {aid}: {last_status} -> {current_status}")

                    # Parse Supporters
                    current_supporters = {}
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
                                current_supporters[s_id] = {
                                    "name": name,
                                    "kv": kv
                                }
                    
                    # Diff Supporters
                    saved_supporters = json.loads(row['supporter_list']) if row['supporter_list'] else {}
                    earlier_supporters = json.loads(row['earlier_supporters']) if row['earlier_supporters'] else {}
                    supporters_changed = False
                    
                    # Midpoint for both additions and removals
                    midpoint_ts = last_checked_dt.timestamp() + (now_dt.timestamp() - last_checked_dt.timestamp()) / 2
                    midpoint_dt = datetime.fromtimestamp(midpoint_ts)
                    midpoint_str = midpoint_dt.strftime("%d.%m.%Y, %H:%M")

                    # Check for new supporters
                    for s_id, s_data in current_supporters.items():
                        if s_id not in saved_supporters:
                            # New supporter
                            s_data['time_supported'] = midpoint_str
                            saved_supporters[s_id] = s_data
                            supporters_changed = True
                            print(f"New supporter for {aid}: {s_data['name']} (Est: {midpoint_str})")
                    
                    # Check for withdrawn supporters
                    ids_to_remove = []
                    for s_id, s_data in saved_supporters.items():
                        if s_id not in current_supporters:
                            # Withdrawn supporter
                            s_data['time_unsupported'] = midpoint_str
                            
                            # Add to earlier_supporters. Since a person might support and withdraw multiple times, 
                            # we use a list or unique keys. Let's use a list of events or just update the entry if we want to keep it simple.
                            # User said "archived in some way", so maybe a list of withdrawals for each person or a list of withdrawn records.
                            # Let's use a list of withdrawn records for that person in earlier_supporters.
                            if s_id not in earlier_supporters:
                                earlier_supporters[s_id] = []
                            earlier_supporters[s_id].append(s_data)
                            
                            ids_to_remove.append(s_id)
                            supporters_changed = True
                            print(f"Supporter withdrawn for {aid}: {s_data['name']} (Est: {midpoint_str})")
                    
                    for s_id in ids_to_remove:
                        del saved_supporters[s_id]
                            
                    # Update DB
                    new_last_checked = now_dt.strftime("%Y-%m-%d %H:%M:%S")
                    
                    if status_changed or supporters_changed:
                        cursor.execute('''
                            UPDATE amendments 
                            SET status_list = ?, status_timeline = ?, supporter_list = ?, earlier_supporters = ?, last_time_checked = ?
                            WHERE id = ?
                        ''', (
                            json.dumps(status_list), 
                            json.dumps(status_timeline),
                            json.dumps(saved_supporters), 
                            json.dumps(earlier_supporters),
                            new_last_checked, 
                            aid
                        ))
                    else:
                        cursor.execute('''
                            UPDATE amendments 
                            SET last_time_checked = ?
                            WHERE id = ?
                        ''', (new_last_checked, aid))
                        
                    conn.commit()
                    
                except Exception as e:
                    print(f"Error checking updates for {aid}: {e}")
                
                time.sleep(2) # Delay between checks
            
            conn.close()
            time.sleep(5) # Delay after full cycle
            
        except Exception as e:
            print(f"Error in monitor_updates: {e}")
            time.sleep(10)

if __name__ == "__main__":
    run()
