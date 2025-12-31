# Stepper Component

The Stepper component is a visual representation of a multi-step process. It follows the **Cyberpunk-Lite** aesthetic with technical markers, glassmorphic progress indicators, and neon accents.

## Design Specifications

### Visual Style
- **Orientation**: Supports both horizontal and vertical layouts.
- **Markers**: Circular or square markers with numbers, icons, or simple technical dots.
- **Progress Line**: Connects markers, changing color from muted to neon (accent-brand) as steps are completed.
- **Glassmorphism**: Step content panels use `backdrop-blur` and semi-transparent backgrounds.
- **Typography**: Step titles use `ModernDense` in uppercase for a technical feel.

### Variations
- **Horizontal**: Best for linear flows on larger screens.
- **Vertical**: Ideal for sidebars or mobile views.
- **Technical**: Minimalist design with `+` markers and dashed lines.
- **Interactive**: Users can click on previous steps to navigate back.

## API & Structure

### HTML Structure
```html
<div class="aea-stepper aea-stepper-horizontal" id="example-stepper">
    <!-- Step 1 -->
    <div class="aea-step aea-step-active" data-step="1">
        <div class="aea-step-marker">1</div>
        <div class="aea-step-content">
            <h3 class="aea-step-title">Initialization</h3>
            <p class="aea-step-desc">Configure base parameters.</p>
        </div>
    </div>
    <div class="aea-step-line"></div>
    <!-- Step 2 -->
    <div class="aea-step" data-step="2">
        <div class="aea-step-marker">2</div>
        <div class="aea-step-content">
            <h3 class="aea-step-title">Authentication</h3>
            <p class="aea-step-desc">Verify system credentials.</p>
        </div>
    </div>
</div>
```

### CSS Classes
- `.aea-stepper`: Main container.
- `.aea-stepper-horizontal`, `.aea-stepper-vertical`: Orientation variants.
- `.aea-step`: Individual step container.
- `.aea-step-active`, `.aea-step-completed`, `.aea-step-error`: State variants.
- `.aea-step-marker`: The visual indicator (circle/square).
- `.aea-step-line`: The connecting line between steps.

## Accessibility
- Use `role="list"` for the stepper container and `role="listitem"` for each step.
- Current step should have `aria-current="step"`.
- Completed steps should have a descriptive label for screen readers (e.g., "Step 1: Completed").
- Interactive steppers must be keyboard navigable (`tabindex="0"`, `Enter/Space` to activate).

## Implementation Details
- **JavaScript**: A `Stepper` class to manage active states, transitions, and optional validation before moving to the next step.
- **Animations**: Smooth color transitions and subtle scale effects on the active marker.
- **Responsive**: Horizontal steppers should gracefully transition to vertical on small screens.
