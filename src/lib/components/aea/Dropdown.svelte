<script>
    import { onMount } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {boolean} [open=false] - Whether the menu is visible (bindable).
     * @property {'bottom-start' | 'bottom-end' | 'right-start'} [placement='bottom-start'] - Preferred placement relative to parent.
     * @property {boolean} [isContextMenu=false] - If true, positions at x and y coordinates.
     * @property {number} [x=0] - X coordinate for context menu.
     * @property {number} [y=0] - Y coordinate for context menu.
     * @property {import('svelte').Snippet} [children] - Menu items.
     * @property {string} [class=''] - Additional classes.
     */

    /** @type {Props} */
    let { 
        open = $bindable(false), 
        placement = 'bottom-start',
        isContextMenu = false,
        x = 0,
        y = 0,
        children,
        class: className = '',
        ...rest 
    } = $props();

    let menuElement = $state();
    let containerElement = $state();

    function close() {
        open = false;
    }

    function handleKeyDown(e) {
        if (!open) return;

        if (e.key === 'Escape') {
            close();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            handleArrowNavigation(e);
        } else if (e.key === 'Tab') {
            close();
        }
    }

    function handleArrowNavigation(e) {
        if (!menuElement) return;
        const items = Array.from(menuElement.querySelectorAll('.dropdown-item:not([disabled])'));
        const currentIndex = items.indexOf(document.activeElement);
        
        if (e.key === 'ArrowDown') {
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex].focus();
            e.preventDefault();
        }
    }

    function handleClickOutside(e) {
        if (open && containerElement && !containerElement.contains(e.target)) {
            close();
        }
    }

    $effect(() => {
        if (open) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('mousedown', handleClickOutside);
            
            // Auto-focus first item
            setTimeout(() => {
                const firstItem = menuElement?.querySelector('.dropdown-item:not([disabled])');
                if (firstItem) firstItem.focus();
            }, 50);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    });

    const positionStyles = $derived.by(() => {
        if (!open) return 'display: none;';
        
        if (isContextMenu) {
            return `position: fixed; left: ${x}px; top: ${y}px; z-index: 9999;`;
        }

        // For standard dropdowns, we assume it's relative to a trigger container
        // This is a simplified version of the logic in script.js
        switch (placement) {
            case 'bottom-start': return 'top: 100%; left: 0; margin-top: 0.5rem;';
            case 'bottom-end': return 'top: 100%; right: 0; margin-top: 0.5rem;';
            case 'right-start': return 'top: 0; left: 100%; margin-left: 0.5rem;';
            default: return 'top: 100%; left: 0; margin-top: 0.5rem;';
        }
    });
</script>

<div 
    bind:this={containerElement}
    class="dropdown-container {isContextMenu ? 'context-mode' : ''}"
>
    <div 
        bind:this={menuElement}
        class="dropdown-menu {open ? 'active' : ''} {className}"
        role="menu"
        aria-expanded={open}
        style={positionStyles}
        {...rest}
    >
        {@render children?.()}
    </div>
</div>

<style>
    .dropdown-container {
        display: inline-block;
        position: relative;
    }

    .dropdown-container.context-mode {
        position: static;
    }

    .dropdown-menu {
        min-width: 12rem;
        padding: 0.5rem;
        background-color: hsla(var(--bg-100) / 0.85);
        backdrop-filter: blur(24px);
        border: 1px solid hsla(var(--border-300) / 0.15);
        border-radius: 1rem;
        box-shadow: 0 10px 30px -5px rgba(0,0,0,0.5), 
                    0 0 20px -5px hsla(var(--accent-brand) / 0.1);
        z-index: 50;
        opacity: 0;
        transform: scale(0.95);
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        position: absolute;
    }

    .dropdown-menu.active {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
    }
</style>
