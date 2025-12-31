# Charts Component (D3.js Integrated)

The Charts component provides high-performance, interactive data visualizations designed with the **Cyberpunk-Lite** aesthetic. Leveraging **D3.js**, these visualizations are deeply customized to fit the technical, node-based graph context of the AEA system.

## Design Aesthetic
- **Neon Data Streams**: Lines and nodes use vivid HSL accents (`--accent-brand`, `--accent-info`) with ambient glows.
- **Glassmorphic Context**: Tooltips and legends utilize semi-transparent backgrounds with `backdrop-blur`.
- **Technical Grids**: Backgrounds feature subtle technical grids and coordinate systems.
- **Dynamic Motion**: Data transitions use smooth, GPU-accelerated D3 interpolations.

## Variations

### 1. Network Graph (`aea-chart-network`)
A force-directed graph optimized for visualizing connections between "Supporter" and "Antrag" nodes. Includes:
- Directional links with animated particles.
- Node collision detection.
- Zoom/Pan capabilities with technical coordinate readouts.

### 2. Radial Pulse (`aea-chart-radial`)
A circular data visualization for comparing categories or distribution. Features:
- Glowing arc segments.
- Central technical metadata.
- Interactive segment expansion on hover.

### 3. Real-time Waveform (`aea-chart-waveform`)
An animated line chart for time-series data, resembling a technical oscilloscope. Includes:
- Area gradients with transparency.
- Vertical scanning line.
- Dynamic data updates with "glitch" transitions.

## Technical Specifications

### Implementation Strategy
- **Library:** D3.js (v7) via CDN for portability.
- **Rendering:** SVG for crisp technical lines and text.
- **Styling:** Hybrid approach using D3 `.style()` for dynamic properties and CSS classes for theme-consistent elements.

### Accessibility
- **ARIA Labels**: SVG elements include `aria-label` and `role="graphics-document"`.
- **Keyboard Navigation**: Focusable data points with visible rings.
- **Color Contrast**: All data colors meet WCAG AA standards against the dark background.
- **Reduced Motion**: Transitions respect `prefers-reduced-motion` settings.

## Usage Example

```javascript
import { NetworkChart } from './script.js';

const chart = new NetworkChart('#chart-container', {
    nodes: [...],
    links: [...]
});
chart.render();
```
