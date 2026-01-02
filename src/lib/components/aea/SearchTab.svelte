<script>
    import { 
        Button, 
        Input, 
        Card, 
        CardContent 
    } from '$lib/components/aea';
    import { IconSearch, IconSearchOff } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {any} graph - The D3 graph instance containing the data to search.
     * @property {(node: any) => void} onSelect - Callback function triggered when a node is selected from results.
     */

    /** @type {Props} */
    let { graph, onSelect } = $props();

    /** @type {string} - The current search query string. */
    let searchQuery = $state('');
    /** @type {any[]} - The list of nodes matching the search query. */
    let searchResults = $state([]);

    /**
     * Performs a search across all nodes in the graph based on the query.
     * Searches in label, sublabel, and ID (case-insensitive).
     */
    function handleSearch() {
        if (!graph) return;
        if (!searchQuery || searchQuery.length < 2) {
            searchResults = [];
            return;
        }

        const nodes = graph.allNodes || [];
        searchResults = nodes.filter(n =>
            (n.label && n.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (n.sublabel && n.sublabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (n.id && n.id.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 1000);
    }

    /**
     * Behandelt den Rechtsklick auf eine Karte, um das Kontextmenü zu öffnen.
     * @param {MouseEvent} event
     * @param {any} node
     */
    function handleContextMenu(event, node) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('aea-context-menu', {
            detail: {
                node: node,
                x: event.clientX,
                y: event.clientY
            }
        }));
    }
</script>

<div class="space-y-6">
    <div class="relative">
        <Input 
            type="search"
            bind:value={searchQuery}
            oninput={handleSearch}
            placeholder="Nach Entitäten suchen..."
            class="bg-[var(--text-primary)]/5 border-[hsl(var(--text-500)/0.1)] rounded-2xl h-12 pl-12 pr-5 text-sm font-modern placeholder:text-[var(--text-tertiary)] w-full"
        />
        <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <IconSearch size={20} class="text-[var(--text-primary)]" />
        </div>
    </div>

    {#if searchResults.length > 0}
        <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
                <h4 class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Ergebnisse</h4>
                <span class="text-[10px] font-mono font-bold text-[hsl(var(--accent-pro-100))] bg-[hsl(var(--accent-pro-100))]/10 px-2 py-0.5 rounded-md">{searchResults.length}</span>
            </div>
            <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {#each searchResults as node}
                    <Card 
                        interactive 
                        onclick={() => onSelect(node)} 
                        oncontextmenu={(e) => handleContextMenu(e, node)}
                        class="group bg-[var(--text-primary)]/5 border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 hover:border-[hsl(var(--accent-pro-100))]/30 transition-all duration-300 rounded-2xl overflow-hidden"
                    >
                        <CardContent class="p-4">
                            <div class="font-serif text-[var(--text-primary)] group-hover:text-[hsl(var(--accent-pro-100))] transition-colors text-lg leading-tight">{node.label}</div>
                            {#if node.sublabel}
                                <div class="text-[10px] text-[var(--text-tertiary)] mt-2 uppercase font-black tracking-widest font-modern">{node.sublabel}</div>
                            {:else}
                                <div class="text-[8px] text-[var(--text-tertiary)] mt-2 font-mono">{node.id}</div>
                            {/if}
                            <div class="mt-4 flex items-center space-x-2">
                                <span class="text-[8px] px-2 py-1 rounded-lg bg-[hsl(var(--accent-pro-100))]/10 text-[hsl(var(--accent-pro-100))] uppercase font-black tracking-widest border border-[hsl(var(--accent-pro-100))]/20">{node.type}</span>
                                {#if node.linkCount}
                                    <span class="text-[8px] px-2 py-1 rounded-lg bg-[var(--text-primary)]/5 text-[var(--text-tertiary)] uppercase font-black tracking-widest border border-[var(--text-primary)]/10">{node.linkCount} Links</span>
                                {/if}
                            </div>
                        </CardContent>
                    </Card>
                {/each}
            </div>
        </div>
    {:else if searchQuery.length >= 2}
        <div class="text-center py-16 bg-[var(--text-primary)]/5 rounded-3xl border border-dashed border-[hsl(var(--text-500)/0.2)]">
            <div class="flex justify-center mb-4 opacity-20">
                <IconSearchOff size={32} />
            </div>
            <p class="text-sm text-[var(--text-tertiary)] font-modern">Keine Ergebnisse für <span class="text-[var(--text-primary)] font-bold italic">"{searchQuery}"</span></p>
        </div>
    {:else}
        <div class="text-center py-16 opacity-40">
            <div class="w-12 h-12 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] flex items-center justify-center mx-auto mb-4">
                <IconSearch size={24} class="text-[var(--text-tertiary)]" />
            </div>
            <p class="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] font-black">Suche starten</p>
            <p class="text-[8px] text-[var(--text-tertiary)] uppercase tracking-widest mt-2 font-bold opacity-60">Gib mindestens zwei Zeichen ein.</p>
        </div>
    {/if}
</div>
