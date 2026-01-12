import os
import sys
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats
from lxml import etree

def update_gexf_with_regression_pos(gexf_path, node_positions):
    """
    Speichert die berechneten Regressions-Positionen als Attribut in der GEXF-Datei.
    """
    print(f"[*] Aktualisiere GEXF-Datei mit regression_pos Attribut...")
    try:
        parser = etree.XMLParser(remove_blank_text=True)
        tree = etree.parse(gexf_path, parser)
        root = tree.getroot()
        
        # Namespaces ermitteln
        ns_map = root.nsmap.copy()
        main_ns = ns_map.get(None, "")
        ns = {"g": main_ns} if main_ns else {}
        
        # 1. Attribut-Definition hinzufügen, falls nicht vorhanden
        attr_id = "attr_regression_pos"
        attr_title = "regression_pos"
        
        # Suche nach <attributes class="node">
        attributes_node = root.xpath("//g:attributes[@class='node']", namespaces=ns)
        if not attributes_node:
            # Falls gar keine Attribute da sind (unwahrscheinlich), erstellen wir sie
            graph_node = root.xpath("//g:graph", namespaces=ns)[0]
            attributes_node = etree.SubElement(graph_node, "{%s}attributes" % main_ns if main_ns else "attributes", 
                                             attrib={"class": "node", "mode": "static"})
        else:
            attributes_node = attributes_node[0]
            
        # Prüfen ob das Attribut schon definiert ist
        existing_attr = attributes_node.xpath("g:attribute[@id='%s']" % attr_id, namespaces=ns)
        if not existing_attr:
            etree.SubElement(attributes_node, "{%s}attribute" % main_ns if main_ns else "attribute",
                           attrib={"id": attr_id, "title": attr_title, "type": "double"})
            
        # 2. Werte für jeden Knoten setzen
        nodes = root.xpath("//g:node", namespaces=ns)
        updated_count = 0
        
        for node in nodes:
            node_id = node.get("id")
            if node_id in node_positions:
                val = node_positions[node_id]
                
                # Suche <attvalues>
                attvalues = node.xpath("g:attvalues", namespaces=ns)
                if not attvalues:
                    attvalues = etree.SubElement(node, "{%s}attvalues" % main_ns if main_ns else "attvalues")
                else:
                    attvalues = attvalues[0]
                    
                # Prüfen ob der Wert schon da ist, sonst neu oder update
                existing_val = attvalues.xpath("g:attvalue[@for='%s']" % attr_id, namespaces=ns)
                if existing_val:
                    existing_val[0].set("value", str(val))
                else:
                    etree.SubElement(attvalues, "{%s}attvalue" % main_ns if main_ns else "attvalue",
                                   attrib={"for": attr_id, "value": str(val)})
                updated_count += 1
                
        # Datei speichern
        tree.write(gexf_path, encoding="utf-8", xml_declaration=True, pretty_print=True)
        print(f"[+] GEXF erfolgreich aktualisiert. {updated_count} Knoten erhielten das Attribut '{attr_title}'.")
        
    except Exception as e:
        print(f"[-] Fehler beim Aktualisieren der GEXF: {e}")

