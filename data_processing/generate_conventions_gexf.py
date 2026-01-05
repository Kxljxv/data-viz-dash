import yaml
import os
import re
import gzip
import shutil
import math
from tqdm import tqdm

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
YAML_FILE = os.path.join(SCRIPT_DIR, "amendments_pipeline.yaml")
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

# Convention IDs and their dates
CONVENTION_DATA = {
    "43bdk": 2018.86, # 10.11.2018 approx
    "44bdk": 2019.87, # 16.11.2019
    "45bdk": 2020.89, # 21.11.2020
    "46bdk": 2021.45, # 12.06.2021
    "48bdk": 2022.79, # 15.10.2022
    "49bdk": 2018.87, # 16.10.2018
    "50bdk": 2018.88, # 17.10.2018
    "51bdk": 2018.89, # 18.10.2018
}

# If True, persons with only one connection (degree 1) are excluded from the graph
FILTER_SINGLE_LINK_SUPPORTERS = False

CONVENTION_IDS = list(CONVENTION_DATA.keys())

def get_conv_year(cid):
    return CONVENTION_DATA.get(cid, 2020.0) # Default if not found

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
    print(f"Loading YAML data from {YAML_FILE}...")
    if not os.path.exists(YAML_FILE):
        print(f"Error: {YAML_FILE} not found. Please run the pipeline_scraper.py first.")
        return

    try:
        with open(YAML_FILE, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading YAML: {e}")
        return

    if not data:
        print("YAML file is empty.")
        return

    print("Building network...")
    nodes = {}  # id -> {label, type, ...attrs}
    
    # Track person stats per convention: pid -> convention -> {'supports': 0, 'authored': 0}
    person_convention_stats = {}
    
    # Track raw connections to build edges later: (source, target, type)
    raw_connections = []
    
    # Track amendment info for node weights
    amendment_supporters_count = {} # aid -> count
    
    # Track which nodes have at least one connection
    connected_nodes = set()

    # Track edge uniqueness to avoid duplicates
    seen_edges = set()

    # First pass: collect connections and counts
    for aid, info in tqdm(data.items(), desc="Pass 1: Counting connections"):
        convention = info.get('convention')
        if convention not in CONVENTION_IDS:
            continue

        # Filter: amendments with less than two supporters aren't in the graph
        supporters = info.get('supporters', [])
        if len(supporters) < 2:
            continue

        # Add Amendment Node placeholder
        if aid not in nodes:
            nodes[aid] = {
                'label': info.get('label', aid), 
                'type': 'amendment', 
                'convention': convention,
                'url': info.get('url', '')
            }
        
        amendment_supporters_count[aid] = 0

        # Process Author
        author_name = info.get('author', '').strip()
        is_prs = info.get('isprs', False)
        
        # Filter: applicaters who are no person aren't in the graph
        if author_name and is_prs:
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
                if convention not in person_convention_stats[author_id]:
                    person_convention_stats[author_id][convention] = {'supports': 0, 'authored': 0}
                person_convention_stats[author_id][convention]['authored'] += 1
                
                edge_key = (author_id, aid)
                if edge_key not in seen_edges:
                    raw_connections.append({
                        'source': author_id, 
                        'target': aid, 
                        'type': 'authored',
                        'convention': convention
                    })
                    seen_edges.add(edge_key)
                    connected_nodes.add(author_id)
                    connected_nodes.add(aid)

        # Process Supporters
        for s in supporters:
            s_name = s.get('name', '').strip()
            if not s_name:
                continue
            
            # Filter: supporters who are no person aren't in the graph
            if "beschlossen am:" in s_name.lower():
                continue
                
            s_slug = s.get('id') or slugify(s_name)
            s_id = f"prs-{s_slug}"
            
            if s_id not in nodes:
                nodes[s_id] = {
                    'label': s_name, 
                    'type': 'prs', 
                    'kv': s.get('kv', '')
                }
            
            amendment_supporters_count[aid] += 1
            
            # Track stats for person weight
            if s_id not in person_convention_stats:
                person_convention_stats[s_id] = {}
            if convention not in person_convention_stats[s_id]:
                person_convention_stats[s_id][convention] = {'supports': 0, 'authored': 0}
            person_convention_stats[s_id][convention]['supports'] += 1
            
            edge_key = (s_id, aid)
            if edge_key not in seen_edges:
                raw_connections.append({
                    'source': s_id, 
                    'target': aid, 
                    'type': 'supports',
                    'convention': convention
                })
                seen_edges.add(edge_key)
                connected_nodes.add(s_id)
                connected_nodes.add(aid)

    # Calculate final person weights based on the new formula
    # pid -> cid -> weight
    person_convention_weights = {}
    # pid -> sum of weights
    person_sum_weights = {}
    # pid -> weighted date average
    person_weighted_date_avg = {}
    
    for pid, convs in person_convention_stats.items():
        person_convention_weights[pid] = {}
        total_w = 0
        weighted_date_sum = 0
        
        for cid, stats in convs.items():
            # Formula: prsconventionweight = cube root of (supported + 5 * authored)
            w = math.pow(stats['supports'] + 5 * stats['authored'], 1/3)
            person_convention_weights[pid][cid] = w
            
            total_w += w
            conv_year = get_conv_year(cid)
            weighted_date_sum += w * conv_year
            
        person_sum_weights[pid] = total_w
        if total_w > 0:
            person_weighted_date_avg[pid] = weighted_date_sum / total_w
        else:
            person_weighted_date_avg[pid] = 2020.0 # Fallback

    # Calculate degrees to support FILTER_SINGLE_LINK_SUPPORTERS
    node_degrees = {}
    for conn in raw_connections:
        s, t = conn['source'], conn['target']
        node_degrees[s] = node_degrees.get(s, 0) + 1
        node_degrees[t] = node_degrees.get(t, 0) + 1

    # Second pass: finalize node weights and build edges with the new weights
    final_nodes = {}
    for nid, ninfo in nodes.items():
        if nid not in connected_nodes:
            continue
            
        # Optional Filter: Skip persons with only one connection
        if FILTER_SINGLE_LINK_SUPPORTERS and ninfo['type'] == 'prs' and node_degrees.get(nid, 0) <= 1:
            continue

        if ninfo['type'] == 'amendment':
            ninfo['weight'] = amendment_supporters_count.get(nid, 0)
        else:
            # Use total sum weight for node size visualization
            ninfo['weight'] = 10 * round(person_sum_weights.get(nid, 0))
        
        final_nodes[nid] = ninfo

    edges = []
    for i, conn in enumerate(raw_connections):
        source = conn['source']
        target = conn['target']
        
        # Skip edges where source or target was filtered out
        if source not in final_nodes or target not in final_nodes:
            continue

        ctype = conn['type']
        cid = conn['convention']
        
        # New complex edge weight formula
        # sum_weights = total experience across all conventions
        total_w = person_sum_weights.get(source, 1.0)
        # weight_in_this_conv = experience in the specific convention of the amendment
        weight_this_conv = person_convention_weights.get(source, {}).get(cid, 1.0)
        # weighted_date_avg = the person's "average activity year"
        weighted_date_avg = person_weighted_date_avg.get(source, 2020.0)
        # current_year = year of the amendment's convention
        current_year = get_conv_year(cid)
        
        # Formula part 1: sqrt(total_w) / sqrt(weight_this_conv)
        ratio = math.sqrt(total_w) / math.sqrt(max(0.001, weight_this_conv))
        
        # Formula part 2: (1 + 2 * weighted_date_avg / current_year)
        temporal_factor = (1 + 2 * (weighted_date_avg / current_year))
        
        weight = ratio * temporal_factor
        
        # Apply 5x multiplier for authored edges
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
            
            # Attributes definition
            f.write('    <attributes class="node" mode="static">\n')
            f.write('      <attribute id="attr_type" title="type" type="string" />\n')
            f.write('      <attribute id="attr_convention" title="convention" type="string" />\n')
            f.write('      <attribute id="attr_kv" title="kv" type="string" />\n')
            f.write('      <attribute id="attr_url" title="url" type="string" />\n')
            f.write('      <attribute id="attr_weight" title="weight" type="integer" />\n')
            f.write('    </attributes>\n')

            # Nodes
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
                f.write(f'          <attvalue for="attr_weight" value="{ninfo.get("weight", 0)}" />\n')
                f.write('        </attvalues>\n')
                f.write('      </node>\n')
            f.write('    </nodes>\n')

            # Edges
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
