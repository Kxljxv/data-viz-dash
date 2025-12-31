# AEA Design Approaches

This document outlines the core design principles and visual language for the AEA Design System. It serves as the single source of truth for design decisions, ensuring consistency across the application.

## 1. Design Philosophy

Our design aesthetic is **Modern Technical / Cyberpunk-Lite**, characterized by:
-   **Dark Mode First:** Optimized for low-light environments and OLED screens, reducing eye strain and saving battery.
-   **Glassmorphism:** Extensive use of semi-transparent backgrounds with blur effects (`backdrop-blur`) to create depth and context without obscuring the underlying graph visualization.
-   **High Contrast:** Key interactive elements and data points use vivid neon accents against deep backgrounds.
-   **Functional Minimalism:** UI elements are unobtrusive, maximizing the viewport for the primary data visualization.

## 2. Color Palette

The system relies on HSL variables for dynamic theming, primarily focused on a dark theme.

### Backgrounds
-   **Surface 1 (Base):** `hsl(60 2.1% 18.4%)` - Main background.
-   **Surface 2 (Panel):** `hsl(60 2.7% 14.5%)` - Cards, sidebars.
-   **Surface 3 (Input):** `hsl(30 3.3% 11.8%)` - Inputs, deeper layers.

### Typography Colors
-   **Primary:** `hsl(48 33.3% 97.1%)` - Headings, main text.
-   **Secondary:** `hsl(50 9% 73.7%)` - Subtitles, secondary data.
-   **Tertiary/Muted:** `hsl(48 4.8% 59.2%)` - Meta info, placeholders.

### Accents
-   **Brand (Orange/Red):** `hsl(15 63.1% 59.6%)` - Primary actions, active states.
-   **Success (Green):** `hsl(97 75% 32.9%)` - "Supporter" nodes, success states.
-   **Danger (Red):** `hsl(0 67% 59.6%)` - Destructive actions, errors.
-   **Info (Blue):** `hsl(210 70.9% 51.6%)` - "Antrag" nodes, links.

## 3. Typography

We use a custom font stack to reinforce the technical/modern aesthetic.

-   **Primary Font:** `ModernDense` - Used for UI labels, buttons, and dense data displays.
-   **Serif Font:** `Serif` - Used for headings and "document" related content (e.g., PDF links) to add a touch of formality.
-   **Accessibility:** `Dyslexic` font support is built-in as an alternative.

### Hierarchy
-   **Page Title:** Serif, 2xl/3xl, High contrast.
-   **Section Header:** ModernDense, lg, Uppercase, Tracking-widest.
-   **Body:** ModernDense/System, base/sm, Relaxed line-height.
-   **Label/Meta:** ModernDense, xs, Uppercase, Bold.

## 4. UI Patterns & Shapes

### Glassmorphism (The "AEA Look")
UI panels (modals, control panels) should float above the content.
-   **Background:** `bg-[hsl(var(--bg-100))]/80` or `bg-black/40`
-   **Blur:** `backdrop-blur-sm` or `backdrop-blur-md`
-   **Border:** Thin, semi-transparent borders `border-[hsla(var(--border-300)/0.2)]` to define edges without heaviness.

### Borders & Radius
-   **Cards/Panels:** `rounded-2xl` or `rounded-3xl` for a friendly, modern feel.
-   **Inputs/Buttons:** `rounded-xl` or `rounded-lg`.
-   **Borders:** 1px solid, usually low opacity (`0.1` - `0.2`) to be subtle.

### Shadows
-   **Depth:** `shadow-xl` or `shadow-2xl` for floating panels to separate them from the graph.
-   **Glow:** Colored shadows (e.g., `shadow-[0_0_8px_rgba(59,130,246,0.5)]`) are used for active states or specific node types.

## 5. Animation

Animations should be subtle and functional, guiding the user's attention.
-   **Hover:** Slight scale (`scale-105`), opacity change, or border color shift.
-   **Entrance:** `animate-in`, `fade-in`, `slide-in-from-bottom` (approx 300ms).
-   **Transitions:** `transition-all duration-200 ease-in-out` is the standard.

## 6. Accessibility (A11y)

-   **Contrast:** Ensure text colors meet WCAG AA standards against their backgrounds.
-   **Focus:** Visible focus rings (often customized to match accent color) for keyboard navigation.
-   **Screen Readers:** Use semantic HTML and ARIA labels where visual context (like icons) is insufficient.
