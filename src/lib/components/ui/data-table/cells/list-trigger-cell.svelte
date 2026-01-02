<script>
    let { count, title, items, project, onOpenModal } = $props();
</script>

{#if count === 0}
    <span class="opacity-30">0</span>
{:else}
    <button 
        class="text-brand hover:underline font-bold"
        onclick={() => onOpenModal(title, items, project)}
    >
        {count}
    </button>
{/if}
