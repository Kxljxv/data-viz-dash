# Technical Approaches

This document defines the technical standards and implementation strategies for the AEA Design Library.

## 1. Technology Stack

-   **HTML:** Semantic HTML5.
-   **CSS:** Tailwind CSS (via CDN for prototyping/portability, or build process for production) + Custom CSS Variables.
-   **JavaScript:** Vanilla ES6+ Modules. No heavy framework dependencies for the core library to ensure portability.

## 2. CSS Methodology

We utilize a hybrid approach: **Utility-First (Tailwind)** for layout and spacing, combined with **CSS Variables** for theming and specific **Component Classes** for complex, reusable patterns.

### Naming Convention
-   **Utility Classes:** Follow Tailwind standards (e.g., `flex`, `p-4`, `text-center`).
-   **Custom Classes:** Kebab-case, descriptive (e.g., `.aea-card`, `.aea-btn`).
-   **Variables:** Kebab-case with `--` prefix (e.g., `--accent-brand`).

### Tailwind Configuration (Implicit)
We rely on the default Tailwind config but extend it via arbitrary values (JIT mode) or custom CSS variables defined in `style.css`.
-   Colors refer to CSS variables: `bg-[hsl(var(--bg-100))]`.
-   Fonts refer to custom font families: `font-['ModernDense']` or utility aliases `.font-modern-dense`.

## 3. Component Structure

Each component is a self-contained directory to facilitate easy copying and maintenance.

```
design_library/
├── components/
│   └── [component-name]/
│       ├── [component-name].md    # Documentation & Specs
│       ├── [component-name].html  # Implementation (HTML + Tailwind)
│       └── script.js              # Logic (if required)
```

### HTML Template
Components should be built as accessible fragments.
```html
<!-- Example Button -->
<button class="px-4 py-2 bg-[hsl(var(--accent-brand))] rounded-xl ...">
  Label
</button>
```

## 4. Responsive Design

-   **Mobile-First:** Write styles for mobile, then add `sm:`, `md:`, `lg:` prefixes.
-   **Breakpoints:**
    -   `sm`: 640px
    -   `md`: 768px
    -   `lg`: 1024px
    -   `xl`: 1280px
-   **Fluidity:** Use percentages or `flex`/`grid` for layouts rather than fixed pixel widths.

## 5. Accessibility (A11y) Implementation

-   **Semantic Tags:** Use `<button>`, `<nav>`, `<aside>` instead of `<div>`.
-   **ARIA:** Use `aria-label`, `aria-expanded`, `role` attributes where semantic HTML is insufficient.
-   **Keyboard Nav:** Ensure all interactive elements are focusable and have visible focus states (`focus:ring-2`).
-   **Motion:** Respect `prefers-reduced-motion` (Tailwind `motion-reduce:`).

## 6. Performance

-   **CSS:** Minimize custom CSS; rely on utility classes.
-   **Images:** Use SVG for icons. Lazy load images if introduced.
-   **Animations:** Use `transform` and `opacity` for high-performance animations (GPU accelerated). Avoid animating `width`, `height`, or `top`/`left`.
