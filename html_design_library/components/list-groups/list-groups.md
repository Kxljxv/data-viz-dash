# List Groups

List Groups are versatile components for displaying series of content. They are essential in the AEA interface for presenting node connections, search results, or metadata in a structured and interactive format.

## 1. Design Specifications

### Visual Style
-   **Structure:** A vertical stack of items with consistent spacing and alignment.
-   **Surface:** Items use the glassmorphism pattern (`card-glass`) or subtle transparent backgrounds to integrate with the layout.
-   **Dividers:** Thin, low-opacity lines (`hsla(var(--border-300)/0.05)`) between items to maintain separation without clutter.
-   **Typography:**
    -   **Item Title:** `ModernDense`, bold, high contrast.
    -   **Item Description:** `ModernDense`, smaller size, muted color (`hsl(var(--text-400))`).
-   **Radii:** The container often has `rounded-2xl`, while internal items may have rounded corners only if they are separated.

### Variants
-   **Standard List:** Clean, simple text items.
-   **Interactive List:** Includes hover states, selection indicators, and active animations.
-   **Iconic List:** Leading icons or avatars for visual categorization.
-   **Rich List:** Multi-line content with titles, descriptions, and trailing badges or actions.
-   **Flush List:** Removes the outer border and rounded corners for use within other containers (like Cards).

## 2. Usage Guidelines

-   **Context:** Use List Groups when you have more than 3 related items that require clear vertical scanning.
-   **Density:** Adjust padding based on the amount of content; use compact lists for technical data and relaxed lists for main navigation.
-   **Interaction:** Always provide a clear visual feedback (hover/active) for clickable list items.
-   **A11y:** Ensure proper `role="list"` and `role="listitem"` attributes. Interactive items should be reachable via keyboard.

## 3. Implementation

### HTML Structure
```html
<ul class="list-group" role="list">
  <li class="list-group-item" role="listitem">
    <div class="list-group-content">
      <span class="list-group-title">Item Title</span>
      <span class="list-group-subtitle">Supporting description</span>
    </div>
    <div class="list-group-actions">
      <!-- Badge or Icon -->
    </div>
  </li>
</ul>
```

### CSS Classes
-   `.list-group`: Container styling.
-   `.list-group-item`: Base item styling with hover and active states.
-   `.list-group-flush`: Removes container borders.
-   `.list-group-item-interactive`: Enables pointer cursor and hover effects.
