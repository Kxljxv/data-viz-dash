<script>
    import { setContext } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { portal } from '$lib/actions/portal'; // Assuming a portal action exists or we implement it

    /**
     * @typedef {Object} Props
     * @property {boolean} [open=false] - Whether the drawer is open.
     * @property {'right' | 'left'} [side='right'] - Which side the drawer slides from.
     * @property {string} [size='400px'] - Maximum width of the drawer.
     * @property {boolean} [closeOnOutsideClick=true] - Close when clicking the backdrop.
     * @property {string} [class] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Drawer content.
     */

    /** @type {Props} */
    let { 
        open = $bindable(false), 
        side = 'right', 
        size = '400px',
        closeOnOutsideClick = true,
        class: className = '', 
        children,
        ...rest 
    } = $props();

    const close = () => open = false;
    setContext('aea-drawer', { close });

    // Handle Escape key
    const handleKeydown = (e) => {
        if (open && e.key === 'Escape') close();
    };

    // Body scroll lock
    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeydown);
        } else {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeydown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeydown);
        };
    });

    const transitionParams = $derived({
        x: side === 'right' ? 400 : -400,
        duration: 300,
        opacity: 1
    });
</script>

{#if open}
    <div class="aea-drawer-root">
        <!-- Backdrop -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="aea-drawer-backdrop" 
            transition:fade={{ duration: 300 }}
            onclick={() => closeOnOutsideClick && close()}
        ></div>

        <!-- Drawer Panel -->
        <div 
            class="aea-drawer aea-drawer-{side} {className}" 
            style:max-width={size}
            transition:fly={transitionParams}
            role="dialog"
            aria-modal="true"
            {...rest}
        >
            {@render children?.()}
        </div>
    </div>
{/if}

<style>
    .aea-drawer-root {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
    }

    .aea-drawer-backdrop {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }

    .aea-drawer {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        background-color: hsla(var(--bg-100) / 0.95);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 25px rgba(0, 0, 0, 0.3);
    }

    .aea-drawer-right {
        right: 0;
        border-left: 1px solid hsla(var(--border-300) / 0.1);
        box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.3);
    }

    .aea-drawer-left {
        left: 0;
        border-right: 1px solid hsla(var(--border-300) / 0.1);
        box-shadow: 10px 0 25px -5px rgba(0, 0, 0, 0.3);
    }
</style>
