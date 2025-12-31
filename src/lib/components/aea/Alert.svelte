<script>
    import { fade } from 'svelte/transition';

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

    const icons = {
        info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
        error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };

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
            {@html icons[variant]}
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
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
