<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Footer content.
     */

    /** @type {Props} */
    let { 
        class: className = '', 
        children,
        ...rest 
    } = $props();
</script>

<div class="aea-drawer-footer {className}" {...rest}>
    {@render children?.()}
</div>

<style>
    .aea-drawer-footer {
        padding: 1.5rem;
        border-top: 1px solid hsla(var(--border-300) / 0.05);
        background-color: hsla(var(--bg-300) / 0.3);
    }
</style>
