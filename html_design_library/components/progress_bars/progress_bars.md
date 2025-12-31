# Progress Bars Component

## 1. Design Specifications

### Visual Language
The Progress Bar component follows the **Cyberpunk-Lite** aesthetic, utilizing glassmorphism and high-contrast accents to visualize task completion or data loading.

- **Track (Background):** Semi-transparent, deep surface color with a subtle blur.
- **Indicator (Fill):** High-contrast accent colors (Brand, Success, Info, Danger) with a subtle glow or pulse effect for active states.
- **Variants:** 
  - **Determinate:** For known progress (e.g., 45%).
  - **Indeterminate:** For ongoing tasks with unknown duration (e.g., "Scanning...").
  - **Striped/Animated:** For active processing.
  - **Sizes:** Small (sm), Medium (default), Large (lg).

### Aesthetics (Glassmorphism)
- **Track:** `hsla(var(--bg-200) / 0.3)` with `backdrop-filter: blur(8px)`.
- **Fill:** Solid `hsl(var(--accent-brand))` or other semantic colors.
- **Glow:** Fill includes a `box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.5)`.

## 2. Technical Implementation

### CSS Classes
- `.aea-progress`: Container/Track.
- `.aea-progress-bar`: The actual fill element.
- `.aea-progress-indeterminate`: Modifier for indeterminate state.
- `.aea-progress-striped`: Modifier for striped pattern.
- `.aea-progress-animated`: Modifier for moving stripes.

### Logic (AEAProgress)
A singleton controller to manage programmatic progress updates.

### API
- `AEAProgress.update(id, percentage)`: Sets the width of a determinate progress bar.
- `AEAProgress.setIndeterminate(id, state)`: Toggles indeterminate animation.

## 3. Accessibility (A11y)
- **Roles:** `role="progressbar"`.
- **ARIA Attributes:** `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.
- **Labeling:** Should be accompanied by a label or `aria-label`.
- **Reduced Motion:** Animations (stripes/indeterminate) are disabled if `prefers-reduced-motion` is active.

## 5. Svelte Implementation (AEA-System)

The Svelte implementation provides a reactive `ProgressBar` component with support for all variants, sizes, and states.

### Usage

```svelte
<script>
  import { ProgressBar } from '$lib/components/aea';
</script>

<!-- Simple determinate progress -->
<ProgressBar value={65} variant="brand" label="Processing" />

<!-- Indeterminate scanning state -->
<ProgressBar indeterminate variant="info" label="Scanning Database..." />

<!-- Striped and animated success state -->
<ProgressBar value={100} variant="success" striped animated />
```

### Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `number` | `0` | The current progress value (0-100). |
| `max` | `number` | `100` | The maximum progress value. |
| `variant` | `'brand' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'brand'` | The visual style of the bar. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The thickness of the bar. |
| `indeterminate` | `boolean` | `false` | Whether to show the indeterminate scanning state. |
| `striped` | `boolean` | `false` | Whether to show a striped pattern. |
| `animated` | `boolean` | `false` | Whether the stripes should be animated. |
| `label` | `string` | `undefined` | Optional label to display above the bar. |
| `showValue` | `boolean` | `false` | Whether to show the percentage value. |
| `class` | `string` | `''` | Additional CSS classes for the container. |

## 4. Usage Example
```html
<div class="aea-progress aea-progress-md">
    <div class="aea-progress-bar bg-[hsl(var(--accent-brand))]" 
         role="progressbar" 
         aria-valuenow="45" 
         aria-valuemin="0" 
         aria-valuemax="100" 
         style="width: 45%;">
    </div>
</div>
```
