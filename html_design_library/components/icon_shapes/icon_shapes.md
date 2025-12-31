# Icon Shapes Component

The Icon Shapes component provides geometric containers for icons or initials, designed with the **Cyberpunk-Lite** aesthetic. These are primary used for node visualization in graphs or as high-impact UI elements.

## Design Specifications

### Visual Style
- **Geometric Precision**: Uses technical shapes like hexagons, octagons, and clipped-corner squares.
- **Glassmorphism**: Semi-transparent backgrounds with `backdrop-blur-md` and subtle borders.
- **Neon Accents**: Outer glows and vibrant borders using HSL variables for active or status states.
- **Holographic Effects**: Optional scan-line overlays and pulsing animations.
- **Status Integration**: Built-in support for status indicators (dots or badges) that attach to the shape's vertices.

### Variations

#### 1. Shapes
- **Circle**: Classic, organic.
- **Hexagon**: Mathematical, technical.
- **Octagon**: Industrial, structured.
- **Clipped Square**: Modern, aggressive.
- **Shield**: Protective, security-focused.

#### 2. Styles
- **Glass (Default)**: Blurred background, thin border.
- **Neon**: Vibrant border with matching outer glow.
- **Hologram**: Pulsing opacity and scan-line texture.
- **Outline**: Minimalist, just the border.

#### 3. Sizes
- **XS**: 24px (Subtle UI indicators)
- **SM**: 32px (Small nodes/labels)
- **MD**: 48px (Standard UI icons)
- **LG**: 64px (Featured icons)
- **XL**: 80px+ (Large graph nodes)

## API & Structure

### HTML Structure
```html
<div class="aea-icon-shape aea-shape-hexagon aea-style-glass aea-size-md" role="img" aria-label="Security Status">
    <!-- Icon or Initials -->
    <svg class="w-6 h-6" ...>...</svg>
    
    <!-- Optional Status Indicator -->
    <div class="aea-status-indicator aea-status-success"></div>
    
    <!-- Optional Scan-line (for Hologram style) -->
    <div class="aea-scan-line"></div>
</div>
```

### CSS Classes
- `.aea-icon-shape`: Base container class.
- `.aea-shape-[circle|hexagon|octagon|square|shield]`: Defines the geometry via `clip-path`.
- `.aea-style-[glass|neon|hologram|outline]`: Visual treatment.
- `.aea-size-[xs|sm|md|lg|xl]`: Standard sizes.
- `.aea-status-[success|warning|danger|info]`: Color-coded status.

## Accessibility
- Uses `role="img"` and `aria-label` for non-decorative icons.
- Maintains high contrast (WCAG AA) for borders and icons.
- Respects `prefers-reduced-motion` for pulse/hologram animations.

## Implementation Details
- **Clip-Path**: Shapes are achieved using CSS `clip-path` for pixel-perfect geometry.
- **Glow**: `box-shadow` or `drop-shadow` for neon effects.
- **Theming**: Fully controlled via `--accent-brand` and surface HSL variables.
