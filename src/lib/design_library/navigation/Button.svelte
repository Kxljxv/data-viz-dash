<script>
    /**
     * @typedef {Object} Props
     * @property {string} [variant='primary'] - Button variant ('primary', 'secondary', 'outline', 'ghost', 'danger')
     * @property {string} [size='md'] - Button size ('sm', 'md', 'lg')
     * @property {boolean} [disabled=false] - Whether the button is disabled
     * @property {string} [type='button'] - HTML button type
     * @property {string} [class=''] - Additional CSS classes
     * @property {import('svelte').Snippet} [children] - Button content
     * @property {() => void} [onclick] - Click handler
     */

    let { 
        variant = 'primary', 
        size = 'md', 
        disabled = false, 
        type = 'button',
        class: className = '',
        children,
        onclick,
        ...rest
    } = $props();

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        danger: 'btn-danger'
    };

    const sizes = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg'
    };
</script>

<button
    {type}
    {disabled}
    class="btn-base {variants[variant]} {sizes[size]} {className}"
    {onclick}
    {...rest}
>
    {#if children}
        {@render children()}
    {/if}
</button>

<style>
    /* Styles are assumed to be provided by the design library's global CSS, 
       but we can also include component-specific styles here if needed. 
       For now, we rely on the global classes defined in style.css. */
</style>
