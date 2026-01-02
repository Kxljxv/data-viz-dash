<script>
    import { 
        Button, 
        Input, 
        Modal,
        Typography,
        Badge,
        Checkbox
    } from '$lib/components/aea';
    import { 
        IconSearch, 
        IconMapPin, 
        IconCheck, 
        IconX,
        IconFilter
    } from '@tabler/icons-svelte';

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

<Modal 
    open={true} 
    onclose={onClose} 
    title="KV-Gruppierung"
    size="md"
    accent="brand"
>
    {#snippet body()}
        <div class="space-y-8">
            <header class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-[hsl(var(--accent-pro-100))]/10 flex items-center justify-center text-[hsl(var(--accent-pro-100))] shadow-inner">
                        <IconMapPin size={28} />
                    </div>
                    <div class="flex flex-col">
                        <Typography variant="h4" class="text-white">Kreisverbände wählen</Typography>
                        <Typography variant="body" class="text-xs text-white/40">Erstelle eine Gruppe basierend auf regionaler Herkunft.</Typography>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <Badge variant="brand" class="px-4 py-1.5 font-bold tracking-wider mb-1">{selectedKvs.length} KV's</Badge>
                    <Typography variant="body" class="text-[9px] text-white/20 uppercase tracking-widest">Ausgewählt</Typography>
                </div>
            </header>

            <div class="space-y-6">
                <!-- Search & Actions Bar -->
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="relative flex-1 group">
                        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[hsl(var(--accent-pro-100))] transition-colors">
                            <IconSearch size={18} />
                        </div>
                        <input 
                            type="text"
                            bind:value={searchQuery}
                            placeholder="Nach Region suchen..."
                            class="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-pro-100))]/50 transition-all placeholder:text-white/20 shadow-inner"
                        />
                    </div>
                    
                    <Button variant="outline" size="sm" onclick={toggleAll} class="h-auto py-4 px-6 rounded-2xl border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/10 transition-all">
                        {selectedKvs.length === filteredKvs.length ? 'Alle abwählen' : 'Alle auswählen'}
                    </Button>
                </div>

                <!-- KV Selection Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                    {#each filteredKvs as kv}
                        <button 
                            onclick={() => toggleKv(kv)}
                            class="flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden
                                {selectedKvs.includes(kv) 
                                    ? 'bg-[hsl(var(--accent-pro-100))]/10 border-[hsl(var(--accent-pro-100))]/40 shadow-[0_8px_20px_hsla(var(--accent-pro-100),0.1)]' 
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}"
                        >
                            {#if selectedKvs.includes(kv)}
                                <div class="absolute top-0 right-0 w-16 h-16 bg-[hsl(var(--accent-pro-100))]/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                            {/if}

                            <div class="flex items-center gap-4 relative z-10">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                    {selectedKvs.includes(kv) 
                                        ? 'bg-[hsl(var(--accent-pro-100))]/20 text-[hsl(var(--accent-pro-100))]' 
                                        : 'bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40'}">
                                    <IconMapPin size={18} />
                                </div>
                                <div class="flex flex-col text-left">
                                    <span class="text-xs font-bold {selectedKvs.includes(kv) ? 'text-white' : 'text-white/60'} transition-colors">{kv}</span>
                                    <span class="text-[9px] text-white/20 uppercase tracking-widest">Regionalverband</span>
                                </div>
                            </div>
                            
                            <div class="w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center relative z-10
                                {selectedKvs.includes(kv) 
                                    ? 'bg-[hsl(var(--accent-pro-100))] border-[hsl(var(--accent-pro-100))] text-white shadow-[0_0_10px_hsla(var(--accent-pro-100),0.5)] scale-110' 
                                    : 'border-white/10 text-transparent group-hover:border-white/20'}">
                                <IconCheck size={14} stroke-width={3} />
                            </div>
                        </button>
                    {/each}
                    
                    {#if filteredKvs.length === 0}
                        <div class="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-5 opacity-20">
                            <div class="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                                <IconFilter size={40} stroke-width={1} />
                            </div>
                            <div class="space-y-1">
                                <Typography variant="body" class="text-sm font-bold uppercase tracking-widest">Keine Treffer</Typography>
                                <Typography variant="body" class="text-xs">Keine Kreisverbände für diese Suche gefunden.</Typography>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/snippet}

    {#snippet footer()}
        <div class="flex items-center justify-between w-full">
            <Typography variant="body" class="text-[10px] text-white/20 uppercase tracking-[0.2em] hidden sm:block">
                Region-Engine v1.2
            </Typography>
            <div class="flex gap-4 w-full sm:w-auto">
                <Button variant="ghost" onclick={onClose} class="flex-1 sm:flex-none px-8 h-12 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                    Abbrechen
                </Button>
                <Button 
                    onclick={handleCreate} 
                    disabled={selectedKvs.length === 0}
                    class="flex-1 sm:flex-none px-12 h-12 text-[10px] font-black uppercase tracking-widest transition-all
                        {selectedKvs.length > 0 
                            ? 'bg-[hsl(var(--accent-pro-100))] text-white shadow-[0_0_20px_hsla(var(--accent-pro-100),0.3)] hover:bg-[hsl(var(--accent-pro-100))]/80' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed'}"
                >
                    Gruppe generieren
                </Button>
            </div>
        </div>
    {/snippet}
</Modal>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
