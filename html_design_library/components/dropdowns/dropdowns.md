# Dropdown & Context Menu Component (Svelte)

The `Dropdown` component provides high-performance overlay menus for actions and context-specific operations, supporting both triggered dropdowns and right-click context menus.

## Usage

### Standard Dropdown
```svelte
<script>
    import Dropdown from './Dropdown.svelte';
    import DropdownItem from './DropdownItem.svelte';
    import Button from './Button.svelte';
    
    let isOpen = $state(false);
</script>

<div class="relative">
    <Button onclick={() => isOpen = !isOpen}>
        Actions
    </Button>
    
    <Dropdown bind:open={isOpen} placement="bottom-start">
        <DropdownItem onclick={() => console.log('Profile')}>
            Profile Settings
            <span slot="shortcut">⌘P</span>
        </DropdownItem>
        <DropdownItem onclick={() => console.log('Log')}>
            Activity Log
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem variant="danger" onclick={() => console.log('Logout')}>
            Logout
        </DropdownItem>
    </Dropdown>
</div>
```

### Context Menu
```svelte
<script>
    import Dropdown from './Dropdown.svelte';
    
    let contextMenu = $state({ open: false, x: 0, y: 0 });
    
    function handleContextMenu(e) {
        e.preventDefault();
        contextMenu = { open: true, x: e.clientX, y: e.clientY };
    }
</script>

<div oncontextmenu={handleContextMenu}>
    Right-click here
</div>

<Dropdown 
    bind:open={contextMenu.open} 
    isContextMenu 
    x={contextMenu.x} 
    y={contextMenu.y}
>
    <DropdownItem>View Details</DropdownItem>
    <DropdownItem>Copy ID</DropdownItem>
</Dropdown>
```

## Properties

### Dropdown
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Whether the menu is visible (bindable). |
| `placement` | `'bottom-start' \| 'bottom-end' \| 'right-start'` | `'bottom-start'` | Preferred placement relative to parent. |
| `isContextMenu` | `boolean` | `false` | If true, positions at `x` and `y` coordinates. |
| `x` | `number` | `0` | X coordinate for context menu. |
| `y` | `number` | `0` | Y coordinate for context menu. |

### DropdownItem
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' \| 'danger'` | `'default'` | Visual style of the item. |
| `disabled` | `boolean` | `false` | Whether the item is interactive. |
| `onclick` | `() => void` | `undefined` | Click handler. |

## Technical Implementation

- **Positioning**: Uses absolute positioning with smart boundary detection.
- **Accessibility**: Implements `role="menu"` and `role="menuitem"`, handles Escape key and arrow navigation.
- **Portaling**: Recommended to use with a portal strategy if nested in overflow-hidden containers (not included in base component for simplicity).
- **Svelte 5 Runes**: Uses `$state`, `$props`, `$effect`, and `$derived`.
