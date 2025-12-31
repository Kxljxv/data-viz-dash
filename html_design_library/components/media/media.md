# Media Component

The Media component provides Cyberpunk-Lite styled containers for images and videos. These are designed to look like technical feeds, data streams, or HUD-integrated visual elements.

## Design Aesthetic
- **Glassmorphic Frames**: Media is housed in semi-transparent containers with technical borders and metadata overlays.
- **Technical Overlays**: HUD elements like coordinates, timestamps, and "REC" indicators reinforce the "data stream" feel.
- **Glitch Effects**: Optional CSS-driven glitch animations for hover states or constant ambient effects.
- **Aspect Ratio Control**: Strict adherence to technical aspect ratios (16:9, 1:1, 4:3).

## Variations

### 1. Base Frame (`aea-media-frame`)
A glassmorphic container with thin borders and a technical metadata footer.

### 2. Glitch Variation (`aea-media-glitch`)
Adds a subtle RGB shift and horizontal displacement animation on hover.

### 3. HUD Overlay (`aea-media-hud`)
Includes scanning lines, corner brackets, and simulated technical data (e.g., coordinates, zoom level).

### 4. Video Player (`aea-media-video`)
A custom-styled video container with glassmorphic controls and a technical progress bar.

## Technical Specifications

### CSS Classes
- `.aea-media-container`: Base wrapper for all media elements.
- `.aea-media-content`: The actual `img` or `video` element, ensuring it fills the container.
- `.aea-media-overlay`: Absolute positioned layer for HUD/metadata.
- `.aea-media-glitch`: Class to trigger glitch animations.

### Accessibility
- **Alt Text**: All images must have descriptive `alt` attributes.
- **Video Captions**: Video elements should include `<track>` for captions if available.
- **Keyboard Controls**: Video controls must be keyboard accessible.
- **Motion Sensitivity**: Glitch effects and animations respect `prefers-reduced-motion`.

## Usage Example

```html
<div class="aea-media-container aea-media-hud aspect-video">
    <img src="path/to/image.jpg" alt="Technical visualization" class="aea-media-content">
    <div class="aea-media-overlay">
        <span class="aea-hud-label top-left">STREAM_01</span>
        <span class="aea-hud-data bottom-right">52.5200° N, 13.4050° E</span>
    </div>
</div>
```
