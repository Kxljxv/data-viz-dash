<script>
    /**
     * @typedef {Object} Props
     * @property {boolean} [glass=false] - Whether to use glassmorphism effect
     * @property {boolean} [interactive=false] - Whether the card should have hover effects
     * @property {string} [accent] - Top border accent color ('brand', 'success', 'danger', 'info')
     * @property {string} [class=''] - Additional CSS classes
     * @property {import('svelte').Snippet} [header] - Card header content
     * @property {import('svelte').Snippet} [children] - Card body content
     * @property {import('svelte').Snippet} [footer] - Card footer content
     */

    let {
        glass = false,
        interactive = false,
        accent,
        class: className = '',
        header,
        children,
        footer,
        ...rest
    } = $props();

    const accents = {
        brand: 'card-accent-brand',
        success: 'card-accent-success',
        danger: 'card-accent-danger',
        info: 'card-accent-info'
    };
</script>

<div 
    class="card {glass ? 'card-glass' : ''} {interactive ? 'card-interactive' : ''} {accent ? accents[accent] : ''} {className}"
    {...rest}
>
    {#if header}
        <div class="card-header">
            {@render header()}
        </div>
    {/if}

    <div class="card-body">
        {#if children}
            {@render children()}
        {/if}
    </div>

    {#if footer}
        <div class="card-footer">
            {@render footer()}
        </div>
    {/if}
</div>
