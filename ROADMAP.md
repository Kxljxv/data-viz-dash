# AEA Platform Roadmap (2025-2026)

Dieses Dokument beschreibt die geplanten Features, technischen Verbesserungen und die langfristige Vision für die AEA (Analysis of Electoral Alliances) Plattform.

---

## 🟢 Kurzfristig (Q1 2025): Performance & Stabilität
*Fokus: Optimierung der bestehenden Funktionen und Fehlerbehebung.*

- [ ] **TypeScript Migration**: Umstellung der Kern-Logik (insb. `GraphVisualization.js`) auf TypeScript für bessere Wartbarkeit und Typsicherheit.
- [ ] **Zustand Integration**: Einführung von Zustand für ein robusteres globales State Management (geplant laut README).
- [ ] **Axios Migration**: Umstellung von Standard-`fetch` auf Axios für besseres Error-Handling und Interceptors.
- [ ] **Unit Testing**: Erhöhung der Testabdeckung für Svelte-Komponenten (aktuelle Lücke laut technischer Analyse).
- [ ] **Density Analysis Speed**: Weiterführende Optimierung der Dichteberechnung (evtl. WebWorker-Auslagerung für UI-Responsiveness).
- [ ] **Gruppen-Synchronisierung**: Möglichkeit, erstellte Gruppen online im Benutzerprofil zu speichern (Cloudflare KV Integration).

---

## 🟡 Mittelfristig (Q2 - Q3 2025): Erweiterte Analyse-Features
*Fokus: Neue Erkenntnisse aus den Daten gewinnen.*

- [ ] **Web Usage Analytics**: Implementierung eines Dashboards im Admin-Panel zur Analyse der Seitennutzung.
- [ ] **Zentralitätsmaße**: Berechnung von Betweenness- und Closeness-Zentralität, um einflussreiche Akteure im Netzwerk automatisch zu identifizieren.
- [ ] **Interaktive Storytelling-Touren**: Erstellung von geführten Pfaden durch den Graphen, um Narrative zu visualisieren.
- [ ] **Annotationen**: Möglichkeit für Nutzer, Kommentare an Knoten oder Verbindungen zu hinterlassen.

---


## 🔴 Technisches Backlog (Laufend)
- [ ] **Accessibility Audit**: Formale Prüfung nach WCAG 2.1 AAA Standards.
- [ ] **SSR Optimierung**: Besseres Management von client-side Libraries wie PDF.js zur Reduzierung der initialen Bundle-Größe.

---

*Letztes Update: 31.12.2025*
