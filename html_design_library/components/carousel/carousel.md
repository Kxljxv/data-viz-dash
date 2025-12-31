# Carousel Component

The Carousel component is a responsive slider for showcasing images, cards, or content. It follows the **Cyberpunk-Lite** aesthetic with glassmorphic controls, technical indicators, and smooth hardware-accelerated transitions.

## Design Specifications

### Visual Style
- **Navigation**: Glassmorphic arrows (`backdrop-blur-md`) with neon hover effects.
- **Indicators**: Technical dots or lines that fill with the `accent-brand` color to show progress.
- **Transitions**: Smooth slide or fade animations using `transform` and `opacity`.
- **Containers**: Semi-transparent backgrounds with subtle borders and large corner radii (`rounded-3xl`).
- **Typography**: Captions and counters use `ModernDense` font.

### Variations
- **Single Slide**: One item visible at a time (default).
- **Multi-Item**: Multiple items visible, useful for card galleries.
- **Center Mode**: The active item is centered and slightly larger.
- **Infinite Loop**: Seamless scrolling from the last item back to the first.
- **Autoplay**: Automatic transition between slides with a progress bar.

## API & Structure

### HTML Structure
```html
<div class="aea-carousel" id="example-carousel" role="region" aria-roledescription="carousel">
    <div class="aea-carousel-viewport">
        <div class="aea-carousel-track">
            <!-- Slide 1 -->
            <div class="aea-carousel-slide" role="group" aria-roledescription="slide" aria-label="1 of 3">
                <img src="..." alt="...">
                <div class="aea-carousel-caption">...</div>
            </div>
            <!-- Slide 2 ... -->
        </div>
    </div>

    <!-- Navigation -->
    <button class="aea-carousel-prev" aria-label="Previous slide"></button>
    <button class="aea-carousel-next" aria-label="Next slide"></button>

    <!-- Indicators -->
    <div class="aea-carousel-indicators">
        <button class="aea-carousel-dot aea-active" aria-label="Go to slide 1"></button>
        <button class="aea-carousel-dot" aria-label="Go to slide 2"></button>
    </div>
</div>
```

### CSS Classes
- `.aea-carousel`: Main container.
- `.aea-carousel-viewport`: Overflow container for the track.
- `.aea-carousel-track`: The moving element containing slides.
- `.aea-carousel-slide`: Individual content slide.
- `.aea-carousel-prev`, `.aea-carousel-next`: Navigation buttons.
- `.aea-carousel-indicators`: Container for dots/lines.
- `.aea-carousel-dot`: Individual step indicator.

## Accessibility
- Uses `role="region"` and `aria-roledescription="carousel"`.
- Navigation buttons are keyboard focusable and have descriptive labels.
- Supports keyboard navigation (`ArrowLeft`, `ArrowRight`).
- Respects `prefers-reduced-motion` for transitions.
- Swipe support for touch devices.

## Implementation Details
- **JavaScript**: A `Carousel` class to handle transitions, events, and responsive breakpoints.
- **Performance**: Uses `translate3d` for GPU acceleration.
- **Responsiveness**: Breakpoints define the number of visible items (e.g., 1 on mobile, 3 on desktop).
