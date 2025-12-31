# PDF Viewer Component

The **PDF Viewer** is a high-fidelity document viewing component designed for the AEA Design System. It provides an embedded viewing experience for technical documents (e.g., Anträge) with a Cyberpunk-Lite aesthetic, glassmorphic controls, and high-performance rendering.

## 1. Design Aesthetic

- **Container**: Large glassmorphic panel with `backdrop-blur-md` and a thin semi-transparent border.
- **Toolbar**: A floating or docked control bar with technical icons (SVG) and neon accent highlights.
- **Loading State**: A pulsing glitch-style loader or a geometric progress indicator.
- **Colors**: Uses `hsl(var(--bg-100))` for the main container, `hsl(var(--accent-brand))` for primary actions (e.g., Download), and `hsl(var(--accent-info))` for secondary actions (e.g., Zoom).

## 2. Technical Specifications

### Core Technology
- **Embedding**: Uses a combination of `<object>`, `<iframe>`, or native PDF rendering hints where supported.
- **Toolbar**: Custom HTML/CSS controls overlaying the PDF area.
- **State Management**: Handles loading, error (e.g., 404), and zoom levels.
- **Error Handling**: 
    - **Cross-Origin Detection**: Detects `net::ERR_BLOCKED_BY_RESPONSE` (CORS/X-Frame-Options) via load event timeouts.
    - **Hanging Load Prevention**: Automatically triggers a timeout (8s) to detect documents that fail to load without a specific error code.
    - **Recovery Fallback**: Provides a "Open in New Tab" link for documents that cannot be embedded due to server security policies.

### Components
- `.aea-pdf-viewer`: The main wrapper.
- `.aea-pdf-toolbar`: Floating or fixed control bar.
- `.aea-pdf-content`: The area containing the PDF object.
- `.aea-pdf-overlay`: For loading spinners or error messages.

## 3. Variations

1.  **Modal Viewer**: A centered, floating window that dims the background. Ideal for focused reading.
2.  **Side Panel**: A collapsible viewer integrated into the application's sidebar for multi-tasking.
3.  **Full-Screen HUD**: A minimal, immersive viewer that maximizes screen real estate with floating controls.

## 4. Accessibility (WCAG AA)

- **Keyboard Control**: Toolbar buttons are focusable and support Enter/Space activation.
- **ARIA**: Uses `role="document"` and appropriate `aria-label` for controls.
- **Fallback**: Provides a direct download link if the browser cannot render the PDF.
- **Contrast**: Toolbar text and icons meet contrast requirements against the glassmorphic background.

## 5. Usage Example

```html
<div class="aea-pdf-viewer aea-pdf-modal" id="system-pdf-viewer">
  <div class="aea-pdf-toolbar">
    <div class="aea-pdf-title">Document_01.pdf</div>
    <div class="aea-pdf-actions">
      <button class="aea-pdf-btn" aria-label="Zoom Out">➖</button>
      <button class="aea-pdf-btn" aria-label="Zoom In">➕</button>
      <button class="aea-pdf-btn aea-pdf-accent" aria-label="Download">💾</button>
      <button class="aea-pdf-btn aea-pdf-danger" aria-label="Close">✖</button>
    </div>
  </div>
  <div class="aea-pdf-content">
    <iframe src="path/to/doc.pdf" type="application/pdf" width="100%" height="100%">
      <p>Your browser does not support PDFs. <a href="path/to/doc.pdf">Download instead</a>.</p>
    </iframe>
  </div>
</div>
```
