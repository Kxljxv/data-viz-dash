<script>
    import { onMount } from 'svelte';
    import { IconX } from "@tabler/icons-svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [open=false] - Whether the modal is visible (bindable).
     * @property {'sm' | 'md' | 'lg' | 'xl' | 'full'} [size='md'] - The maximum width of the modal.
     * @property {'brand' | 'success' | 'danger' | 'none'} [accent='none'] - Top border color accent.
     * @property {string} [title] - The title displayed in the header.
     * @property {boolean} [showClose=true] - Whether to show the close button in the header.
     * @property {() => void} [onclose] - Callback triggered when the modal is closed.
     * @property {import('svelte').Snippet} [body] - Main content for the modal body.
     * @property {import('svelte').Snippet} [footer] - Action buttons for the modal footer.
     * @property {import('svelte').Snippet} [children] - Direct children if body/footer not used.
     */

    /** @type {Props} */
    let {
        open = $bindable(false),
        size = 'md',
        accent = 'none',
        title,
        showClose = true,
        onclose,
        body,
        footer,
        children,
        ...rest
    } = $props();

    const sizeClasses = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        xl: 'modal-xl',
        full: 'modal-full'
    };

    const accentClasses = {
        brand: 'modal-accent-brand',
        success: 'modal-accent-success',
        danger: 'modal-accent-danger',
        none: ''
    };

    function handleClose() {
        open = false;
        onclose?.();
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape' && open) {
            handleClose();
        }
    }

    $effect(() => {
        if (open) {
            document.body.classList.add('modal-open');
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    // Generate a unique ID for ARIA association
    const titleId = `modal-title-${Math.random().toString(36).substring(2, 9)}`;
</script>

{#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="modal-backdrop active" 
        onclick={handleBackdropClick}
        aria-hidden="true"
    >
        <div 
            class="modal {sizeClasses[size]} {accentClasses[accent]}" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby={title ? titleId : undefined}
            {...rest}
        >
            {#if title || showClose}
                <div class="modal-header">
                    {#if title}
                        <h2 id={titleId} class="modal-title">{title}</h2>
                    {/if}
                    {#if showClose}
                        <button class="btn-close" onclick={handleClose} aria-label="Close Modal">
                            <IconX size={24} />
                        </button>
                    {/if}
                </div>
            {/if}

            <div class="modal-body custom-scrollbar">
                {#if body}
                    {@render body()}
                {:else if children}
                    {@render children()}
                {/if}
            </div>

            {#if footer}
                <div class="modal-footer">
                    {@render footer()}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 1rem;
    }

    .modal-backdrop.active {
        opacity: 1;
        visibility: visible;
    }

    .modal {
        background-color: hsla(var(--bg-100) / 0.85);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid hsla(var(--border-300) / 0.2);
        border-radius: 2rem; /* rounded-3xl */
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 40px -10px hsla(var(--accent-brand) / 0.1);
        transform: scale(0.95) translateY(10px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }

    .modal-backdrop.active .modal {
        transform: scale(1) translateY(0);
    }

    /* Modal Sizes */
    .modal-sm { max-width: 400px; }
    .modal-md { max-width: 600px; }
    .modal-lg { max-width: 900px; }
    .modal-xl { max-width: 1140px; }
    .modal-full { max-width: 95vw; height: 95vh; }

    .modal-header {
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid hsla(var(--border-300) / 0.05);
    }

    .modal-title {
        font-family: 'Serif', serif;
        font-size: 1.75rem;
        color: hsl(var(--text-000));
        margin: 0;
    }

    .modal-body {
        padding: 2rem;
        overflow-y: auto;
        flex: 1;
        color: hsl(var(--text-200));
        font-family: 'ModernDense', sans-serif;
        line-height: 1.6;
    }

    .modal-footer {
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
        border-top: 1px solid hsla(var(--border-300) / 0.05);
        background-color: hsla(var(--bg-300) / 0.2);
    }

    .btn-close {
        background: transparent;
        border: none;
        color: hsl(var(--text-400));
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-close:hover {
        color: hsl(var(--text-000));
        background-color: hsla(var(--always-white) / 0.1);
    }

    /* Modal Status Accents */
    .modal-accent-brand { border-top: 4px solid hsl(var(--accent-brand)); }
    .modal-accent-success { border-top: 4px solid hsl(var(--success-100)); }
    .modal-accent-danger { border-top: 4px solid hsl(var(--danger-100)); }
</style>
