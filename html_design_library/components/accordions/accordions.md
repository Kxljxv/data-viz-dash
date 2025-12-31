# Accordions

Accordions are vertically stacked headers that reveal or hide content sections. They are ideal for organizing large amounts of information into manageable, collapsible groups, promoting progressive disclosure in dense technical interfaces.

## 1. Design Specifications

### Visual Style
-   **Header:** High-contrast label with a trailing chevron icon. Uses `ModernDense` font.
-   **Surface:** Glassmorphism background (`hsla(var(--bg-100) / 0.5)`) with a subtle border.
-   **Active State:** The active header glows slightly or changes text color to `hsl(var(--accent-brand))`.
-   **Chevron:** Rotates 180 degrees when the section is expanded.

### Animation
-   **Expansion:** Uses the `grid-template-rows` transition technique for smooth, hardware-accelerated height changes from 0 to auto.
-   **Duration:** 300ms using `cubic-bezier(0.4, 0, 0.2, 1)`.

### Variants
-   **Standard:** Individual cards that look like the `Card` component.
-   **Flush:** A borderless version that sits flat against a container background.
-   **Grouped:** Multiple sections within a single container with shared borders.

## 2. Technical Implementation

### Logic (AEAAccordion)
Manages the toggling of sections and ensures accessibility attributes are updated in real-time.

### API
-   `AEAAccordion.init(containerId, options)`: Initializes accordion behavior for a specific container.
-   `options.allowMultiple`: If `false` (default), opening one section will close others.
-   `options.onToggle`: Callback function when a section is opened or closed.

### Accessibility (A11y)
-   `role="button"` and `aria-expanded` on the header.
-   `aria-controls` linking the header to its content panel.
-   `role="region"` on the content panel for screen reader clarity.
-   Keyboard support: `Enter` or `Space` to toggle.

## 4. Technical Concept (Svelte Implementation)

Implemented with **Svelte 5 Runes** for seamless state management between the parent container and child items.

### Accordion Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `allowMultiple` | `boolean` | `false` | If true, multiple sections can be open at once. |

### AccordionItem Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Initial open state (bindable). |
| `title` | `string` | `undefined` | Header title. |
| `disabled` | `boolean` | `false` | Prevents interaction. |

### Example Usage
```svelte
<Accordion allowMultiple={true}>
  <AccordionItem title="System Logs" open={true}>
    <p>Detailed system logs go here...</p>
  </AccordionItem>
  <AccordionItem title="Network Topology">
    <p>Graph visualization settings...</p>
  </AccordionItem>
</Accordion>
```

