<script>
    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    /**
     * @typedef {Object} Props
     * @property {string} value - The value of the tab this panel belongs to.
     * @property {import('svelte').Snippet} [children] - Panel content.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { value, children, class: className = '', ...rest } = $props();

    const context = getContext('AEA_TABS');
    if (!context) {
        throw new Error('TabPanel must be used within a Tabs component');
    }

    const { value: selectedValue } = context;
    const isActive = $derived(selectedValue === value);
</script>

{#if isActive}
    <div 
        class="tab-panel active {className}" 
        role="tabpanel"
        tabindex="0"
        transition:fade={{ duration: 150 }}
        {...rest}
    >
        {@render children?.()}
    </div>
{/if}

<style>
    .tab-panel {
        padding: 1rem 0;
        outline: none;
    }
</style>
