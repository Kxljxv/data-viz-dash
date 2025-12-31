# Spinner Component

## 1. Design Specifications

### Visual Language
The Spinner component provides visual feedback for loading states, following the **Cyberpunk-Lite** aesthetic with high-performance CSS animations.

- **Aesthetic:** Technical, neon, and unobtrusive.
- **Variants:**
  - **Ring (Default):** A classic rotating ring with a gradient or gap.
  - **Orbit:** Two concentric rings rotating in opposite directions (More "Technical").
  - **Pulse:** A soft pulsing glow (More "Cyberpunk").
  - **Dots:** Sequential bouncing dots for smaller areas.
- **Sizes:** 
  - `sm`: 1rem (16px) - For buttons or inline text.
  - `md`: 2rem (32px) - Default for panel loading.
  - `lg`: 3rem (48px) - For main viewport loading.
  - `xl`: 4rem (64px) - For heavy initialization.

### Aesthetics (Neon & Glass)
- **Colors:** Primary use of `hsl(var(--accent-brand))` or `hsl(var(--accent-secondary-100))`.
- **Glow:** Keyframes include `box-shadow` or `drop-shadow` to create a neon effect.

## 2. Technical Implementation

### CSS Classes
- `.aea-spinner`: Base container.
- `.aea-spinner-ring`: Rotating ring variant.
- `.aea-spinner-orbit`: Dual-ring variant.
- `.aea-spinner-pulse`: Pulsing variant.
- `.aea-spinner-dots`: Dot sequence variant.

### Performance
- Animations rely exclusively on `transform` and `opacity` to ensure GPU acceleration and 60fps smoothness even during heavy JS execution.

## 3. Accessibility (A11y)
- **Role:** `role="status"`.
- **Attributes:** `aria-live="polite"`, `aria-busy="true"`.
- **Fallback:** Includes a hidden "Loading..." text for screen readers using `.sr-only`.
- **Reduced Motion:** Animations are slowed down or simplified if `prefers-reduced-motion` is active.

## 4. Usage Example
```html
<div class="aea-spinner aea-spinner-md aea-spinner-ring" role="status" aria-busy="true">
    <span class="sr-only">Loading...</span>
</div>
```

## 5. Svelte Implementation (AEA-System)

The Svelte implementation provides a unified `Spinner` component with full support for all variants, sizes, and colors.

### Usage

```svelte
<script>
  import { Spinner } from '$lib/components/aea';
</script>

<!-- Default Ring Spinner (Medium) -->
<Spinner />

<!-- Large Orbit Spinner with Brand Color -->
<Spinner variant="orbit" size="lg" color="brand" />

<!-- Small Pulse Spinner -->
<Spinner variant="pulse" size="sm" />

<!-- Dots Spinner with Secondary Color -->
<Spinner variant="dots" color="secondary" />
```

### Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'ring' \| 'orbit' \| 'pulse' \| 'dots'` | `'ring'` | The visual style of the spinner. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | The size of the spinner. |
| `color` | `'brand' \| 'secondary' \| 'current' \| string` | `'brand'` | Color variant or custom CSS color. |
| `label` | `string` | `'Loading...'` | Screen reader label. |
| `class` | `string` | `''` | Additional CSS classes. |
