# Alerts Component

Status: 🟢 Done

## 1. Design Specification

### Visual Language
- **Background:** Glassmorphic semi-transparent base (`hsla(var(--bg-100) / 0.8)`).
- **Accents:** 4px left-border accent matching the alert type color (Success, Info, Warning, Error).
- **Blur:** `backdrop-filter: blur(8px)`.
- **Contrast:** High-contrast text for legibility against glass backgrounds.
- **Icons:** Mandatory iconography for quick visual identification.

### Variants
| Type | Color Variable | Icon (Lucide-like) | Purpose |
| :--- | :--- | :--- | :--- |
| **Info** | `var(--info)` | Info | General system updates, neutral info. |
| **Success** | `var(--success)` | CheckCircle | Successful operations, "Supporter" node feedback. |
| **Warning** | `var(--accent-brand)` | AlertTriangle | Potential issues, attention required. |
| **Error** | `var(--danger)` | XCircle | Critical failures, unauthorized access. |

## 2. Technical Implementation

### Logic (AEAAlerts)
Manages the dismissal of alerts and potential auto-hide functionality.

### API
- `AEAAlerts.init()`: Attaches listeners to all close buttons.
- `AEAAlerts.dismiss(elementId)`: Programmatically removes an alert.

### Accessibility (A11y)
- **Role:** `role="alert"` for dynamic updates.
- **Close Button:** `aria-label="Dismiss"` for screen readers.
- **Color:** Does not rely solely on color (includes icons).

## 4. Technical Concept (Svelte Implementation)

Implemented with **Svelte 5 Runes** for reactive state and improved prop handling.

### Props (Interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Visual style and icon of the alert. |
| `title` | `string` | `undefined` | Bold title text. |
| `dismissible` | `boolean` | `true` | Whether to show the close button. |
| `onclose` | `function` | `undefined` | Callback when alert is dismissed. |

### Example Usage
```svelte
<Alert variant="success" title="Success!" onclose={() => console.log('closed')}>
  Your changes have been saved successfully.
</Alert>
```

