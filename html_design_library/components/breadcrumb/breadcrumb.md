# Breadcrumb

Breadcrumbs are a secondary navigation aid that helps users understand their location within the application's hierarchy and provides a way to navigate back to parent pages.

## 1. Design Specifications

### Visual Style
-   **Typography:** Uses `ModernDense` for technical precision.
-   **Separators:** Subtle icons or characters (e.g., `/` or `>`) with low opacity.
-   **Interactive:** Hover states for links; the current page is highlighted and non-clickable.
-   **Colors:** Muted colors for previous levels, brand accent or high contrast for the current level.

### Variants
-   **Simple:** Text-only with separators.
-   **Icon-based:** Includes icons for home or specific categories.
-   **Collapsible:** For deep hierarchies, truncating intermediate steps with an ellipsis.

## 2. Usage Guidelines

-   **Location:** Typically placed at the top of the main content area, below the primary navbar.
-   **Clarity:** Ensure the path is logical and reflects the user's journey or the application's structure.
-   **Accessibility:** Use `<nav aria-label="Breadcrumb">` and `aria-current="page"` for the last item.

## 3. Implementation

### HTML Structure
```html
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Graph View</a></li>
    <li class="breadcrumb-item active" aria-current="page">Node Details</li>
  </ol>
</nav>
```

### CSS Classes (via style.css)
-   `.breadcrumb`: Flex container for items.
-   `.breadcrumb-item`: Individual step.
-   `.breadcrumb-item + .breadcrumb-item::before`: Content for the separator.
-   `.breadcrumb-item.active`: Styling for the current location.
