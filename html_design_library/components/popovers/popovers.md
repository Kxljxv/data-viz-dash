# Popovers

Popovers are rich, interactive overlays that appear when a user clicks on a trigger element. They are more substantial than tooltips, supporting headers, rich text, and even interactive elements like buttons or links.

## 1. Design Specifications

### Visual Aesthetic
- **Glassmorphism:** Dense `16px` backdrop blur with `hsla(var(--bg-100) / 0.8)` background.
- **Borders:** Subtle `1px` border using `hsla(var(--border-300) / 0.2)`.
- **Shadow:** Deep `shadow-2xl` to provide clear depth against the underlying content.
- **Typography:**
    - Header: `ModernDense`, bold, `0.9375rem`.
    - Body: `ModernDense`, `0.875rem`, `hsl(var(--text-300))`.
- **Arrow:** Optional arrow pointing to the trigger element.

### Behavior
- **Trigger:** Click (standard) or Hover (optional).
- **Dismissal:**
    - Click outside.
    - Click a "Close" button.
    - Press `Escape` key.
- **Positioning:** Auto-flip based on viewport boundaries (Top, Bottom, Left, Right).

## 2. Technical Implementation

### CSS Classes
- `.aea-popover`: Main container.
- `.aea-popover-header`: Title section.
- `.aea-popover-body`: Content section.
- `.aea-popover-footer`: Optional action section.
- `.aea-popover-arrow`: Decorative pointer.

### JavaScript API (`AEAPopover`)
The popover controller manages instantiation and lifecycle.

```javascript
// Example Usage
AEAPopover.show(triggerElement, {
    title: "Node Details",
    content: "Detailed information about the selected node...",
    position: "top",
    interactive: true
});
```

## 3. Accessibility (A11y)
- **Roles:** `role="dialog"` or `role="tooltip"` (depending on content).
- **ARIA:** `aria-expanded` on trigger, `aria-labelledby` linking to header.
- **Focus:** Optional focus trapping if the popover contains interactive elements.
- **Keyboard:** `Escape` key closes the popover.

## 4. Failure Scenarios & Edge Cases
- **Viewport Clipping:** If there's no room at the preferred position, the popover must flip to the opposite side or shift to stay within view.
- **Rapid Clicking:** Ensure previous instances are cleaned up or handled correctly to avoid DOM bloat.
- **Dynamic Content:** If content changes size, the popover should ideally reposition itself.

## 5. Svelte Implementation (AEA-System)

The Svelte implementation provides a reactive `Popover` component that uses Svelte 5 runes for state management and built-in positioning logic.

### Usage

```svelte
<script>
  import { Popover, Button } from '$lib/components/aea';
</script>

<Popover position="top">
  {#snippet trigger({ onclick })}
    <Button onclick={onclick}>Open Popover</Button>
  {/snippet}

  {#snippet title()}
    Node Details
  {/snippet}

  <div class="flex flex-col gap-2">
    <p>Detailed information about the selected node...</p>
    <Button variant="outline" size="sm">Action</Button>
  </div>
</Popover>
```

### Properties

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred position relative to trigger. |
| `open` | `boolean` | `false` | Whether the popover is open (controlled). |
| `onOpenChange` | `function` | `undefined` | Callback called when the open state changes. |
| `showClose` | `boolean` | `true` | Whether to show the close button. |
| `trigger` | `Snippet` | (Required) | Snippet for the trigger element. |
| `title` | `Snippet` | `undefined` | Snippet for the popover title. |
| `footer` | `Snippet` | `undefined` | Snippet for the popover footer. |
| `children` | `Snippet` | (Required) | The popover body content. |
| `class` | `string` | `''` | Additional CSS classes for the popover. |
