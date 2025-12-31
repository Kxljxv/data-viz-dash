# Select Inputs

Select inputs allow users to choose one or more options from a collapsed list. Our implementation replaces the native select with a fully custom, accessible, and themeable component that aligns with the **Cyberpunk-Lite** aesthetic.

## 1. Design Specifications

### Visual Aesthetic
- **Trigger:**
    - Glassmorphism: `hsla(var(--bg-200) / 0.3)` background with `backdrop-filter: blur(24px)`.
    - Border: `1px solid hsla(var(--border-300) / 0.1)`.
    - Typography: `ModernDense`, `0.875rem`.
    - Icon: A chevron-down icon that rotates 180° when open.
- **Dropdown Menu:**
    - Glassmorphism: `hsla(var(--bg-100) / 0.8)` background with dense `backdrop-blur-md`.
    - Shadow: `shadow-2xl` for depth.
    - Animation: Scale and opacity fade-in using `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Options:**
    - Hover state: `hsla(var(--accent-brand) / 0.1)` background with high-contrast text.
    - Selected state: Left-side accent border or subtle glow.

### Behavior
- **Opening:** Click the trigger to toggle the menu.
- **Closing:** Click outside, select an option, or press `Escape`.
- **Filtering:** Optional search input at the top of the dropdown for long lists.
- **Positioning:** Automatically opens upwards if there isn't enough space below.

## 2. Technical Implementation

### CSS Classes
- `.aea-select`: Root container.
- `.aea-select-trigger`: The clickable area showing the current value.
- `.aea-select-menu`: The floating options container.
- `.aea-select-option`: Individual items in the list.
- `.aea-select-search`: Optional filter input.

### JavaScript API (`AEASelect`)
A singleton controller manages the state of all select instances on the page.

```javascript
// Initialization
AEASelect.init();

// Manual value setting
AEASelect.setValue('my-select-id', 'option-value');
```

## 3. Accessibility (A11y)
- **Roles:** `role="combobox"`, `role="listbox"`, `role="option"`.
- **ARIA:** `aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-selected`.
- **Keyboard Navigation:**
    - `Enter` / `Space`: Open/Close and select.
    - `ArrowDown` / `ArrowUp`: Navigate through options.
    - `Escape`: Close menu.
    - `Tab`: Move to next focusable element.

## 4. Failure Scenarios & Edge Cases
- **Overflow:** The menu should have a `max-height` and a custom scrollbar for many options.
- **Dynamic Content:** If options are added via JS, the component must be re-initialized or use MutationObservers.
- **Mobile Viewport:** On very small screens, the select might transition to a full-screen drawer for better usability.
