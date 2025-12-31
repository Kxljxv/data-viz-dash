# Buttons Component

The Button component is the primary interactive element for triggering actions within the AEA ecosystem. It is designed to be highly flexible, supporting various visual weights, sizes, and states while maintaining a consistent Cyberpunk-Lite aesthetic.

## 1. Description and Functionality
Buttons provide a clear visual cue that an action can be performed. They react to user input (click, tap, keyboard) and provide visual feedback through state changes (hover, active, focus, disabled). 

### Key Features:
- **Consistent Typography**: Uses the `ModernDense` font for a technical, modern look.
- **Visual Feedback**: Smooth transitions for hover and active states.
- **Glassmorphism**: Subtle transparency and background blurs where applicable.
- **Flexibility**: Support for icons, varying sizes, and semantic variants.

## 2. Use Cases and Scenarios
- **Primary Actions**: Submitting a form, starting a process, or confirming a major decision.
- **Secondary Actions**: Navigation, opening settings, or cancelling an action.
- **Destructive Actions**: Deleting data or stopping a critical process.
- **Toolbars**: Small, compact actions within a specific context.
- **Floating Actions**: Quick access to common tasks.

## 3. Variants and Specifications

### Visual Variants
| Variant | CSS Classes | Aesthetic Description | Recommended Use |
| :--- | :--- | :--- | :--- |
| **Primary** | `btn-base btn-primary` | Solid brand accent color (`--accent-brand`), white text, subtle shadow. | Main CTA of a page or modal. |
| **Secondary** | `btn-base btn-secondary` | Dark background (`--bg-200`), subtle border, low contrast text. | Alternative or supporting actions. |
| **Outline** | `btn-base btn-outline` | Transparent background, visible border, brand-colored text on hover. | Tertiary actions or secondary buttons on dark backgrounds. |
| **Ghost** | `btn-base btn-ghost` | Fully transparent, only text visible, background appears on hover. | Minimal impact, used in headers or sidebars. |
| **Danger** | `btn-base btn-danger` | Transparent background, red border and text, red background on hover. | Irreversible or destructive actions. |

### Sizes
| Size | CSS Class | Padding (rem) | Font Size | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Small** | `btn-sm` | `0.375 / 0.75` | `0.75rem` (xs) | Compact spaces, toolbars. |
| **Medium** | `btn-md` | `0.625 / 1.25` | `0.875rem` (sm) | Standard application actions. |
| **Large** | `btn-lg` | `0.75 / 1.5` | `1rem` (base) | Prominent CTAs, hero sections. |

## 4. Technical Concept (Svelte Implementation)

The Svelte implementation will use **Svelte 5 Runes** for a modern, reactive, and type-safe experience.

### Props (Interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | The visual style of the button. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The size of the button. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | The HTML button type. |
| `disabled` | `boolean` | `false` | Whether the button is interactive. |
| `loading` | `boolean` | `false` | Shows a loading spinner and disables the button. |
| `class` | `string` | `''` | Additional custom CSS classes. |
| `onclick` | `function` | `undefined` | Callback for the click event. |

### Slots / Children
- **Default Slot**: Used for the button label and optional icons.

### Implementation Details:
- **Base Styles**: Encapsulated within the component to ensure consistency even without global CSS.
- **Tailwind Integration**: Uses Tailwind classes for layout and spacing, with custom AEA variables for colors.
- **Accessibility**: Includes `aria-disabled`, `role="button"`, and appropriate `tabindex`.

## 5. Usage Example (Svelte)

```svelte
<script>
    import Button from '$lib/components/aea/Button.svelte';
</script>

<Button variant="primary" onclick={() => console.log('Clicked!')}>
    Confirm Action
</Button>

<Button variant="danger" size="sm" disabled={true}>
    Delete Data
</Button>

<Button variant="ghost">
    <Icon name="settings" />
    <span>Settings</span>
</Button>
```

## 6. Accessibility (WCAG AA)
- **Contrast**: All variants meet the 4.5:1 contrast ratio for text.
- **Interaction**: Keyboard support (Space, Enter) is native. Focus rings are clearly visible.
- **States**: `aria-disabled` is used to communicate the disabled state to screen readers.
- **Labels**: For icon-only buttons, the `aria-label` prop must be used.

