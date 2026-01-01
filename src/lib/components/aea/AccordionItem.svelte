<script>
    import { getContext, onMount } from 'svelte';
    import { IconChevronDown } from "@tabler/icons-svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [open=false] - Whether the section is expanded (bindable).
     * @property {string} [title] - Header title.
     * @property {boolean} [disabled=false] - Prevents interaction.
     * @property {import('svelte').Snippet} [children] - Content.
     * @property {import('svelte').Snippet} [header] - Custom header content (replaces title).
     * @property {string} [class=''] - Additional classes.
     */

    /** @type {Props} */
    let { 
        open = $bindable(false), 
        title, 
        disabled = false, 
        children,
        header,
        class: className = '',
        ...rest 
    } = $props();

    const id = Math.random().toString(36).substring(2, 9);
    const accordion = getContext('accordion');

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

<div class="accordion-item {open ? 'is-open' : ''} {disabled ? 'is-disabled' : ''} {className}" {...rest}>
    <button 
        class="accordion-header"
        type="button"
        aria-expanded={open}
        aria-controls="panel-{id}"
        id="header-{id}"
        onclick={toggle}
        {disabled}
    >
        <div class="header-content">
            {#if header}
                {@render header()}
            {:else}
                <span class="header-title">{title}</span>
            {/if}
        </div>
        
        <IconChevronDown 
            size={16}
            class="chevron-icon {open ? 'rotated' : ''}" 
        />
    </button>

    <div 
        class="accordion-panel"
        id="panel-{id}"
        role="region"
        aria-labelledby="header-{id}"
        style="grid-template-rows: {open ? '1fr' : '0fr'}; opacity: {open ? '1' : '0'};"
    >
        <div class="panel-inner">
            <div class="panel-content">
                {@render children?.()}
            </div>
        </div>
    </div>
</div>

<style>
    .accordion-item {
        background-color: hsla(var(--bg-100) / 0.4);
        border: 1px solid hsla(var(--border-300) / 0.1);
        border-radius: 1rem;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    .accordion-item:hover:not(.is-disabled) {
        background-color: hsla(var(--bg-100) / 0.6);
        border-color: hsla(var(--border-300) / 0.2);
        transform: translateY(-1px);
    }

    .accordion-item.is-open {
        background-color: hsla(var(--bg-100) / 0.8);
        border-color: hsla(var(--accent-brand) / 0.3);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .accordion-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
    }

    .header-title {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: hsl(var(--text-200));
        transition: color 0.2s ease;
    }

    .accordion-item.is-open .header-title {
        color: hsl(var(--text-100));
    }

    .chevron-icon {
        width: 1rem;
        height: 1rem;
        color: hsl(var(--text-400));
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .chevron-icon.rotated {
        transform: rotate(180deg);
        color: hsl(var(--accent-brand));
    }

    .accordion-panel {
        display: grid;
        transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    }

    .panel-inner {
        overflow: hidden;
    }

    .panel-content {
        padding: 0 1.5rem 1.5rem 1.5rem;
        color: hsl(var(--text-300));
        font-size: 0.875rem;
        line-height: 1.6;
    }

    .is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .is-disabled .accordion-header {
        cursor: not-allowed;
    }
</style>
