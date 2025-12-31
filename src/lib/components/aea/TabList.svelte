<script>
    import { getContext } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} [children] - Tab triggers.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { children, class: className = '', ...rest } = $props();

    const context = getContext('AEA_TABS');
    if (!context) {
        throw new Error('TabList must be used within a Tabs component');
    }

    const { orientation, variant } = context;
</script>

<nav 
    class="tabs-container {variant === 'pill' ? 'tabs-pills' : ''} {orientation} {className}" 
    role="tablist"
    aria-orientation={orientation}
    {...rest}
>
    {@render children?.()}
</nav>

<style>
    .tabs-container {
        display: flex;
        position: relative;
        border-bottom: 1px solid hsla(var(--border-300) / 0.1);
        padding-bottom: 2px;
    }

    .tabs-container.vertical {
        flex-direction: column;
        border-bottom: none;
        border-right: 1px solid hsla(var(--border-300) / 0.1);
        padding-bottom: 0;
        padding-right: 2px;
    }

    /* Pill variant adjustments */
    .tabs-container.tabs-pills {
        border-bottom: none;
        gap: 0.5rem;
        background: hsla(var(--bg-100) / 0.3);
        backdrop-filter: blur(10px);
        padding: 0.4rem;
        border-radius: 9999px;
        width: fit-content;
    }

    .tabs-container.tabs-pills.vertical {
        border-right: none;
        border-radius: 1rem;
    }
</style>
