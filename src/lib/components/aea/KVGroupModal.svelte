<script>
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import * as Dialog from '$lib/components/ui/dialog';
    import Checkbox from './Checkbox.svelte';

    /**
     * @typedef {Object} Props
     * @property {string[]} allKvs - All unique KVs found in the data
     * @property {() => void} onClose - Callback to close the modal
     * @property {(selectedKvs: string[]) => void} onCreate - Callback to create the group
     */

    let { allKvs = [], onClose, onCreate } = $props();

    let selectedKvs = $state([]);
    let searchQuery = $state('');

    let filteredKvs = $derived(
        allKvs.filter(kv => 
            kv.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => a.localeCompare(b))
    );

    function toggleKv(kv) {
        if (selectedKvs.includes(kv)) {
            selectedKvs = selectedKvs.filter(k => k !== kv);
        } else {
            selectedKvs = [...selectedKvs, kv];
        }
    }

    function handleCreate() {
        if (selectedKvs.length > 0 && onCreate) {
            onCreate(selectedKvs);
        }
        onClose();
    }

    function toggleAll() {
        if (selectedKvs.length === filteredKvs.length) {
            selectedKvs = [];
        } else {
            selectedKvs = [...filteredKvs];
        }
    }
</script>

<Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Content class="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <Dialog.Header class="p-6 border-b border-[hsl(var(--border-300))/0.5] bg-[var(--bg-100)]/30">
            <Dialog.Title class="text-lg font-serif text-[var(--text-primary)]">KV-Gruppe erstellen</Dialog.Title>
        </Dialog.Header>

        <div class="p-6 space-y-6 overflow-hidden flex flex-col max-h-[60vh]">
            <!-- Search & Filter -->
            <div class="space-y-4">
                <div class="relative">
                    <Input 
                        type="text" 
                        bind:value={searchQuery}
                        placeholder="KV suchen..."
                    />
                </div>
                
                <div class="flex justify-between items-center px-1">
                    <span class="text-[10px] font-black text-[hsl(var(--accent-pro-100))] uppercase tracking-[0.2em]">
                        {selectedKvs.length} ausgewählt
                    </span>
                    <button 
                        onclick={toggleAll}
                        class="text-[10px] font-black text-[var(--text-tertiary)] hover:text-[var(--text-primary)] uppercase tracking-[0.2em] transition-colors"
                    >
                        {selectedKvs.length === filteredKvs.length ? 'Alle abwählen' : 'Alle auswählen'}
                    </button>
                </div>
            </div>

            <!-- KV List -->
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1 min-h-[200px]">
                {#each filteredKvs as kv}
                    <button 
                        onclick={() => toggleKv(kv)}
                        class="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[var(--bg-100)] transition-all group {selectedKvs.includes(kv) ? 'bg-[hsl(var(--accent-pro-100))]/5' : ''}"
                    >
                        <div class="flex-shrink-0">
                            <Checkbox checked={selectedKvs.includes(kv)} />
                        </div>
                        <span class="text-sm text-[var(--text-primary)] flex-1 text-left">{kv}</span>
                    </button>
                {/each}
                
                {#if filteredKvs.length === 0}
                    <div class="text-center py-8">
                        <span class="text-xs text-[var(--text-tertiary)] italic">Keine KVs gefunden</span>
                    </div>
                {/if}
            </div>
        </div>

        <Dialog.Footer class="p-6 bg-[var(--bg-100)]/30 border-t border-[hsl(var(--border-300))] flex flex-row space-x-3">
            <Button variant="ghost" onclick={onClose} class="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Abbrechen
            </Button>
            <Button 
                onclick={handleCreate} 
                disabled={selectedKvs.length === 0}
                class="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em]"
            >
                Erstellen
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<style>
</style>
