<script>
    import { 
        Button, 
        Input, 
        Modal,
        Typography,
        Badge,
        Separator
    } from '$lib/components/aea';
    import { onMount } from 'svelte';
    import { 
        IconX, 
        IconPlus, 
        IconDownload, 
        IconUpload, 
        IconSearch,
        IconPalette,
        IconUsers,
        IconSettings,
        IconFileText,
        IconUser
    } from '@tabler/icons-svelte';

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

    const presets = [
        '#7f6df2', // Brand Purple
        '#ff4d4d', // Red
        '#4dff88', // Green
        '#4db8ff', // Blue
        '#ffb84d', // Orange
        '#ff4db8'  // Pink
    ];

    // Sync state with group prop when it changes
    $effect(() => {
        name = group?.name ?? 'Neue Gruppe';
        color = group?.color ?? presets[0];
        groupNodes = group?.nodes || [];
    });

    let filteredNodes = $derived(
        allNodes.filter(node => 
            node.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !groupNodes.includes(node.id)
        ).slice(0, 8)
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
    title="Gruppen-Konfiguration"
    size="lg"
    accent="brand"
>
    {#snippet body()}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <!-- Linke Spalte: Basis-Einstellungen -->
            <div class="lg:col-span-5 space-y-8">
                <section class="space-y-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-[hsl(var(--accent-pro-100))]/10 flex items-center justify-center text-[hsl(var(--accent-pro-100))]">
                            <IconSettings size={20} />
                        </div>
                        <Typography variant="h4" class="text-white">Allgemein</Typography>
                    </div>

                    <div class="space-y-4">
                        <Input 
                            label="Name der Gruppe"
                            placeholder="z.B. Fokus-Cluster A"
                            bind:value={name}
                            class="w-full"
                        />

                        <div class="space-y-3">
                            <div class="text-[10px] font-black text-white/30 uppercase tracking-widest block ml-1">Farbschema</div>
                            <div class="flex flex-wrap gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                {#each presets as p}
                                    <button 
                                        onclick={() => color = p}
                                        class="w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110"
                                        style="background-color: {p}; border-color: {color === p ? 'white' : 'transparent'}; box-shadow: {color === p ? `0 0 15px ${p}` : 'none'}"
                                        aria-label={`Farbe ${p}`}
                                    ></button>
                                {/each}
                                <div class="w-1 px-1 bg-white/10 mx-1"></div>
                                <div class="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/5 hover:border-white/20 transition-all">
                                    <input 
                                        type="color" 
                                        bind:value={color}
                                        class="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            <Typography variant="label" class="text-white/40 mb-1">Datenverwaltung</Typography>
                            <Typography variant="body" class="text-[9px] text-white/20 uppercase tracking-widest">JSON Format</Typography>
                        </div>
                        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                            <IconFileText size={16} />
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" onclick={handleExport} class="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-bold border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all">
                            <IconDownload size={14} class="text-white/40" /> EXPORT
                        </Button>
                        <div class="relative">
                            <input 
                                type="file" 
                                accept=".json" 
                                onchange={handleImport}
                                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <Button variant="outline" size="sm" class="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-bold border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all">
                                <IconUpload size={14} class="text-white/40" /> IMPORT
                            </Button>
                        </div>
                    </div>
                </section>

                <!-- Statistics Card -->
                <section class="p-6 rounded-3xl bg-[hsl(var(--accent-pro-100))]/5 border border-[hsl(var(--accent-pro-100))]/10">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-[hsl(var(--accent-pro-100))]/10 flex items-center justify-center text-[hsl(var(--accent-pro-100))]">
                            <IconUsers size={24} />
                        </div>
                        <div>
                            <Typography variant="body" class="text-xs text-white/40">Mitglieder insgesamt</Typography>
                            <Typography variant="h3" class="text-white leading-none">{groupNodes.length}</Typography>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Rechte Spalte: Mitglieder-Management -->
            <div class="lg:col-span-7 flex flex-col h-full min-h-[450px]">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-[hsl(var(--accent-pro-100))]/10 flex items-center justify-center text-[hsl(var(--accent-pro-100))]">
                            <IconUsers size={20} />
                        </div>
                        <Typography variant="h4" class="text-white">Mitglieder</Typography>
                    </div>
                    <Badge variant="brand" class="px-3 py-1">{groupNodes.length} Knoten</Badge>
                </div>

                <!-- Search Input -->
                <div class="relative mb-6">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                        <IconSearch size={18} />
                    </div>
                    <input 
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Knoten suchen und hinzufügen..."
                        class="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-pro-100))]/50 transition-all placeholder:text-white/20 shadow-inner"
                    />

                    {#if searchQuery.length > 0 && filteredNodes.length > 0}
                        <div class="absolute z-20 w-full mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {#each filteredNodes as node}
                                <button 
                                    onclick={() => { addNode(node.id); searchQuery = ''; }}
                                    class="w-full text-left px-5 py-4 hover:bg-white/5 transition-all flex items-center justify-between group"
                                >
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">
                                            {#if node.type === 'supporter'}
                                                <IconUser size={16} />
                                            {:else}
                                                <IconFileText size={16} />
                                            {/if}
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-xs font-bold text-white group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">{node.label}</span>
                                            <span class="text-[10px] text-white/30 uppercase tracking-widest">{node.type}</span>
                                        </div>
                                    </div>
                                    <div class="w-6 h-6 rounded-full bg-[hsl(var(--accent-pro-100))]/20 flex items-center justify-center text-[hsl(var(--accent-pro-100))] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <IconPlus size={14} />
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Current Members Scroll Area -->
                <div class="flex-1 bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-inner">
                    <div class="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <Typography variant="label" class="text-[10px] text-white/30 font-black uppercase tracking-widest">Aktuelle Auswahl</Typography>
                        {#if groupNodes.length > 0}
                            <button 
                                onclick={() => groupNodes = []}
                                class="text-[9px] font-black text-red-400/50 hover:text-red-400 uppercase tracking-widest transition-colors"
                            >
                                Alle entfernen
                            </button>
                        {/if}
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {#if groupNodes.length === 0}
                            <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20 p-10">
                                <div class="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                                    <IconUsers size={40} stroke-width={1} />
                                </div>
                                <div class="max-w-[200px] space-y-1">
                                    <Typography variant="body" class="text-sm font-bold">Keine Mitglieder</Typography>
                                    <Typography variant="body" class="text-xs">Nutze die Suche oben, um Knoten zu dieser Gruppe hinzuzufügen.</Typography>
                                </div>
                            </div>
                        {:else}
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {#each groupNodes as nodeId}
                                    {@const node = allNodes.find(n => n.id === nodeId)}
                                    {#if node}
                                        <div class="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/5 hover:border-white/10 transition-all hover:shadow-lg">
                                            <div class="flex items-center gap-3 overflow-hidden">
                                                <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {color}; box-shadow: 0 0 10px {color}"></div>
                                                <div class="flex flex-col min-w-0">
                                                    <span class="text-[11px] font-bold text-white/90 truncate">{node.label}</span>
                                                    <span class="text-[9px] text-white/20 uppercase tracking-tighter">{node.id}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onclick={() => removeNode(nodeId)}
                                                class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                                title="Entfernen"
                                            >
                                                <IconX size={14} />
                                            </button>
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/snippet}

    {#snippet footer()}
        <div class="flex items-center justify-between w-full">
            <Typography variant="body" class="text-[10px] text-white/20 uppercase tracking-[0.2em] hidden sm:block">
                AEA Data Viz Engine v2.4
            </Typography>
            <div class="flex gap-4 w-full sm:w-auto">
                <Button variant="ghost" onclick={onClose} class="flex-1 sm:flex-none px-8 h-12 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                    Abbrechen
                </Button>
                <Button onclick={handleSave} class="flex-1 sm:flex-none px-12 h-12 text-[10px] font-black uppercase tracking-widest bg-[hsl(var(--accent-pro-100))] hover:bg-[hsl(var(--accent-pro-100))]/80 text-white shadow-[0_0_20px_hsla(var(--accent-pro-100),0.3)] transition-all">
                    Änderungen speichern
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
