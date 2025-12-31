# Cards & Containers

Cards are fundamental building blocks of the AEA interface, used to group related information, provide context, and house interactive elements. Following our **Cyberpunk-Lite** aesthetic, they leverage glassmorphism to feel integrated with the underlying graph visualization.

## 1. Design Specifications

### Visual Style
-   **Background:** Semi-transparent HSL colors with `backdrop-blur`.
-   **Border:** Thin (1px), low-opacity borders to define edges without adding visual weight.
-   **Radius:** Large corner radii (`rounded-2xl` or `rounded-3xl`) for a modern, fluid feel.
-   **Shadow:** Multi-layered shadows to create depth and separation from the background.

### Variants
-   **Standard Card:** Solid surface for maximum readability.
-   **Glass Card:** Frosted effect, ideal for floating panels.
-   **Interactive Card:** Includes hover effects (scale, border glow, shadow intensity).
-   **Accent Card:** Uses brand or status colors (Success, Info, Danger) for the border or a top stripe.

## 2. Usage Guidelines

-   **Hierarchy:** Use cards to create clear information hierarchies.
-   **Padding:** Maintain consistent internal padding (`p-4` to `p-6`) to prevent content from feeling cramped.
-   **Spacing:** Use cards to separate distinct content areas on the same screen.
-   **Accessibility:** Ensure sufficient contrast between card background and text. Always provide focus states for interactive cards.

## 3. Implementation

### HTML Structure
```html
<div class="card card-glass">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <span class="card-subtitle">Secondary information</span>
  </div>
  <div class="card-body">
    <p>Main content area for the card.</p>
  </div>
  <div class="card-footer">
    <button class="btn-primary">Action</button>
  </div>
</div>
```

### CSS Classes (via style.css)
-   `.card`: Base card styling (radius, overflow, position).
-   `.card-glass`: Glassmorphism effect (blur, semi-transparent bg).
-   `.card-interactive`: Hover and focus animations.
-   `.card-header`, `.card-body`, `.card-footer`: Standardized layout sections.

## 4. Technical Concept (Svelte Implementation)

The Svelte implementation will use **Svelte 5 Runes** for a modern, reactive, and type-safe experience.

### Props (Interface)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' \| 'glass'` | `'default'` | The visual style of the card background. |
| `interactive` | `boolean` | `false` | Whether the card should have hover/click effects. |
| `accent` | `'brand' \| 'success' \| 'danger' \| 'none'` | `'none'` | Color accent for the top border. |
| `class` | `string` | `""` | Additional custom CSS classes. |
| `onclick` | `function` | `undefined` | Callback for the click event (only if interactive). |
| `header` | `Snippet` | `undefined` | Content for the card header. |
| `body` | `Snippet` | `undefined` | Main content for the card body. |
| `footer` | `Snippet` | `undefined` | Content for the card footer. |
| `children` | `Snippet` | `undefined` | Direct children (if header/body/footer are not used). |

### Features
- **Flexible Layout:** Supports both structured (header/body/footer snippets) and free-form (children) content.
- **Interactive States:** Automatic handling of hover and active states for interactive cards.
- **Accessibility:** Role="button" and keyboard support when interactive.
- **Variants:** Easy switching between glassmorphism and solid styles.

### Example Usage
```svelte
<Card variant="glass" accent="brand" interactive onclick={() => console.log('Clicked')}>
  {#snippet header()}
    <h3 class="card-title">Project Alpha</h3>
  {/snippet}
  
  {#snippet body()}
    <p>Details about the project...</p>
  {/snippet}
  
  {#snippet footer()}
    <Button size="sm">Open</Button>
  {/snippet}
</Card>

<!-- Simple usage -->
<Card class="p-4">
  <p>Just some content here.</p>
</Card>
```
