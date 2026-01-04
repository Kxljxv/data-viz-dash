import yaml
import os
import re
from tqdm import tqdm

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
YAML_FILE = os.path.join(SCRIPT_DIR, "amendments_pipeline.yaml")
OUTPUT_GEXF = os.path.join(SCRIPT_DIR, "conventions_network.gexf")

# Convention IDs to include
# You can add or remove IDs from this list as needed
CONVENTION_IDS = [    
    "51bdk",
]

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
    edges = []  # (source, target, weight, type)
    
    # Track node weight components
    # For amendments: number of supporters
    # For persons: supports + (applications * 5)
    amendment_supporters_count = {} # aid -> count
    person_supports_count = {}      # pid -> count
    person_applications_count = {}  # pid -> count
    
    # Track which nodes have at least one connection
    connected_nodes = set()

    # Track edge uniqueness to avoid duplicates
    seen_edges = set()

    # First pass: collect connections and counts
    for aid, info in tqdm(data.items(), desc="Pass 1: Counting connections"):
        convention = info.get('convention')
        if convention not in CONVENTION_IDS:
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
        is_person = info.get('isperson', False)
        
        if author_name:
            clean_author = re.split(r'\(', author_name)[0].strip()
            if clean_author:
                author_slug = slugify(clean_author)
                author_id = f"person-{author_slug}"
                
                if author_id not in nodes:
                    nodes[author_id] = {
                        'label': clean_author, 
                        'type': 'person' if is_person else 'organization'
                    }
                
                person_applications_count[author_id] = person_applications_count.get(author_id, 0) + 1
                
                edge = (author_id, aid)
                if edge not in seen_edges:
                    edges.append({'source': author_id, 'target': aid, 'weight': 5, 'type': 'authored'})
                    seen_edges.add(edge)
                    connected_nodes.add(author_id)
                    connected_nodes.add(aid)

        # Process Supporters
        supporters = info.get('supporters', [])
        for s in supporters:
            s_name = s.get('name', '').strip()
            if not s_name:
                continue
                
            s_slug = s.get('id') or slugify(s_name)
            s_id = f"person-{s_slug}"
            
            if s_id not in nodes:
                nodes[s_id] = {
                    'label': s_name, 
                    'type': 'person', 
                    'kv': s.get('kv', '')
                }
            
            amendment_supporters_count[aid] += 1
            person_supports_count[s_id] = person_supports_count.get(s_id, 0) + 1
            
            edge = (s_id, aid)
            if edge not in seen_edges:
                edges.append({'source': s_id, 'target': aid, 'weight': 1, 'type': 'supports'})
                seen_edges.add(edge)
                connected_nodes.add(s_id)
                connected_nodes.add(aid)

    # Second pass: finalize node weights and filter connected nodes
    final_nodes = {}
    for nid, ninfo in nodes.items():
        if nid not in connected_nodes:
            continue
            
        if ninfo['type'] == 'amendment':
            ninfo['weight'] = amendment_supporters_count.get(nid, 0)
        else:
            supports = person_supports_count.get(nid, 0)
            apps = person_applications_count.get(nid, 0)
            ninfo['weight'] = supports + (apps * 5)
        
        final_nodes[nid] = ninfo

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
