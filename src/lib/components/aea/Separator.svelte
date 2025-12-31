<script>
    /**
     * @typedef {Object} Props
     * @property {'horizontal' | 'vertical'} [orientation='horizontal'] - The direction of the separator.
     * @property {'default' | 'tech' | 'neon'} [variant='default'] - The visual style.
     * @property {string} [label] - Optional text label.
     * @property {'left' | 'center' | 'right'} [labelAlign='center'] - Alignment of the label (horizontal only).
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        orientation = 'horizontal', 
        variant = 'default', 
        label, 
        labelAlign = 'center', 
        class: className = '',
        ...rest 
    } = $props();
</script>

{#if orientation === 'horizontal'}
    {#if label}
        <div class="aea-separator-container align-{labelAlign} {className}" {...rest}>
            <div class="aea-separator-label">{label}</div>
        </div>
    {:else if variant === 'tech'}
        <div class="aea-separator-tech {className}" {...rest}>
            <div class="aea-separator-tech-line"></div>
        </div>
    {:else if variant === 'neon'}
        <div class="aea-separator-neon {className}" {...rest}></div>
    {:else}
        <hr class="aea-separator {className}" {...rest} />
    {/if}
{:else}
    <div 
        class="aea-separator-v {variant} {className}" 
        role="separator" 
        aria-orientation="vertical"
        {...rest}
    ></div>
{/if}

<style>
    /* Horizontal Base */
    .aea-separator {
        border: none;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent 0%,
            hsla(var(--text-500) / 0.2) 15%,
            hsla(var(--text-500) / 0.2) 85%,
            transparent 100%
        );
        margin: 1.5rem 0;
        width: 100%;
    }

    /* With Label */
    .aea-separator-container {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin: 2rem 0;
        width: 100%;
    }

    .aea-separator-container::before,
    .aea-separator-container::after {
        content: "";
        height: 1px;
        flex: 1;
        background: linear-gradient(
            90deg,
            transparent 0%,
            hsla(var(--border-300) / 0.2) 50%,
            hsla(var(--border-300) / 0.2) 100%
        );
    }

    .aea-separator-container::after {
        background: linear-gradient(
            270deg,
            transparent 0%,
            hsla(var(--border-300) / 0.2) 50%,
            hsla(var(--border-300) / 0.2) 100%
        );
    }

    .align-left::before { display: none; }
    .align-right::after { display: none; }

    .aea-separator-label {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: hsl(var(--text-500));
        white-space: nowrap;
        padding: 0 0.5rem;
    }

    /* Tech Variant */
    .aea-separator-tech {
        position: relative;
        height: 12px;
        margin: 2rem 0;
        width: 100%;
        display: flex;
        align-items: center;
    }

    .aea-separator-tech::before,
    .aea-separator-tech::after {
        content: "+";
        position: absolute;
        font-family: monospace;
        font-size: 10px;
        color: hsl(var(--accent-brand));
        opacity: 0.5;
    }

    .aea-separator-tech::before { left: 0; }
    .aea-separator-tech::after { right: 0; }

    .aea-separator-tech-line {
        height: 1px;
        width: 100%;
        background: repeating-linear-gradient(
            90deg,
            hsla(var(--border-300) / 0.2) 0px,
            hsla(var(--border-300) / 0.2) 2px,
            transparent 2px,
            transparent 4px
        );
        margin: 0 12px;
    }

    /* Neon Variant */
    .aea-separator-neon {
        height: 1px;
        background: hsl(var(--accent-brand));
        box-shadow: 0 0 8px hsla(var(--accent-brand) / 0.5);
        width: 100%;
        margin: 2rem 0;
        position: relative;
    }

    /* Vertical */
    .aea-separator-v {
        width: 1px;
        height: 100%;
        min-height: 1rem;
        background: linear-gradient(
            180deg,
            transparent 0%,
            hsla(var(--border-300) / 0.2) 15%,
            hsla(var(--border-300) / 0.2) 85%,
            transparent 100%
        );
        margin: 0 1rem;
    }

    .aea-separator-v.neon {
        background: hsl(var(--accent-brand));
        box-shadow: 0 0 8px hsla(var(--accent-brand) / 0.5);
    }

    .aea-separator-v.tech {
        background: repeating-linear-gradient(
            180deg,
            hsla(var(--border-300) / 0.2) 0px,
            hsla(var(--border-300) / 0.2) 2px,
            transparent 2px,
            transparent 4px
        );
    }
</style>
