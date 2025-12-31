<script>
    import { 
        Button, 
        Modal, 
        Card, 
        CardContent, 
        Table, 
        TableBody, 
        TableCell, 
        TableHeadCell, 
        TableRow 
    } from '$lib/components/aea';
    import PdfViewer from './PdfViewer.svelte';
    import { onMount } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {any} node - The selected node to display details for.
     * @property {string} project - The current project ID (e.g., 'bdk').
     * @property {any[]} allLinks - All links in the graph to find connections.
     * @property {boolean} [initialOpenPdf] - Whether to open the PDF viewer immediately.
     * @property {() => void} onClose - Callback function to close the panel.
     * @property {(action: string, node: any) => void} onAction - Callback for actions like 'focus', 'highlight', or 'details' on a related node.
     */

    /** @type {Props} */
    let { node, project = 'bdk', allLinks = [], initialOpenPdf = false, onClose, onAction } = $props();

    let isPdfOpen = $state(false);

    $effect(() => {
        if (initialOpenPdf !== undefined) {
            isPdfOpen = initialOpenPdf;
        }
    });

    /** @type {any[]} - Reactive derived list of neighbor nodes connected to the current node. */
    let connections = $derived(
        allLinks
            .filter(l => (l.source.id === node?.id) || (l.target.id === node?.id))
            .map(l => {
                const neighbor = l.source.id === node.id ? l.target : l.source;
                return neighbor;
            })
    );

    /** @type {string|null} - Reactive derived path to the PDF document for 'antrag' type nodes. */
    let pdfPath = $derived(
        node?.type === 'antrag' 
            ? `/data/${project}/pdf/${String(node.id).replace(/[<>:"/\\|?*]/g, '_').trim()}.pdf` 
            : null
    );

    /**
     * Internal handler for node actions.
     * @param {string} action - The action type (e.g., 'focus', 'highlight', 'details').
     * @param {any} [targetNode=node] - The node to perform the action on.
     */
    function handleAction(action, targetNode = node) {
        if (onAction) onAction(action, targetNode);
    }
</script>

<Modal 
    open={!!node} 
    onclose={onClose}
    size={isPdfOpen ? 'lg' : 'sm'}
    accent={node.type === 'antrag' ? 'brand' : 'success'}
    title={node.label}
>
    {#snippet body()}
        <!-- Content Area -->
        <div class="flex flex-col min-h-0">
            {#if isPdfOpen}
                <div class="flex flex-col h-[70vh]">
                    <div class="flex items-center mb-4">
                        <Button 
                            variant="ghost"
                            onclick={() => isPdfOpen = false}
                            class="flex items-center gap-2 px-3 py-2 text-[10px] font-black tracking-widest uppercase border border-[var(--text-primary)]/10 rounded-xl hover:bg-[var(--text-primary)]/5 transition-colors text-[var(--text-tertiary)]"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7 7-7" />
                            </svg>
                            Zurück
                        </Button>
                    </div>
                    <PdfViewer url={pdfPath} title={node.id} />
                </div>
            {:else}
                <div class="space-y-8">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-2 gap-4">
                        <Card glass>
                            <CardContent class="p-4">
                                <span class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">ID</span>
                                <span class="text-sm font-mono text-[var(--text-primary)]">{node.id}</span>
                            </CardContent>
                        </Card>
                        <Card glass>
                            <CardContent class="p-4">
                                <span class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">Typ</span>
                                <span class="text-sm font-mono text-[var(--text-primary)] uppercase">{node.type || 'Knoten'}</span>
                            </CardContent>
                        </Card>
                    </div>

                    <!-- Description / Content -->
                    <div class="space-y-3">
                        <span class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">Beschreibung</span>
                        <p class="text-sm text-[var(--text-primary)]/80 leading-relaxed font-modern">
                            {node.sublabel ? `${node.label} (${node.sublabel})` : node.label} ist Teil des Netzwerks. 
                            {node.type === 'antrag' ? ' Dieser Antrag weist folgende Verbindungen zu Unterstützern auf.' : ' Diese Person unterstützt folgende Anträge.'}
                        </p>
                    </div>

                    <!-- Connections List -->
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">Verbindungen</span>
                            <span class="text-[10px] font-mono text-[var(--text-tertiary)]">{connections.length} Total</span>
                        </div>
                        
                        {#if connections.length > 0}
                            <Table hoverable glass compact>
                                {#snippet head()}
                                    <TableHeadCell>Typ</TableHeadCell>
                                    <TableHeadCell>Label</TableHeadCell>
                                    <TableHeadCell></TableHeadCell>
                                {/snippet}
                                <TableBody>
                                    {#each connections as neighbor (neighbor.id)}
                                        <TableRow 
                                            class="cursor-pointer group" 
                                            onclick={() => handleAction('details', neighbor)}
                                        >
                                            <TableCell>
                                                <div class={`w-2 h-2 rounded-full ${neighbor.type === 'antrag' ? 'bg-[hsl(var(--accent-secondary-100))]' : 'bg-[hsl(var(--success-100))]'} opacity-60`}></div>
                                            </TableCell>
                                            <TableCell>
                                                <span class="text-xs text-[var(--text-primary)] truncate block max-w-[120px] font-modern font-bold">{neighbor.label}</span>
                                            </TableCell>
                                            <TableCell class="text-right">
                                                <span class="text-[10px] text-[hsl(var(--accent-pro-100))] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 inline-block">→</span>
                                            </TableCell>
                                        </TableRow>
                                    {/each}
                                </TableBody>
                            </Table>
                        {:else}
                            <div class="text-center py-6 border-2 border-dashed border-[var(--text-primary)]/5 rounded-2xl">
                                <span class="text-xs text-[var(--text-tertiary)] font-modern">Keine Verbindungen gefunden</span>
                            </div>
                        {/if}
                    </div>

                    <!-- Action Buttons -->
                    <div class="pt-6 border-t border-[hsl(var(--text-500)/0.2)] space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <Button 
                                onclick={() => handleAction('focus')}
                                class="w-full flex items-center justify-center space-x-2"
                            >
                                <span>🎯</span>
                                <span>Fokus</span>
                            </Button>
                            <Button 
                                variant="outline"
                                onclick={() => handleAction('highlight')}
                                class="w-full flex items-center justify-center space-x-2"
                            >
                                <span>✨</span>
                                <span>Hervorheben</span>
                            </Button>
                        </div>
                        <Button 
                            variant="ghost"
                            onclick={() => handleAction('add_group')}
                            class="w-full flex items-center justify-center space-x-2 border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5"
                        >
                            <span>📁</span>
                            <span>Zu Gruppe hinzufügen</span>
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    {/snippet}

    {#snippet footer()}
        <!-- Footer / PDF Toggle -->
        {#if pdfPath && !isPdfOpen}
            <Button 
                variant="ghost"
                onclick={() => isPdfOpen = true}
                class="w-full h-auto flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.2)] hover:bg-[var(--text-primary)]/10 transition-all group"
            >
                <div class="flex items-center space-x-3 text-left">
                    <div class="w-10 h-10 rounded-xl bg-[hsl(var(--danger-100))]/10 flex items-center justify-center text-[hsl(var(--danger-100))] text-lg">
                        📄
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-[var(--text-primary)] block truncate max-w-[150px] font-modern">
                            {node.id}.pdf
                        </span>
                        <span class="text-[10px] text-[var(--text-tertiary)] font-modern uppercase tracking-wider">Dokument öffnen</span>
                    </div>
                </div>
                <span class="text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform">→</span>
            </Button>
        {/if}
    {/snippet}
</Modal>

<style>
</style>
