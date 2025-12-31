# Clipboard Component

The Clipboard component provides a consistent and accessible way to copy text to the user's clipboard. It follows the **Cyberpunk-Lite** aesthetic with high-contrast feedback and glassmorphic elements.

## 1. Design Philosophy

-   **Instant Feedback:** The UI must immediately reflect the success or failure of the copy action.
-   **Minimalist Integration:** Can be used as a standalone button, an icon-only trigger, or integrated into input fields.
-   **Aesthetic Flair:** Subtle neon glows and spring-based transitions for icon swaps.
-   **Robust Fallbacks:** Handles environments where the Clipboard API is unavailable.

## 2. Visual Specifications

### Components
1.  **Icon Button:** A compact 32x32px or 40x40px button with a "Copy" icon.
2.  **Input Group:** A text input with a trailing copy action.
3.  **Feedback Indicator:** A transient "Copied!" label or tooltip.

### Colors & Styles
-   **Default State:** `hsl(var(--text-500))` for icons, `hsla(var(--border-300) / 0.1)` for borders.
-   **Success State:** Icon changes to a "Check" mark and turns `hsl(var(--success))` (Neon Green).
-   **Error State:** Icon may pulse or turn `hsl(var(--danger))` (Neon Red) if copy fails.
-   **Glassmorphism:** Feedback tooltips use `backdrop-blur(8px)` and `hsla(var(--bg-200) / 0.8)`.

### Typography
-   Labels (e.g., "Copied!") use `ModernDense` font, uppercase, tracking-widest, size `xs`.

## 3. Technical Implementation

### CSS Classes
-   `.aea-clipboard`: Root container for input groups.
-   `.aea-clipboard-btn`: The trigger button.
-   `.aea-clipboard-success`: Applied to the button/container on success.
-   `.aea-clipboard-error`: Applied on failure.
-   `.aea-clipboard-feedback`: The tooltip/label element.

### JavaScript Logic
-   Uses `navigator.clipboard.writeText()` as the primary method.
-   Includes a fallback to `document.execCommand('copy')` for legacy support.
-   Implements a timer (default 2000ms) to reset the visual state.

### Accessibility (WCAG AA)
-   **ARIA Labels:** `aria-label="Copy to clipboard"` on buttons.
-   **ARIA Live:** The feedback element uses `aria-live="polite"` so screen readers announce "Copied!".
-   **Keyboard:** Fully focusable and triggerable via `Enter` or `Space`.

## 4. Usage Examples

### Icon Only (Inline)
```html
<button class="aea-clipboard-btn" data-copy="Value to copy" aria-label="Copy ID">
    <svg class="aea-icon-copy">...</svg>
    <svg class="aea-icon-check hidden">...</svg>
</button>
```

### Input Group
```html
<div class="aea-clipboard-group">
    <input type="text" value="https://aea.network/graph/123" readonly class="aea-input">
    <button class="aea-clipboard-btn" aria-label="Copy link">
        <!-- Icons -->
    </button>
</div>
```

## 5. Failure Scenarios & Edge Cases
-   **Clipboard Permission Denied:** Show error state and fallback to selecting the text if an input is present.
-   **Insecure Context (HTTP):** Clipboard API is unavailable. Use `execCommand` or notify user.
-   **Empty Value:** Disable button or show "Nothing to copy" tooltip.
-   **Mobile Devices:** Ensure touch target is at least 44x44px.
