# Button Group Component

The **Button Group** component is a high-fidelity interactive element designed to group related actions or views. It embodies the AEA Cyberpunk-Lite aesthetic, prioritizing depth, clear states, and technical precision.

## Design Decisions

### 1. The "Tray" Concept
Instead of merely sticking buttons together, the new design uses a **glassmorphic tray** (`aea-button-group`) that acts as a physical container. This creates a unified visual entity rather than a collection of separate elements.

### 2. Visual Fidelity & Depth
-   **Glassmorphism**: The container uses `backdrop-blur-md` and a semi-transparent surface (`hsla(var(--bg-200) / 0.5)`).
-   **Inner Dividers**: Subtle vertical or horizontal separators (`aea-button-group-divider`) that don't touch the edges, reinforcing the technical "instrument" look.
-   **Active Glow**: Active states use a combination of a subtle inner glow and a brand-accented indicator bar.

### 3. Typography
-   Uses `ModernDense` exclusively.
-   Uppercase and letter-spacing (`tracking-widest`) for a professional, technical feel.

### 4. Interactions
-   **Hover**: A gentle lift and a subtle background highlight.
-   **Active**: A persistent state with high contrast and a colored indicator bar (bottom for horizontal, left for vertical).

## Technical Specifications

### CSS Classes

| Class | Description |
| :--- | :--- |
| `.aea-button-group` | The glassmorphic container (tray). |
| `.aea-button-group-vertical` | Layout variant for vertical grouping. |
| `.aea-button-group-item` | The individual action item within the group. |
| `.aea-button-group-divider` | Decorative separator between items. |
| `.aea-active` | State class for the currently selected item. |

### Layout & Sizing
-   **Padding**: The tray has inner padding (`p-1`) to create a margin between the buttons and the container's edge.
-   **Radius**: Container uses `rounded-xl`, while inner items use `rounded-lg` for a nested, "fitted" look.

## Usage Example

```html
<div class="aea-button-group" role="group" aria-label="View switch">
    <button type="button" class="aea-button-group-item aea-active">
        <span class="aea-button-group-label">Graph</span>
        <div class="aea-button-group-indicator"></div>
    </button>
    <div class="aea-button-group-divider"></div>
    <button type="button" class="aea-button-group-item">
        <span class="aea-button-group-label">List</span>
        <div class="aea-button-group-indicator"></div>
    </button>
</div>
```

## Accessibility

-   **Roles**: Container must have `role="group"`.
-   **Labels**: Items must have descriptive text or `aria-label`.
-   **States**: Use `aria-pressed="true"` or `aria-current="page"` for active items.
-   **Keyboard**: Tab navigation should allow jumping into the group and cycling through items.

## Failure Scenarios & Edge Cases

1.  **Text Overflow**: Long labels in buttons will truncate with ellipsis or cause the group to expand.
2.  **Mobile Squeeze**: On small screens, the group will scroll horizontally (`overflow-x-auto`) to maintain its layout without breaking.
3.  **Mixed Content**: Supports icons only, text only, or both. Icons are centered and sized consistently.
