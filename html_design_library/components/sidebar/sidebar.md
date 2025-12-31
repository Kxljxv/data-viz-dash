# Sidebar

A versatile vertical navigation component designed for complex application layouts. It supports multiple states (full, mini, mobile), nested navigation, and glassmorphic styling.

## 1. Design Specifications

### Aesthetic: Cyberpunk-Lite
- **Surface:** Glassmorphic panel with `24px` blur and `hsla(var(--bg-100) / 0.8)` background.
- **Accents:** Active items use `hsl(var(--accent-brand))` for the left border and background glow.
- **Typography:** Uses `ModernDense` for navigation labels and `uppercase` for group headers.
- **Icons:** SVG icons are mandatory for all top-level items to support the "mini" sidebar mode.

### Behavior
- **Desktop:** Can be toggled between "full" (expanded) and "mini" (collapsed) states.
- **Mobile:** Acts as an off-canvas drawer with a semi-transparent backdrop.
- **Transitions:** Smooth width transitions for desktop and slide-in animations for mobile.

### Accessibility (WCAG AA)
- **Roles:** `role="navigation"`, `aria-label="Primary Navigation"`.
- **States:** `aria-expanded` on the toggle button and nested groups.
- **Keyboard:** Full tab navigation support; `Enter` to toggle groups; `Esc` to close on mobile.

## 2. Technical Implementation

### CSS Classes
- `.aea-sidebar`: Root container.
- `.aea-sidebar-inner`: The scrolling content area.
- `.aea-sidebar-item`: Individual navigation link.
- `.aea-sidebar-group`: Container for nested items.
- `.aea-sidebar-toggle`: Button to collapse/expand.
- `.aea-sidebar-backdrop`: Overlay for mobile mode.

### JavaScript API (`AEASidebar`)
The component is managed by a singleton controller that handles:
- **State Management:** Tracks expanded/collapsed state and mobile visibility.
- **Persistence:** (Optional) Stores the user's preference in `localStorage`.
- **Breakpoints:** Automatically switches to mobile mode based on window width.
- **Event Dispatching:** Fires `aea-sidebar-toggle` events for other components to adjust their layouts (e.g., the main graph).

## 3. Usage Example

```html
<aside class="aea-sidebar" id="main-sidebar">
    <div class="aea-sidebar-header">
        <img src="logo.svg" alt="Logo" class="aea-sidebar-logo">
        <button class="aea-sidebar-toggle">...</button>
    </div>
    <nav class="aea-sidebar-inner">
        <div class="aea-sidebar-group">
            <span class="aea-sidebar-group-title">Navigation</span>
            <a href="#" class="aea-sidebar-item is-active">
                <svg>...</svg>
                <span class="aea-sidebar-label">Dashboard</span>
            </a>
            <!-- More items -->
        </div>
    </nav>
    <div class="aea-sidebar-footer">
        <!-- User profile or settings -->
    </div>
</aside>
```
