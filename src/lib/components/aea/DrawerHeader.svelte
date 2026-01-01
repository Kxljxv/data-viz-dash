<script>
    import { getContext } from 'svelte';
    import { IconX } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {string} [title] - Drawer title.
     * @property {boolean} [showClose=true] - Whether to show close button.
     * @property {string} [class] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Optional title snippet.
     */

    /** @type {Props} */
    let { 
        title, 
        showClose = true, 
        class: className = '', 
        children,
        ...rest 
    } = $props();

    const { close } = getContext('aea-drawer');
</script>

<div class="aea-drawer-header {className}" {...rest}>
    <div class="aea-drawer-title-container">
        {#if title}
            <h3 class="aea-drawer-title">{title}</h3>
        {:else}
            {@render children?.()}
        {/if}
    </div>

    {#if showClose}
        <button 
            class="aea-drawer-close" 
            aria-label="Close drawer"
            onclick={close}
        >
            <IconX size={24} />
        </button>
    {/if}
</div>

<style>
    .aea-drawer-header {
        padding: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid hsla(var(--border-300) / 0.05);
    }

    .aea-drawer-title {
        font-family: 'Serif', serif;
        font-size: 1.5rem;
        color: hsl(var(--text-000));
        margin: 0;
    }

    .aea-drawer-close {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.75rem;
        color: hsl(var(--text-400));
        transition: all 0.2s;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
    }

    .aea-drawer-close:hover {
        background-color: hsla(var(--bg-200) / 0.5);
        color: hsl(var(--text-000));
    }
</style>
