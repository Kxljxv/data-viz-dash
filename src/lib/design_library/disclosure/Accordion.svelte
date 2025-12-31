<script lang="ts">
    import { setContext } from 'svelte';

    interface Props {
        allowMultiple?: boolean;
        variant?: 'standard' | 'flush';
        class?: string;
        children?: import('svelte').Snippet;
        [key: string]: any;
    }

    let { 
        allowMultiple = false, 
        variant = 'standard',
        class: className = '', 
        children,
        ...rest 
    } = $props();

    // Track which item is open (if not allowMultiple)
    let activeId = $state<string | null>(null);

    setContext('accordion', {
        get allowMultiple() { return allowMultiple; },
        activeId: () => activeId,
        setActive: (id: string | null) => activeId = id
    });
</script>

<div 
    class="accordion-group {variant === 'flush' ? 'accordion-flush' : ''} {className}" 
    {...rest}
>
    {@render children?.()}
</div>
