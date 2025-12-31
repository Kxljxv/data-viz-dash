# Range Component

The Range component provides a Cyberpunk-Lite styled input for selecting a value within a specified range. It features a glassmorphic track, a custom glowing thumb, and dynamic progress filling.

## Design Aesthetic
- **Glassmorphic Track**: Semi-transparent background with `backdrop-blur`.
- **Neon Thumb**: High-contrast, glowing handle for clear interaction.
- **Dynamic Progress**: Visual feedback showing the current value's position relative to the track.
- **Technical Typography**: Labels and values use `ModernDense` for a technical look.

## Variations

### 1. Base Range (`aea-range-base`)
A standard range input with a custom styled track and thumb.

### 2. Labeled Range (`aea-range-labeled`)
Includes labels for the minimum and maximum values, plus a live readout of the current value.

### 3. Step Range (`aea-range-steps`)
Features visible step indicators along the track for discrete value selection.

### 4. Technical HUD Range (`aea-range-hud`)
A high-impact version with technical labels (e.g., "SIGNAL_STRENGTH") and a glowing progress fill.

## Technical Specifications

### Implementation Strategy
- **Structure**: A wrapper `div` containing the native `input[type="range"]`.
- **Styling**: 
    - `-webkit-appearance: none` for full custom control.
    - CSS Variables for dynamic progress: `--range-progress`.
    - Custom thumb styling for both WebKit and Firefox.
- **Interactivity**: Vanilla JS to update the progress fill and labels in real-time.

### Svelte Implementation

The Svelte implementation provides a reactive, type-safe component using Svelte 5 Runes with automatic progress calculation.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | *required* | The label for the range input. |
| `value` | `number` | `50` | Bindable current value. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `step` | `number` | `1` | Step increment. |
| `unit` | `string` | `''` | Optional unit to display after the value. |
| `hud` | `boolean` | `false` | Whether to use the technical HUD layout. |
| `steps` | `number` | `0` | Number of visual step indicators to show. |
| `oninput` | `function` | `undefined` | Callback function when value changes. |

### Usage Example (Svelte)
```svelte
<script>
    import RangeInput from '$lib/components/aea/RangeInput.svelte';
    let zoomLevel = $state(1.5);
</script>

<RangeInput 
    label="Zoom Level"
    bind:value={zoomLevel}
    min={0.1}
    max={3.0}
    step={0.1}
    unit="x"
    hud={true}
    steps={5}
/>
```

### Accessibility
- **Semantic HTML**: Uses the native `<input type="range">`.
- **ARIA**: Supports `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- **Focus States**: Clearly defined focus rings around the thumb.
- **Keyboard Navigation**: Standard arrow key support for incremental adjustments.

## Usage Example

```html
<div class="aea-range-container">
    <label for="range-input" class="aea-range-label">Volume</label>
    <div class="aea-range-wrapper">
        <input type="range" id="range-input" class="aea-range-input" min="0" max="100" value="50">
    </div>
</div>
```
