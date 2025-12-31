# Toasts Component

## 1. Design Specifications

### Visual Language
The Toasts component provides temporary, non-disruptive feedback in the corner of the screen, following the **Cyberpunk-Lite** aesthetic with glassmorphism and subtle animations.

- **Background:** `hsla(var(--bg-100) / 0.9)` with `backdrop-filter: blur(16px)`.
- **Border:** `1px solid hsla(var(--border-300) / 0.1)`.
- **Shadow:** `shadow-2xl` for depth.
- **Variants:**
  - `success`: Green accent.
  - `error`: Red accent.
  - `info`: Blue accent.
  - `warning`: Orange accent.
- **Animation:** Slides in from the right/bottom and fades out.

### Positioning
- Toasts are queued in a container at the bottom-right of the viewport by default.
- Stacked vertically with a consistent gap.

## 2. Technical Implementation

### CSS Classes
- `.aea-toast-container`: Fixed container for all toasts.
- `.aea-toast`: Individual toast element.
- `.aea-toast-content`: Text container.
- `.aea-toast-icon`: Status icon.
- `.aea-toast-close`: Dismiss button.

### Logic (AEAToasts)
A singleton controller to programmatically spawn, queue, and dismiss toasts.

### API
- `AEAToasts.show({ title, message, type, duration })`: Spawns a new toast.
- `AEAToasts.dismiss(id)`: Removes a specific toast.
- `AEAToasts.clearAll()`: Clears the entire queue.

## 3. Accessibility (A11y)
- **Role:** `role="status"` or `role="alert"` (for errors).
- **ARIA:** `aria-live="polite"` for non-critical info, `aria-live="assertive"` for errors.
- **Interaction:** Dismissible via close button or automatically after a duration.
- **Reduced Motion:** Respects `prefers-reduced-motion` for slide animations.

## 4. Usage Example
```javascript
AEAToasts.show({
    title: "Sync Complete",
    message: "Node graph has been successfully updated.",
    type: "success",
    duration: 5000
});
```
