<script>
    /**
     * @typedef {Object} Props
     * @property {'default' | 'glass'} [variant='default'] - The visual style of the card background.
     * @property {boolean} [interactive=false] - Whether the card should have hover/click effects.
     * @property {'brand' | 'success' | 'danger' | 'info' | 'none'} [accent='none'] - Color accent for the top border.
     * @property {string} [class=""] - Additional custom CSS classes for the container.
     * @property {import('svelte/elements').MouseEventHandler<HTMLDivElement>} [onclick] - Callback for the click event.
     * @property {import('svelte/elements').MouseEventHandler<HTMLDivElement>} [oncontextmenu] - Callback for the context menu event.
     * @property {import('svelte').Snippet} [header] - Content for the card header.
     * @property {import('svelte').Snippet} [body] - Main content for the card body.
     * @property {import('svelte').Snippet} [footer] - Content for the card footer.
     * @property {import('svelte').Snippet} [children] - Direct children (if header/body/footer are not used).
     */

    /** @type {Props} */
    let {
        variant = 'default',
        interactive = false,
        accent = 'none',
        class: className = "",
        onclick,
        oncontextmenu,
        header,
        body,
        footer,
        children,
        ...rest
    } = $props();

    const accentClasses = {
        brand: 'card-accent-brand',
        success: 'card-accent-success',
        danger: 'card-accent-danger',
        info: 'card-accent-info',
        none: ''
    };

    function handleKeyDown(e) {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            onclick?.(event);
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
    class="card {variant === 'glass' ? 'card-glass' : ''} {interactive ? 'card-interactive' : ''} {accentClasses[accent]} {className}"
    role={interactive ? "button" : undefined}
    tabindex={interactive ? 0 : undefined}
    {onclick}
    {oncontextmenu}
    onkeydown={handleKeyDown}
    {...rest}
>
    {#if header}
        <div class="card-header">
            {@render header()}
        </div>
    {/if}

    {#if body}
        <div class="card-body">
            {@render body()}
        </div>
    {:else if children}
        <div class="card-body">
            {@render children()}
        </div>
    {/if}

    {#if footer}
        <div class="card-footer">
            {@render footer()}
        </div>
    {/if}
</div>


