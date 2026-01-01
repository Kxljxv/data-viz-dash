<script>
    import { toastState } from './toasts.svelte.js';
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { 
        IconCircleCheck, 
        IconAlertCircle, 
        IconInfoCircle, 
        IconAlertTriangle, 
        IconX 
    } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Toast
     * @property {string} id
     * @property {string} [title]
     * @property {string} message
     * @property {'success' | 'error' | 'info' | 'warning'} type
     */

    /** @type {{ toast: Toast }} */
    let { toast } = $props();

    const icons = {
        success: IconCircleCheck,
        error: IconAlertCircle,
        info: IconInfoCircle,
        warning: IconAlertTriangle
    };

    let Icon = $derived(icons[toast.type] || icons.info);
</script>

<div 
    class="aea-toast aea-toast-{toast.type}" 
    role={toast.type === 'error' ? 'alert' : 'status'}
    aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    in:fly={{ x: 300, duration: 400, easing: cubicOut }}
    out:fade={{ duration: 300 }}
>
    <div class="aea-toast-icon">
        <Icon size={20} />
    </div>
    
    <div class="aea-toast-content">
        {#if toast.title}
            <strong class="aea-toast-title">{toast.title}</strong>
        {/if}
        <p class="aea-toast-message">{toast.message}</p>
    </div>

    <button 
        class="aea-toast-close" 
        aria-label="Dismiss"
        onclick={() => toastState.remove(toast.id)}
    >
        <IconX size={16} />
    </button>
</div>

<style>
    .aea-toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        padding: 1rem 1.25rem;
        background-color: hsla(var(--bg-100) / 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid hsla(var(--border-300) / 0.2);
        border-radius: 1.25rem;
        box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 1px 1px hsla(var(--always-white) / 0.05) inset;
        color: hsl(var(--text-100));
        font-family: 'ModernDense', sans-serif;
        min-width: 320px;
        max-width: 450px;
        transition: transform 0.2s ease;
    }

    .aea-toast:hover {
        transform: translateY(-2px);
        background-color: hsla(var(--bg-100) / 0.95);
    }

    .aea-toast-content {
        flex: 1;
        margin-right: 1rem;
    }

    .aea-toast-title {
        font-weight: 700;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.375rem;
        display: block;
        color: hsl(var(--text-100));
    }

    .aea-toast-message {
        font-size: 0.875rem;
        color: hsl(var(--text-300));
        line-height: 1.5;
    }

    .aea-toast-icon {
        flex-shrink: 0;
        width: 1.25rem;
        height: 1.25rem;
        margin-right: 1rem;
        margin-top: 0.125rem;
    }

    .aea-toast-success .aea-toast-icon { color: hsl(var(--accent-success)); }
    .aea-toast-error .aea-toast-icon { color: hsl(var(--accent-danger)); }
    .aea-toast-info .aea-toast-icon { color: hsl(var(--accent-secondary-100)); }
    .aea-toast-warning .aea-toast-icon { color: hsl(var(--accent-brand)); }

    .aea-toast-close {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.5rem;
        color: hsl(var(--text-400));
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        margin: -0.25rem -0.5rem 0 0;
    }

    .aea-toast-close:hover {
        background-color: hsla(var(--always-white) / 0.05);
        color: hsl(var(--text-100));
    }
</style>
