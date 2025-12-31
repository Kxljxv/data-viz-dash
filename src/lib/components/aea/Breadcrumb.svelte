<script>
    /**
     * @typedef {Object} Props
     * @property {string} [ariaLabel='Breadcrumb'] - Accessibility label for the navigation.
     * @property {string} [class] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Breadcrumb items.
     */

    /** @type {Props} */
    let { 
        ariaLabel = 'Breadcrumb', 
        class: className = '', 
        children,
        ...rest 
    } = $props();
</script>

<nav aria-label={ariaLabel} class={className} {...rest}>
    <ol class="aea-breadcrumb">
        {@render children?.()}
    </ol>
</nav>

<style>
    .aea-breadcrumb {
        display: flex;
        flex-wrap: wrap;
        padding: 0.5rem 0;
        margin-bottom: 1rem;
        list-style: none;
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
    }

    :global(.aea-breadcrumb-item) {
        display: flex;
        align-items: center;
        color: hsl(var(--text-400));
    }

    :global(.aea-breadcrumb-item + .aea-breadcrumb-item) {
        padding-left: 0.75rem;
    }

    :global(.aea-breadcrumb-item + .aea-breadcrumb-item::before) {
        display: inline-block;
        padding-right: 0.75rem;
        color: hsla(var(--text-500) / 0.5);
        content: "/";
    }
</style>
