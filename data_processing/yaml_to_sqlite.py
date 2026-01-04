import os
import sys
import re
import json
import sqlite3
import yaml

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_YAML = os.path.join(SCRIPT_DIR, "amendments_pipeline.yaml")
AMENDMENTS_DB = os.path.join(SCRIPT_DIR, "amendments.sqlite")
prsS_DB = os.path.join(SCRIPT_DIR, "prss.sqlite")

RE_ID_CLEAN = re.compile(r'[^a-z0-9-]')

def slugify(text):
    if not text:
        return ""
    text = text.lower().replace(' ', '-')
    return RE_ID_CLEAN.sub('', text)

def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def ensure_amendments_schema(conn):
    cur = conn.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS amendments ("
        "id TEXT PRIMARY KEY,"
        "convention TEXT,"
        "url TEXT,"
        "label TEXT,"
        "applicant_id TEXT,"
        "supporter_ids TEXT)"
    )
    conn.commit()

def ensure_prss_schema(conn):
    cur = conn.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS prss ("
        "id TEXT PRIMARY KEY,"
        "name TEXT,"
        "kv TEXT,"
        "applicated_ids TEXT,"
        "applicated_count INTEGER,"
        "supported_ids TEXT,"
        "supported_count INTEGER,"
        "conventions TEXT)"
    )
    conn.commit()

def build_databases(data):
    amend_conn = sqlite3.connect(AMENDMENTS_DB)
    prss_conn = sqlite3.connect(prsS_DB)
    ensure_amendments_schema(amend_conn)
    ensure_prss_schema(prss_conn)

    prss = {}

    for aid, info in data.items():
        if info.get('type') != 'amendment':
            continue
        if not info.get('isprs', False):
            continue

        applicant_id = ""
        ad = info.get('applicant_details') or {}
        applicant_id = ad.get('id') or slugify(info.get('author', ''))
        applicant_name = ad.get('name') or info.get('author', '')
        applicant_kv = ad.get('kv') or ""

        supporters = info.get('supporters') or []
        supporter_ids = []
        for s in supporters:
            sid = (s or {}).get('id') or slugify((s or {}).get('name', ''))
            if sid and sid != applicant_id:
                supporter_ids.append(sid)
        supporter_ids = list(dict.fromkeys(supporter_ids))

        if not applicant_id or len(supporter_ids) < 1:
            continue

        cur = amend_conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO amendments "
            "(id, convention, url, label, applicant_id, supporter_ids) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                aid,
                info.get('convention', ''),
                info.get('url', ''),
                info.get('label', ''),
                applicant_id,
                json.dumps(supporter_ids, ensure_ascii=False),
            ),
        )
        amend_conn.commit()

        if applicant_id not in prss:
            prss[applicant_id] = {
                'id': applicant_id,
                'name': applicant_name,
                'kv': applicant_kv,
                'applicated_ids': set(),
                'supported_ids': set(),
                'conventions': set(),
            }
        p = prss[applicant_id]
        if not p['name'] and applicant_name:
            p['name'] = applicant_name
        if not p['kv'] and applicant_kv:
            p['kv'] = applicant_kv
        p['applicated_ids'].add(aid)
        p['conventions'].add(info.get('convention', ''))

        sup_index = { (s or {}).get('id') or slugify((s or {}).get('name','')): s for s in supporters }
        for sid in supporter_ids:
            srec = sup_index.get(sid) or {}
            sname = srec.get('name') or ""
            skv = srec.get('kv') or ""
            if sid not in prss:
                prss[sid] = {
                    'id': sid,
                    'name': sname,
                    'kv': skv,
                    'applicated_ids': set(),
                    'supported_ids': set(),
                    'conventions': set(),
                }
            sp = prss[sid]
            if not sp['name'] and sname:
                sp['name'] = sname
            if not sp['kv'] and skv:
                sp['kv'] = skv
            sp['supported_ids'].add(aid)
            sp['conventions'].add(info.get('convention', ''))

    pcur = prss_conn.cursor()
    for pid, p in prss.items():
        applicated_ids = sorted(list(p['applicated_ids']))
        supported_ids = sorted(list(p['supported_ids']))
        conventions = sorted([c for c in p['conventions'] if c])
        pcur.execute(
            "INSERT OR REPLACE INTO prss "
            "(id, name, kv, applicated_ids, applicated_count, supported_ids, supported_count, conventions) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                pid,
                p['name'],
                p['kv'],
                json.dumps(applicated_ids, ensure_ascii=False),
                len(applicated_ids),
                json.dumps(supported_ids, ensure_ascii=False),
                len(supported_ids),
                json.dumps(conventions, ensure_ascii=False),
            ),
        )
    prss_conn.commit()

    amend_conn.close()
    prss_conn.close()

def main():
    yaml_path = DEFAULT_YAML
    if len(sys.argv) > 1 and sys.argv[1]:
        yaml_path = sys.argv[1]
    data = load_yaml(yaml_path)
    build_databases(data)
    print(f"Created databases:\n - {AMENDMENTS_DB}\n - {prsS_DB}")

if __name__ == "__main__":
    main()

