<script>
    import { setContext } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {string} [defaultValue] - The value of the tab to select by default.
     * @property {string} [value] - The value of the currently selected tab (controlled).
     * @property {(value: string) => void} [onValueChange] - Callback called when the selected tab changes.
     * @property {'horizontal' | 'vertical'} [orientation='horizontal'] - The orientation of the tabs.
     * @property {'underline' | 'pill'} [variant='underline'] - The visual style of the tabs.
     * @property {import('svelte').Snippet} [children] - Tab components.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        defaultValue, 
        value = $bindable(), 
        onValueChange, 
        orientation = 'horizontal', 
        variant = 'underline',
        children,
        class: className = '',
        ...rest 
    } = $props();

    // Internal state if value is not provided
    let internalValue = $state('');
    
    // Derived current value
    const currentValue = $derived(value !== undefined ? value : internalValue);

    $effect.pre(() => {
        if (!internalValue && defaultValue) {
            internalValue = defaultValue;
        }
    });

    $effect(() => {
        if (value === undefined && defaultValue !== undefined && !internalValue) {
            internalValue = defaultValue;
        }
    });

    function selectTab(newValue) {
        if (value !== undefined) {
            value = newValue;
        } else {
            internalValue = newValue;
        }
        onValueChange?.(newValue);
    }

    // Set context for child components
    setContext('AEA_TABS', {
        get value() { return currentValue; },
        get orientation() { return orientation; },
        get variant() { return variant; },
        selectTab
    });
</script>

<div 
    class="aea-tabs {orientation} {className}" 
    data-orientation={orientation}
    data-variant={variant}
    {...rest}
>
    {@render children?.()}
</div>

<style>
    .aea-tabs {
        display: flex;
        width: 100%;
    }

    .aea-tabs.horizontal {
        flex-direction: column;
    }

    .aea-tabs.vertical {
        flex-direction: row;
    }
</style>
