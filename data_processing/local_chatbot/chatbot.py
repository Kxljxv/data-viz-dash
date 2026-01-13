import os
import sys
import unicodedata
import re
from difflib import get_close_matches
from gpt4all import GPT4All
from data_loader import DataLoader

# Konfiguration
# Llama-3.2-1B ist extrem klein (0.7GB), sehr modern und schnell auf CPUs
MODEL_NAME = "Llama-3.2-1B-Instruct-Q4_0.gguf"

# Pfad relativ zum Skript-Verzeichnis berechnen
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "static", "data"))

def normalize_name(name):
    """Normalisiert Namen für besseren Vergleich (Umlaute, Kleinschreibung)."""
    if not name:
        return ""
    # In Kleinbuchstaben umwandeln
    name = name.lower()
    # Umlaute ersetzen
    replacements = {'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'}
    for char, replacement in replacements.items():
        name = name.replace(char, replacement)
    # Akzente entfernen (z.B. é -> e)
    name = "".join(c for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn')
    return name.strip()

def strip_html(text):
    """Entfernt HTML-Tags aus einem String."""
    if not text:
        return ""
    # Tags entfernen
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)
    # Mehrfache Leerzeichen/Newlines reduzieren
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def find_best_person_match(user_input, known_names):
    """Findet die am besten passende Person im Text mit Fuzzy Matching."""
    user_input_norm = normalize_name(user_input)
    
    # 1. Direkter Substring-Check (schnell)
    for name in sorted(known_names, key=len, reverse=True):
        if normalize_name(name) in user_input_norm:
            return name
            
    # 2. Fuzzy Matching über Wortgruppen (für Tippfehler)
    # Wir zerlegen den Input in Wörter und suchen nach Ähnlichkeiten
    words = user_input.split()
    if len(words) >= 2:
        # Versuche 2-Wort-Kombinationen (Vorname Nachname)
        for i in range(len(words) - 1):
            candidate = f"{words[i]} {words[i+1]}"
            candidate_norm = normalize_name(candidate)
            
            # Vergleiche mit allen bekannten Namen (normalisiert)
            name_map = {normalize_name(n): n for n in known_names}
            matches = get_close_matches(candidate_norm, name_map.keys(), n=1, cutoff=0.8)
            
            if matches:
                return name_map[matches[0]]
                
    return None

