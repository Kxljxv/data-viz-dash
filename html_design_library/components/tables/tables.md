# Tables

The Tables component is designed to present structured data clearly while maintaining the AEA design system's technical aesthetic. It supports glassmorphism, responsive horizontal scrolling, and interactive hover states.

## Design Specifications

-   **Container:** Usually wrapped in a `.aea-card` or a glassmorphic container.
-   **Header:** High contrast, uppercase, using `ModernDense` font.
-   **Rows:** Subtle borders or alternate striping.
-   **Hover:** Highlighted row with a brand accent or subtle glow.
-   **Typography:** Numbers should be tabular (mono if possible) for alignment.

## CSS Classes

-   `.aea-table-container`: Responsive wrapper for the table.
-   `.aea-table`: Main table class.
-   `.aea-table-striped`: Alternating row colors.
-   `.aea-table-hover`: Highlight rows on hover.
-   `.aea-table-compact`: Reduced padding for dense data.
-   `.aea-table-glass`: Semi-transparent background with backdrop blur.

## Usage

```html
<div class="aea-table-container aea-scroll-area">
    <table class="aea-table aea-table-hover">
        <thead>
            <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Last Active</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>John Doe</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>2023-10-27</td>
            </tr>
        </tbody>
    </table>
</div>
```

## Accessibility

-   Use `<thead>`, `<tbody>`, and `<th>` tags for semantic structure.
-   Ensure `scope="col"` or `scope="row"` is used on headers.
-   Maintain high contrast for text in headers and cells.
-   The responsive wrapper should allow keyboard users to scroll horizontally if content overflows.
