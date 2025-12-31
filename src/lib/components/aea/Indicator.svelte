<script>
    /**
     * @typedef {Object} Props
     * @property {'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'} [variant='brand'] - The visual style of the indicator.
     * @property {'sm' | 'md' | 'lg' | 'xl'} [size='md'] - The size of the indicator.
     * @property {boolean} [pulse=false] - Whether the indicator should have a pulsing animation.
     * @property {string} [title] - Tooltip title/accessibility label.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        variant = 'brand', 
        size = 'md', 
        pulse = false, 
        title,
        class: className = '',
        ...rest 
    } = $props();
</script>

<div 
    class="aea-indicator {size} {variant} {className}" 
    role="status"
    aria-label={title}
    {title}
    {...rest}
>
    <span class="indicator-dot"></span>
    {#if pulse}
        <span class="indicator-pulse"></span>
    {/if}
</div>

<style>
    .aea-indicator {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .indicator-dot {
        border-radius: 9999px;
        width: 100%;
        height: 100%;
        background-color: currentColor;
        z-index: 1;
    }

    .indicator-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 9999px;
        background-color: currentColor;
        opacity: 0.75;
        animation: aea-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes aea-pulse {
        0% {
            transform: scale(1);
            opacity: 0.75;
        }
        70%, 100% {
            transform: scale(2.5);
            opacity: 0;
        }
    }

    /* Sizes */
    .sm { width: 0.375rem; height: 0.375rem; }
    .md { width: 0.625rem; height: 0.625rem; }
    .lg { width: 0.875rem; height: 0.875rem; }
    .xl { width: 1.25rem; height: 1.25rem; }

    /* Variants */
    .brand { color: hsl(var(--accent-brand)); }
    .success { color: hsl(var(--success-100)); }
    .warning { color: hsl(var(--accent-brand)); }
    .danger { color: hsl(var(--danger-100)); }
    .info { color: hsl(var(--accent-secondary-100)); }
    .neutral { color: hsl(var(--text-400)); }

    @media (prefers-reduced-motion: reduce) {
        .indicator-pulse {
            animation: none;
            display: none;
        }
    }
</style>
