# Speed Dial

The Speed Dial component is a floating action button (FAB) that expands into a series of related actions when clicked. It is ideal for primary page actions that require quick access without cluttering the main UI.

## 1. Design Philosophy

- **High Visibility:** Positioned in a fixed corner (usually bottom-right) with the brand accent color.
- **Micro-interactions:** Smooth, spring-based animations for expanding and collapsing.
- **Glassmorphism:** Action button tooltips or containers use the system's signature glass effect.
- **Cyberpunk Aesthetic:** Sharp lines, neon accents, and subtle glow effects.

## 2. Visual Specifications

### Primary Button (FAB)
- **Shape:** Circular (48px or 56px).
- **Background:** `hsl(var(--accent-brand))` (Orange/Red).
- **Icon:** Centered SVG icon.
- **State Change:** Rotates 45 or 135 degrees when expanded (transitioning "+" to "x").
- **Shadow:** Strong elevation `shadow-xl` and a subtle brand-colored glow `0 0 12px hsla(var(--accent-brand) / 0.4)`.

### Action Buttons
- **Shape:** Smaller circular buttons (36px or 40px).
- **Background:** `hsla(var(--bg-200) / 0.8)` with `backdrop-blur(12px)`.
- **Border:** `1px solid hsla(var(--border-300) / 0.1)`.
- **Labels:** Tooltips or persistent labels using `ModernDense` font, appearing to the side.

### Layout & Spacing
- **Position:** Fixed `bottom-6 right-6`.
- **Gap:** `0.75rem` between the FAB and the first action, and between actions.
- **Safe Areas:** Respects `env(safe-area-inset-bottom)`.

## 3. Technical Implementation

### CSS Classes
- `.aea-speed-dial`: Root container (fixed).
- `.aea-speed-dial-trigger`: The main FAB.
- `.aea-speed-dial-actions`: Container for action buttons.
- `.aea-speed-dial-action`: Individual action button.
- `.aea-speed-dial-label`: Tooltip or label for the action.

### Animation Details
- **Entrance:** Staggered `scale-0` to `scale-100` with `fade-in`.
- **Transition:** `cubic-bezier(0.34, 1.56, 0.64, 1)` for a "bouncy" spring feel.
- **Stagger:** 50ms delay between each action button.

### Accessibility (WCAG AA)
- **Role:** `role="button"` on all interactive elements.
- **ARIA:**
  - `aria-expanded="false/true"` on the trigger.
  - `aria-haspopup="true"`.
  - `aria-label` for all buttons (e.g., "Add new", "Settings").
- **Keyboard:**
  - `Tab` cycle through expanded actions.
  - `Esc` closes the speed dial.
  - `Enter/Space` toggles the trigger.

## 4. Usage Examples

### Standard Bottom-Right
```html
<div class="aea-speed-dial aea-speed-dial-bottom-right">
    <div class="aea-speed-dial-actions" role="menu">
        <button class="aea-speed-dial-action" aria-label="Action 1">
            <!-- Icon -->
            <span class="aea-speed-dial-label">Action 1</span>
        </button>
        <!-- More actions -->
    </div>
    <button class="aea-speed-dial-trigger" aria-expanded="false">
        <!-- Plus Icon -->
    </button>
</div>
```

## 5. Failure Scenarios & Edge Cases
- **Screen Edge:** Ensure labels don't overflow the viewport (adjust placement to left/right based on anchor).
- **Overlapping Content:** High `z-index` (50+) to ensure it's not obscured.
- **Touch Targets:** Minimum 44x44px for the FAB and 36x36px for actions.
