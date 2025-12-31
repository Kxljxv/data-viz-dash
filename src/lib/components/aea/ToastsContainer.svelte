<script>
    import { toastState } from './toasts.svelte.js';
    import ToastItem from './ToastItem.svelte';
</script>

<div class="aea-toast-container">
    {#each toastState.queue as toast (toast.id)}
        <ToastItem {toast} />
    {/each}
</div>

<style>
    .aea-toast-container {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 3000;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        pointer-events: none;
        max-width: 400px;
        width: calc(100% - 3rem);
    }
</style>
