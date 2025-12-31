<script>
    /**
     * @typedef {Object} Props
     * @property {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [variant='primary'] - The visual style of the button.
     * @property {'sm' | 'md' | 'lg'} [size='md'] - The size of the button.
     * @property {'button' | 'submit' | 'reset'} [type='button'] - The HTML button type.
     * @property {boolean} [disabled=false] - Whether the button is interactive.
     * @property {boolean} [loading=false] - Shows a loading spinner and disables the button.
     * @property {string} [class=""] - Additional custom CSS classes.
     * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} [onclick] - Callback for the click event.
     * @property {import('svelte').Snippet} [children] - The button content.
     */

    /** @type {Props} */
    let {
        variant = 'primary',
        size = 'md',
        type = 'button',
        disabled = false,
        loading = false,
        class: className = '',
        onclick,
        children,
        ...rest
    } = $props();

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        danger: 'btn-danger'
    };

    const sizeClasses = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg'
    };
</script>

<button
    {type}
    class="btn-base {variantClasses[variant]} {sizeClasses[size]} {className}"
    disabled={disabled || loading}
    aria-disabled={disabled || loading}
    {onclick}
    {...rest}
>
    {#if loading}
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    {/if}
    {@render children?.()}
</button>

<style>
    /* 
       Styles are primarily managed by global CSS classes defined in design_library/style.css.
       We use the global classes here to ensure exact replication of the design system.
    */
    
    :global(.btn-base) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: 'ModernDense', sans-serif;
        font-weight: 500;
        letter-spacing: 0.05em;
        border-radius: 0.75rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        gap: 0.5rem;
        border: 1px solid transparent;
    }

    :global(.btn-primary) {
        background-color: hsl(var(--accent-brand));
        color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    :global(.btn-primary:hover:not(:disabled)) {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    :global(.btn-primary:active:not(:disabled)) {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    :global(.btn-secondary) {
        background-color: hsl(var(--bg-200));
        color: hsl(var(--text-200));
        border-color: hsla(var(--border-300) / 0.1);
    }
    :global(.btn-secondary:hover:not(:disabled)) {
        background-color: hsl(var(--bg-300));
        color: hsl(var(--text-000));
        border-color: hsla(var(--border-300) / 0.3);
    }

    :global(.btn-outline) {
        background-color: transparent;
        border: 1px solid hsla(var(--text-500) / 0.3);
        color: hsl(var(--text-200));
    }
    :global(.btn-outline:hover:not(:disabled)) {
        background-color: hsla(var(--bg-200) / 0.05);
        border-color: hsla(var(--text-200) / 0.4);
        color: hsl(var(--text-000));
    }

    :global(.btn-ghost) {
        background-color: transparent;
        color: hsl(var(--text-500));
    }
    :global(.btn-ghost:hover:not(:disabled)) {
        background-color: hsla(var(--bg-200) / 0.5);
        color: hsl(var(--text-200));
    }

    :global(.btn-danger) {
        background-color: transparent;
        color: hsl(var(--danger-100));
        border: 1px solid hsla(var(--danger-100) / 0.3);
    }
    :global(.btn-danger:hover:not(:disabled)) {
        background-color: hsl(var(--accent-danger));
        color: white;
        transform: translateY(-2px);
    }

    :global(.btn-sm) { padding: 0.375rem 0.75rem; font-size: 0.625rem; }
    :global(.btn-md) { padding: 0.625rem 1.25rem; font-size: 0.75rem; }
    :global(.btn-lg) { padding: 0.875rem 1.75rem; font-size: 0.875rem; }

    :global(.btn-base:disabled) {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
</style>
