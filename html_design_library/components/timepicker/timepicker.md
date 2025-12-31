# Timepicker

The Timepicker component provides a high-quality, glassmorphic interface for selecting precise times. It features a technical aesthetic with dual-column selection for hours and minutes, optimized for both mouse and keyboard interaction.

## 1. Visual Specifications

- **Popover Container:** Glassmorphic panel with `backdrop-blur(16px)` and thin borders.
- **Typography:** `ModernDense` for numbers and labels.
- **Colors:**
  - **Selection:** `hsl(var(--accent-brand))` with glow.
  - **Hover:** `hsla(var(--bg-300) / 0.5)`.
  - **Background:** `hsla(var(--bg-100) / 0.9)`.
- **Layout:** Two vertical scrolling columns (24-hour format).

## 2. Interaction Design

### Selection
- **Columns:** Separate columns for Hours (00-23) and Minutes (00-59).
- **Click:** Selects the clicked value and updates the input.
- **Wheel:** Support for mouse wheel scrolling through time values.
- **Keyboard:** Arrow keys navigate between columns and values.

### States
- **Idle:** Input field with clock icon.
- **Open:** Popover visible with current selection highlighted.
- **Selected:** Input reflects chosen time in `HH:mm` format.

## 3. Technical Implementation

- **HTML:** Semantic input and button structure; popover built as an absolute-positioned fragment.
- **CSS:** Utility-first Tailwind for layout; custom classes for scrolling behavior and neon effects.
- **JS:** Vanilla ES6+ Module for selection logic, scrolling synchronization, and event handling.
- **Accessibility:**
  - `aria-haspopup="listbox"` and `aria-expanded` for the trigger.
  - `role="listbox"` for time columns.
  - Keyboard focus management.

## 4. Usage Example

```javascript
import { Timepicker } from './script.js';

const tp = new Timepicker(document.getElementById('time-input-root'), {
    format: '24h',
    onSelect: (time) => console.log('Selected:', time)
});
```

## 5. Responsive Behavior

- **Mobile:** Full-screen modal or larger touch targets for selection.
- **Desktop:** Compact popover aligned to the input field.
