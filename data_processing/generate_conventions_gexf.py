import sqlite3
import json
import os
import re
import gzip
import shutil
import math
from datetime import datetime
from tqdm import tqdm

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_AMENDMENTS = os.path.join(SCRIPT_DIR, "amendments.sqlite")
OUTPUT_GEXF = os.path.join(SCRIPT_DIR, "bdk_all.gexf")

def compress_file(file_path):
    """Compresses a file using gzip safely."""
    gz_path = f"{file_path}.gz"
    temp_gz_path = f"{gz_path}.tmp"
    print(f"Compressing {file_path} -> {gz_path}")
    try:
        with open(file_path, 'rb') as f_in:
            with gzip.open(temp_gz_path, 'wb', compresslevel=9) as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Verify the temp file exists and is not empty
        if os.path.exists(temp_gz_path) and os.path.getsize(temp_gz_path) > 0:
            # Atomic rename to the final destination
            if os.path.exists(gz_path):
                os.remove(gz_path)
            os.rename(temp_gz_path, gz_path)
            os.remove(file_path)
            print(f"Successfully compressed and removed original: {file_path}")
        else:
            if os.path.exists(temp_gz_path):
                os.remove(temp_gz_path)
            print(f"Error: Compression failed for {file_path}")
    except Exception as e:
        if os.path.exists(temp_gz_path):
            os.remove(temp_gz_path)
        print(f"Error compressing {file_path}: {e}")

# If True, persons with only one connection (degree 1) are excluded from the graph
FILTER_SINGLE_LINK_SUPPORTERS = False

def date_to_numeric_year(date_str):
    """Converts an ISO date string to a numeric year (float)."""
    if not date_str:
        return 2020.0
    try:
        # Handle formats like 2017-04-03T11:20:40+00:00 or 2017-05-02T15:29:36.232980
        # datetime.fromisoformat handles these in Python 3.7+
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        year = dt.year
        start_of_year = datetime(year, 1, 1, tzinfo=dt.tzinfo)
        end_of_year = datetime(year + 1, 1, 1, tzinfo=dt.tzinfo)
        year_duration = (end_of_year - start_of_year).total_seconds()
        elapsed = (dt - start_of_year).total_seconds()
        return year + (elapsed / year_duration)
    except Exception:
        return 2020.0

RE_ID_CLEAN = re.compile(r'[^a-z0-9-]')

def slugify(text):
    """Converts text to lowercase, replaces spaces with hyphens, and removes special characters."""
    if not text:
        return ""
    text = text.lower().replace(' ', '-')
    return RE_ID_CLEAN.sub('', text)

def escape_xml(text):
    """Escapes special characters for XML."""
    if not text:
        return ""
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&apos;'))

