<script>
    import { getContext } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {string} value - The unique value associated with this tab.
     * @property {boolean} [disabled=false] - Whether the tab is disabled.
     * @property {import('svelte').Snippet} [children] - Tab label/content.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        value, 
        disabled = false, 
        children, 
        class: className = '', 
        ...rest 
    } = $props();

    const context = getContext('AEA_TABS');
    if (!context) {
        throw new Error('Tab must be used within a Tabs component');
    }

    const { selectTab, orientation, variant } = context;
    const isActive = $derived(context.value === value);

    function handleClick() {
        if (!disabled) {
            selectTab(value);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }
</script>

<button 
    class="tab-trigger {isActive ? 'active' : ''} {variant} {orientation} {className}" 
    role="tab"
    aria-selected={isActive}
    aria-disabled={disabled}
    data-state={isActive ? 'active' : 'inactive'}
    tabindex={isActive ? 0 : -1}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    {disabled}
    {...rest}
>
    {@render children?.()}
</button>

<style>
    .tab-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: hsl(var(--text-400));
        transition: all 0.2s ease;
        position: relative;
        background: transparent;
        border: none;
        cursor: pointer;
        white-space: nowrap;
    }

    .tab-trigger:hover:not(:disabled) {
        color: hsl(var(--text-100));
    }

    .tab-trigger.active {
        color: hsl(var(--text-100));
    }

    /* Underline variant */
    .tab-trigger.underline::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background: hsl(var(--text-100));
        transform: scaleX(0);
        transition: transform 0.2s ease;
    }

    .tab-trigger.underline.active::after {
        transform: scaleX(1);
    }

    .tab-trigger.underline.vertical::after {
        bottom: 0;
        right: -2px;
        left: auto;
        width: 2px;
        height: 100%;
        transform: scaleY(0);
    }

    .tab-trigger.underline.vertical.active::after {
        transform: scaleY(1);
    }

    /* Pill variant */
    .tab-trigger.pill {
        border-radius: 9999px;
        padding: 0.5rem 1rem;
    }

    .tab-trigger.pill.active {
        background: hsla(var(--bg-100) / 0.5);
        box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.2);
        backdrop-filter: blur(4px);
        border: 1px solid hsla(var(--border-300) / 0.1);
    }

    .tab-trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
