# Skeleton Component

The Skeleton component is used to provide a visual placeholder while content is loading. It follows the **Cyberpunk-Lite** aesthetic with subtle pulsing animations and glassmorphic depth.

## Design Specifications

### Visual Style
- **Color**: Uses a semi-transparent version of the surface color `hsla(var(--bg-300) / 0.3)`.
- **Animation**: A subtle "pulse" or "shimmer" effect using `opacity` or `background-position` transitions.
- **Glassmorphism**: Integrated with `backdrop-blur` for a cohesive look within panels.
- **Borders**: Same radius as the elements they represent (`rounded-lg`, `rounded-full`, etc.).

### Variations
- **Text**: Multiple lines of varying widths to simulate paragraphs.
- **Circular**: For avatars or status indicators.
- **Rectangular**: For images, buttons, or card headers.
- **Complex**: Pre-built layouts (e.g., Card Skeleton, List Item Skeleton).

## API & Structure

### HTML Structure
```html
<!-- Basic Rectangle -->
<div class="aea-skeleton aea-skeleton-rect h-32 w-full"></div>

<!-- Circle -->
<div class="aea-skeleton aea-skeleton-circle h-12 w-12"></div>

<!-- Text Line -->
<div class="aea-skeleton aea-skeleton-text w-3/4"></div>
```

### CSS Classes
- `.aea-skeleton`: Base class for animation and basic styling.
- `.aea-skeleton-rect`: Default rectangular shape.
- `.aea-skeleton-circle`: Forces a 1:1 aspect ratio and `rounded-full`.
- `.aea-skeleton-text`: Optimized height and margin for simulating text lines.
- `.aea-skeleton-pulse`: Standard pulsing animation (default).
- `.aea-skeleton-shimmer`: Advanced shimmering gradient animation.

## Accessibility
- Skeletons should be marked with `aria-hidden="true"` to prevent screen readers from announcing them as content.
- Containers should use `aria-busy="true"` while loading and switch to `false` once content is ready.

## Implementation Details
- **Performance**: Animations use `opacity` or `transform` to ensure GPU acceleration and high FPS.
- **Responsiveness**: Widths are typically percentage-based or follow Tailwind's utility classes.
