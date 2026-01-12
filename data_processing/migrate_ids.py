import os
import yaml
import re
from bs4 import BeautifulSoup
from tqdm import tqdm

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AMENDMENTS_HTML_DIR = os.path.join(SCRIPT_DIR, "amendments_html")
YAML_FILE = os.path.join(SCRIPT_DIR, "amendments_pipeline.yaml")

def get_new_id_from_html(filepath):
    """
    Extracts the new ID from the breadcrumb menu in the HTML file.
    The last <li> in the breadcrumb contains the motion/amendment code.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'lxml')
            
        breadcrumb = soup.find('ol', class_='breadcrumb')
        if not breadcrumb:
            return None
            
        last_li = breadcrumb.find_all('li')[-1]
        if not last_li:
            return None
            
        # The code is usually the direct text of the last <li>
        code = last_li.get_text(strip=True)
        return code
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def slugify_filename(text):
    """Safe slugify for filenames to avoid WinError 123"""
    if not text:
        return ""
    # Remove characters that are definitely illegal in Windows filenames: < > : " / \ | ? *
    # Also remove extra spaces and dots at the end
    text = re.sub(r'[<>:"/\\|?*]', '', text)
    text = text.strip().strip('.')
    # Truncate if too long (Windows max path is ~260, but filename limit is 255)
    return text[:150]

def migrate():
    print("Starting migration to new ID format: {convention_id}/{last_li}")
    
    if not os.path.exists(YAML_FILE):
        print(f"YAML file not found: {YAML_FILE}")
        return

    with open(YAML_FILE, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    if not data:
        print("YAML data is empty.")
        return

    new_data = {}
    rename_mapping = {} # old_aid -> new_aid

    # 1. Process all entries and determine new IDs
    for old_aid, info in tqdm(data.items(), desc="Determining new IDs"):
        convention_id = info.get('convention')
        html_path = os.path.join(AMENDMENTS_HTML_DIR, f"{old_aid}.html")
        
        new_code = None
        if os.path.exists(html_path):
            new_code = get_new_id_from_html(html_path)
        
        if not new_code:
            # Fallback if HTML doesn't exist or breadcrumb missing
            label = info.get('label', "")
            match = re.match(r'^([^:]+):', label)
            if match:
                new_code = match.group(1).strip()
            else:
                new_code = old_aid.replace(f"{convention_id}-", "")

        new_aid = f"{convention_id}/{new_code}"
        new_data[new_aid] = info
        rename_mapping[old_aid] = new_aid

    # 2. Rename HTML files
    print("Renaming HTML files...")
    for old_aid, new_aid in tqdm(rename_mapping.items(), desc="Renaming files"):
        old_path = os.path.join(AMENDMENTS_HTML_DIR, f"{old_aid}.html")
        
        # Safe filename for Windows
        safe_new_code = slugify_filename(new_aid.split("/")[-1])
        new_filename_id = f"{new_aid.split('/')[0]}__{safe_new_code}"
        new_path = os.path.join(AMENDMENTS_HTML_DIR, f"{new_filename_id}.html")
        
        if os.path.exists(old_path):
            try:
                if os.path.exists(new_path) and os.path.abspath(old_path) != os.path.abspath(new_path):
                    os.remove(new_path)
                os.rename(old_path, new_path)
            except Exception as e:
                print(f"Error renaming {old_path} to {new_path}: {e}")

    # 3. Save updated YAML
    print(f"Saving updated YAML to {YAML_FILE}")
    with open(YAML_FILE, 'w', encoding='utf-8') as f:
        yaml.dump(new_data, f, allow_unicode=True, sort_keys=False, width=1000)

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
