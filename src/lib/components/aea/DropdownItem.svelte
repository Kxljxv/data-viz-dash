<script>
    /**
     * @typedef {Object} Props
     * @property {'default' | 'danger'} [variant='default'] - Visual style.
     * @property {boolean} [disabled=false] - Whether the item is interactive.
     * @property {() => void} [onclick] - Click handler.
     * @property {import('svelte').Snippet} [children] - Content.
     * @property {import('svelte').Snippet} [icon] - Leading icon.
     * @property {import('svelte').Snippet} [shortcut] - Keyboard shortcut label.
     */

    /** @type {Props} */
    let { 
        variant = 'default', 
        disabled = false, 
        onclick, 
        children,
        icon,
        shortcut,
        ...rest 
    } = $props();

    function handleClick(e) {
        if (disabled) return;
        onclick?.(e);
    }
</script>

<button 
    class="dropdown-item {variant === 'danger' ? 'dropdown-item-danger' : ''}"
    role="menuitem"
    {disabled}
    onclick={handleClick}
    {...rest}
>
    {#if icon}
        <span class="dropdown-icon">
            {@render icon()}
        </span>
    {/if}
    
    <span class="dropdown-label">
        {@render children?.()}
    </span>

    {#if shortcut}
        <span class="dropdown-shortcut">
            {@render shortcut()}
        </span>
    {/if}
</button>

<style>
    .dropdown-item {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0.625rem 0.75rem;
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
        color: hsl(var(--text-200));
        text-align: left;
        transition: all 0.2s ease;
        border-radius: 0.5rem;
        gap: 0.75rem;
        cursor: pointer;
        border: none;
        background: transparent;
        outline: none;
    }

    .dropdown-item:hover:not(:disabled) {
        background-color: hsla(var(--accent-brand) / 0.1);
        color: hsl(var(--accent-brand));
    }

    .dropdown-item:focus:not(:disabled) {
        background-color: hsla(var(--accent-brand) / 0.15);
        color: hsl(var(--accent-brand));
    }

    .dropdown-item:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .dropdown-item-danger:hover:not(:disabled) {
        background-color: hsla(var(--danger-100) / 0.1);
        color: hsl(var(--danger-100));
    }

    :global(.dropdown-icon) {
        width: 1rem;
        height: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: currentColor;
    }

    .dropdown-label {
        flex: 1;
    }

    .dropdown-shortcut {
        font-size: 0.75rem;
        font-weight: 700;
        color: hsl(var(--text-500));
        letter-spacing: 0.05em;
        margin-left: auto;
    }
</style>
