<script>
    /**
     * @typedef {Object} Props
     * @property {number} [value=0] - The current value of the slider (bindable).
     * @property {number} [min=0] - Minimum value.
     * @property {number} [max=100] - Maximum value.
     * @property {number} [step=1] - Step increment.
     * @property {string} [label] - Optional label.
     * @property {boolean} [disabled=false] - Whether the slider is disabled.
     * @property {string} [class=""] - Additional CSS classes.
     */

    /** @type {Props} */
    let {
        value = $bindable(0),
        min = 0,
        max = 100,
        step = 1,
        label,
        disabled = false,
        class: className = "",
        ...rest
    } = $props();
</script>

<div class="aea-slider-group {className} {disabled ? 'disabled' : ''}">
    {#if label}
        <div class="aea-slider-header">
            <span class="aea-slider-label">{label}</span>
            <span class="aea-slider-value">{value}</span>
        </div>
    {/if}
    
    <input 
        type="range" 
        {min} 
        {max} 
        {step} 
        bind:value 
        {disabled}
        class="aea-slider"
        {...rest}
    />
</div>

<style>
    .aea-slider-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .aea-slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .aea-slider-label {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: hsl(var(--text-300));
    }

    .aea-slider-value {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        color: hsl(var(--accent-brand));
        background: hsla(var(--accent-brand) / 0.1);
        padding: 0.1rem 0.4rem;
        border-radius: 0.25rem;
    }

    .aea-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: hsla(var(--text-500) / 0.2);
        border-radius: 3px;
        outline: none;
        transition: all 0.3s ease;
    }

    .aea-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        background: hsl(var(--accent-brand));
        cursor: pointer;
        border-radius: 50%;
        box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.4);
        transition: transform 0.2s ease;
    }

    .aea-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background: hsl(var(--accent-brand));
        cursor: pointer;
        border-radius: 50%;
        border: none;
        box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.4);
        transition: transform 0.2s ease;
    }

    .aea-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
    }

    .aea-slider:active::-webkit-slider-thumb {
        transform: scale(0.9);
    }

    .aea-slider.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
