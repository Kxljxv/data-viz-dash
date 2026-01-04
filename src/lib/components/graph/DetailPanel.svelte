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
        TableRow,
        Typography
    } from '$lib/components/aea';
    import PdfViewer from './PdfViewer.svelte';
    import { onMount } from 'svelte';
    import { 
        IconTarget, 
        IconSparkles, 
        IconFolderPlus, 
        IconFileText, 
        IconArrowRight 
    } from '@tabler/icons-svelte';

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
        (node?.type === 'antrag' || node?.type === 'amendment')
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
    size={isPdfOpen ? 'xl' : 'sm'}
    title={node.label}
>
    {#snippet body()}
        <!-- Content Area -->
        <div class="flex-1 overflow-hidden flex flex-col min-h-0">
            {#if isPdfOpen}
                <div class="flex-1 p-6 overflow-hidden flex flex-col h-[70vh]">
                    <PdfViewer url={pdfPath} title={node.id} />
                </div>
            {:else}
                <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 max-h-[70vh]">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-2 gap-4">
                        <Card variant="glass" class="border border-[hsl(var(--text-500)/0.2)]">
                            <CardContent class="p-4">
                                <Typography variant="label" class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">ID</Typography>
                                <Typography variant="body" class="text-sm font-mono text-[var(--text-primary)]">{node.id}</Typography>
                            </CardContent>
                        </Card>
                        <Card variant="glass" class="border border-[hsl(var(--text-500)/0.2)]">
                            <CardContent class="p-4">
                                <Typography variant="label" class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">Typ</Typography>
                                <Typography variant="body" class="text-sm font-mono text-[var(--text-primary)] uppercase">{node.type || 'Knoten'}</Typography>
                            </CardContent>
                        </Card>
                    </div>

                    <!-- Description / Content -->
                    <div class="space-y-3">
                        <Typography variant="label" class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">Beschreibung</Typography>
                        <Typography variant="body" class="text-sm text-[var(--text-primary)]/80 leading-relaxed font-modern">
                            {node.sublabel ? `${node.label} (${node.sublabel})` : node.label} ist Teil des Netzwerks. 
                            {(node.type === 'antrag' || node.type === 'amendment') ? ' Dieser Antrag weist folgende Verbindungen zu Unterstützern auf.' : ' Diese Person unterstützt folgende Anträge.'}
                        </Typography>
                    </div>

                    <!-- Connections List -->
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <Typography variant="label" class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">Verbindungen</Typography>
                            <span class="text-[10px] font-mono text-[var(--text-tertiary)]">{connections.length} Total</span>
                        </div>
                        
                        {#if connections.length > 0}
                            <div class="rounded-2xl border border-[hsl(var(--text-500)/0.1)] overflow-hidden bg-[var(--text-primary)]/5">
                                <Table>
                                    <thead>
                                        <TableRow class="hover:bg-transparent border-b border-[hsl(var(--text-500)/0.1)]">
                                            <TableHeadCell class="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] h-10">Typ</TableHeadCell>
                                            <TableHeadCell class="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] h-10">Label</TableHeadCell>
                                            <TableHeadCell align="right" class="h-10"></TableHeadCell>
                                        </TableRow>
                                    </thead>
                                    <TableBody>
                                        {#each connections as neighbor (neighbor.id)}
                                            <TableRow 
                                                class="cursor-pointer group border-b border-[hsl(var(--text-500)/0.05)] last:border-0 hover:bg-[var(--text-primary)]/5 transition-colors" 
                                                onclick={() => handleAction('details', neighbor)}
                                            >
                                                <TableCell class="py-3">
                                                    <div class={`w-2 h-2 rounded-full ${(neighbor.type === 'antrag' || neighbor.type === 'amendment') ? 'bg-[hsl(var(--accent-secondary-100))]' : 'bg-[hsl(var(--success-100))]'} opacity-60`}></div>
                                                </TableCell>
                                                <TableCell class="py-3">
                                                    <Typography variant="body" class="text-xs text-[var(--text-primary)] truncate block max-w-[120px] font-modern font-bold">{neighbor.label}</Typography>
                                                </TableCell>
                                                <TableCell align="right" class="py-3">
                                                    <IconArrowRight size={14} class="text-[hsl(var(--accent-pro-100))] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 inline-block" />
                                                </TableCell>
                                            </TableRow>
                                        {/each}
                                    </TableBody>
                                </Table>
                            </div>
                        {:else}
                            <div class="text-center py-6 border-2 border-dashed border-[var(--text-primary)]/5 rounded-2xl">
                                <Typography variant="body" class="text-xs text-[var(--text-tertiary)] font-modern">Keine Verbindungen gefunden</Typography>
                            </div>
                        {/if}
                    </div>

                    <!-- Action Buttons -->
                    <div class="pt-6 border-t border-[hsl(var(--text-500)/0.2)] space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <Button 
                                onclick={() => handleAction('focus')}
                                class="w-full flex items-center justify-center space-x-2 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]"
                            >
                                <IconTarget size={18} />
                                <span>Fokus</span>
                            </Button>
                            <Button 
                                variant="outline"
                                onclick={() => handleAction('highlight')}
                                class="w-full flex items-center justify-center space-x-2 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border-[var(--text-primary)]/10"
                            >
                                <IconSparkles size={18} />
                                <span>Hervorheben</span>
                            </Button>
                        </div>
                        <Button 
                            variant="ghost"
                            onclick={() => handleAction('add_group')}
                            class="w-full flex items-center justify-center space-x-2 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5"
                        >
                            <IconFolderPlus size={18} />
                            <span>Zu Gruppe hinzufügen</span>
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    {/snippet}

    {#snippet footer()}
        {#if pdfPath && !isPdfOpen}
            <div class="w-full">
                <Button 
                    variant="ghost"
                    onclick={() => isPdfOpen = true}
                    class="w-full h-auto flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.2)] hover:bg-[var(--text-primary)]/10 transition-all group"
                >
                    <div class="flex items-center space-x-3 text-left">
                        <div class="w-10 h-10 rounded-xl bg-[hsl(var(--danger-100))]/10 flex items-center justify-center text-[hsl(var(--danger-100))]">
                            <IconFileText size={24} />
                        </div>
                        <div class="flex flex-col">
                            <Typography variant="body" class="text-xs font-bold text-[var(--text-primary)] block truncate max-w-[150px] font-modern">
                                {node.id}.pdf
                            </Typography>
                            <Typography variant="label" class="text-[10px] text-[var(--text-tertiary)] font-modern uppercase tracking-wider">Dokument öffnen</Typography>
                        </div>
                    </div>
                    <IconArrowRight size={18} class="text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        {/if}
    {/snippet}
</Modal>

<style>
</style>
