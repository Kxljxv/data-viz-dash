# Jumbotron (Hero) Component

The **Jumbotron** (or Hero) component is a prominent showcase area designed to highlight key features, welcome users, or provide a high-impact call to action. It follows the AEA Cyberpunk-Lite aesthetic, utilizing glassmorphism and bold typography.

## Design Specifications

-   **Background**: Can be a deep gradient, a background image with a glassmorphic overlay, or a pure glassmorphic panel (`hsla(var(--bg-100) / 0.7)`).
-   **Typography**:
    -   Title: `ModernDense`, xl/2xl/3xl, Bold, High Contrast (`hsl(var(--text-100))`).
    -   Subtitle: `ModernDense`, lg, `hsl(var(--text-300))`.
    -   Description: `ModernDense`, base/md, `hsl(var(--text-400))`.
-   **Call to Action**: Large buttons with accent brand highlights.
-   **Layout**:
    -   Centered: Standard for welcome screens.
    -   Split: Text on one side, visual element (graph, image, code) on the other.
-   **Animations**: Subtle entrance animations (fade-in, slide-up) to enhance the "high-impact" feel.

## CSS Classes

| Class | Description |
| :--- | :--- |
| `.aea-jumbotron` | Main container for the hero section. |
| `.aea-jumbotron-glass` | Variant with a full-width glassmorphic panel. |
| `.aea-jumbotron-content` | Inner container for text and buttons. |
| `.aea-jumbotron-title` | Large, impactful title. |
| `.aea-jumbotron-subtitle` | Secondary text below the title. |
| `.aea-jumbotron-actions` | Container for CTA buttons. |
| `.aea-jumbotron-visual` | Container for any visual elements (images, graphs). |

## Usage Example

```html
<section class="aea-jumbotron aea-jumbotron-glass">
    <div class="container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <h1 class="aea-jumbotron-title">Visualize the Future of Governance</h1>
        <p class="aea-jumbotron-subtitle">
            An advanced node-based graph system for exploring people, motions, and their complex connections.
        </p>
        <div class="aea-jumbotron-actions">
            <button class="aea-button aea-button-primary">Launch Explorer</button>
            <button class="aea-button aea-button-secondary">Read Documentation</button>
        </div>
    </div>
</section>
```

## Accessibility

-   Ensure high contrast between text and background (WCAG AA).
-   Use semantic `<section>` or `<header>` tags.
-   Provide clear labels for all interactive elements.
-   Use `aria-hidden="true"` for decorative background elements or visuals that don't add content value.

## Failure Scenarios & Considerations

1.  **Background Legibility**: If using a background image, ensure the glassmorphic overlay is thick enough to maintain text readability.
2.  **Mobile Responsiveness**: Font sizes must scale down gracefully on mobile to avoid horizontal scrolling or awkward wrapping.
3.  **CTA Visibility**: Ensure the primary button is clearly distinguished from the secondary button.
