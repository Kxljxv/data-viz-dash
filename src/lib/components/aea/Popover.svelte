<script>
    import { onMount, tick } from 'svelte';
    import { fade, scale } from 'svelte/transition';

    /**
     * @typedef {Object} Props
     * @property {'top' | 'bottom' | 'left' | 'right'} [position='top'] - Preferred position relative to trigger.
     * @property {boolean} [open] - Whether the popover is open (controlled).
     * @property {(open: boolean) => void} [onOpenChange] - Callback called when the open state changes.
     * @property {boolean} [showClose=true] - Whether to show the close button.
     * @property {import('svelte').Snippet<[any]>} trigger - Snippet for the trigger element.
     * @property {import('svelte').Snippet} [title] - Snippet for the popover title.
     * @property {import('svelte').Snippet} [footer] - Snippet for the popover footer.
     * @property {import('svelte').Snippet} [children] - The popover body content.
     * @property {string} [class] - Additional CSS classes for the popover.
     */

    /** @type {Props} */
    let { 
        position = 'top', 
        open = $bindable(false), 
        onOpenChange, 
        showClose = true,
        trigger,
        title,
        footer,
        children,
        class: className = '',
        ...rest 
    } = $props();

    let triggerElement = $state();
    let popoverElement = $state();
    let coords = $state({ x: 0, y: 0 });
    let currentPosition = $state('');

    $effect.pre(() => {
        if (!currentPosition) currentPosition = position;
    });

    $effect(() => {
        currentPosition = position;
    });

    async function toggleOpen(e) {
        if (e) {
            e.stopPropagation();
            if (!triggerElement) triggerElement = e.currentTarget;
        }
        open = !open;
        onOpenChange?.(open);
        if (open) {
            await tick();
            calculatePosition();
        }
    }

    function calculatePosition() {
        if (!triggerElement || !popoverElement) return;

        const triggerRect = triggerElement.getBoundingClientRect();
        const popoverRect = popoverElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let x = 0;
        let y = 0;
        const offset = 12;

        function getPosition(pos) {
            let tx = 0;
            let ty = 0;
            switch (pos) {
                case 'top':
                    tx = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
                    ty = triggerRect.top - popoverRect.height - offset;
                    break;
                case 'bottom':
                    tx = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
                    ty = triggerRect.bottom + offset;
                    break;
                case 'left':
                    tx = triggerRect.left - popoverRect.width - offset;
                    ty = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
                    break;
                case 'right':
                    tx = triggerRect.right + offset;
                    ty = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
                    break;
            }
            return { x: tx, y: ty };
        }

        let result = getPosition(position);
        currentPosition = position;

        // Auto-flip logic
        if (position === 'top' && result.y < 0) {
            result = getPosition('bottom');
            currentPosition = 'bottom';
        } else if (position === 'bottom' && result.y + popoverRect.height > viewportHeight) {
            result = getPosition('top');
            currentPosition = 'top';
        } else if (position === 'left' && result.x < 0) {
            result = getPosition('right');
            currentPosition = 'right';
        } else if (position === 'right' && result.x + popoverRect.width > viewportWidth) {
            result = getPosition('left');
            currentPosition = 'left';
        }

        // Viewport constraint
        result.x = Math.max(8, Math.min(result.x, viewportWidth - popoverRect.width - 8));
        result.y = Math.max(8, Math.min(result.y, viewportHeight - popoverRect.height - 8));

        coords = { x: result.x + scrollX, y: result.y + scrollY };
    }

    function handleOutsideClick(e) {
        if (open && popoverElement && !popoverElement.contains(e.target) && !triggerElement.contains(e.target)) {
            open = false;
            onOpenChange?.(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape' && open) {
            open = false;
            onOpenChange?.(false);
        }
    }

    $effect(() => {
        if (open) {
            window.addEventListener('mousedown', handleOutsideClick);
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('scroll', calculatePosition, { passive: true });
            window.addEventListener('resize', calculatePosition);
        } else {
            window.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', calculatePosition);
            window.removeEventListener('resize', calculatePosition);
        }

        return () => {
            window.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', calculatePosition);
            window.removeEventListener('resize', calculatePosition);
        };
    });
</script>

<div class="aea-popover-trigger-wrapper">
    {@render trigger({ onclick: toggleOpen })}
</div>

{#if open}
    <div 
        bind:this={popoverElement}
        class="aea-popover {className}" 
        style="left: {coords.x}px; top: {coords.y}px;"
        role="dialog"
        transition:scale={{ duration: 200, start: 0.95, opacity: 0 }}
        {...rest}
    >
        {#if title || showClose}
            <div class="aea-popover-header">
                <div class="aea-popover-title">
                    {#if title}
                        {@render title()}
                    {/if}
                </div>
                {#if showClose}
                    <button 
                        class="aea-popover-close" 
                        aria-label="Close"
                        onclick={() => { open = false; onOpenChange?.(false); }}
                    >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                {/if}
            </div>
        {/if}

        <div class="aea-popover-body">
            {@render children?.()}
        </div>

        {#if footer}
            <div class="aea-popover-footer">
                {@render footer()}
            </div>
        {/if}

        <div class="aea-popover-arrow position-{currentPosition}"></div>
    </div>
{/if}

<style>
    .aea-popover-trigger-wrapper {
        display: inline-block;
    }

    .aea-popover {
        position: absolute;
        width: 280px;
        background: hsla(var(--bg-100) / 0.8);
        backdrop-filter: blur(16px);
        border: 1px solid hsla(var(--border-300) / 0.2);
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        z-index: 2000;
        overflow: visible;
    }

    .aea-popover-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem 0.5rem;
        border-bottom: 1px solid hsla(var(--border-300) / 0.1);
    }

    .aea-popover-title {
        font-family: 'ModernDense', sans-serif;
        font-weight: 700;
        font-size: 0.9375rem;
        color: hsl(var(--text-100));
    }

    .aea-popover-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.375rem;
        background: transparent;
        border: none;
        color: hsl(var(--text-400));
        cursor: pointer;
        transition: all 0.2s;
    }

    .aea-popover-close:hover {
        background: hsla(var(--bg-200) / 0.5);
        color: hsl(var(--text-100));
    }

    .aea-popover-body {
        padding: 1rem 1.25rem;
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
        color: hsl(var(--text-300));
        line-height: 1.5;
    }

    .aea-popover-footer {
        padding: 0.75rem 1.25rem 1rem;
        border-top: 1px solid hsla(var(--border-300) / 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    .aea-popover-arrow {
        position: absolute;
        width: 12px;
        height: 12px;
        background: hsla(var(--bg-100) / 0.8);
        backdrop-filter: blur(16px);
        border: 1px solid hsla(var(--border-300) / 0.2);
        transform: rotate(45deg);
        z-index: -1;
    }

    .position-top {
        bottom: -7px;
        left: calc(50% - 6px);
        border-top: none;
        border-left: none;
    }

    .position-bottom {
        top: -7px;
        left: calc(50% - 6px);
        border-bottom: none;
        border-right: none;
    }

    .position-left {
        right: -7px;
        top: calc(50% - 6px);
        border-bottom: none;
        border-left: none;
    }

    .position-right {
        left: -7px;
        top: calc(50% - 6px);
        border-top: none;
        border-right: none;
    }
</style>
