# Checkbox Fields Component

The Checkbox Fields component provides a button-style multi-selection interface with integrated glowing indicator lights. It is designed for high-impact settings panels where visual feedback of active states is critical.

## Design Aesthetic
- **Button-Style Container**: A glassmorphic button that acts as a toggle.
- **Glowing Indicator**: A small, circular LED-style indicator that glows when the field is active.
- **State Feedback**: Significant visual shift between active (filled background, glowing LED) and inactive (transparent background, dimmed LED) states.
- **Cyberpunk-Lite Detail**: Thin borders, technical typography, and precise spacing.

## Variations

### 1. Base Checkbox Field (`aea-checkbox-field-base`)
A standard button-style toggle with a text label and a single status LED.

### 2. HUD Checkbox Field (`aea-checkbox-field-hud`)
A more technical version with an uppercase label, a sub-label for state description (e.g., "ACTIVE"), and a larger glowing indicator.

### 3. Multi-Color Indicators
- **Success (Green)**: Used for positive states like "Online" or "Verified".
- **Warning (Orange)**: Used for critical but non-destructive states.
- **Info (Blue)**: Used for informational toggles.
- **Danger (Red)**: Used for high-risk overrides.

### 4. Grouped Fields (`aea-checkbox-field-group`)
A grid or list layout for multiple fields, often used in sidebars or control panels.

## Technical Specifications

### Implementation Strategy
- **Structure**: A `button` element containing a `span` for the label and a `div` for the indicator light.
- **State Management**: Uses an `aria-pressed` attribute to manage the active state and drive CSS transitions.
- **Styling**:
    - `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for smooth state shifts.
    - `box-shadow` with spread for the glowing LED effect.
    - Glassmorphism via `backdrop-filter`.
- **Accessibility**:
    - Semantic `<button>` with `role="switch"` or `aria-pressed`.
    - Screen reader feedback for state changes.
    - High-contrast focus rings.

### Svelte Implementation

The Svelte implementation provides a reactive, type-safe component using Svelte 5 Runes.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | *required* | The text label for the checkbox field. |
| `checked` | `boolean` | `false` | Bindable state of the field. |
| `indicator` | `string` | `'success'` | Color of the indicator (`success`, `brand`, `info`, `danger`). |
| `subLabel` | `string` | `undefined` | Optional sub-label for HUD style. |
| `hud` | `boolean` | `false` | Whether to use the technical HUD layout. |
| `onchange` | `function` | `undefined` | Callback function when state changes. |

### Usage Example (Svelte)
```svelte
<script>
    import CheckboxField from '$lib/components/aea/CheckboxField.svelte';
    let showLabels = $state(true);
</script>

<CheckboxField 
    label="Beschriftungen anzeigen"
    bind:checked={showLabels}
    indicator="brand"
    subLabel="ACTIVE"
    hud={true}
/>
```

## Accessibility (WCAG AA)
- **Contrast**: Text and indicators meet contrast requirements in both states.
- **Interaction**: Keyboard accessible via Tab and Space/Enter.
- **Labels**: Clear semantic labeling for screen readers.

## Usage Example

```html
<button 
    class="aea-checkbox-field" 
    aria-pressed="true"
    data-aea-indicator="success"
>
    <span class="aea-checkbox-field-label">System Labels</span>
    <div class="aea-checkbox-field-indicator"></div>
</button>
```
