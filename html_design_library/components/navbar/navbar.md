# Navbar

The Navbar is the primary horizontal navigation header for the AEA application. It provides access to high-level navigation, global search, and user actions while maintaining the Cyberpunk-Lite glassmorphic aesthetic.

## Design Specifications

-   **Aesthetic:** High-transparency glassmorphism with strong backdrop-blur.
-   **Structure:**
    -   **Left:** Logo and Branding.
    -   **Center:** Primary navigation links (hidden on mobile).
    -   **Right:** Global actions (Search, Notifications, Profile).
-   **Behavior:** Sticky at the top of the viewport. Subtle bottom border for definition.
-   **Mobile:** Collapses into a hamburger menu or utilizes a mobile-specific drawer.

## CSS Classes

-   `.aea-navbar`: Main container with glassmorphic styles.
-   `.aea-navbar-inner`: Flex container for content alignment.
-   `.aea-navbar-brand`: Logo and application name area.
-   `.aea-navbar-nav`: List of navigation links.
-   `.aea-navbar-link`: Individual navigation item with hover states.
-   `.aea-navbar-actions`: Right-side container for buttons/icons.
-   `.aea-navbar-toggle`: Mobile menu button.

## Usage

```html
<nav class="aea-navbar">
    <div class="aea-navbar-inner">
        <div class="aea-navbar-brand">
            <img src="logo.svg" alt="AEA Logo" class="h-8">
            <span class="font-modern-dense font-bold">AEA BDK</span>
        </div>
        
        <ul class="aea-navbar-nav">
            <li><a href="#" class="aea-navbar-link is-active">Dashboard</a></li>
            <li><a href="#" class="aea-navbar-link">Graph View</a></li>
            <li><a href="#" class="aea-navbar-link">Data Entry</a></li>
        </ul>
        
        <div class="aea-navbar-actions">
            <button class="aea-btn-icon" aria-label="Search">
                <!-- Search Icon -->
            </button>
            <div class="aea-user-profile">
                <!-- Avatar/Profile Dropdown -->
            </div>
        </div>
    </div>
</nav>
```

## Technical Considerations

-   **Z-Index:** Set to `1000` to stay above page content but below modals (`2000+`).
-   **Blur:** Use `backdrop-filter: blur(16px)` for the "AEA Look".
-   **Transitions:** Smooth color and opacity transitions for links and buttons.
-   **Mobile Logic:** Toggle the `.is-open` class on the nav list or trigger a `AEADrawer`.

## Accessibility

-   Use `<nav>` element for landmark identification.
-   Ensure navigation links have clear focus states.
-   The mobile toggle must have `aria-label="Toggle navigation"` and `aria-expanded` attributes.
-   Keyboard users should be able to tab through all navigation items.
