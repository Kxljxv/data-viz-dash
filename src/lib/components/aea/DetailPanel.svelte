<script>
    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import { Card, CardContent } from '$lib/components/ui/card';
    import * as Table from '$lib/components/ui/table';
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

<Dialog.Root open={!!node} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Content class="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl transition-all duration-300 {isPdfOpen ? 'sm:max-w-4xl' : 'sm:max-w-sm'}">
        <!-- Header -->
        <Dialog.Header class="p-6 border-b border-[hsl(var(--text-500)/0.2)] flex flex-row justify-between items-center bg-gradient-to-r from-[var(--text-primary)]/5 to-transparent space-y-0">
            <div class="flex items-center space-x-3">
                {#if isPdfOpen}
                    <Button 
                        variant="ghost"
                        size="icon"
                        onclick={() => isPdfOpen = false}
                        class="h-8 w-8 hover:bg-[var(--text-primary)]/5 rounded-xl transition-colors text-[var(--text-tertiary)]"
                        title="Zurück zur Übersicht"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7 7-7" />
                        </svg>
                    </Button>
                {/if}
                <div class={`w-3 h-3 rounded-full ${node.type === 'antrag' ? 'bg-[hsl(var(--accent-secondary-100))]' : 'bg-[hsl(var(--success-100))]'} shadow-lg shrink-0`}></div>
                <Dialog.Title class="text-xl font-serif text-[var(--text-primary)] truncate {isPdfOpen ? 'max-w-md' : 'max-w-[200px]'}">{node.label}</Dialog.Title>
            </div>
        </Dialog.Header>

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
                        <Card class="bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.2)]">
                            <CardContent class="p-4">
                                <span class="text-[10px] font-black text-[hsl(var(--text-300))] uppercase tracking-[0.2em] block mb-1">ID</span>
                                <span class="text-sm font-mono text-[var(--text-primary)]">{node.id}</span>
                            </CardContent>
                        </Card>
                        <Card class="bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.2)]">
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
                            <div class="rounded-2xl border border-[hsl(var(--text-500)/0.1)] overflow-hidden bg-[var(--text-primary)]/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <Table.Root>
                                    <Table.Header class="bg-[var(--text-primary)]/5">
                                        <Table.Row class="hover:bg-transparent border-b border-[hsl(var(--text-500)/0.1)]">
                                            <Table.Head class="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] h-10">Typ</Table.Head>
                                            <Table.Head class="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] h-10">Label</Table.Head>
                                            <Table.Head class="text-right h-10"></Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {#each connections as neighbor (neighbor.id)}
                                            <Table.Row 
                                                class="cursor-pointer group border-b border-[hsl(var(--text-500)/0.05)] last:border-0 hover:bg-[var(--text-primary)]/5 transition-colors" 
                                                onclick={() => handleAction('details', neighbor)}
                                            >
                                                <Table.Cell class="py-3">
                                                    <div class={`w-2 h-2 rounded-full ${neighbor.type === 'antrag' ? 'bg-[hsl(var(--accent-secondary-100))]' : 'bg-[hsl(var(--success-100))]'} opacity-60`}></div>
                                                </Table.Cell>
                                                <Table.Cell class="py-3">
                                                    <span class="text-xs text-[var(--text-primary)] truncate block max-w-[120px] font-modern font-bold">{neighbor.label}</span>
                                                </Table.Cell>
                                                <Table.Cell class="text-right py-3">
                                                    <span class="text-[10px] text-[hsl(var(--accent-pro-100))] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 inline-block">→</span>
                                                </Table.Cell>
                                            </Table.Row>
                                        {/each}
                                    </Table.Body>
                                </Table.Root>
                            </div>
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
                                class="w-full flex items-center justify-center space-x-2 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]"
                            >
                                <span>🎯</span>
                                <span>Fokus</span>
                            </Button>
                            <Button 
                                variant="outline"
                                onclick={() => handleAction('highlight')}
                                class="w-full flex items-center justify-center space-x-2 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border-[var(--text-primary)]/10"
                            >
                                <span>✨</span>
                                <span>Hervorheben</span>
                            </Button>
                        </div>
                        <Button 
                            variant="ghost"
                            onclick={() => handleAction('add_group')}
                            class="w-full flex items-center justify-center space-x-2 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5"
                        >
                            <span>📁</span>
                            <span>Zu Gruppe hinzufügen</span>
                        </Button>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Footer / PDF Toggle -->
        {#if pdfPath && !isPdfOpen}
            <div class="p-6 bg-[var(--text-primary)]/5 border-t border-[hsl(var(--text-500)/0.2)]">
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
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>

<style>
</style>
