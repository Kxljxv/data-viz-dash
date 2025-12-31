# Modals

Modals are high-priority overlay windows that interrupt the user's workflow to capture input, provide critical information, or display focused details (e.g., node specifications). They are a core component of the AEA interface, leveraging glassmorphism to maintain visual continuity with the underlying data graph.

## 1. Design Specifications

### Visual Style
-   **Surface:** Frosted glass effect (`card-glass`) with a higher blur (`backdrop-blur-xl`) and slightly higher opacity to ensure readability over complex backgrounds.
-   **Backdrop:** Deeply dimmed overlay (`bg-black/60`) with a light blur (`backdrop-blur-sm`) to isolate the modal.
-   **Typography:**
    -   **Title:** `Serif` font for authority and clarity.
    -   **Content:** `ModernDense` for technical data and descriptions.
-   **Borders:** 1px semi-transparent border (`hsla(var(--border-300)/0.2)`) with a larger corner radius (`rounded-3xl`).
-   **Shadows:** Extreme depth (`shadow-2xl`) with a subtle outer glow based on the modal's context (e.g., brand orange for actions).

### Variants
-   **Standard Modal:** Fixed width (sm/md/lg), centered on screen.
-   **Full-Screen Modal:** Mobile-first or for immersive data exploration.
-   **Action Modal:** Includes prominent primary/secondary action buttons in the footer.
-   **Status Modal:** Color-coded (Success/Danger/Info) for specific feedback loops.

## 2. Technical Considerations

### Accessibility (A11y)
-   **Role:** `role="dialog"` and `aria-modal="true"`.
-   **Focus Management:**
    -   Trap focus within the modal when open.
    -   Return focus to the triggering element upon closing.
    -   Initial focus on the primary action or close button.
-   **Dismissal:** Support `Esc` key, backdrop click, and explicit close buttons.
-   **Labels:** Use `aria-labelledby` and `aria-describedby` to link the title and content to the dialog.

### Error Handling & Edge Cases
-   **Overflow:** Handle long content with an internal scroll area (`overflow-y-auto`).
-   **Nesting:** Prevent multiple modals from overlapping awkwardly; manage z-index stacks.
-   **Mobile:** Ensure responsive scaling; convert to bottom-sheet style or full-screen on small viewports.
-   **Animation Interrupts:** Ensure opening/closing animations complete before allowing new state changes.

## 3. Implementation

### HTML Structure
```html
<div class="modal-backdrop" id="modalBackdrop">
  <div class="modal modal-md" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-header">
      <h2 id="modalTitle" class="modal-title">Modal Heading</h2>
      <button class="btn-close" aria-label="Close Modal">&times;</button>
    </div>
    <div class="modal-body">
      <!-- Content -->
    </div>
    <div class="modal-footer">
      <!-- Actions -->
    </div>
  </div>
</div>
```

### CSS Classes (via style.css)
-   `.modal-backdrop`: Shared background for all modals.
-   `.modal`: Main container.
-   `.modal-sm`, `.modal-md`, `.modal-lg`: Size variants.
-   `.modal-header`, `.modal-body`, `.modal-footer`: Layout sections.

## 4. Technical Concept (Svelte Implementation)

The Svelte implementation will use **Svelte 5 Runes** and the native `<dialog>` element where possible, or a custom implementation for maximum style control matching the design library.

### Props (Interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Whether the modal is visible (bindable). |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | The maximum width of the modal. |
| `accent` | `'brand' \| 'success' \| 'danger' \| 'none'` | `'none'` | Top border color accent. |
| `title` | `string` | `undefined` | The title displayed in the header. |
| `showClose` | `boolean` | `true` | Whether to show the close button in the header. |
| `onclose` | `function` | `undefined` | Callback triggered when the modal is closed. |
| `body` | `Snippet` | `undefined` | Main content for the modal body. |
| `footer` | `Snippet` | `undefined` | Action buttons for the modal footer. |

### Features
- **Body Scroll Lock:** Automatically manages the `modal-open` class on the body.
- **Backdrop Click:** Closes the modal when clicking the backdrop (optional).
- **Animations:** Smooth scale and fade transitions using CSS.
- **Accessibility:** ARIA attributes, focus management, and Escape key support.

### Example Usage
```svelte
<Modal bind:open={showModal} size="md" title="System Update" accent="brand">
  {#snippet body()}
    <p>Details about the update...</p>
  {/snippet}
  
  {#snippet footer()}
    <Button variant="ghost" onclick={() => showModal = false}>Cancel</Button>
    <Button variant="primary" onclick={handleUpdate}>Update Now</Button>
  {/snippet}
</Modal>
```
