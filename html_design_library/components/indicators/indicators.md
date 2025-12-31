# Indicators Component

Status: 🟢 Done

## 1. Design Specification

### Visual Language
- **Base:** Small circular elements (`rounded-full`) used to signify status or draw attention.
- **Accents:** High-vibrancy HSL colors for status clarity.
- **Animation:** "Pulse" effects using expansion and opacity fades to create a "living" system feel.
- **Placement:** Often used as overlays on avatars, icons, or next to text labels.

### Variants
| Type | Color Variable | Purpose |
| :--- | :--- | :--- |
| **Brand** | `var(--accent-brand)` | Primary attention, active process. |
| **Success** | `var(--success-100)` | Online, synchronized, healthy. |
| **Warning** | `var(--accent-brand)` | High latency, pending, attention needed. |
| **Danger** | `var(--danger-100)` | Offline, error, critical failure. |
| **Info** | `var(--accent-secondary-100)` | Neutral status, background task. |
| **Neutral** | `var(--text-400)` | Inactive, unknown, muted. |

### Styles
- **Dot:** Simple solid circle.
- **Pulse:** A dot with a concentric expanding ring animation.
- **Ring:** An outline-only indicator.

## 2. Technical Implementation

### CSS Classes
- `.indicator`: Base wrapper (relative positioning).
- `.indicator-dot`: The visible status circle.
- `.indicator-pulse`: The animated expanding ring.
- `.indicator-sm`, `.indicator-md`, `.indicator-lg`: Size variants.

### Accessibility (A11y)
- **Aria-hidden:** Indicators are often decorative or redundant to text. If they convey the *only* status, they must have an `aria-label` or `title`.
- **Motion:** Pulse animations should respect `prefers-reduced-motion`.

## 4. Svelte Implementation (AEA-System)

The Svelte implementation provides a versatile `Indicator` component that supports all design variants, sizes, and animation types.

### Usage

```svelte
<script>
  import { Indicator } from '$lib/components/aea';
</script>

<!-- Simple pulsing success dot -->
<Indicator variant="success" pulse size="md" />

<!-- Small static danger dot -->
<Indicator variant="danger" size="sm" />

<!-- Large brand indicator with custom title -->
<Indicator variant="brand" size="lg" pulse title="System Active" />
```

### Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'brand' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'brand'` | The visual style of the indicator. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | The size of the indicator. |
| `pulse` | `boolean` | `false` | Whether the indicator should have a pulsing animation. |
| `title` | `string` | `undefined` | Tooltip title/accessibility label. |
| `class` | `string` | `''` | Additional CSS classes. |

## 3. Usage Examples

```html
<!-- Simple Success Dot -->
<span class="indicator-dot indicator-success"></span>

<!-- Pulsing Danger Indicator -->
<div class="indicator">
  <span class="indicator-dot indicator-danger"></span>
  <span class="indicator-pulse indicator-danger"></span>
</div>
```
