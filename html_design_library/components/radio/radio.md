# Radio Component

The **Radio** component provides a set of mutually exclusive options. It follows the **Cyberpunk-Lite** aesthetic with glassmorphism, high-contrast indicators, and technical HUD-inspired details.

## 1. Design Aesthetic

- **Indicator**: A circular outer ring with a glowing inner dot or ring when selected.
- **Glassmorphism**: Containers use semi-transparent backgrounds with backdrop blur.
- **Accents**: Uses `hsl(var(--accent-brand))` for primary selection, with support for Success, Info, and Danger themes.
- **Feedback**: Subtle scale and glow animations on selection.

## 2. Technical Specifications

### Structure
- **Container**: `.aea-radio-group` (Optional grouping for layout).
- **Label/Wrapper**: `.aea-radio-container` (Contains the hidden input and custom indicator).
- **Hidden Input**: Standard `<input type="radio">` for accessibility and form submission.
- **Custom Indicator**: `.aea-radio-circle` (The visual representation).
- **Label Text**: `.aea-radio-label`.

### States
- **Default**: Muted border, low-opacity background.
- **Hover**: Brightened border, slight scale up.
- **Active (Checked)**: Glowing center dot, accent border.
- **Disabled**: Lowered opacity, `not-allowed` cursor.
- **Focus**: Visible focus ring on the custom indicator.

## 3. Variations

1.  **Standard**: Classic circular radio button.
2.  **Button-Style**: Full-width or inline buttons where selection is indicated by a glow (similar to Checkbox Fields but exclusive).
3.  **Industrial HUD**: Square or octagonal indicators with extra technical markings.
4.  **Compact**: Smaller versions for dense data tables or sidebars.

## 4. Accessibility (WCAG AA)

- **Semantic HTML**: Uses native `<input type="radio">` elements.
- **Keyboard Navigation**: Standard Tab and Arrow key navigation within groups.
- **ARIA Labels**: `aria-checked` is handled natively by the input, but group labels use `role="radiogroup"`.
- **Contrast**: Selection indicators exceed 3:1 contrast ratio against backgrounds.

## 5. Usage Example

```html
<div class="aea-radio-group" role="radiogroup" aria-labelledby="group-label">
  <span id="group-label" class="sr-only">Select Priority</span>
  
  <label class="aea-radio-container">
    <input type="radio" name="priority" value="high" class="aea-radio-input">
    <span class="aea-radio-circle"></span>
    <span class="aea-radio-label">High Priority</span>
  </label>

  <label class="aea-radio-container">
    <input type="radio" name="priority" value="low" class="aea-radio-input">
    <span class="aea-radio-circle"></span>
    <span class="aea-radio-label">Low Priority</span>
  </label>
</div>
```
