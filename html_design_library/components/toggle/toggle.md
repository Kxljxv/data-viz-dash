# Toggle Component

The Toggle component (Switch) provides a binary selection interface with a Cyberpunk-Lite aesthetic. It uses glassmorphism for the track and high-contrast neon accents for the active state.

## Design Aesthetic
- **Glassmorphic Track**: Semi-transparent, blurred background using `backdrop-blur`.
- **Neon Active State**: The "Brand" accent color (`--accent-brand`) is used for the active state, often accompanied by a subtle glow.
- **Smooth Transitions**: Fluid animation for the thumb movement and color shifts.
- **Technical Variants**: Includes both rounded and industrial angular designs.

## Variations

### 1. Base Toggle (`aea-toggle-base`)
A standard rounded switch with a minimalist thumb.

### 2. Industrial Toggle (`aea-toggle-industrial`)
A squared-off version with a technical look, matching the `rounded-lg` pattern of the design system.

### 3. Labeled Toggle (`aea-toggle-labeled`)
A toggle integrated with a text label, supporting both left and right alignment.

### 4. Status HUD Toggle (`aea-toggle-hud`)
Includes visible "ON/OFF" or "ACTIVE/INACTIVE" status indicators that change based on the state.

### 5. Iconic Toggle (`aea-toggle-icon`)
Features small icons (e.g., sun/moon, lock/unlock) inside or next to the toggle to provide additional context.

## Technical Specifications

### Implementation Strategy
- **Structure**: A hidden `input[type="checkbox"]` followed by a stylized `label` and a `span` for the track/thumb.
- **Styling**:
    - Uses `:checked` pseudo-class to drive animations and color changes.
    - `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for high-quality motion.
    - Glassmorphism achieved via `hsla` background and `backdrop-filter`.
- **Accessibility**:
    - Semantic `<input type="checkbox">` ensures native keyboard and screen reader support.
    - Explicit `label` associations.
    - High-contrast focus rings for keyboard navigation.

### Accessibility (WCAG AA)
- **Contrast**: Active states use the high-contrast Brand accent.
- **Keyboard**: Full tab-index and spacebar/enter key support.
- **ARIA**: Uses `aria-checked` (implicit via checkbox) and `aria-labelledby`.

## Usage Example

```html
<label class="aea-toggle-container">
    <input type="checkbox" class="aea-toggle-input">
    <span class="aea-toggle-track">
        <span class="aea-toggle-thumb"></span>
    </span>
    <span class="aea-toggle-label">System Override</span>
</label>
```
