<script>
    /**
     * @typedef {Object} Props
     * @property {boolean} open - Whether the drawer is open
     * @property {'left' | 'right'} [side='right'] - Which side the drawer opens from
     * @property {string} [title] - Drawer title
     * @property {string} [class=''] - Additional CSS classes for the drawer
     * @property {() => void} [onclose] - Callback when the drawer wants to close
     * @property {import('svelte').Snippet} [header] - Custom header snippet
     * @property {import('svelte').Snippet} [children] - Drawer body content
     * @property {import('svelte').Snippet} [footer] - Drawer footer content
     */

    let {
        open = $bindable(false),
        side = 'right',
        title = '',
        class: className = '',
        onclose,
        header,
        children,
        footer
    } = $props();

    function close() {
        open = false;
        if (onclose) onclose();
    }

    function handleKeydown(event) {
        if (event.key === 'Escape' && open) {
            close();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div 
    class="drawer-backdrop {open ? 'active' : ''}" 
    onclick={close}
    onkeydown={(e) => e.key === 'Enter' && close()}
    role="button"
    tabindex="-1"
    aria-label="Close drawer"
></div>

<!-- Drawer -->
<div 
    class="drawer {side === 'left' ? 'drawer-left' : 'drawer-right'} {open ? 'active' : ''} {className}"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "drawer-title" : undefined}
>
    <div class="drawer-header">
        {#if header}
            {@render header()}
        {:else}
            <h2 id="drawer-title" class="drawer-title">{title}</h2>
            <button 
                type="button" 
                class="btn-close" 
                onclick={close}
                aria-label="Close"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="15" y1="5" x2="5" y2="15"></line>
                    <line x1="5" y1="5" x2="15" y2="15"></line>
                </svg>
            </button>
        {/if}
    </div>

    <div class="drawer-body custom-scrollbar">
        {#if children}
            {@render children()}
        {/if}
    </div>

    {#if footer}
        <div class="drawer-footer">
            {@render footer()}
        </div>
    {/if}
</div>
