<script>
    /**
     * @typedef {Object} Props
     * @property {'ring' | 'orbit' | 'pulse' | 'dots'} [variant='ring'] - The visual style of the spinner.
     * @property {'sm' | 'md' | 'lg' | 'xl'} [size='md'] - The size of the spinner.
     * @property {string} [color] - Optional CSS color value.
     * @property {string} [label='Loading...'] - Accessible label for screen readers.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        variant = 'ring', 
        size = 'md', 
        color, 
        label = 'Loading...', 
        class: className = '', 
        ...rest 
    } = $props();
</script>

<div 
    class="aea-spinner aea-spinner-{size} aea-spinner-{variant} {className}" 
    role="status" 
    aria-busy="true"
    style:color={color}
    {...rest}
>
    {#if variant === 'dots'}
        <span></span><span></span><span></span>
    {/if}
    <span class="sr-only">{label}</span>
</div>

<style>
    .aea-spinner {
        display: inline-block;
        position: relative;
        /* Default color if not provided via prop or parent */
        color: inherit;
    }

    /* Size Definitions */
    .aea-spinner-sm { width: 1rem; height: 1rem; border-width: 2px; }
    .aea-spinner-md { width: 2rem; height: 2rem; border-width: 3px; }
    .aea-spinner-lg { width: 3rem; height: 3rem; border-width: 4px; }
    .aea-spinner-xl { width: 4rem; height: 4rem; border-width: 5px; }

    /* Variant: Ring */
    .aea-spinner-ring {
        border-style: solid;
        border-color: currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: aea-spinner-rotate 0.75s linear infinite;
    }

    /* Variant: Orbit */
    .aea-spinner-orbit {
        border-style: solid;
        border-color: currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: aea-spinner-rotate 1s linear infinite;
    }

    .aea-spinner-orbit::after {
        content: '';
        position: absolute;
        top: 15%; left: 15%; right: 15%; bottom: 15%;
        border: inherit;
        border-color: hsl(var(--accent-secondary-100));
        border-left-color: transparent;
        border-radius: 50%;
        animation: aea-spinner-rotate 0.5s linear reverse infinite;
    }

    /* Variant: Pulse */
    .aea-spinner-pulse {
        background-color: currentColor;
        border-radius: 50%;
        animation: aea-spinner-pulse 1.2s ease-in-out infinite;
        filter: drop-shadow(0 0 5px currentColor);
    }

    /* Variant: Dots */
    .aea-spinner-dots {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
        height: 1rem;
        width: auto;
    }

    .aea-spinner-dots span {
        width: 6px;
        height: 6px;
        background-color: currentColor;
        border-radius: 50%;
        animation: aea-spinner-dots 1.4s infinite ease-in-out both;
    }

    .aea-spinner-dots span:nth-child(1) { animation-delay: -0.32s; }
    .aea-spinner-dots span:nth-child(2) { animation-delay: -0.16s; }

    /* Animations */
    @keyframes aea-spinner-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes aea-spinner-pulse {
        0% { transform: scale(0.6); opacity: 0.2; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.6); opacity: 0.2; }
    }

    @keyframes aea-spinner-dots {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }

    /* Accessibility: Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
        .aea-spinner-ring, 
        .aea-spinner-orbit, 
        .aea-spinner-orbit::after {
            animation-duration: 3s;
        }
        .aea-spinner-pulse,
        .aea-spinner-dots span {
            animation: none;
            opacity: 0.5;
        }
    }
</style>
