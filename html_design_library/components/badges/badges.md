# Badge Component (Svelte)

The `Badge` component provides small status indicators and metadata labels, following the Cyberpunk-Lite aesthetic of the AEA design system.

## Usage

```svelte
<script>
    import Badge from './Badge.svelte';
</script>

<Badge variant="brand">Brand</Badge>
<Badge variant="success" pill>Success</Badge>
<Badge variant="danger" outline>Danger</Badge>
<Badge variant="info" soft>Soft Info</Badge>
```

## Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'brand' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'neutral'` | The color variant of the badge. |
| `pill` | `boolean` | `false` | If true, the badge will have fully rounded corners. |
| `outline` | `boolean` | `false` | If true, the badge will have an outline style. |
| `soft` | `boolean` | `false` | If true, the badge will have a glassmorphic/soft style. |
| `class` | `string` | `''` | Additional CSS classes. |

## Variants

### Solid
The default solid background style.

### Outline
A style with a border and transparent background. Use the `outline` prop.

### Soft (Glassmorphic)
A semi-transparent background style recommended for the Cyberpunk-Lite look. Use the `soft` prop.

### Pill
Fully rounded corners. Use the `pill` prop.

## Technical Implementation

Implemented with Svelte 5 runes (`$props`).

```svelte
<script>
    let { 
        variant = 'neutral', 
        pill = false, 
        outline = false, 
        soft = false, 
        children,
        class: className = '',
        ...rest 
    } = $props();
</script>
```