def analyze_gexf_regression(gexf_path, output_image_path=None):
    """
    Liest eine GEXF-Datei, extrahiert Positionen und Gewichte (Degree),
    berechnet eine gewichtete Regressionsgerade und exportiert ein Bild.
    """
    if not os.path.exists(gexf_path):
        print(f"[-] Datei nicht gefunden: {gexf_path}")
        return

    print(f"[*] Lade Graph aus {gexf_path}...")
    
    try:
        # Wir nutzen iterparse für Speicher-Effizienz bei großen Dateien
        context = etree.iterparse(gexf_path, events=("start", "end"))
        
        nodes_data = {} # node_id -> {x, y}
        degrees = {}    # node_id -> count
        
        # Namespaces aus dem Root-Element holen (wird beim ersten "start" Event verfügbar)
        ns_map = {}
        
        for event, elem in context:
            if event == "start" and not ns_map:
                ns_map = elem.nsmap.copy()
                if None in ns_map:
                    ns_map["g"] = ns_map.pop(None)
                # Viz Namespace suchen
                for prefix, url in ns_map.items():
                    if "viz" in url:
                        ns_map["viz"] = url
                        break
            
            # Knoten verarbeiten
            if event == "end" and elem.tag.endswith("node"):
                node_id = elem.get("id")
                # Viz Position suchen
                pos_elems = elem.xpath("viz:position", namespaces=ns_map)
                if pos_elems:
                    nodes_data[node_id] = {
                        "x": float(pos_elems[0].get("x", 0)),
                        "y": float(pos_elems[0].get("y", 0))
                    }
                elem.clear() # Speicher freigeben
            
            # Kanten verarbeiten für Degree
            if event == "end" and elem.tag.endswith("edge"):
                source = elem.get("source")
                target = elem.get("target")
                degrees[source] = degrees.get(source, 0) + 1
                degrees[target] = degrees.get(target, 0) + 1
                elem.clear() # Speicher freigeben
                
        if not nodes_data:
            print("[!] KEINE Positionsdaten (viz:position) in GEXF gefunden.")
            print("[!] Wie vom User gewünscht, wird KEIN automatisches Layouting durchgeführt.")
            return

        x_vals = []
        y_vals = []
        weights = []
        
        for node_id, pos in nodes_data.items():
            x_vals.append(pos["x"])
            y_vals.append(pos["y"])
            # Gewichtung basierend auf dem Degree (Anzahl der Verbindungen)
            # +1 um 0-Gewichte zu vermeiden
            weights.append(degrees.get(node_id, 0) + 1)

        x = np.array(x_vals)
        y = np.array(y_vals)
        w = np.array(weights)

        print(f"[*] Berechne gewichtete Regression für {len(x)} Knoten...")
        
        # 3. Gewichtete lineare Regression
        # WLS (Weighted Least Squares)
        # Modell: y = m*x + c
        slope, intercept = np.polyfit(x, y, 1, w=w)
        
        # 3b. Mittelpunkt und Projektionen berechnen (Neu)
        # Der gewichtete Mittelpunkt (Centroid) liegt immer auf der Regressionsgeraden
        mean_x_w = np.average(x, weights=w)
        mean_y_w = np.average(y, weights=w)
        
        # Richtungsvektor der Geraden: v = (1, slope)
        # Normalisierter Richtungsvektor u
        line_mag = np.sqrt(1 + slope**2)
        u_x = 1 / line_mag
        u_y = slope / line_mag
        
        # Für jeden Knoten die Distanz entlang der Geraden zum Mittelpunkt berechnen
        # d = (P - Centroid) . u
        node_regression_pos = {}
        for node_id, pos in nodes_data.items():
            dx = pos["x"] - mean_x_w
            dy = pos["y"] - mean_y_w
            # Skalarprodukt für die Projektion
            dist_along_line = dx * u_x + dy * u_y
            node_regression_pos[node_id] = dist_along_line

        # 4. GEXF Datei aktualisieren (Neu)
        update_gexf_with_regression_pos(gexf_path, node_regression_pos)
        
        # 5. Visualisierung
        plt.figure(figsize=(12, 10), dpi=150)
        plt.style.use('dark_background')
        
        # Knoten zeichnen (Größe basierend auf Gewicht)
        sizes = (w / np.max(w)) * 100 + 5
        plt.scatter(x, y, s=sizes, c=w, cmap='viridis', alpha=0.5, edgecolors='none', label='Knoten (Größe=Degree)')
        
        # Regressionsgerade zeichnen
        x_range = np.linspace(np.min(x), np.max(x), 100)
        y_line = slope * x_range + intercept
        plt.plot(x_range, y_line, color='red', linewidth=2, label=f'Gewichtete Regression: y={slope:.4f}x + {intercept:.2f}')
        
        plt.title(f"Graph Analyse: {os.path.basename(gexf_path)}\nGewichtete Regressionsgerade", fontsize=14)
        plt.xlabel("X Koordinate (viz:position)", fontsize=10)
        plt.ylabel("Y Koordinate (viz:position)", fontsize=10)
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.3)
        
        # Ausgabe-Pfad bestimmen
        if not output_image_path:
            output_image_path = gexf_path.replace(".gexf", "_regression.png")
            if output_image_path.endswith(".gz"):
                output_image_path = output_image_path.replace(".gz", "")

        plt.savefig(output_image_path, bbox_inches='tight')
        plt.close()
        
        print(f"[+] Analyse abgeschlossen. Bild gespeichert unter: {output_image_path}")
        print(f"    Steigung (Slope): {slope:.6f}")
        print(f"    Y-Achsenabschnitt (Intercept): {intercept:.6f}")

    except Exception as e:
        print(f"[-] Fehler bei der Verarbeitung: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Benutzung: python analyze_graph_regression.py <pfad_zur_gexf_datei>")
        # Test-Pfad falls vorhanden
        test_path = "c:/Users/kolja/Desktop/viz-svelting/static/data/bdk_all/bdk_all.gexf"
        if os.path.exists(test_path):
            print(f"[*] Starte Analyse mit Standardpfad: {test_path}...")
            analyze_gexf_regression(test_path)
        else:
            # Fallback falls der Unterordner nicht existiert
            test_path = "c:/Users/kolja/Desktop/viz-svelting/static/data/bdk_all.gexf"
            if os.path.exists(test_path):
                print(f"[*] Starte Analyse mit Fallback-Pfad: {test_path}...")
                analyze_gexf_regression(test_path)
    else:
        analyze_gexf_regression(sys.argv[1])
