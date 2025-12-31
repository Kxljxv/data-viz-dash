# Checkbox Component

The Checkbox component provides a multi-selection interface with a Cyberpunk-Lite aesthetic. It features a glassmorphic box, custom SVG checkmarks, and high-contrast neon active states.

## Design Aesthetic
- **Glassmorphic Box**: Semi-transparent background with a subtle blur and a thin border.
- **Neon Checkmark**: The checkmark uses the Brand accent color (`--accent-brand`) with a glowing effect when active.
- **Interactive States**: Smooth transitions for hover, focus, and checking.
- **Technical Variants**: Includes rounded, industrial, and HUD-integrated variations.

## Variations

### 1. Base Checkbox (`aea-checkbox-base`)
A standard checkbox with `rounded-md` corners and a minimalist SVG checkmark.

### 2. Industrial Checkbox (`aea-checkbox-industrial`)
A squared-off version with a technical look, featuring a more "digital" checkmark style (e.g., a simple cross or a square fill).

### 3. Labeled Checkbox (`aea-checkbox-labeled`)
A checkbox integrated with a text label, supporting both left and right alignment and multi-line text.

### 4. Technical HUD Checkbox (`aea-checkbox-hud`)
Includes a technical label (e.g., "MODULE_ENABLED") and a secondary status indicator (e.g., a small glowing dot or text like "ON/OFF").

### 5. Checkbox Group (`aea-checkbox-group`)
A layout pattern for grouping multiple checkboxes together, often used for checklists or settings panels.

## Technical Specifications

### Implementation Strategy
- **Structure**: A hidden `input[type="checkbox"]` followed by a stylized `span` (the box) and a `label`.
- **Styling**:
    - Uses the `:checked` pseudo-class to toggle the visibility of the SVG checkmark.
    - `transition: all 0.2s ease-in-out` for responsiveness.
    - Glassmorphism achieved via `hsla` and `backdrop-filter`.
- **Accessibility**:
    - Uses the native `<input type="checkbox">` for keyboard and screen reader support.
    - High-contrast focus states using `outline`.
    - ARIA labels where necessary.

### Accessibility (WCAG AA)
- **Contrast**: The Brand accent color provides high contrast against the dark background.
- **Keyboard**: Standard tab and spacebar support.
- **ARIA**: Implicitly handled by the native checkbox input.

## Usage Example

```html
<label class="aea-checkbox-container">
    <input type="checkbox" class="aea-checkbox-input">
    <span class="aea-checkbox-box">
        <svg class="aea-checkbox-check" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </span>
    <span class="aea-checkbox-label">Authorize Protocol</span>
</label>
```
