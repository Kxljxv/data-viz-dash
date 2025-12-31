# Input Fields & Search

Input fields are the primary means for users to enter data and search for information within the AEA interface. Following the "Cyberpunk-Lite" aesthetic, these components focus on high readability, technical precision, and subtle interactive feedback.

## 1. Design Specifications

### Visual Style
-   **Surface:** Semi-transparent glassmorphism (`hsla(var(--bg-200) / 0.3)`).
-   **Borders:** 1px solid `hsla(var(--border-300) / 0.15)` in resting state.
-   **Focus State:** Border changes to `hsl(var(--accent-brand))` with a subtle outer glow (`box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1)`).
-   **Typography:** `ModernDense` for inputs and placeholders to maintain the technical aesthetic.
-   **Icons:** Integrated icons for Search, Password Toggle, and Clearing input.

### Variants
-   **Default:** Standard text input.
-   **Search:** Includes a leading search icon and an optional trailing "Clear" button.
-   **Password:** Includes a visibility toggle icon.
-   **Outlined:** A more prominent border style for high-priority forms.
-   **Disabled:** Reduced opacity and `cursor: not-allowed`.

### States
-   **Hover:** Subtle increase in border opacity.
-   **Focus:** High-contrast accent border and glow.
-   **Error:** Border and helper text in `hsl(0, 84%, 60%)`.
-   **Success:** Border and helper text in `hsl(142, 70%, 45%)`.

## 2. Technical Implementation

### Logic (AEAInput)
Handles interactive features like the "Clear" button and password visibility toggling.

### Accessibility (A11y)
-   **Labels:** Every input must have an associated `<label>` or `aria-label`.
-   **States:** Use `aria-invalid` for error states.
-   **Interactivity:** Ensure all custom controls (like password toggles) are keyboard accessible (`tabindex="0"`, `role="button"`).

## 3. Usage Guidelines

-   **Placeholders:** Use descriptive placeholders (e.g., "Search nodes..." instead of "Search").
-   **Helper Text:** Use for validation messages or additional context.
-   **Grouping:** Use the `.input-group` class to bundle labels, inputs, and feedback together.

## 4. Technical Concept (Svelte Implementation)

The Svelte implementation will use **Svelte 5 Runes** for a modern, reactive, and type-safe experience.

### Props (Interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `""` | The current value of the input (bindable). |
| `type` | `string` | `"text"` | The HTML input type (text, search, password, email, etc.). |
| `label` | `string` | `undefined` | The label text displayed above the input. |
| `placeholder` | `string` | `""` | The placeholder text. |
| `id` | `string` | `randomId()` | Unique identifier for the input and label association. |
| `error` | `string` | `undefined` | Error message to display. If set, the input enters error state. |
| `success` | `string` | `undefined` | Success message to display. |
| `helperText` | `string` | `undefined` | Additional context or instructions. |
| `disabled` | `boolean` | `false` | Whether the input is interactive. |
| `required` | `boolean` | `false` | Whether the input is required. |
| `showClear` | `boolean` | `false` | (Search only) Whether to show the clear button. |
| `variant` | `'default' \| 'outlined'` | `'default'` | The visual style of the input. |
| `class` | `string` | `""` | Additional custom CSS classes for the container. |

### Features
- **Reactive Value:** Uses `$bindable()` for two-way binding of the `value` prop.
- **Clear Button:** Built-in logic for clearing search inputs.
- **Password Toggle:** Built-in logic for toggling password visibility with icon updates.
- **Validation States:** Dynamic classes for error and success states based on props.
- **Accessibility:** Automatic ID generation, aria-labels, and proper role attributes.

### Example Usage
```svelte
<Input 
  label="Username" 
  bind:value={username} 
  placeholder="Enter your handle..." 
  required 
/>

<Input 
  type="search" 
  label="Search Nodes" 
  bind:value={searchQuery} 
  showClear 
/>

<Input 
  type="password" 
  label="Security Key" 
  bind:value={password} 
  error={passwordError} 
/>
```
