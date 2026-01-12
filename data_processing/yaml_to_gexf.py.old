import yaml
import xml.etree.ElementTree as ET
from xml.dom import minidom
import os

def yaml_to_gexf(yaml_file, gexf_file):
    """Converts the amendments YAML file to a GEXF network file."""
    if not os.path.exists(yaml_file):
        print(f"Error: {yaml_file} not found.")
        return

    print(f"Reading {yaml_file}...")
    with open(yaml_file, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    if not data:
        print("No data found in YAML.")
        return

    # Create GEXF structure
    gexf = ET.Element("gexf", xmlns="http://www.gexf.net/1.2draft", version="1.2")
    graph = ET.SubElement(gexf, "graph", defaultedgetype="undirected", mode="static")
    
    # Attributes for nodes
    attributes = ET.SubElement(graph, "attributes", {"class": "node"})
    ET.SubElement(attributes, "attribute", id="0", title="type", type="string")
    ET.SubElement(attributes, "attribute", id="1", title="kv", type="string")
    ET.SubElement(attributes, "attribute", id="2", title="convention", type="string")
    ET.SubElement(attributes, "attribute", id="3", title="weight", type="double")

    nodes = ET.SubElement(graph, "nodes")
    edges = ET.SubElement(graph, "edges")

    # Data structures to track nodes and calculate weights
    node_data = {}  # id -> {label, type, kv, convention, weight}
    edge_list = []  # list of (source, target, weight)
    
    # Pre-calculate weights
    person_weights = {} # id -> weight
    amendment_weights = {} # id -> weight

    print("Analyzing network and calculating weights...")
    for amendment_id, details in data.items():
        # Amendment weight = number of supporters
        supporters = details.get('supporters', [])
        amendment_weights[amendment_id] = len(supporters)
        
        # Track person weights
        applicant = details.get('applicant', {})
        app_name = applicant.get('name')
        if app_name:
            app_id = f"person-{app_name.lower().replace(' ', '-')}"
            person_weights[app_id] = person_weights.get(app_id, 0) + 5
            
        for supporter in supporters:
            sup_name = supporter.get('name')
            if sup_name:
                sup_id = f"person-{sup_name.lower().replace(' ', '-')}"
                person_weights[sup_id] = person_weights.get(sup_id, 0) + 1

    print("Building nodes and edges...")
    seen_nodes = set()
    for amendment_id, details in data.items():
        # 1. Create Amendment Node
        if amendment_id not in seen_nodes:
            node = ET.SubElement(nodes, "node", id=str(amendment_id), label=details.get('label', ''))
            attvalues = ET.SubElement(node, "attvalues")
            ET.SubElement(attvalues, "attvalue", {"for": "0", "value": "amendment"})
            ET.SubElement(attvalues, "attvalue", {"for": "2", "value": details.get('convention', '')})
            ET.SubElement(attvalues, "attvalue", {"for": "3", "value": str(amendment_weights[amendment_id])})
            ET.SubElement(node, "{http://www.gexf.net/1.2draft/viz}position", x="0.0", y="0.0", z="0.0")
            seen_nodes.add(amendment_id)

        # 2. Create Applicant Node and Edge
        applicant = details.get('applicant', {})
        app_name = applicant.get('name')
        if app_name:
            app_id = f"person-{app_name.lower().replace(' ', '-')}"
            if app_id not in seen_nodes:
                node = ET.SubElement(nodes, "node", id=app_id, label=app_name)
                attvalues = ET.SubElement(node, "attvalues")
                ET.SubElement(attvalues, "attvalue", {"for": "0", "value": "person"})
                ET.SubElement(attvalues, "attvalue", {"for": "1", "value": applicant.get('kv', '')})
                ET.SubElement(attvalues, "attvalue", {"for": "3", "value": str(person_weights.get(app_id, 0))})
                ET.SubElement(node, "{http://www.gexf.net/1.2draft/viz}position", x="0.0", y="0.0", z="0.0")
                seen_nodes.add(app_id)
            
            # Edge from applicant to amendment: Weight = 5
            edge_list.append((app_id, str(amendment_id), "5.0"))

        # 3. Create Supporter Nodes and Edges
        for supporter in details.get('supporters', []):
            sup_name = supporter.get('name')
            if not sup_name:
                continue
            
            sup_id = f"person-{sup_name.lower().replace(' ', '-')}"
            if sup_id not in seen_nodes:
                node = ET.SubElement(nodes, "node", id=sup_id, label=sup_name)
                attvalues = ET.SubElement(node, "attvalues")
                ET.SubElement(attvalues, "attvalue", {"for": "0", "value": "person"})
                ET.SubElement(attvalues, "attvalue", {"for": "1", "value": supporter.get('kv', '')})
                ET.SubElement(attvalues, "attvalue", {"for": "3", "value": str(person_weights.get(sup_id, 0))})
                ET.SubElement(node, "{http://www.gexf.net/1.2draft/viz}position", x="0.0", y="0.0", z="0.0")
                seen_nodes.add(sup_id)
            
            # Edge from supporter to amendment: Weight = 1
            edge_list.append((sup_id, str(amendment_id), "1.0"))

    # Add edges to XML
    for i, (source, target, weight) in enumerate(edge_list):
        ET.SubElement(edges, "edge", id=str(i), source=source, target=target, weight=weight)

    # Pretty print XML
    xml_str = ET.tostring(gexf, encoding='utf-8')
    parsed_str = minidom.parseString(xml_str)
    pretty_xml = parsed_str.toprettyxml(indent="  ")

    # Fix namespace issues in viz:position
    pretty_xml = pretty_xml.replace('xmlns:ns0="http://www.gexf.net/1.2draft/viz" ns0:position', 'viz:position')
    # Add viz namespace to root if needed
    if 'xmlns:viz="http://www.gexf.net/1.2draft/viz"' not in pretty_xml:
        pretty_xml = pretty_xml.replace('xmlns="http://www.gexf.net/1.2draft"', 'xmlns="http://www.gexf.net/1.2draft" xmlns:viz="http://www.gexf.net/1.2draft/viz"')

    print(f"Writing to {gexf_file}...")
    with open(gexf_file, 'w', encoding='utf-8') as f:
        f.write(pretty_xml)
    print("Done!")

if __name__ == "__main__":
    # By default, look for amendments.yaml in the same directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "amendments.yaml")
    output_path = os.path.join(script_dir, "amendments.gexf")
    
    yaml_to_gexf(input_path, output_path)
