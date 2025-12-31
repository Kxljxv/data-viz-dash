# Timelines

The Timelines component provides a vertical or horizontal representation of chronological events. It's ideal for audit logs, node history, or project milestones in the AEA application.

## Design Specifications

-   **Line:** Subtle, semi-transparent line (`hsla(var(--border-300) / 0.1)`).
-   **Markers:** Circular indicators, often using brand accents or status colors. Can be solid, outlined, or glowing.
-   **Content:** Information associated with each point in time, usually presented in small cards or minimal text blocks.
-   **Typography:** Dates and times should be prominent and use the `ModernDense` font.

## CSS Classes

-   `.aea-timeline`: The main container for the timeline.
-   `.aea-timeline-item`: A single entry in the timeline.
-   `.aea-timeline-marker`: The visual indicator on the line.
-   `.aea-timeline-content`: The container for the event description.
-   `.aea-timeline-date`: The timestamp associated with the event.
-   `.aea-timeline-alternating`: Items alternate between left and right sides (desktop only).

## Usage

```html
<div class="aea-timeline">
    <div class="aea-timeline-item">
        <div class="aea-timeline-marker bg-[hsl(var(--accent-brand))]"></div>
        <div class="aea-timeline-content">
            <time class="aea-timeline-date">2023-12-22</time>
            <h3 class="text-lg font-semibold">System Update</h3>
            <p>Version 2.0 deployed successfully.</p>
        </div>
    </div>
</div>
```

## Accessibility

-   Use `<time>` tags for dates.
-   Ensure the reading order is logical (chronological).
-   Use semantic headings within timeline content.
-   Markers should have sufficient contrast if they convey meaning (e.g., status).
