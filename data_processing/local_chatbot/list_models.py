from gpt4all import GPT4All
import json

def list_available_models():
    print("Abfrage der verfügbaren Modelle von GPT4All...")
    try:
        # GPT4All.list_models() gibt eine Liste von Dicts zurück
        models = GPT4All.list_models()
        print(f"Gefundene Modelle: {len(models)}")
        
        # Wir suchen nach Modellen, die klein sind (< 3GB)
        small_models = []
        for m in models:
            filename = m.get('filename')
            filesize = m.get('filesize', '0')
            if filename:
                # Größe in GB umrechnen (filesize ist oft ein String oder int in Bytes)
                try:
                    size_gb = int(filesize) / (1024**3)
                except:
                    size_gb = 0
                
                if size_gb < 4:
                    small_models.append((filename, size_gb))
        
        print("\nVerfügbare kleine Modelle (< 4GB):")
        for name, size in sorted(small_models, key=lambda x: x[1]):
            print(f"- {name} ({size:.2f} GB)")
            
    except Exception as e:
        print(f"Fehler beim Abrufen der Liste: {e}")

if __name__ == "__main__":
    list_available_models()
