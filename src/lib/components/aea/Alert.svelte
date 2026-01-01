<script>
    import { fade } from 'svelte/transition';
    import { 
        IconInfoCircle, 
        IconCheck, 
        IconAlertTriangle, 
        IconAlertCircle, 
        IconX 
    } from "@tabler/icons-svelte";

    /**
     * @typedef {Object} Props
     * @property {'info' | 'success' | 'warning' | 'error'} [variant='info'] - Visual style and icon of the alert.
     * @property {string} [title] - Bold title text.
     * @property {boolean} [dismissible=true] - Whether to show the close button.
     * @property {() => void} [onclose] - Callback when alert is dismissed.
     * @property {import('svelte').Snippet} [children] - Main content description.
     * @property {string} [class=''] - Additional classes.
     */

    /** @type {Props} */
    let { 
        variant = 'info', 
        title, 
        dismissible = true, 
        onclose, 
        children,
        class: className = '',
        ...rest 
    } = $props();

    let visible = $state(true);

    function handleClose() {
        visible = false;
        onclose?.();
    }

    const variantClasses = {
        info: 'aea-alert-info',
        success: 'aea-alert-success',
        warning: 'aea-alert-warning',
        error: 'aea-alert-error'
    };
</script>

{#if visible}
    <div 
        class="aea-alert {variantClasses[variant]} {className}" 
        role="alert"
        transition:fade={{ duration: 200 }}
        {...rest}
    >
        <div class="aea-alert-icon">
            {#if variant === 'info'}
                <IconInfoCircle size={20} />
            {:else if variant === 'success'}
                <IconCheck size={20} />
            {:else if variant === 'warning'}
                <IconAlertTriangle size={20} />
            {:else if variant === 'error'}
                <IconAlertCircle size={20} />
            {/if}
        </div>
        
        <div class="aea-alert-content">
            {#if title}
                <span class="aea-alert-title">{title}</span>
            {/if}
            <div class="aea-alert-description">
                {@render children?.()}
            </div>
        </div>

        {#if dismissible}
            <button 
                class="aea-alert-close" 
                aria-label="Dismiss"
                onclick={handleClose}
            >
                <IconX size={16} />
            </button>
        {/if}
    </div>
{/if}

<style>
    .aea-alert {
        display: flex;
        align-items: flex-start;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 1rem;
        background-color: hsla(var(--bg-100) / 0.8);
        backdrop-filter: blur(8px);
        border: 1px solid hsla(var(--border-300) / 0.1);
        border-left-width: 4px;
        gap: 1rem;
        position: relative;
    }

    .aea-alert-info { border-left-color: hsl(var(--accent-pro-100)); }
    .aea-alert-success { border-left-color: hsl(var(--success-100)); }
    .aea-alert-warning { border-left-color: hsl(var(--accent-brand)); }
    .aea-alert-error { border-left-color: hsl(var(--danger-100)); }

    .aea-alert-icon {
        flex-shrink: 0;
        margin-top: 0.125rem;
    }

    .aea-alert-info .aea-alert-icon { color: hsl(var(--accent-pro-100)); }
    .aea-alert-success .aea-alert-icon { color: hsl(var(--success-100)); }
    .aea-alert-warning .aea-alert-icon { color: hsl(var(--accent-brand)); }
    .aea-alert-error .aea-alert-icon { color: hsl(var(--danger-100)); }

    .aea-alert-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .aea-alert-title {
        font-family: 'Serif', serif;
        font-size: 1rem;
        font-weight: 700;
        color: hsl(var(--text-100));
    }

    .aea-alert-description {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.875rem;
        color: hsl(var(--text-300));
        line-height: 1.5;
    }

    .aea-alert-close {
        flex-shrink: 0;
        padding: 0.25rem;
        margin: -0.25rem;
        color: hsl(var(--text-500));
        transition: color 0.2s ease;
        border: none;
        background: transparent;
        cursor: pointer;
    }

    .aea-alert-close:hover {
        color: hsl(var(--text-100));
    }
</style>
