# Scroll Area

The Scroll Area component provides a custom-styled scrollbar that integrates seamlessly with the AEA Cyberpunk-Lite aesthetic. It ensures a consistent look across different browsers and operating systems.

## Design Specifications

-   **Aesthetic:** Minimalist, high-tech.
-   **Track:** Semi-transparent or invisible by default, appearing subtle on interaction.
-   **Thumb:** Thin, rounded, using a semi-transparent white/muted color that brightens or changes to the brand accent on hover.
-   **Behavior:** Appears only on hover or interaction to minimize visual noise.

## CSS Classes

-   `.aea-scroll-area`: Apply this class to any container that needs a custom scrollbar. It sets `overflow: auto` and applies the custom scrollbar styles.
-   `.aea-scroll-area-v`: Vertical scrolling only.
-   `.aea-scroll-area-h`: Horizontal scrolling only.

## Usage

```html
<div class="aea-scroll-area h-64 w-full">
    <!-- Long content here -->
</div>
```

## Implementation Details

The implementation uses the standard `::-webkit-scrollbar` pseudo-elements for WebKit browsers and `scrollbar-width` / `scrollbar-color` for Firefox.

### Variables (Customizable in `style.css`)

-   `--scrollbar-width`: 6px (default)
-   `--scrollbar-track`: transparent
-   `--scrollbar-thumb`: hsla(var(--text-100) / 0.2)
-   `--scrollbar-thumb-hover`: hsla(var(--accent-brand) / 0.8)

## Accessibility

-   Ensure the scrollbar thumb has enough contrast against the background when active.
-   Do not hide scrollbars entirely if content is overflowing, as this can confuse keyboard users.
-   The custom scrollbar should not interfere with standard scrolling behavior.
