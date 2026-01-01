<script>
    import { onMount } from 'svelte';
    import { auth } from '$lib/auth/client.svelte';
    import { 
        Tabs, 
        TabList, 
        Tab, 
        TabPanels, 
        TabPanel,
        Button,
        Typography
    } from '$lib/components/aea';
    import { 
        IconMenu2, 
        IconArrowLeft, 
        IconChevronDown 
    } from "@tabler/icons-svelte";
    import SearchTab from './SearchTab.svelte';
    import ViewTab from './ViewTab.svelte';
    import GroupsTab from './GroupsTab.svelte';
    import DetailPanel from './DetailPanel.svelte';
    import GroupModal from './GroupModal.svelte';
    import KVGroupModal from './KVGroupModal.svelte';
    import GroupSelector from './GroupSelector.svelte';

    /**
     * @typedef {Object} Props
     * @property {any} [graph] - Die Instanz der Graph-Visualisierung
     * @property {string} [backUrl] - URL für den Zurück-Button
     */

    // Using $props() instead of export let for Svelte 5
    let { graph = null, backUrl = "" } = $props();

    let activeTab = $state('search');
    let selectedNode = $state(null);
    let openWithPdf = $state(false);
    let editingGroup = $state(null);
    let kvModalOpen = $state(false);
    let nodeToGroup = $state(null);
    let groups = $state([]);
    let isOpen = $state(false);

    // Desktop should probably be open by default
    onMount(() => {
        if (window.innerWidth > 1024) {
            isOpen = true;
        }
    });

    let settings = $state({
        showLabels: false,
        showLinks: true,
        showAntraege: true,
        showSupporters: true,
        nodeSize: 1
    });

    let stats = $state({
        nodes: 0,
        links: 0,
        project: 'bdk'
    });

    let allKvs = $derived.by(() => {
        if (!graph?.allNodes) return [];
        const kvs = new Set();
        graph.allNodes.forEach(node => {
            if (node.type === 'supporter' && node.sublabel) {
                kvs.add(node.sublabel);
            }
        });
        return Array.from(kvs).sort();
    });

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        stats.project = urlParams.get('project') || 'bdk';

        /**
         * Behandelt die Auswahl eines Knotens
         * @param {CustomEvent} event
         */
        const handleNodeSelected = (event) => {
            if (event.detail.node === null) {
                selectedNode = null;
                openWithPdf = false;
            } else if (event.detail.openPanel) {
                selectedNode = event.detail.node;
                openWithPdf = event.detail.openPdf || false;
            } else if (event.detail.action === 'add_group') {
                nodeToGroup = event.detail.node;
            }
        };

        /**
         * Behandelt das Laden von Daten
         * @param {CustomEvent} event
         */
        const handleDataLoaded = (event) => {
            stats.nodes = event.detail.nodes.length;
            stats.links = event.detail.links.length;
        };

        window.addEventListener('aea-node-selected', handleNodeSelected);
        window.addEventListener('aea-data-loaded', handleDataLoaded);

        // Sync initial state if graph already exists
        if (graph) {
            stats.nodes = graph.allNodes?.length || 0;
            stats.links = graph.allLinks?.length || 0;
            settings = { ...graph.settings };
        }

        return () => {
            window.removeEventListener('aea-node-selected', handleNodeSelected);
            window.removeEventListener('aea-data-loaded', handleDataLoaded);
        };
    });

    /**
     * Wählt einen Knoten aus und zentriert die Ansicht
     * @param {any} node - Der auszuwählende Knoten
     */
    function selectNode(node) {
        if (graph) {
            // Use the events the graph expects
            window.dispatchEvent(new CustomEvent('aea-view-action', {
                detail: { action: 'center', nodeId: node.id }
            }));
            window.dispatchEvent(new CustomEvent('aea-view-action', {
                detail: { action: 'highlight', nodeId: node.id }
            }));
        }
    }

    /**
     * Aktualisiert eine Visualisierungs-Einstellung
     * @param {string} key - Der Schlüssel der Einstellung
     * @param {any} value - Der neue Wert
     */
    function updateSetting(key, value) {
        settings[key] = value;
        // Dispatch event for the graph to pick up
        window.dispatchEvent(new CustomEvent('aea-filter-change', {
            detail: { type: key, value: value }
        }));
    }

    /**
     * Setzt die Ansicht des Graphen zurück
     */
    function resetView() {
        window.dispatchEvent(new CustomEvent('aea-view-action', {
            detail: { action: 'reset' }
        }));
    }

    /**
     * Schaltet das Panel um (offen/geschlossen)
     */
    function togglePanel() {
        isOpen = !isOpen;
    }

    /**
     * Behandelt Aktionen aus dem Detail-Panel
     * @param {string} action - Die auszuführende Aktion
     * @param {any} node - Der betroffene Knoten
     */
    function handlePanelAction(action, node) {
        if (!graph) return;

        switch (action) {
            case 'focus':
                window.dispatchEvent(new CustomEvent('aea-view-action', {
                    detail: { action: 'center', nodeId: node.id }
                }));
                break;
            case 'highlight':
                window.dispatchEvent(new CustomEvent('aea-view-action', {
                    detail: { action: 'highlight', nodeId: node.id }
                }));
                break;
            case 'details':
                selectedNode = node;
                break;
            case 'add_group':
                nodeToGroup = node;
                break;
        }
    }

    /**
     * Behandelt Aktionen für Gruppen
     * @param {string} action - Die auszuführende Aktion
     * @param {any} [data] - Zusätzliche Daten für die Aktion
     */
    function handleGroupAction(action, data) {
        switch (action) {
            case 'create':
                editingGroup = {
                    id: `g${Date.now()}`,
                    name: 'Neue Gruppe',
                    color: 'hsl(var(--accent-pro-100))',
                    nodes: []
                };
                break;
            case 'create_kv':
                kvModalOpen = true;
                break;
            case 'delete':
                if (confirm('Möchten Sie diese Gruppe wirklich löschen?')) {
                    groups = groups.filter(g => g.id !== data);
                    window.dispatchEvent(new CustomEvent('aea-group-update', {
                        detail: { groups }
                    }));
                }
                break;
            case 'density_settings':
                window.dispatchEvent(new CustomEvent('aea-density-update', {
                    detail: data
                }));
                break;
            case 'export':
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `aea-group-${data.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                a.click();
                break;
            case 'export_all':
                const allBlob = new Blob([JSON.stringify(groups, null, 2)], { type: 'application/json' });
                const allUrl = URL.createObjectURL(allBlob);
                const allA = document.createElement('a');
                allA.href = allUrl;
                allA.download = `aea-all-groups-${new Date().toISOString().split('T')[0]}.json`;
                allA.click();
                break;
            case 'import':
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const imported = JSON.parse(event.target.result);
                            if (Array.isArray(imported)) {
                                groups = [...groups, ...imported];
                            } else {
                                groups = [...groups, imported];
                            }
                            window.dispatchEvent(new CustomEvent('aea-group-update', {
                                detail: { groups }
                            }));
                        } catch (err) {
                            alert('Fehler beim Importieren der Datei.');
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
                break;
        }
    }

    /**
     * Speichert eine Gruppe
     * @param {any} groupData - Die Daten der Gruppe
     */
    function saveGroup(groupData) {
        const index = groups.findIndex(g => g.id === groupData.id);
        if (index >= 0) {
            groups[index] = groupData;
        } else {
            groups.push(groupData);
        }
        
        window.dispatchEvent(new CustomEvent('aea-group-update', {
            detail: { groups }
        }));
        editingGroup = null;
    }

    /**
     * Fügt einen Knoten zu einer Gruppe hinzu
     * @param {any} group - Die Zielgruppe
     * @param {any} node - Der hinzuzufügende Knoten
     */
    function addToGroup(group, node) {
        const updatedGroup = {
            ...group,
            nodes: group.nodes.includes(node.id) ? group.nodes : [...group.nodes, node.id]
        };
        saveGroup(updatedGroup);
        nodeToGroup = null;
        activeTab = 'groups';
    }

    /**
     * Erstellt eine neue Gruppe aus einem Knoten
     * @param {any} node - Der initiale Knoten für die Gruppe
     */
    function createFromNode(node) {
        editingGroup = {
            id: `g${Date.now()}`,
            name: 'Neue Gruppe',
            color: 'hsl(var(--accent-pro-100))',
            nodes: [node.id]
        };
        nodeToGroup = null;
    }
    /**
     * Erstellt eine Gruppe basierend auf ausgewählten KVs
     * @param {string[]} selectedKvs - Die ausgewählten KVs
     */
    function createGroupFromKvs(selectedKvs) {
        if (!graph?.allNodes) return;
        
        const nodeIds = graph.allNodes
            .filter(node => node.type === 'supporter' && selectedKvs.includes(node.sublabel))
            .map(node => node.id);
            
        if (nodeIds.length === 0) {
            alert('Keine Unterstützer für die ausgewählten KVs gefunden.');
            return;
        }
        
        const newGroup = {
            id: `g${Date.now()}`,
            name: selectedKvs.length === 1 ? `KV ${selectedKvs[0]}` : `KVs: ${selectedKvs.join(', ')}`,
            color: 'hsl(var(--accent-pro-100))',
            nodes: nodeIds
        };
        
        saveGroup(newGroup);
        activeTab = 'groups';
    }
</script>

<!-- Detail Panel (Overlay) -->
{#if selectedNode}
    <DetailPanel 
        node={selectedNode} 
        project={stats.project}
        allLinks={graph?.allLinks || []} 
        initialOpenPdf={openWithPdf}
        onClose={() => { selectedNode = null; openWithPdf = false; }}
        onAction={handlePanelAction}
    />
{/if}

<!-- KV Group Modal (Overlay) -->
{#if kvModalOpen}
    <KVGroupModal 
        {allKvs}
        onClose={() => kvModalOpen = false}
        onCreate={createGroupFromKvs}
    />
{/if}

<!-- Group Modal (Overlay) -->
{#if editingGroup}
    <GroupModal 
        group={editingGroup} 
        allNodes={graph?.allNodes || []} 
        onClose={() => editingGroup = null}
        onSave={saveGroup}
        onExport={(data) => handleGroupAction('export', data)}
    />
{/if}

<!-- Group Selector (Overlay) -->
{#if nodeToGroup}
    <GroupSelector 
        node={nodeToGroup}
        {groups}
        onClose={() => nodeToGroup = null}
        onSelect={addToGroup}
        onCreate={createFromNode}
    />
{/if}

<div class="fixed top-4 right-4 md:top-10 md:right-10 z-[5000] flex flex-col items-end pointer-events-none w-[calc(100%-2rem)] md:w-80">
    <!-- Toggle Button (only when closed) -->
    {#if !isOpen}
        <Button 
            variant="ghost" 
            size="icon" 
            class="pointer-events-auto rounded-xl bg-background/80 backdrop-blur-xl border border-white/5 shadow-lg lg:hidden"
            onclick={togglePanel}
        >
            <IconMenu2 size={20} class="text-white" />
        </Button>
    {/if}

    <!-- Panel Content -->
    {#if isOpen}
        <div class="overall-container pointer-events-auto max-h-[85vh] md:max-h-[70vh] w-full flex flex-col overflow-hidden z-40 rounded-2xl border-width:0  border-transparent shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/3.5%),0_0_0_0.5px_hsla(var(--border-300)/0.15)] hover:shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/3.5%),0_0_0_0.5px_hsla(var(--border-200)/0.3)] focus-within:shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/7.5%),0_0_0_0.5px_hsla(var(--border-200)/0.3)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-background/90 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            
            <div class="flex items-center gap-2 px-4 pt-4 pb-0 bg-[var(--text-primary)]/[0.02]">
                {#if backUrl}
                    <a 
                        href={backUrl}
                        class="flex-1 flex items-center gap-2 px-3 py-2 text-[10px] font-black tracking-widest uppercase border border-[var(--text-primary)]/10 rounded-xl hover:bg-[var(--text-primary)]/5 transition-colors text-[var(--text-primary)]"
                    >
                        <IconArrowLeft size={12} />
                        Zur Übersicht
                    </a>
                {/if}

                <!-- Toggle Button (inside panel) -->
                <Button 
                    variant="ghost" 
                    size="sm" 
                    class="h-9 px-3 rounded-xl border border-white/5 bg-white/5 lg:hidden"
                    onclick={togglePanel}
                >
                    <IconChevronDown size={16} class="text-white/60" />
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => activeTab = v} class="flex flex-col flex-1 min-h-0 gap-0">
                <!-- Tabs Navigation -->
                <TabList class="w-full rounded-none border-b border-[hsl(var(--text-500)/0.1)] bg-[var(--text-primary)]/[0.02] h-12 p-0 flex flex-none">
                    <Tab 
                        value="search" 
                        class="flex-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(var(--accent-pro-100))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--accent-pro-100))] data-[state=active]:shadow-none text-[10px] tracking-[0.2em] font-modern font-black uppercase transition-all opacity-60 data-[state=active]:opacity-100"
                    >
                        Suche
                    </Tab>
                    <Tab 
                        value="view" 
                        class="flex-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(var(--accent-pro-100))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--accent-pro-100))] data-[state=active]:shadow-none text-[10px] tracking-[0.2em] font-modern font-black uppercase transition-all opacity-60 data-[state=active]:opacity-100"
                    >
                        Ansicht
                    </Tab>
                    <Tab 
                        value="groups" 
                        class="flex-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(var(--accent-pro-100))] data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--accent-pro-100))] data-[state=active]:shadow-none text-[10px] tracking-[0.2em] font-modern font-black uppercase transition-all opacity-60 data-[state=active]:opacity-100"
                    >
                        Gruppen
                    </Tab>
                </TabList>

                <!-- Scrollable Content Area -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-4 md:pl-8 md:pr-2 pt-4 pb-8">
                    <div class="md:pr-6 space-y-6 md:space-y-10">
                        <TabPanels>
                            <TabPanel value="search" class="m-0 outline-none p-0">
                                <SearchTab {graph} onSelect={selectNode} />
                            </TabPanel>

                            <TabPanel value="view" class="m-0 outline-none p-0">
                                <ViewTab {settings} onUpdate={updateSetting} onReset={resetView} />
                            </TabPanel>

                            <TabPanel value="groups" class="m-0 outline-none p-0">
                                <GroupsTab 
                                    {groups} 
                                    onGroupAction={handleGroupAction}
                                    onEditGroup={(group) => editingGroup = group}
                                />
                            </TabPanel>
                        </TabPanels>
                    </div>
                </div>
            </Tabs>
        </div>
    {/if}
</div>

<style>
</style>

