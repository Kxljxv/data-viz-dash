<script>
    import { 
        Button, 
        Input, 
        Modal 
    } from '$lib/components/aea';
    import { onMount } from 'svelte';
    import { 
        IconX, 
        IconSearch, 
        IconDownload, 
        IconUpload, 
        IconPlus 
    } from "@tabler/icons-svelte";

    /**
     * @typedef {Object} Props
     * @property {any} group - The group to edit
     * @property {any[]} allNodes - All available nodes for searching/adding
     * @property {() => void} onClose - Callback to close the modal
     * @property {(group: any) => void} onSave - Callback to save the group
     */

    let { group, allNodes = [], onClose, onSave } = $props();

    let name = $state('');
    let color = $state('');
    let groupNodes = $state([]);
    let searchQuery = $state('');
    let isImporting = $state(false);

    // Sync state with group prop when it changes
    $effect(() => {
        name = group?.name ?? 'Neue Gruppe';
        color = group?.color ?? '#7f6df2';
        groupNodes = group?.nodes || [];
    });

    let filteredNodes = $derived(
        allNodes.filter(node => 
            node.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !groupNodes.includes(node.id)
        ).slice(0, 10) // Limit results for performance
    );

    /**
     * Fügt einen Knoten zur Gruppe hinzu
     * @param {string} id - Die ID des Knotens
     */
    function addNode(id) {
        if (!groupNodes.includes(id)) {
            groupNodes = [...groupNodes, id];
        }
    }

    /**
     * Entfernt einen Knoten aus der Gruppe
     * @param {string} id - Die ID des Knotens
     */
    function removeNode(id) {
        groupNodes = groupNodes.filter(nodeId => nodeId !== id);
    }

    /**
     * Speichert die Gruppe und schließt das Modal
     */
    function handleSave() {
        if (onSave) {
            onSave({
                ...group,
                name,
                color,
                nodes: groupNodes
            });
        }
        onClose();
    }

    /**
     * Importiert Gruppendaten aus einer JSON-Datei
     * @param {Event} event - Das Change-Event des File-Inputs
     */
    function handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        isImporting = true;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.name && data.color && Array.isArray(data.nodes)) {
                    name = data.name;
                    color = data.color;
                    groupNodes = data.nodes;
                } else {
                    throw new Error('Ungültiges Format');
                }
            } catch (err) {
                alert('Fehler beim Importieren: ' + err.message);
            } finally {
                isImporting = false;
            }
        };
        reader.readAsText(file);
    }

    /**
     * Exportiert die Gruppe als JSON-Datei
     */
    function handleExport() {
        const data = JSON.stringify({ name, color, nodes: groupNodes }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_group.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<Modal 
    open={!!group} 
    onclose={onClose}
    title="Gruppe bearbeiten"
    accent="brand"
    size="md"
>
    {#snippet body()}
        <div class="space-y-8">
            <!-- Name & Color Section -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="md:col-span-3">
                    <Input 
                        id="group-name"
                        label="Gruppenname"
                        type="text" 
                        bind:value={name}
                        placeholder="Gruppenname eingeben..."
                        class="bg-white/5 border-white/10 focus:border-brand/50 transition-colors"
                    />
                </div>
                <div>
                    <label for="group-color" class="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Farbe</label>
                    <div class="flex items-center space-x-3 p-2 bg-white/5 border border-white/10 rounded-2xl">
                        <input 
                            id="group-color"
                            type="color" 
                            bind:value={color}
                            class="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                            title="Farbe wählen"
                        />
                        <span class="text-[10px] font-mono text-white/60">{color.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <!-- Node Management Section -->
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Mitglieder ({groupNodes.length})</span>
                    {#if groupNodes.length > 0}
                        <button 
                            onclick={() => groupNodes = []}
                            class="text-[10px] font-black text-danger-100/60 hover:text-danger-100 uppercase tracking-[0.2em] transition-colors"
                        >
                            Alle entfernen
                        </button>
                    {/if}
                </div>
                
                <!-- Current Nodes -->
                <div class="flex flex-wrap gap-2 min-h-[60px] p-4 bg-white/5 border border-white/5 rounded-2xl">
                    {#each groupNodes as nodeId}
                        {@const node = allNodes.find(n => n.id === nodeId)}
                        {#if node}
                            <div class="flex items-center space-x-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-xl group transition-all hover:border-brand/40">
                                <span class="text-[11px] font-medium text-white/90">{node.label}</span>
                                <button 
                                    onclick={() => removeNode(nodeId)}
                                    class="text-white/30 hover:text-danger-100 transition-colors"
                                    aria-label={`Entferne ${node.label}`}
                                >
                                    <IconX size={14} />
                                </button>
                            </div>
                        {/if}
                    {/each}
                    {#if groupNodes.length === 0}
                        <div class="w-full flex flex-col items-center justify-center py-4 text-center">
                            <span class="text-[10px] font-medium text-white/20 uppercase tracking-widest">Keine Knoten ausgewählt</span>
                        </div>
                    {/if}
                </div>

                <!-- Add Nodes Search -->
                <div class="relative">
                    <Input 
                        type="search" 
                        bind:value={searchQuery}
                        placeholder="Nach Knoten suchen..."
                        aria-label="Knoten suchen"
                        class="bg-white/5 border-white/10 pr-10"
                    />
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                        <IconSearch size={16} class="text-white" />
                    </div>

                    {#if searchQuery.length > 0 && filteredNodes.length > 0}
                        <div class="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {#each filteredNodes as node}
                                <button 
                                    onclick={() => { addNode(node.id); searchQuery = ''; }}
                                    class="w-full text-left px-5 py-4 text-xs text-white/80 hover:bg-white/5 hover:text-white transition-all flex items-center justify-between group"
                                >
                                    <div class="flex flex-col">
                                        <span class="font-medium">{node.label}</span>
                                        <span class="text-[9px] text-white/40 uppercase tracking-tighter">{node.id}</span>
                                    </div>
                                    <span class="w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <IconPlus size={14} />
                                    </span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Import/Export -->
            <div class="pt-6 border-t border-white/5 flex gap-3">
                <Button variant="ghost" size="sm" onclick={handleExport} class="flex-1 h-11 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all" aria-label="Gruppe exportieren">
                    <IconDownload size={14} class="mr-2 opacity-50" />
                    Exportieren
                </Button>
                <div class="flex-1 relative group">
                    <input 
                        id="import-group"
                        type="file" 
                        accept=".json" 
                        onchange={handleImport}
                        class="absolute inset-0 opacity-0 cursor-pointer z-10"
                        aria-label="Gruppe importieren"
                    />
                    <Button variant="ghost" size="sm" class="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 bg-white/5 group-hover:bg-white/10 text-white/60 group-hover:text-white transition-all">
                        <IconUpload size={14} class="mr-2 opacity-50" />
                        Importieren
                    </Button>
                </div>
            </div>
        </div>
    {/snippet}

    {#snippet footer()}
        <div class="flex w-full gap-3">
            <Button variant="ghost" onclick={onClose} class="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors" aria-label="Abbrechen">
                Abbrechen
            </Button>
            <Button onclick={handleSave} class="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.2em] bg-brand hover:bg-brand/80 text-white transition-all shadow-lg shadow-brand/20" aria-label="Speichern">
                Änderungen speichern
            </Button>
        </div>
    {/snippet}
</Modal>

<style>
</style>
