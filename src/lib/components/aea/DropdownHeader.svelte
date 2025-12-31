<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} [children] - Header text.
     */

    /** @type {Props} */
    let { children } = $props();
</script>

<div class="dropdown-header">
    {@render children?.()}
</div>

<style>
    .dropdown-header {
        padding: 0.5rem 0.75rem 0.25rem;
        font-family: 'ModernDense', sans-serif;
        font-size: 0.65rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: hsl(var(--text-500));
    }
</style>
