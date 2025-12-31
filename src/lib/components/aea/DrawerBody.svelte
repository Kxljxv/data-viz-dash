<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Content snippet.
     */

    /** @type {Props} */
    let { 
        class: className = '', 
        children,
        ...rest 
    } = $props();
</script>

<div class="aea-drawer-body {className} custom-scrollbar" {...rest}>
    {@render children?.()}
</div>

<style>
    .aea-drawer-body {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
    }
</style>
