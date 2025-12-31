<script>
    import { setContext } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {boolean} [allowMultiple=false] - If true, multiple sections can be open at once.
     * @property {import('svelte').Snippet} [children] - Accordion items.
     * @property {string} [class=''] - Additional classes.
     */

    /** @type {Props} */
    let { allowMultiple = false, children, class: className = '', ...rest } = $props();

    // Track which item is open (if not allowMultiple)
    let activeId = $state(null);

    setContext('accordion', {
        get allowMultiple() { return allowMultiple; },
        activeId: () => activeId,
        setActive: (id) => activeId = id
    });
</script>

<div class="aea-accordion {className}" {...rest}>
    {@render children?.()}
</div>

<style>
    .aea-accordion {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }
</style>
