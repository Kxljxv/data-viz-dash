<script>
    import { 
        Button, 
        Input, 
        Modal 
    } from '$lib/components/aea';
    import { onMount } from 'svelte';

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
>
    {#snippet body()}
        <div class="space-y-6">
            <!-- Name & Color Section -->
            <div class="space-y-4">
                <Input 
                    id="group-name"
                    label="Gruppenname"
                    type="text" 
                    bind:value={name}
                    placeholder="Gruppenname eingeben..."
                />
                <div>
                    <label for="group-color" class="block text-[10px] font-black text-[hsl(var(--accent-pro-100))] uppercase tracking-[0.2em] mb-2">Farbe</label>
                    <div class="flex items-center space-x-4">
                        <input 
                            id="group-color"
                            type="color" 
                            bind:value={color}
                            class="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                            title="Farbe wählen"
                        />
                        <span class="text-xs font-mono text-[var(--text-tertiary)]">{color.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <!-- Node Management Section -->
            <div class="space-y-4">
                <span class="block text-[10px] font-black text-[hsl(var(--accent-pro-100))] uppercase tracking-[0.2em] mb-2">Knoten verwalten ({groupNodes.length})</span>
                
                <!-- Current Nodes -->
                <div class="flex flex-wrap gap-2 mb-4">
                    {#each groupNodes as nodeId}
                        {@const node = allNodes.find(n => n.id === nodeId)}
                        {#if node}
                            <div class="flex items-center space-x-2 px-3 py-1.5 bg-[hsl(var(--accent-pro-100))]/10 border border-[hsl(var(--accent-pro-100))]/20 rounded-full group">
                                <span class="text-xs text-[var(--text-primary)]">{node.label}</span>
                                <button 
                                    onclick={() => removeNode(nodeId)}
                                    class="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                    aria-label={`Entferne ${node.label}`}
                                >
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        {/if}
                    {/each}
                    {#if groupNodes.length === 0}
                        <div class="w-full py-4 text-center border-2 border-dashed border-[hsl(var(--border-300))] rounded-2xl">
                            <span class="text-xs text-[var(--text-tertiary)]">Keine Knoten in dieser Gruppe</span>
                        </div>
                    {/if}
                </div>

                <!-- Add Nodes Search -->
                <div class="relative">
                    <Input 
                        type="search" 
                        bind:value={searchQuery}
                        placeholder="Knoten suchen..."
                        aria-label="Knoten suchen"
                    />
                    {#if searchQuery.length > 0 && filteredNodes.length > 0}
                        <div class="absolute z-10 w-full mt-2 bg-[var(--bg-300)] border border-[hsl(var(--border-300))] rounded-xl shadow-2xl overflow-hidden">
                            {#each filteredNodes as node}
                                <button 
                                    onclick={() => { addNode(node.id); searchQuery = ''; }}
                                    class="w-full text-left px-4 py-3 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-100)] transition-all flex items-center justify-between"
                                >
                                    <span>{node.label}</span>
                                    <span class="text-[hsl(var(--accent-pro-100))]">+</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Import/Export -->
            <div class="pt-6 border-t border-[hsl(var(--border-300))] flex space-x-3">
                <Button variant="ghost" size="sm" onclick={handleExport} class="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.1em] border border-[hsl(var(--border-300))]" aria-label="Gruppe exportieren">
                    Exportieren
                </Button>
                <div class="flex-1 relative">
                    <input 
                        id="import-group"
                        type="file" 
                        accept=".json" 
                        onchange={handleImport}
                        class="absolute inset-0 opacity-0 cursor-pointer z-10"
                        aria-label="Gruppe importieren"
                    />
                    <Button variant="ghost" size="sm" class="w-full py-3 text-[10px] font-black uppercase tracking-[0.1em] border border-[hsl(var(--border-300))]">
                        Importieren
                    </Button>
                </div>
            </div>
        </div>
    {/snippet}

    {#snippet footer()}
        <Button variant="ghost" onclick={onClose} class="flex-1" aria-label="Abbrechen">
            Abbrechen
        </Button>
        <Button onclick={handleSave} class="flex-1" aria-label="Speichern">
            Speichern
        </Button>
    {/snippet}
</Modal>

<style>
</style>
