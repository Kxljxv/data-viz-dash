<script>
    /**
     * @typedef {Object} Props
     * @property {number} [value=0] - The current progress value (0-100).
     * @property {number} [max=100] - The maximum progress value.
     * @property {'brand' | 'success' | 'warning' | 'danger' | 'info'} [variant='brand'] - The visual style of the bar.
     * @property {'sm' | 'md' | 'lg'} [size='md'] - The thickness of the bar.
     * @property {boolean} [indeterminate=false] - Whether to show the indeterminate scanning state.
     * @property {boolean} [striped=false] - Whether to show a striped pattern.
     * @property {boolean} [animated=false] - Whether the stripes should be animated.
     * @property {string} [label] - Optional label to display above the bar.
     * @property {boolean} [showValue=false] - Whether to show the percentage value.
     * @property {string} [class] - Additional CSS classes for the container.
     */

    /** @type {Props} */
    let { 
        value = 0, 
        max = 100, 
        variant = 'brand', 
        size = 'md', 
        indeterminate = false, 
        striped = false, 
        animated = false, 
        label,
        showValue = false,
        class: className = '',
        ...rest 
    } = $props();

    const percentage = $derived(indeterminate ? 100 : Math.max(0, Math.min(100, (value / max) * 100)));
</script>

<div class="aea-progress-wrapper {className}" {...rest}>
    {#if label || showValue}
        <div class="aea-progress-info">
            {#if label}
                <span class="aea-progress-label">{label}</span>
            {/if}
            {#if showValue && !indeterminate}
                <span class="aea-progress-value">{Math.round(percentage)}%</span>
            {/if}
        </div>
    {/if}

    <div 
        class="aea-progress {size} {indeterminate ? 'indeterminate' : ''} {striped ? 'striped' : ''} {animated ? 'animated' : ''}"
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin="0"
        aria-valuemax={max}
    >
        <div 
            class="aea-progress-bar variant-{variant}" 
            style="width: {percentage}%"
        ></div>
    </div>
</div>

<style>
    .aea-progress-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .aea-progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: hsl(var(--text-400));
    }

    .aea-progress {
        width: 100%;
        background-color: hsla(var(--bg-200) / 0.3);
        backdrop-filter: blur(8px);
        border-radius: 9999px;
        overflow: hidden;
        position: relative;
    }

    .aea-progress-bar {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 9999px;
        position: relative;
    }

    /* Sizes */
    .sm { height: 0.375rem; }
    .md { height: 0.625rem; }
    .lg { height: 1rem; }

    /* Variants */
    .variant-brand { 
        background-color: hsl(var(--accent-brand));
        box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.5);
    }
    .variant-success { 
        background-color: hsl(var(--success-100));
        box-shadow: 0 0 10px hsla(var(--success-100) / 0.5);
    }
    .variant-warning { 
        background-color: hsl(var(--accent-brand));
        box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.5);
    }
    .variant-danger { 
        background-color: hsl(var(--danger-100));
        box-shadow: 0 0 10px hsla(var(--danger-100) / 0.5);
    }
    .variant-info { 
        background-color: hsl(var(--accent-secondary-100));
        box-shadow: 0 0 10px hsla(var(--accent-secondary-100) / 0.5);
    }

    /* Indeterminate */
    .indeterminate .aea-progress-bar {
        width: 30% !important;
        position: absolute;
        animation: aea-progress-indeterminate 2s infinite linear;
        transform-origin: 0% 50%;
    }

    @keyframes aea-progress-indeterminate {
        0% { transform: translateX(-100%) scaleX(0.2); }
        50% { transform: translateX(0%) scaleX(0.5); }
        100% { transform: translateX(100%) scaleX(0.2); }
    }

    /* Striped */
    .striped .aea-progress-bar {
        background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
        );
        background-size: 1rem 1rem;
    }

    /* Animated */
    .animated .aea-progress-bar {
        animation: aea-progress-stripes 1s linear infinite;
    }

    @keyframes aea-progress-stripes {
        from { background-position: 1rem 0; }
        to { background-position: 0 0; }
    }

    @media (prefers-reduced-motion: reduce) {
        .aea-progress-bar {
            transition: none;
        }
        .indeterminate .aea-progress-bar,
        .animated .aea-progress-bar {
            animation: none;
        }
    }
</style>
