# Bottom Navigation Component

The **Bottom Navigation** component provides quick access to primary destinations in the mobile view. It is designed to be thumb-friendly and follows the AEA Cyberpunk-Lite aesthetic with glassmorphism and active state indicators.

## Design Specifications

- **Font:** `ModernDense` for labels.
- **Background:** Semi-transparent glass (`hsla(var(--bg-100) / 0.8)` with `backdrop-blur-lg`).
- **Active State:** Text and icon change to `--accent-brand` with a subtle top indicator line.
- **Hover State:** Subtle opacity increase and slight scale effect.
- **Placement:** Fixed at the bottom of the viewport (`fixed bottom-0`).
- **Responsive:** Only visible on mobile/small screens (`md:hidden`).

## CSS Classes

| Class | Description |
| :--- | :--- |
| `.aea-bottom-nav` | Main container (fixed bottom, flexbox). |
| `.aea-bottom-nav-item` | Individual navigation link/button. |
| `.aea-bottom-nav-icon` | Container for the SVG icon. |
| `.aea-bottom-nav-label` | Text label for the item. |
| `.aea-bottom-nav-active` | Active item state (color + indicator). |
| `.aea-bottom-nav-indicator` | Visual line above the active item. |

## Usage Examples

### Standard Bottom Navigation

```html
<nav class="aea-bottom-nav md:hidden" aria-label="Mobile navigation">
    <div class="aea-bottom-nav-inner">
        <a href="#" class="aea-bottom-nav-item aea-bottom-nav-active">
            <span class="aea-bottom-nav-indicator"></span>
            <svg class="aea-bottom-nav-icon" ...>...</svg>
            <span class="aea-bottom-nav-label">Graph</span>
        </a>
        <a href="#" class="aea-bottom-nav-item">
            <svg class="aea-bottom-nav-icon" ...>...</svg>
            <span class="aea-bottom-nav-label">Search</span>
        </a>
        <a href="#" class="aea-bottom-nav-item">
            <svg class="aea-bottom-nav-icon" ...>...</svg>
            <span class="aea-bottom-nav-label">Settings</span>
        </a>
    </div>
</nav>
```

## Accessibility

- Use `<nav>` with `aria-label="Mobile navigation"`.
- Use `aria-current="page"` for the active link.
- Icons should have `aria-hidden="true"` if labels are present.
- Ensure touch targets are at least 48x48px.

## Failure Scenarios & Considerations

1. **Too Many Items:** Limit to 3-5 items to prevent crowding and overlap.
2. **Safe Areas:** Ensure padding handles "Home Indicator" areas on modern mobile devices (e.g., iPhone notch/bottom bar).
3. **Desktop Visibility:** Use `md:hidden` to ensure it doesn't appear on larger screens where the Navbar/Sidebar is preferred.
