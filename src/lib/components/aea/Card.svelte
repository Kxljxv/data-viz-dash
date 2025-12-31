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

<style>
    .card {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: hsl(var(--bg-100));
        background-clip: border-box;
        border: 1px solid hsla(var(--border-300) / 0.1);
        border-radius: 1.5rem; /* rounded-2xl */
        overflow: hidden;
        color: hsl(var(--text-200));
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .card-glass {
        background-color: hsla(var(--bg-100) / 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-color: hsla(var(--border-300) / 0.2);
        box-shadow: 
            0 10px 15px -3px rgba(0, 0, 0, 0.1), 
            0 4px 6px -2px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 0 hsla(var(--always-white) / 0.05);
    }

    .card-interactive {
        cursor: pointer;
    }

    .card-interactive:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: hsla(var(--border-300) / 0.3);
    }

    .card-interactive:active {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .card-header {
        padding: 1.5rem;
        margin-bottom: 0;
        background-color: transparent;
        border-bottom: 1px solid hsla(var(--border-300) / 0.1);
        font-family: 'ModernDense', sans-serif;
        font-weight: 700;
        letter-spacing: 0.025em;
    }

    .card-body {
        flex: 1 1 auto;
        padding: 1.5rem;
    }

    .card-footer {
        padding: 1.25rem 1.5rem;
        background-color: hsla(var(--bg-200) / 0.3);
        border-top: 1px solid hsla(var(--border-300) / 0.1);
    }

    /* Accent borders */
    .card-accent-brand { border-top: 4px solid hsl(var(--accent-brand)); }
    .card-accent-success { border-top: 4px solid hsl(var(--accent-success)); }
    .card-accent-danger { border-top: 4px solid hsl(var(--accent-danger)); }
    .card-accent-info { border-top: 4px solid hsl(var(--accent-info)); }
</style>
