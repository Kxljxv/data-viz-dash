# Color Picker Component

The Color Picker provides a technical, high-precision interface for selecting colors, adhering to the **Cyberpunk-Lite** aesthetic with glassmorphic panels and neon feedback.

## 1. Design Philosophy

-   **Technical Precision:** Exposed numerical values and precise sliders for a "control room" feel.
-   **Visual Context:** Real-time preview of the color in both a swatch and a larger "glow" area.
-   **Compact Utility:** Can be used as an inline component or a popover.
-   **Seamless Integration:** Works with the existing AEA Clipboard component for quick hex copying.

## 2. Visual Specifications

### Components
1.  **Saturation/Brightness Field:** A 2D gradient area (HSV model) for picking color depth and light.
2.  **Hue Slider:** A spectrum slider for selecting the base color.
3.  **Alpha Slider:** A checkerboard-backed slider for transparency (optional).
4.  **Value Inputs:** Small, technical input fields for Hex, RGB, and HSL.
5.  **Swatch:** A circular or rounded-square preview of the current color.

### Colors & Styles
-   **Container:** `hsla(var(--bg-200) / 0.8)` with `backdrop-blur(16px)`.
-   **Borders:** `1px solid hsla(var(--border-300) / 0.15)`.
-   **Reticle/Sliders:** Neon brand accent (`hsl(var(--accent-brand))`) or white for high contrast.
-   **Inputs:** `ModernDense` font, monospaced look for numbers.

### Typography
-   Labels (Hex, R, G, B) use `ModernDense` font, size `xs`, uppercase.

## 3. Technical Implementation

### CSS Classes
-   `.aea-color-picker`: Root container.
-   `.aea-color-picker-canvas`: The 2D saturation/brightness field.
-   `.aea-color-picker-slider`: Hue and Alpha sliders.
-   `.aea-color-picker-swatch`: Preview element.
-   `.aea-color-picker-input`: Numerical/Hex input fields.
-   `.aea-color-picker-popover`: Floating variant of the picker.

### JavaScript Logic
-   **HSV to RGB/Hex Conversion:** Internal math for color space transformations.
-   **Canvas Rendering:** Use `<canvas>` for the saturation field to ensure performance.
-   **Event Handling:** Mouse and touch support for dragging indicators.
-   **Debounced Updates:** Optional debouncing for high-frequency color changes if linked to expensive operations (like re-rendering a graph).

### Accessibility (WCAG AA)
-   **Keyboard Control:** Arrow keys to move reticle (with `Shift` for larger steps).
-   **ARIA Labels:** `aria-label="Color Picker"`, `aria-label="Hue Slider"`, etc.
-   **Focus Management:** Clear focus rings on sliders and inputs.

## 4. Usage Examples

### Inline Picker
```html
<div class="aea-color-picker" data-color="#ff4500">
    <!-- Component structure -->
</div>
```

### Popover Trigger
```html
<div class="aea-color-picker-trigger">
    <button class="aea-color-picker-swatch" aria-label="Choose color"></button>
    <div class="aea-color-picker-popover hidden">
        <!-- Picker content -->
    </div>
</div>
```

## 5. Failure Scenarios & Edge Cases
-   **Invalid Hex Input:** Revert to previous valid color or show error state.
-   **Touch Collisions:** Ensure sliders don't conflict with page scrolling on mobile.
-   **Contrast:** Ensure the reticle is visible even on very light or very dark colors (e.g., using `mix-blend-mode: difference`).
