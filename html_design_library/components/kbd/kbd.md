# KBD (Keyboard Key)

The KBD component provides a technical, glassmorphic visualization of keyboard keys and shortcuts. It is designed to be used within documentation, tooltips, or command menus to indicate user input actions.

## 1. Visual Specifications

- **Container:** Small, key-shaped box with `backdrop-blur(8px)`.
- **Typography:** `ModernDense` font, bold, uppercase.
- **Colors:**
  - **Background:** `hsla(var(--bg-200) / 0.8)`.
  - **Border:** `1px solid hsla(var(--border-300) / 0.4)`.
  - **Text:** `hsl(var(--text-200))`.
- **Shape:** `rounded-md` with a subtle bottom-heavy shadow to simulate a physical key.
- **Interactive:** Subtle neon brand glow on hover.

## 2. Interaction Design

- **Hover:** The border color shifts towards `hsl(var(--accent-brand))` with a small outer glow.
- **Active:** Slight downward shift (`translate-y-[1px]`) to mimic a key press.

## 3. Technical Implementation

- **HTML:** Semantic `<kbd>` tag.
- **CSS:** Utility-first Tailwind with custom classes for the "key" effect.
- **Accessibility:**
  - Native `<kbd>` tag is recognized by screen readers.
  - High contrast text ensures readability.

## 4. Usage Example

```html
<p class="text-sm text-[hsl(var(--text-500))]">
    Press <kbd class="aea-kbd">Ctrl</kbd> + <kbd class="aea-kbd">K</kbd> to search.
</p>
```

## 5. Variations

- **Default:** Standard neutral key.
- **Accent:** Key with a brand-colored border for primary shortcuts.
- **Small:** Even more compact version for dense UIs.
