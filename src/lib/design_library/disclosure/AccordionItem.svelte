<script lang="ts">
    import { getContext, onMount } from 'svelte';

    interface Props {
        open?: boolean;
        title?: string;
        disabled?: boolean;
        class?: string;
        children?: import('svelte').Snippet;
        icon?: import('svelte').Snippet;
        header?: import('svelte').Snippet;
        [key: string]: any;
    }

    let { 
        open = $bindable(false), 
        title, 
        disabled = false, 
        class: className = '',
        children,
        icon,
        header,
        ...rest 
    } = $props();

    const id = Math.random().toString(36).substring(2, 9);
    const accordion = getContext<any>('accordion');

    function toggle() {
        if (disabled) return;
        
        if (accordion && !accordion.allowMultiple) {
            if (open) {
                accordion.setActive(null);
                open = false;
            } else {
                accordion.setActive(id);
                open = true;
            }
        } else {
            open = !open;
        }
    }

    $effect(() => {
        if (accordion && !accordion.allowMultiple) {
            if (accordion.activeId() === id) {
                open = true;
            } else if (open && accordion.activeId() !== id) {
                open = false;
            }
        }
    });

    onMount(() => {
        if (open && accordion && !accordion.allowMultiple) {
            accordion.setActive(id);
        }
    });
</script>

<div 
    class="accordion-item {open ? 'active' : ''} {disabled ? 'opacity-50 pointer-events-none' : ''} {className}" 
    {id}
    {...rest}
>
    <button 
        class="accordion-header" 
        type="button"
        aria-expanded={open} 
        onclick={toggle}
        {disabled}
    >
        <span class="accordion-title">
            {#if header}
                {@render header()}
            {:else}
                {#if icon}
                    {@render icon()}
                {/if}
                {title}
            {/if}
        </span>
        <svg class="accordion-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
    </button>
    <div class="accordion-content-wrapper">
        <div class="accordion-content">
            <div class="accordion-body">
                {@render children?.()}
            </div>
        </div>
    </div>
</div>
