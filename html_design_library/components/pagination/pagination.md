# Pagination Component

The **Pagination** component provides navigation through multi-page content. It follows the AEA Cyberpunk-Lite aesthetic with glassmorphism and high-contrast active states.

## Design Specifications

- **Font:** `ModernDense` for numbers and labels.
- **Background:** Glassmorphic buttons (`hsla(var(--bg-200) / 0.5)` with `backdrop-blur`).
- **Active State:** Solid `--accent-brand` background with a subtle glow.
- **Hover State:** Scale effect (`scale-105`) and increased border opacity.
- **Disabled State:** Reduced opacity and `pointer-events-none`.
- **Responsive:** Collapses to essential controls (Prev/Next/Current) on smaller screens.

## CSS Classes

| Class | Description |
| :--- | :--- |
| `.aea-pagination` | Main container (flexbox). |
| `.aea-pagination-item` | Individual page link/button. |
| `.aea-pagination-link` | Inner anchor/button style. |
| `.aea-pagination-active` | Active page state. |
| `.aea-pagination-disabled` | Disabled state (e.g., for "Next" on the last page). |
| `.aea-pagination-prev` | Previous button. |
| `.aea-pagination-next` | Next button. |
| `.aea-pagination-glass` | Variation with enhanced glass effect. |

## Usage Examples

### Basic Pagination

```html
<nav class="aea-pagination" aria-label="Page navigation">
    <ul class="flex items-center space-x-2">
        <li><a href="#" class="aea-pagination-prev">&larr;</a></li>
        <li><a href="#" class="aea-pagination-item">1</a></li>
        <li><a href="#" class="aea-pagination-item aea-pagination-active">2</a></li>
        <li><a href="#" class="aea-pagination-item">3</a></li>
        <li><span class="px-2 text-[hsl(var(--text-500))]">...</span></li>
        <li><a href="#" class="aea-pagination-item">12</a></li>
        <li><a href="#" class="aea-pagination-next">&rarr;</a></li>
    </ul>
</nav>
```

### Glass Variation

```html
<nav class="aea-pagination aea-pagination-glass" aria-label="Page navigation">
    <!-- Same structure as above -->
</nav>
```

## Accessibility

- Use `<nav>` with `aria-label="Page navigation"` for semantic structure.
- Use `aria-current="page"` for the active item.
- Use `aria-disabled="true"` for disabled buttons.
- Ensure focus rings are visible on keyboard navigation.

## Failure Scenarios & Considerations

1. **Large Page Counts:** Ensure "..." ellipsis logic is handled via JavaScript if dynamic.
2. **Mobile Viewport:** Avoid horizontal overflow by hiding non-essential page numbers.
3. **Contrast:** Verify that the active state (`--accent-brand`) has sufficient contrast against the dark background.
