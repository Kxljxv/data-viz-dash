# Footer Component

The **Footer** component provides the bottom navigation and information section for the application. It follows the AEA Cyberpunk-Lite aesthetic with glassmorphism, high contrast, and a clear information hierarchy.

## Design Specifications

-   **Background**: Glassmorphic surface (`hsla(var(--bg-100) / 0.8)` or `hsla(var(--bg-200) / 0.9)`) with `backdrop-blur-md`.
-   **Typography**:
    -   Headings: `ModernDense`, lg, Uppercase, Tracking-widest.
    -   Links: `ModernDense`, sm, `hsl(var(--text-200))`, hover: `hsl(var(--accent-brand))`.
    -   Meta Info: `ModernDense`, xs, `hsl(var(--text-400))`.
-   **Border**: Subtle top border (`1px solid hsla(var(--border-300) / 0.1)`).
-   **Layout**:
    -   Desktop: Multi-column grid (e.g., Brand, Navigation, Resources, Social).
    -   Mobile: Stacked sections with centered text or accordions for dense content.
-   **Spacing**: Generous vertical padding (`py-12` or `py-16`).

## CSS Classes

| Class | Description |
| :--- | :--- |
| `.aea-footer` | Main footer container with glassmorphic background. |
| `.aea-footer-grid` | Responsive grid for footer columns. |
| `.aea-footer-column` | Individual column for links or info. |
| `.aea-footer-heading` | Section title within the footer. |
| `.aea-footer-link` | Styled link with hover effects. |
| `.aea-footer-bottom` | Bottom section for copyright and legal links. |
| `.aea-footer-brand` | Branding section (logo + name). |

## Usage Example

```html
<footer class="aea-footer">
    <div class="container mx-auto px-6 py-12">
        <div class="aea-footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <!-- Brand Section -->
            <div class="aea-footer-brand">
                <h2 class="font-serif text-2xl text-[hsl(var(--text-100))] mb-4">AEA</h2>
                <p class="text-sm text-[hsl(var(--text-400))] leading-relaxed">
                    Visualizing the network of people, motions, and connections in a performant interactive graph.
                </p>
            </div>
            
            <!-- Navigation -->
            <div class="aea-footer-column">
                <h3 class="aea-footer-heading">Navigation</h3>
                <ul class="space-y-2">
                    <li><a href="#" class="aea-footer-link">Graph View</a></li>
                    <li><a href="#" class="aea-footer-link">Search</a></li>
                    <li><a href="#" class="aea-footer-link">Documentation</a></li>
                </ul>
            </div>
            
            <!-- Resources -->
            <div class="aea-footer-column">
                <h3 class="aea-footer-heading">Resources</h3>
                <ul class="space-y-2">
                    <li><a href="#" class="aea-footer-link">API Reference</a></li>
                    <li><a href="#" class="aea-footer-link">Design Library</a></li>
                    <li><a href="#" class="aea-footer-link">Help Center</a></li>
                </ul>
            </div>
            
            <!-- Social / Contact -->
            <div class="aea-footer-column">
                <h3 class="aea-footer-heading">Connect</h3>
                <div class="flex space-x-4">
                    <a href="#" class="aea-footer-link" aria-label="Twitter">
                        <svg class="w-6 h-6" ...>...</svg>
                    </a>
                    <!-- More social icons -->
                </div>
            </div>
        </div>
        
        <!-- Bottom Section -->
        <div class="aea-footer-bottom mt-12 pt-8 border-t border-[hsla(var(--border-300)/0.1)] flex flex-col md:flex-row justify-between items-center">
            <p class="text-xs text-[hsl(var(--text-500))] mb-4 md:mb-0">
                &copy; 2025 AEA Project. All rights reserved.
            </p>
            <div class="flex space-x-6 text-xs">
                <a href="#" class="aea-footer-link">Privacy Policy</a>
                <a href="#" class="aea-footer-link">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>
```

## Accessibility

-   Use the `<footer>` semantic tag.
-   Ensure sufficient contrast for all text (WCAG AA).
-   Use descriptive `aria-label` for social icons.
-   Maintain a logical heading structure within footer columns.

## Failure Scenarios & Considerations

1.  **Overcrowding**: Avoid adding too many links per column.
2.  **Mobile Wrap**: Ensure columns stack gracefully on smaller screens.
3.  **Contrast**: The glassmorphic background must remain dark enough to support high-contrast text colors.
