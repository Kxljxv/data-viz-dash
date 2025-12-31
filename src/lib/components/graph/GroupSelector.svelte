<script>
    import { 
        Button, 
        Modal,
        Typography
    } from '$lib/components/aea';

    let { node, groups = [], onSelect, onCreate, onClose } = $props();

    function handleSelect(group) {
        if (onSelect) {
            onSelect(group, node);
        }
    }

    function handleCreate() {
        if (onCreate) {
            onCreate(node);
        }
    }

    function handleClose() {
        if (onClose) {
            onClose();
        }
    }
</script>

<Modal 
    open={!!node} 
    onclose={handleClose} 
    title="Zu Gruppe hinzufügen"
    size="sm"
>
    {#snippet body()}
        <div class="space-y-6">
            <div class="px-3 py-2 bg-[var(--bg-100)]/50 rounded-xl border border-[hsl(var(--border-300))/0.5] mb-4 flex items-center">
                <Typography variant="label" class="text-[10px] text-[var(--text-tertiary)] uppercase font-black tracking-wider">Knoten:</Typography>
                <Typography variant="body" class="text-xs text-[var(--text-primary)] ml-3 font-bold">{node.label}</Typography>
            </div>

            <Button 
                variant="outline"
                onclick={handleCreate}
                class="w-full flex items-center justify-start space-x-3 p-6 rounded-2xl border-dashed border-2 border-[hsl(var(--border-300))] hover:border-[hsl(var(--accent-pro-100))] hover:bg-[hsl(var(--accent-pro-100))]/5 transition-all group h-auto"
            >
                <div class="w-8 h-8 rounded-full bg-[hsl(var(--accent-pro-100))]/10 flex items-center justify-center text-[hsl(var(--accent-pro-100))] group-hover:scale-110 transition-transform font-bold">
                    +
                </div>
                <Typography variant="body" class="text-sm font-bold text-[var(--text-primary)]">Neue Gruppe erstellen</Typography>
            </Button>

            {#if groups.length > 0}
                <div class="pt-2">
                    <Typography variant="label" class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest block mb-4 px-1">Bestehende Gruppen</Typography>
                    <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {#each groups as group (group.id)}
                            <button 
                                onclick={() => handleSelect(group)}
                                class="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-100)]/50 border border-[hsl(var(--border-300))/0.5] hover:border-[hsl(var(--border-300))] hover:bg-[var(--bg-100)] transition-all group"
                            >
                                <div class="flex items-center space-x-4">
                                    <div class="w-3 h-3 rounded-full shadow-lg" style="background-color: {group.color}"></div>
                                    <Typography variant="body" class="text-sm font-medium text-[var(--text-primary)]">{group.name}</Typography>
                                </div>
                                <Typography variant="label" class="text-[10px] font-black text-[hsl(var(--accent-pro-100))] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Hinzufügen</Typography>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/snippet}

    {#snippet footer()}
        <Button variant="ghost" onclick={handleClose} class="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]">
            Abbrechen
        </Button>
    {/snippet}
</Modal>

<style>
</style>
