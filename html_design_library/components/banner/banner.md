# Banner Component

Status: 🟢 Done

## 1. Design Specification

### Visual Language
- **Background:** High-blur glassmorphic surface (`hsla(var(--bg-100) / 0.9)`).
- **Accents:** 2px bottom border matching the banner type (Success, Info, Warning, Error).
- **Blur:** `backdrop-filter: blur(24px)`.
- **Typography:** `ModernDense` for compact data; `Serif` for prominent titles.
- **Layout:** Full-width, horizontal flex container.

### Variants
| Type | Color Variable | Purpose |
| :--- | :--- | :--- |
| **Info** | `var(--accent-secondary-100)` | Maintenance notices, system-wide updates. |
| **Success** | `var(--success-100)` | Mass operation completion, synchronization success. |
| **Warning** | `var(--accent-brand)` | Impending downtime, security notices. |
| **Danger** | `var(--danger-100)` | Critical system failures, data breach alerts. |

## 2. Technical Implementation

### Logic (AEABanner)
Manages the dismissal and persistent state of banners (if required).

### API
- `AEABanner.init()`: Attaches listeners to all banner close buttons.
- `AEABanner.dismiss(elementId)`: Animates and removes a banner.

### Accessibility (A11y)
- **Role:** `role="status"` or `role="alert"` depending on urgency.
- **Dismissal:** Keyboard accessible close buttons with `aria-label`.
- **Focus:** If the banner is critical, focus should move to it upon appearance.

## 4. Svelte Implementation (AEA-System)

The Svelte implementation provides a reactive `Banner` component with built-in state management for dismissal and support for different variants and positions.

### Usage

```svelte
<script>
  import { Banner } from '$lib/components/aea';
</script>

<!-- Fixed top banner -->
<Banner 
  variant="warning" 
  position="fixed-top" 
  dismissible
>
  <span class="font-bold">System Maintenance:</span> 
  The graph database will be offline in 45 minutes.
</Banner>

<!-- Inline banner -->
<Banner variant="success">
  Successfully processed updates.
</Banner>
```

### Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | The visual style of the banner. |
| `position` | `'inline' \| 'fixed-top' \| 'fixed-bottom'` | `'inline'` | Where the banner is positioned. |
| `dismissible` | `boolean` | `true` | Whether the banner can be dismissed by the user. |
| `onDismiss` | `function` | `undefined` | Callback called when the banner is dismissed. |
| `icon` | `Snippet` | `undefined` | Custom icon to display. |
| `actions` | `Snippet` | `undefined` | Custom actions (buttons) to display. |
| `children` | `Snippet` | (Required) | The banner content. |

## 3. Usage Examples

```html
<div class="banner banner-info" role="status">
  <div class="banner-content">
    <svg class="banner-icon">...</svg>
    <p>Scheduled maintenance in 2 hours. <a>Learn more</a></p>
  </div>
  <div class="banner-actions">
    <button class="btn-banner-close" aria-label="Dismiss">&times;</button>
  </div>
</div>
```