def generate_gexf():
    print(f"Connecting to database {SQLITE_AMENDMENTS}...")
    if not os.path.exists(SQLITE_AMENDMENTS):
        print(f"Error: {SQLITE_AMENDMENTS} not found. Please run yaml_to_sqlite.py first.")
        return

    try:
        conn = sqlite3.connect(SQLITE_AMENDMENTS)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get count for tqdm
        cursor.execute("SELECT COUNT(*) FROM amendments")
        total_amendments = cursor.fetchone()[0]
        
        cursor.execute("SELECT * FROM amendments")
        rows = cursor.fetchall()
    except Exception as e:
        print(f"Error connecting to or querying database: {e}")
        return

    print("Building network...")
    nodes = {}  # id -> {label, type, ...attrs}
    
    # Track total stats per person: pid -> {'supported': 0, 'initiated': 0}
    person_total_stats = {}
    
    # Track person stats per convention: pid -> convention -> {'supports': 0, 'authored': 0}
    person_convention_stats = {}
    
    # Track raw connections to build edges later: (source, target, type)
    raw_connections = []
    
    # Track amendment info for node weights
    amendment_supporters_count = {} # aid -> count
    amendment_numeric_years = {} # aid -> float year
    
    # Track which nodes have at least one connection
    connected_nodes = set()

    # Track edge uniqueness to avoid duplicates
    seen_edges = set()

    # First pass: collect connections and counts
    for row in tqdm(rows, desc="Pass 1: Counting connections", total=total_amendments):
        aid = str(row['amendment_id'])
        convention = row['convention_id']
        date_str = row['amendment_date_published']
        numeric_year = date_to_numeric_year(date_str)
        amendment_numeric_years[aid] = numeric_year

        # Supporters and Initiators are JSON strings in the DB
        try:
            supporters = json.loads(row['amendment_supporters'] or '[]')
            initiators = json.loads(row['amendment_initiators'] or '[]')
        except json.JSONDecodeError:
            continue

        # Filter: amendments with less than two supporters aren't in the graph
        if len(supporters) < 2:
            continue

        # Add Amendment Node placeholder
        if aid not in nodes:
            nodes[aid] = {
                'label': row['amendment_title'] or aid, 
                'type': 'amendment', 
                'convention': convention,
                'url': row['amendment_url_html'] or ''
            }
        
        amendment_supporters_count[aid] = 0

        # Process Initiators (Authors)
        for initiator in initiators:
            if initiator.get('type') != 'person':
                continue
                
            author_name = initiator.get('name', '').strip()
            if not author_name:
                continue
                
            # Filter logic: clean name
            clean_author = re.split(r'\(', author_name)[0].strip()
            if clean_author:
                author_slug = slugify(clean_author)
                author_id = f"prs-{author_slug}"
                
                if author_id not in nodes:
                    nodes[author_id] = {
                        'label': clean_author, 
                        'type': 'prs'
                    }
                
                # Track stats for person weight
                if author_id not in person_convention_stats:
                    person_convention_stats[author_id] = {}
                    person_total_stats[author_id] = {'supported': 0, 'initiated': 0}
                if convention not in person_convention_stats[author_id]:
                    person_convention_stats[author_id][convention] = {'supports': 0, 'authored': 0, 'weighted_year_sum': 0}
                
                person_convention_stats[author_id][convention]['authored'] += 1
                person_total_stats[author_id]['initiated'] += 1
                # Note: we use numeric_year here. In a convention multiple amendments can have slightly different dates.
                
                edge_key = (author_id, aid)
                if edge_key not in seen_edges:
                    raw_connections.append({
                        'source': author_id, 
                        'target': aid, 
                        'type': 'authored',
                        'convention': convention,
                        'numeric_year': numeric_year
                    })
                    seen_edges.add(edge_key)
                    connected_nodes.add(author_id)
                    connected_nodes.add(aid)

        # Process Supporters
        for s in supporters:
            if s.get('type') != 'person':
                continue
                
            s_name = s.get('name', '').strip()
            if not s_name:
                continue
            
            # Filter: supporters who are no person aren't in the graph
            if "beschlossen am:" in s_name.lower():
                continue
                
            s_slug = slugify(s_name) # Using name-based slug for consistency
            s_id = f"prs-{s_slug}"
            
            if s_id not in nodes:
                nodes[s_id] = {
                    'label': s_name, 
                    'type': 'prs', 
                    'kv': s.get('organization', '') # Using 'organization' from JSON as 'kv'
                }
            
            amendment_supporters_count[aid] += 1
            
            # Track stats for person weight
            if s_id not in person_convention_stats:
                person_convention_stats[s_id] = {}
                person_total_stats[s_id] = {'supported': 0, 'initiated': 0}
            if convention not in person_convention_stats[s_id]:
                person_convention_stats[s_id][convention] = {'supports': 0, 'authored': 0}
            
            person_convention_stats[s_id][convention]['supports'] += 1
            person_total_stats[s_id]['supported'] += 1
            
            edge_key = (s_id, aid)
            if edge_key not in seen_edges:
                raw_connections.append({
                    'source': s_id, 
                    'target': aid, 
                    'type': 'supports',
                    'convention': convention,
                    'numeric_year': numeric_year
                })
                seen_edges.add(edge_key)
                connected_nodes.add(s_id)
                connected_nodes.add(aid)

    conn.close()

    # Calculate final person weights based on the formula
    person_convention_weights = {}
    person_sum_weights = {}
    person_weighted_date_avg = {}
    
    for pid, convs in person_convention_stats.items():
        person_convention_weights[pid] = {}
        total_w = 0
        
        for cid, stats in convs.items():
            # Formula: prsconventionweight = cube root of (supported + 5 * authored)
            w = math.pow(stats['supports'] + 5 * stats['authored'], 1/3)
            person_convention_weights[pid][cid] = w
            total_w += w
        
        person_sum_weights[pid] = total_w
    
    # Calculate average year per convention from all amendments that are in the graph
    convention_years = {} # cid -> [years]
    for aid, nyear in amendment_numeric_years.items():
        if aid in nodes and nodes[aid]['type'] == 'amendment':
            cid = nodes[aid]['convention']
            if cid not in convention_years:
                convention_years[cid] = []
            convention_years[cid].append(nyear)
    
    avg_convention_years = {cid: sum(yrs)/len(yrs) for cid, yrs in convention_years.items()}

    for pid, convs in person_convention_stats.items():
        weighted_date_sum = 0
        total_w = person_sum_weights[pid]
        for cid, w in person_convention_weights[pid].items():
            # If a convention has no amendments (unlikely here but for safety)
            conv_year = avg_convention_years.get(cid, 2020.0)
            weighted_date_sum += w * conv_year
            
        if total_w > 0:
            person_weighted_date_avg[pid] = weighted_date_sum / total_w
        else:
            person_weighted_date_avg[pid] = 2020.0

    # Calculate degrees to support FILTER_SINGLE_LINK_SUPPORTERS
    node_degrees = {}
    for conn_data in raw_connections:
        s, t = conn_data['source'], conn_data['target']
        node_degrees[s] = node_degrees.get(s, 0) + 1
        node_degrees[t] = node_degrees.get(t, 0) + 1

    # Second pass: finalize node weights and build edges
    final_nodes = {}
    for nid, ninfo in nodes.items():
        if nid not in connected_nodes:
            continue
            
        if FILTER_SINGLE_LINK_SUPPORTERS and ninfo['type'] == 'prs' and node_degrees.get(nid, 0) <= 1:
            continue

        if ninfo['type'] == 'amendment':
            ninfo['weight'] = amendment_supporters_count.get(nid, 0)
        else:
            ninfo['weight'] = 10 * round(person_sum_weights.get(nid, 0))
        
        final_nodes[nid] = ninfo

    edges = []
    for i, conn_data in enumerate(raw_connections):
        source = conn_data['source']
        target = conn_data['target']
        
        if source not in final_nodes or target not in final_nodes:
            continue

        ctype = conn_data['type']
        cid = conn_data['convention']
        
        total_w = person_sum_weights.get(source, 1.0)
        weight_this_conv = person_convention_weights.get(source, {}).get(cid, 1.0)
        weighted_date_avg = person_weighted_date_avg.get(source, 2020.0)
        
        # Use the specific amendment's numeric year as current_year for this edge
        current_year = conn_data['numeric_year']
        
        ratio = math.sqrt(total_w) / math.sqrt(max(0.001, weight_this_conv))
        temporal_factor = (1 + 2 * (weighted_date_avg / current_year))
        
        weight = ratio * temporal_factor
        if ctype == 'authored':
            weight *= 5.0
            
        edges.append({
            'id': f"e{i}",
            'source': source,
            'target': target,
            'weight': weight,
            'type': ctype
        })

    print(f"Writing GEXF to {OUTPUT_GEXF}...")
    try:
        with open(OUTPUT_GEXF, 'w', encoding='utf-8') as f:
            f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            f.write('<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">\n')
            f.write('  <graph mode="static" defaultedgetype="directed">\n')
            
            f.write('    <attributes class="node" mode="static">\n')
            f.write('      <attribute id="attr_type" title="type" type="string" />\n')
            f.write('      <attribute id="attr_convention" title="convention" type="string" />\n')
            f.write('      <attribute id="attr_kv" title="kv" type="string" />\n')
            f.write('      <attribute id="attr_url" title="url" type="string" />\n')
            f.write('      <attribute id="attr_weight" title="weight" type="integer" />\n')
            f.write('    </attributes>\n')

            f.write('    <nodes>\n')
            for nid, ninfo in final_nodes.items():
                esc_label = escape_xml(ninfo['label'])
                f.write(f'      <node id="{nid}" label="{esc_label}">\n')
                f.write('        <attvalues>\n')
                f.write(f'          <attvalue for="attr_type" value="{escape_xml(ninfo.get("type", ""))}" />\n')
                if 'convention' in ninfo:
                    f.write(f'          <attvalue for="attr_convention" value="{escape_xml(ninfo["convention"])}" />\n')
                if 'kv' in ninfo:
                    f.write(f'          <attvalue for="attr_kv" value="{escape_xml(ninfo["kv"])}" />\n')
                if 'url' in ninfo:
                    f.write(f'          <attvalue for="attr_url" value="{escape_xml(ninfo["url"])}" />\n')
                if 'initiated' in ninfo:
                    f.write(f'          <attvalue for="attr_initiated" value="{ninfo["initiated"]}" />\n')
                if 'supported' in ninfo:
                    f.write(f'          <attvalue for="attr_supported" value="{ninfo["supported"]}" />\n')
                f.write(f'          <attvalue for="attr_weight" value="{ninfo.get("weight", 0)}" />\n')
                f.write('        </attvalues>\n')
                f.write('      </node>\n')
            f.write('    </nodes>\n')

            f.write('    <edges>\n')
            for i, e in enumerate(edges):
                f.write(f'      <edge id="e{i}" source="{e["source"]}" target="{e["target"]}" weight="{e["weight"]}" />\n')
            f.write('    </edges>\n')
            
            f.write('  </graph>\n')
            f.write('</gexf>\n')
        print(f"Success! Created {OUTPUT_GEXF} with {len(final_nodes)} nodes and {len(edges)} edges.")
        
    except Exception as e:
        print(f"Error writing GEXF: {e}")

if __name__ == "__main__":
    generate_gexf()
