# File Upload Status

The File Upload Status component provides a high-quality, glassmorphic interface for managing file uploads within the AEA ecosystem. It features a Cyberpunk-Lite aesthetic with neon accents, real-time progress visualization, and comprehensive error handling.

## 1. Visual Specifications

- **Container:** Glassmorphic panel with `backdrop-blur(16px)` and a subtle border.
- **Typography:** `ModernDense` for all UI labels, file names, and status text.
- **Colors:**
  - **Progress Bar:** `hsl(var(--accent-brand))` (Neon Orange/Red).
  - **Success State:** `hsl(var(--success))` (Neon Green) with glow.
  - **Error State:** `hsl(var(--danger))` (Neon Red).
  - **Background:** `hsla(var(--bg-100) / 0.8)`.
- **Shapes:** `rounded-2xl` for the main container; `rounded-full` for progress bars and badges.

## 2. Interaction Design

### States
1. **Idle:** Clear call-to-action for dragging or selecting files.
2. **Dragging:** Visual feedback when a file is hovered over the drop zone (border glow, opacity shift).
3. **Uploading:** Real-time progress bar updates with percentage and byte counts.
4. **Success:** Transition to a "Completed" state with a success icon and neon glow.
5. **Error:** Detailed error message with a "Retry" or "Remove" option.

### Actions
- **Cancel:** Stop an ongoing upload.
- **Retry:** Restart a failed upload.
- **Remove:** Clear a file from the list.
- **Select Files:** Standard file picker fallback.

## 3. Technical Implementation

- **HTML:** Semantic structure using `<section>`, `<ul>`, and `<progress>` (or custom div-based bars for better styling).
- **CSS:** Utility-first Tailwind for layout, custom CSS for glassmorphism and neon effects.
- **JS:** Vanilla ES6+ Module with a `FileUploadStatus` class for state management.
- **Accessibility:**
  - `aria-live="polite"` for status updates.
  - Keyboard-navigable actions (Tab/Enter).
  - Role-based attributes for the file list and progress indicators.

## 4. Usage Example

```javascript
import { FileUploadStatus } from './script.js';

const uploadManager = new FileUploadStatus(document.getElementById('upload-root'));

// Example of adding a file programmatically
uploadManager.addFile({
    name: 'network_data.json',
    size: 1024 * 1024 * 2.5, // 2.5MB
    type: 'application/json'
});
```

## 5. Responsive Behavior

- **Mobile:** Full-width container, stacked file details.
- **Desktop:** Max-width constraints, side-by-side layout for file name and progress.
- **Fluidity:** Progress bars expand to fill available width.
