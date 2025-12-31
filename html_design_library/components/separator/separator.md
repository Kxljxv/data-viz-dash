# Separator

The Separator component is used to visually divide content sections with a technical, Cyberpunk-Lite aesthetic. It goes beyond a simple line by incorporating neon accents, technical markers (ticks), and optional metadata labels.

## 1. Visual Specifications

- **Line:** Thin (1px) line with varying opacity.
- **Typography:** `ModernDense` for labels, small (xs), uppercase, tracking-widest.
- **Colors:**
  - **Main Line:** `hsla(var(--border-300) / 0.2)`.
  - **Accent:** `hsl(var(--accent-brand))` for markers or neon variations.
  - **Label:** `hsl(var(--text-500))`.
- **Technical Markers:** Small `+` or square dots at the ends or intersections to reinforce the technical/blueprint look.

## 2. Variations

- **Horizontal (Default):** Standard horizontal divider.
- **Vertical:** Used for side-by-side content separation.
- **With Label:** Includes a text label (left, center, or right aligned).
- **Neon Glow:** A version with a subtle neon glow for high-impact sections.
- **Dashed/Technical:** Using technical patterns like dashes or repeated markers.

## 3. Technical Implementation

- **HTML:** Semantic `<hr>` tag for horizontal separators, or `<div>` with `role="separator"` for complex/vertical versions.
- **CSS:** Hybrid Tailwind + Custom CSS for precise marker positioning and gradients.
- **Accessibility:**
  - `role="separator"` for non-`<hr>` elements.
  - `aria-orientation` (horizontal/vertical).

## 4. Usage Example

```html
<!-- Simple Horizontal -->
<hr class="aea-separator">

<!-- Horizontal with Center Label -->
<div class="aea-separator-container">
    <div class="aea-separator-label">Data Section</div>
</div>

<!-- Vertical Separator -->
<div class="aea-separator-v" role="separator" aria-orientation="vertical"></div>
```

## 5. Responsive Behavior

- **Fluidity:** Horizontal separators expand to 100% of their container.
- **Vertical:** Adapts to the height of its parent container.

## 6. Svelte Implementation (AEA-System)

The Svelte implementation provides a versatile `Separator` component supporting all visual styles and orientations.

### Usage

```svelte
<script>
  import { Separator } from '$lib/components/aea';
</script>

<!-- Simple horizontal -->
<Separator />

<!-- Horizontal with label -->
<Separator label="System Logs" labelAlign="center" />

<!-- Vertical separator -->
<div class="flex h-12 items-center">
  <div>Section 1</div>
  <Separator orientation="vertical" />
  <div>Section 2</div>
</div>

<!-- Technical style -->
<Separator variant="tech" />

<!-- Neon style -->
<Separator variant="neon" />
```

### Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The direction of the separator. |
| `variant` | `'default' \| 'tech' \| 'neon'` | `'default'` | The visual style. |
| `label` | `string` | `undefined` | Optional text label. |
| `labelAlign` | `'left' \| 'center' \| 'right'` | `'center'` | Alignment of the label (horizontal only). |
| `class` | `string` | `''` | Additional CSS classes. |
