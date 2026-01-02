<script>
    import { IconLoader2 } from '@tabler/icons-svelte';
    /**
     * @typedef {Object} Props
     * @property {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [variant='primary'] - The visual style of the button.
     * @property {'sm' | 'md' | 'lg'} [size='md'] - The size of the button.
     * @property {'button' | 'submit' | 'reset'} [type='button'] - The HTML button type.
     * @property {boolean} [disabled=false] - Whether the button is interactive.
     * @property {boolean} [loading=false] - Shows a loading spinner and disables the button.
     * @property {string} [class=""] - Additional custom CSS classes.
     * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} [onclick] - Callback for the click event.
     * @property {import('svelte').Snippet} [icon] - An optional icon snippet.
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
        icon: IconProp,
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
        <IconLoader2 class="animate-spin -ml-1 mr-3 h-4 w-4" />
    {:else}
        {#if IconProp}
            {#if typeof IconProp === 'function' && !IconProp.prototype}
                {@render IconProp()}
            {:else}
                <IconProp class="-ml-1 mr-2 h-4 w-4" />
            {/if}
        {/if}
        {@render children?.()}
    {/if}
</button>

