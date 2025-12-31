# Avatar Component

The Avatar component is used to represent a user or entity with an image, initials, or an icon. It follows the **Cyberpunk-Lite** aesthetic with support for glassmorphism, status indicators, and technical accents.

## Design Specifications

### Visual Style
- **Shape**: Supports circular (`rounded-full`), rounded square (`rounded-2xl`), and technical square (`rounded-lg`) variants.
- **Glassmorphism**: Fallback backgrounds use semi-transparent colors with `backdrop-blur`.
- **Borders**: Subtle semi-transparent borders `border-[hsla(var(--border-300)/0.2)]`.
- **Status Indicators**: Small badges at the corner (Online, Offline, Busy, Away) using neon accent colors.
- **Glow**: Active or highlighted avatars may have a subtle glow effect matching the accent color.

### Sizes
- **XS**: 24px (1.5rem)
- **SM**: 32px (2rem)
- **MD**: 48px (3rem) - Default
- **LG**: 64px (4rem)
- **XL**: 96px (6rem)

### Typography
- **Initials**: Uses `ModernDense` font, uppercase, centered.

## API & Structure

### HTML Structure
```html
<div class="aea-avatar aea-avatar-md" aria-label="User Name">
    <img src="..." alt="User Name" class="aea-avatar-img">
    <!-- Fallback -->
    <div class="aea-avatar-fallback">JD</div>
    <!-- Status Badge -->
    <span class="aea-avatar-status aea-status-online"></span>
</div>
```

### CSS Classes
- `.aea-avatar`: Base container.
- `.aea-avatar-[xs|sm|md|lg|xl]`: Size variants.
- `.aea-avatar-fallback`: Glassmorphic fallback for initials/icons.
- `.aea-avatar-status`: Status indicator base.
- `.aea-status-[online|offline|busy|away]`: Status colors.
- `.aea-avatar-group`: Container for stacked avatars.

## Accessibility
- Use `aria-label` on the container to describe the user.
- Images must have an `alt` attribute (empty if decorative, or matching the user's name).
- Status indicators should have descriptive `aria-label` if not communicated otherwise.

## Implementation Details
- **Image Fallback**: JavaScript logic to detect loading errors and show the fallback div.
- **Initials Generation**: Helper function to extract initials from a name.
- **Responsive**: Sizes scale appropriately or can be adjusted using Tailwind breakpoints.