def main():
    print("Initialisiere Chatbot...")
    
    # 1. Daten laden
    try:
        loader = DataLoader(STATIC_DATA_PATH)
    except Exception as e:
        print(f"Fehler beim Initialisieren des DataLoaders: {e}")
        return

    # Namen für die Suche cachen (aus den GEXF Daten)
    known_names = list(loader.regression_data.keys())
    print(f"{len(known_names)} Personen im Index.")

    # 2. Modell laden
    print(f"Lade LLM Modell '{MODEL_NAME}'...")
    print("HINWEIS: Falls kein CUDA gefunden wird, läuft das Modell auf der CPU.")
    try:
        # Wir laden das Modell und setzen das Context-Fenster explizit höher, falls unterstützt
        # GPT4All erlaubt n_ctx im Konstruktor bei einigen Backends
        model = GPT4All(MODEL_NAME, allow_download=True)
    except Exception as e:
        print(f"Fehler beim Laden des Modells: {e}")
        print("Stelle sicher, dass du eine Internetverbindung hast oder das Modell bereits heruntergeladen ist.")
        return

    print("\n" + "="*50)
    print("LOKALER PARTEI-FLÜGEL CHATBOT")
    print("Frage mich nach einer Person, um ihre politische Verortung zu erfahren.")
    print("Tippe 'exit' oder 'quit' zum Beenden.")
    print("="*50 + "\n")

    # 3. Chat Loop
    with model.chat_session():
        while True:
            user_input = input("Du: ").strip()
            
            if user_input.lower() in ['exit', 'quit', 'ende']:
                break
                
            if not user_input:
                continue

            # Personenerkennung mit Fuzzy Matching
            found_person_data = None
            found_name = find_best_person_match(user_input, known_names)
            
            if found_name:
                # Daten für die gefundene Person laden
                print(f"--> Person erkannt: {found_name.title()}")
                found_person_data = loader.get_person_data(found_name)
            
            # Kontext bauen
            system_context = ""
            if found_person_data:
                reg_pos = found_person_data.get('regression_pos')
                
                # Kontext für das LLM zusammenstellen
                amendments_str = ", ".join(found_person_data['supported_amendments'])
                conventions_str = ", ".join(found_person_data.get('supported_conventions', []))
                total_supported = found_person_data.get('total_supported', 0)
                
                # Initiierte Anträge mit HTML hinzufügen (aber bereinigt und gekürzt)
                initiated_info = ""
                initiated_list = found_person_data.get('initiated_amendments', [])
                if initiated_list:
                    initiated_info = "\n### Initiierte Anträge (Auszug):\n"
                    # Max 3 Anträge anzeigen, um Context-Fenster nicht zu sprengen
                    for am in initiated_list[:3]:
                        clean_text = strip_html(am['html'])
                        # Pro Antrag max 800 Zeichen
                        if len(clean_text) > 800:
                            clean_text = clean_text[:800] + "..."
                        initiated_info += f"- TITEL: {am['title']}\n  INHALT: {clean_text}\n"
                
                system_context = (
                    f"### Kontext\n"
                    f"Person: {found_person_data['name']}\n"
                    f"Kreisverband: {found_person_data['kv']}\n"
                    f"Veranstaltungen: {conventions_str}\n"
                    f"Insgesamt unterstützte Änderungsanträge: {total_supported}\n"
                    f"Unterstützte Änderungsanträge (Selection): {amendments_str}\n"
                    f"Partei-internes Orientierungsmaß: {reg_pos}\n"
                    f"{initiated_info}"
                    f"\n"
                    f"### Regel\n"
                    f"Alle gefragten Personen sind aktive Mitglieder von Bündnis 90 / Die grünen (Unabhängig vom Partei-internen Orientierungsmaß)."
                    f"Partei-internes Orientierungsmaß höher als -1000 = Realo Flügel.\n"
                    f"Partei-internes Orientierungsmaß niedriger als -1000 = Linker Flügel (PL).\n"
                    f"Verwende den bereitgestellten Kontext, um zu erklären, zu welchem Flügel die Person gehört.\n"
                    f"Du hast alle Informationen über die Person, die für die Antwort erforderlich ist.\n"
                    f"Der bereitgestellter Kontext ist 100% wahrheitsgemäß bestätigt und aktuell.\n"
                    f"Der Benutzer hat den Namen {found_person_data['name']} bereitgestellt. Jetzt ist es deine Aufgabe, in einem Text zu erklären, welchem Flügel die Person angehört und alle Daten weiterzugeben.\n"
                )
                
                print(f"--> Kontext geladen (Reg-Pos: {reg_pos})")
            
            # Prompt generieren
            full_prompt = user_input
            if system_context:
                # Wir hängen den Kontext an oder stellen ihn voran
                full_prompt = f"{system_context}\n\nPerson: {user_input}"
            
            # Antwort generieren
            print("KI denkt nach (Streaming):")
            print("Bot: ", end="", flush=True)
            
            # Streaming nutzen, damit es sich schneller anfühlt
            response_text = ""
            # Wir erhöhen max_tokens etwas, falls HTML-Inhalt erklärt werden soll
            try:
                for token in model.generate(full_prompt, max_tokens=500, streaming=True):
                    print(token, end="", flush=True)
                    response_text += token
            except Exception as e:
                print(f"\nFehler bei der Generierung: {e}")
                print("Hinweis: Der Kontext war eventuell immer noch zu groß für das Modell.")
                
            print("\n")

if __name__ == "__main__":
    main()
