# Drawer (Sheet)

The Drawer (or Sheet) is a sliding panel that appears from the edge of the screen. It is used for secondary navigation, settings, or displaying additional context without losing the current view.

## 1. Design Specifications

### Visual Style
-   **Surface:** Glassmorphism (`card-glass` style) with `backdrop-blur`.
-   **Backdrop:** Semi-transparent overlay (`bg-black/50`) to focus attention on the drawer.
-   **Animation:** Smooth transitions (`translate-x`) for entry and exit.
-   **Shadow:** Deep shadow on the leading edge to create separation.

### Variants
-   **Right Drawer:** Most common for details and settings.
-   **Left Drawer:** Typically used for primary navigation.
-   **Bottom Sheet:** Used on mobile for quick actions.

## 2. Usage Guidelines

-   **Trigger:** Usually opened via a button or menu icon.
-   **Dismissal:** Should be dismissible via a close button, clicking the backdrop, or pressing `Esc`.
-   **Content:** Keep content organized with headers and clear sections.
-   **Accessibility:** Use `aria-hidden` on the backdrop and ensure focus is trapped within the drawer when open.

## 3. Implementation

### HTML Structure
```html
<!-- Backdrop -->
<div class="drawer-backdrop hidden" id="drawerBackdrop"></div>

<!-- Drawer Container -->
<div class="drawer drawer-right hidden" id="myDrawer">
  <div class="drawer-header">
    <h3 class="drawer-title">Drawer Title</h3>
    <button class="btn-close" id="closeDrawer">&times;</button>
  </div>
  <div class="drawer-body">
    <!-- Content goes here -->
  </div>
  <div class="drawer-footer">
    <button class="btn-primary w-full">Save Changes</button>
  </div>
</div>
```

### CSS Classes (via style.css)
-   `.drawer`: Base drawer styling (fixed, high z-index).
-   `.drawer-right`, `.drawer-left`: Positioning and entry animations.
-   `.drawer-backdrop`: Darkened overlay.
-   `.drawer-open`: Utility class to trigger visibility and animation.
