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

