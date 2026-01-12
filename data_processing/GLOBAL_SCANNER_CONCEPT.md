# Konzept: Globaler Antragsgrün Scanner (Optimiert)

Dieses Dokument beschreibt den systematischen Ablauf für die vollständige Indizierung aller Amendments auf der Antragsgrün-Plattform (`berlin.antragsgruen.de`).

## Zielsetzung
*   Lückenlose Erfassung aller Amendment-IDs durch Kombination von REST-Harvesting und Probing.
*   Systematische Zuordnung zu Konventen (Slugs) und Motions.
*   Minimierung redundanter Anfragen durch Batch-Verarbeitung und State-Tracking.

---

## Phase 1: Datensammlung & Inventur

### 1.1 Slugs sammeln
*   Abruf aller verfügbaren Konvente (Slugs) von `https://berlin.antragsgruen.de/rest`.
*   Speicherung der Slugs in der Datenbank.

### 1.2 Öffentliche IDs & Max-IDs ermitteln
*   Für jeden Slug werden alle öffentlich sichtbaren Amendments via REST gesammelt.
*   **Ergebnis:** 
    *   Eine Liste aller existierenden öffentlichen IDs.
    *   Festlegung der `max_id` für **jeden einzelnen Konvent** (höchste dort gefundene ID).

---

## Phase 2: Systematisches Probing in Batches

Wir teilen alle Slugs in **Batches von jeweils 10 Konventen** auf.

### 2.1 Lokaler Scan (Innerhalb der Konvent-Range)
Für jeden Batch führen wir folgenden Ablauf durch:

```python
für konvent in batch:
    für unbelegte ID zwischen 0 und konvent.max_id:
        ist ID in konvent? (REST-Check)
            JA:
                finde motion für ID heraus
                speichere in Datenbank: "ID"=ID, "URL"=URL, "CONVENTION"=konvent
            NEIN:
                Speichere in Datenbank: Markiere ID als "nicht in konvent"
```

### 2.2 Globaler Scan (Batch-Erweiterung)
Um IDs zu finden, die höher sind als die höchste öffentliche ID eines Konvents, aber noch im Bereich des Batches liegen:

```python
batch_max_id = max(max_id aller konvente im batch)

für konvent in batch:
    für unbelegte ID zwischen 0 und batch_max_id:
        ist ID in konvent? (REST-Check)
            JA:
                finde motion für ID heraus
                speichere in Datenbank: "ID"=ID, "URL"=URL, "CONVENTION"=konvent
            NEIN:
                Speichere in Datenbank: Markiere ID als "nicht in konvent"
```

---

## Phase 3: REST-Check Logik (Details)

Der Check erfolgt über den Endpunkt:
`https://berlin.antragsgruen.de/rest/{CONVENTION}/motion/{PROBE_SLUG}/amendment/{ID}`

### Auswertung der JSON-Antwort:

| Szenario | JSON-Meldung | Bedeutung |
| :--- | :--- | :--- |
| **Erfolg** | `{"success": true, ...}` | ID gehört exakt zu dieser Motion. |
| **Falsche Motion** | `{"success": false, "message": "...gehört nicht zum Antrag."}` | **Gefunden!** ID gehört zum Konvent, aber anderer Motion. |
| **Nicht gefunden** | `{"success": false, "message": "...nicht gefunden"}` | ID existiert in diesem Konvent (aktuell) nicht. |

---

## Phase 4: Datenhaltung (SQLite)

### Tabelle `amendments`
*   `id` (Primary Key)
*   `convention_slug` (Zugeordneter Konvent)
*   `motion_slug` (Zugeordnete Motion)
*   `url` (Vollständige URL)
*   `is_public` (Boolean)
*   `checked_conventions` (Liste/Tabelle der Slugs, gegen die diese ID bereits erfolglos geprüft wurde)

### Tabelle `conventions`
*   `slug` (Primary Key)
*   `max_id` (Höchste bekannte öffentliche ID)
*   `probe_motion_slug` (Anker für REST-Checks)
