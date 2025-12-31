<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} [children] - Tab panels.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { children, class: className = '', ...rest } = $props();
</script>

<div class="aea-tab-panels {className}" {...rest}>
    {@render children?.()}
</div>

<style>
    .aea-tab-panels {
        flex: 1;
        width: 100%;
    }
</style>
