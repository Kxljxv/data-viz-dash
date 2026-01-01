<script>
    import { fade, slide } from 'svelte/transition';
    import { 
        IconInfoCircle, 
        IconCircleCheck, 
        IconAlertTriangle, 
        IconAlertCircle, 
        IconX 
    } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {'info' | 'success' | 'warning' | 'danger'} [variant='info'] - The visual style of the banner.
     * @property {'inline' | 'fixed-top' | 'fixed-bottom'} [position='inline'] - Where the banner is positioned.
     * @property {boolean} [dismissible=true] - Whether the banner can be dismissed by the user.
     * @property {() => void} [onDismiss] - Callback called when the banner is dismissed.
     * @property {import('svelte').Snippet | import('svelte').Component<any>} [icon] - Custom icon to display.
     * @property {import('svelte').Snippet} [actions] - Custom actions (buttons) to display.
     * @property {import('svelte').Snippet} [children] - The banner content.
     * @property {string} [class] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        variant = 'info', 
        position = 'inline', 
        dismissible = true, 
        onDismiss, 
        icon, 
        actions, 
        children,
        class: className = '',
        ...rest 
    } = $props();

    let visible = $state(true);

    function handleDismiss() {
        visible = false;
        onDismiss?.();
    }

    const icons = {
        info: IconInfoCircle,
        success: IconCircleCheck,
        warning: IconAlertTriangle,
        danger: IconAlertCircle
    };
</script>

{#if visible}
    <div 
        class="banner banner-{variant} banner-{position} {className}" 
        role={variant === 'danger' ? 'alert' : 'status'}
        transition:slide={{ duration: 300 }}
        {...rest}
    >
        <div class="banner-content">
            {#if icon}
                <span class="banner-icon">
                    {#if typeof icon === 'function' && !icon.prototype}
                        {@render icon()}
                    {:else}
                        <icon size={24} />
                    {/if}
                </span>
            {:else}
                {@const Icon = icons[variant]}
                <span class="banner-icon">
                    <Icon size={24} />
                </span>
            {/if}
            <div class="banner-text">
                {@render children?.()}
            </div>
        </div>

        <div class="banner-actions">
            {#if actions}
                {@render actions()}
            {/if}
            
            {#if dismissible}
                <button 
                    class="btn-close" 
                    aria-label="Dismiss"
                    onclick={handleDismiss}
                >
                    <IconX size={16} />
                </button>
            {/if}
        </div>
    </div>
{/if}

<style>
    .banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        gap: 1rem;
        backdrop-filter: blur(24px);
        background: hsla(var(--bg-100) / 0.9);
        border-bottom: 2px solid transparent;
        z-index: 1000;
        width: 100%;
        min-height: 3.5rem;
    }

    .banner-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .banner-icon {
        width: 1.5rem;
        height: 1.5rem;
        flex-shrink: 0;
    }

    .banner-text {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.9375rem;
        line-height: 1.4;
        color: hsl(var(--text-100));
    }

    .banner-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    /* Variants */
    .banner-info { border-bottom-color: hsl(var(--accent-secondary-100)); }
    .banner-success { border-bottom-color: hsl(var(--success-100)); }
    .banner-warning { border-bottom-color: hsl(var(--accent-brand)); }
    .banner-danger { border-bottom-color: hsl(var(--danger-100)); }

    .banner-info .banner-icon { color: hsl(var(--accent-secondary-100)); }
    .banner-success .banner-icon { color: hsl(var(--success-100)); }
    .banner-warning .banner-icon { color: hsl(var(--accent-brand)); }
    .banner-danger .banner-icon { color: hsl(var(--danger-100)); }

    /* Positions */
    .banner-fixed-top {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
    }

    .banner-fixed-bottom {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        border-bottom: none;
        border-top: 2px solid transparent;
    }

    .banner-fixed-bottom.banner-info { border-top-color: hsl(var(--accent-secondary-100)); }
    .banner-fixed-bottom.banner-success { border-top-color: hsl(var(--success-100)); }
    .banner-fixed-bottom.banner-warning { border-top-color: hsl(var(--accent-brand)); }
    .banner-fixed-bottom.banner-danger { border-top-color: hsl(var(--danger-100)); }

    /* Close Button */
    .btn-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.5rem;
        background: transparent;
        border: none;
        color: hsl(var(--text-400));
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-close:hover {
        background: hsla(var(--bg-200) / 0.5);
        color: hsl(var(--text-100));
    }
</style>
