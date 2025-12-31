<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    /**
     * @typedef {Object} Props
     * @property {string} [text] - Tooltip content text.
     * @property {'top' | 'bottom' | 'left' | 'right'} [position='top'] - Preferred position.
     * @property {number} [delay=200] - Delay in ms before showing.
     * @property {import('svelte').Snippet} [children] - Trigger element.
     * @property {import('svelte').Snippet} [content] - Custom content (replaces text).
     */

    /** @type {Props} */
    let { 
        text, 
        position = 'top', 
        delay = 200, 
        children,
        content,
        ...rest 
    } = $props();

    let visible = $state(false);
    let timeout;
    let triggerElement = $state();
    let tooltipElement = $state();
    let coords = $state({ x: 0, y: 0 });

    function show() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            visible = true;
            calculatePosition();
        }, delay);
    }

    function hide() {
        clearTimeout(timeout);
        visible = false;
    }

    function calculatePosition() {
        if (!triggerElement || !tooltipElement) return;

        const triggerRect = triggerElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let x = 0;
        let y = 0;
        const offset = 8;

        switch (position) {
            case 'top':
                x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                y = triggerRect.top - tooltipRect.height - offset;
                break;
            case 'bottom':
                x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                y = triggerRect.bottom + offset;
                break;
            case 'left':
                x = triggerRect.left - tooltipRect.width - offset;
                y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                break;
            case 'right':
                x = triggerRect.right + offset;
                y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                break;
        }

        coords = { x: x + scrollX, y: y + scrollY };
    }

    $effect(() => {
        if (visible) {
            calculatePosition();
            window.addEventListener('scroll', calculatePosition);
            window.addEventListener('resize', calculatePosition);
        } else {
            window.removeEventListener('scroll', calculatePosition);
            window.removeEventListener('resize', calculatePosition);
        }

        return () => {
            window.removeEventListener('scroll', calculatePosition);
            window.removeEventListener('resize', calculatePosition);
        };
    });
</script>

<div 
    bind:this={triggerElement}
    class="tooltip-trigger"
    onmouseenter={show}
    onmouseleave={hide}
    onfocusin={show}
    onfocusout={hide}
    role="none"
>
    {@render children?.()}

    {#if visible && (text || content)}
        <div 
            bind:this={tooltipElement}
            class="tooltip-content position-{position}"
            role="tooltip"
            transition:fade={{ duration: 150 }}
            style="left: {coords.x}px; top: {coords.y}px;"
        >
            {#if content}
                {@render content()}
            {:else}
                {text}
            {/if}
            <div class="tooltip-arrow"></div>
        </div>
    {/if}
</div>

<style>
    .tooltip-trigger {
        display: inline-block;
        position: relative;
    }

    .tooltip-content {
        position: fixed;
        z-index: 10000;
        padding: 0.5rem 0.75rem;
        background-color: hsla(var(--bg-100) / 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid hsla(var(--border-300) / 0.2);
        border-radius: 0.5rem;
        color: hsl(var(--text-100));
        font-family: 'ModernDense', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 4px 12px -2px rgba(0,0,0,0.4);
    }

    .tooltip-arrow {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: inherit;
        border: inherit;
        border-bottom: none;
        border-right: none;
    }

    .position-top .tooltip-arrow {
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(225deg);
    }

    .position-bottom .tooltip-arrow {
        top: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
    }

    .position-left .tooltip-arrow {
        right: -5px;
        top: 50%;
        transform: translateY(-50%) rotate(315deg);
    }

    .position-right .tooltip-arrow {
        left: -5px;
        top: 50%;
        transform: translateY(-50%) rotate(135deg);
    }
</style>
