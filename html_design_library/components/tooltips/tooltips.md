# Tooltips Component

Status: 🟢 Done

## 1. Design Specification

### Visual Language
- **Background:** High-opacity glassmorphic base (`hsla(var(--bg-100) / 0.95)`).
- **Accents:** Subtle border (`hsla(var(--border-300) / 0.2)`).
- **Blur:** `backdrop-filter: blur(8px)`.
- **Typography:** `ModernDense`, small (`text-sm`), high contrast.
- **Shapes:** `rounded-lg` with small arrow pointers.
- **Animations:** Fade-in with a slight 4px translate offset.

### Variants
| Position | Description |
| :--- | :--- |
| **Top** | Appears above the target element. |
| **Bottom** | Appears below the target element. |
| **Left** | Appears to the left of the target element. |
| **Right** | Appears to the right of the target element. |

## 2. Technical Implementation

### Logic (AEATooltip)
A singleton controller that manages the creation, positioning, and destruction of tooltips based on mouse and keyboard events.

### API
- `AEATooltip.init()`: Scans for elements with `data-tooltip` attribute.
- `AEATooltip.show(target, content, position)`: Programmatically show a tooltip.
- `AEATooltip.hide()`: Hide the current active tooltip.

### Accessibility (A11y)
- **Trigger:** Tooltips appear on both `mouseenter` and `focus`.
- **Roles:** Uses `role="tooltip"`.
- **Association:** The trigger element should ideally have `aria-describedby` pointing to the tooltip ID (handled dynamically).

## 4. Technical Concept (Svelte Implementation)

Implemented as a Svelte component that wraps a trigger element and handles the tooltip lifecycle.

### Props (Interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | `undefined` | Tooltip content text. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred position. |
| `delay` | `number` | `200` | Delay in ms before showing. |

### Example Usage
```svelte
<Tooltip text="Save changes" position="top">
  <Button icon="save" />
</Tooltip>
```

