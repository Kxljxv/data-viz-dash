<script>
    import { Modal, Select, Typography, Table, TableBody, TableCell, TableHeadCell, TableRow, Button } from '$lib/components/aea';
    import * as Plot from '@observablehq/plot';

    /**
     * @typedef {Object} Props
     * @property {boolean} open - Bindable open state
     * @property {any[]} selectedNodes - Nodes in the selected area
     * @property {any[]} allNodes - All nodes in the graph
     */

    let { open = $bindable(false), selectedNodes = [], allNodes = [] } = $props();

    let selectedAttribute = $state(null);
    let plotContainer = $state(null);

    const attributeOptions = $derived.by(() => {
        if (allNodes.length === 0) return [];
        // Get all unique attribute keys from all nodes
        const keys = new Set();
        allNodes.forEach(node => {
            Object.keys(node).forEach(key => {
                if (['id', 'x', 'y', 'size', 'color', 'label', 'type', 'hidden'].includes(key)) return;
                keys.add(key);
            });
        });
        return Array.from(keys).map(key => ({ label: key, value: key }));
    });

    const attributeData = $derived.by(() => {
        if (!selectedAttribute || allNodes.length === 0) return null;

        const firstVal = allNodes.find(n => n[selectedAttribute] !== undefined)?.[selectedAttribute];
        const isNumeric = typeof firstVal === 'number';

        if (isNumeric) {
            return {
                type: 'number',
                all: allNodes.map(n => n[selectedAttribute]).filter(v => v !== undefined),
                selected: selectedNodes.map(n => n[selectedAttribute]).filter(v => v !== undefined)
            };
        } else {
            // String attribute - calculate frequencies
            const allCounts = {};
            const selectedCounts = {};

            allNodes.forEach(n => {
                const val = n[selectedAttribute] || 'N/A';
                allCounts[val] = (allCounts[val] || 0) + 1;
            });

            selectedNodes.forEach(n => {
                const val = n[selectedAttribute] || 'N/A';
                selectedCounts[val] = (selectedCounts[val] || 0) + 1;
            });

            const uniqueValues = Array.from(new Set([...Object.keys(allCounts), ...Object.keys(selectedCounts)]));
            
            return {
                type: 'string',
                values: uniqueValues.map(val => {
                    const allPct = (allCounts[val] || 0) / allNodes.length * 100;
                    const selectedPct = (selectedCounts[val] || 0) / selectedNodes.length * 100;
                    return {
                        value: val,
                        allPct,
                        selectedPct
                    };
                })
            };
        }
    });

    $effect(() => {
        if (attributeData?.type === 'number' && plotContainer) {
            renderPlot();
        }
    });

    function renderPlot() {
        if (!plotContainer || !attributeData || attributeData.type !== 'number') return;

        plotContainer.innerHTML = '';

        const data = [
            ...attributeData.all.map(v => ({ value: v, source: 'Gesamtgraph' })),
            ...attributeData.selected.map(v => ({ value: v, source: 'Auswahl' }))
        ];

        // Ensure we have enough data points for a meaningful distribution
        if (data.length === 0) return;

        const plot = Plot.plot({
            width: 700,
            height: 350,
            style: {
                background: "transparent",
                color: "currentColor",
                padding: "30px",
                fontSize: "12px",
                fontFamily: "ModernDense"
            },
            x: {
                label: `${selectedAttribute} →`,
                grid: true,
                nice: true
            },
            y: {
                label: "↑ Anzahl Knoten",
                grid: true
            },
            marks: [
                Plot.lineY(data, Plot.binX({y: "count"}, {
                    x: "value", 
                    stroke: "source", 
                    strokeWidth: 3,
                    curve: "basis",
                    tip: true
                })),
                Plot.areaY(data, Plot.binX({y: "count"}, {
                    x: "value", 
                    fill: "source", 
                    opacity: 0.1,
                    curve: "basis"
                })),
                Plot.ruleY([0])
            ],
            color: {
                legend: true,
                domain: ['Gesamtgraph', 'Auswahl'],
                range: ['hsla(var(--text-400) / 0.5)', 'hsl(var(--accent-brand))']
            }
        });

        plotContainer.appendChild(plot);
    }
</script>

<Modal bind:open title="Attribut-Zusammensetzung" size="xl">
    <div class="space-y-6 p-4">
        <div class="bg-[var(--text-primary)]/5 p-6 rounded-3xl border border-[hsl(var(--text-500)/0.1)]">
            <Select 
                label="Attribut zur Analyse auswählen" 
                options={attributeOptions} 
                bind:value={selectedAttribute}
                placeholder="Wähle ein Attribut..."
                searchable
            />
        </div>

        {#if attributeData}
            <div class="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="flex items-center justify-between mb-6">
                    <Typography variant="label" class="text-sm font-black uppercase tracking-[0.2em] text-[var(--accent-pro-100)]">Analyseergebnisse: {selectedAttribute}</Typography>
                    <div class="flex gap-4">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-[hsla(var(--text-400)/0.5)]"></div>
                            <Typography variant="body" class="text-[10px] font-bold uppercase tracking-wider opacity-60">Gesamtgraph</Typography>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-[hsl(var(--accent-brand))]"></div>
                            <Typography variant="body" class="text-[10px] font-bold uppercase tracking-wider">Auswahl</Typography>
                        </div>
                    </div>
                </div>
                
                {#if attributeData.type === 'string'}
                    <div class="rounded-2xl overflow-hidden border border-[hsl(var(--text-500)/0.1)]">
                        <Table compact hoverable>
                            {#snippet head()}
                                <TableHeadCell class="bg-[var(--text-primary)]/5">Eigenschaft</TableHeadCell>
                                {#each attributeData.values as item}
                                    <TableHeadCell class="text-center min-w-[100px]">{item.value}</TableHeadCell>
                                {/each}
                            {/snippet}
                            <TableBody>
                                <TableRow>
                                    <TableCell class="font-bold bg-[var(--text-primary)]/5">Auswahl (%)</TableCell>
                                    {#each attributeData.values as item}
                                        <TableCell class="text-center font-modern text-lg text-[hsl(var(--accent-brand))]">{item.selectedPct.toFixed(1)}%</TableCell>
                                    {/each}
                                </TableRow>
                                <TableRow>
                                    <TableCell class="font-bold bg-[var(--text-primary)]/5">Gesamt (%)</TableCell>
                                    {#each attributeData.values as item}
                                        <TableCell class="text-center font-modern text-lg opacity-60">{item.allPct.toFixed(1)}%</TableCell>
                                    {/each}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                {:else if attributeData.type === 'number'}
                    <div bind:this={plotContainer} class="w-full min-h-[400px] flex items-center justify-center bg-[var(--text-primary)]/2 rounded-3xl overflow-hidden border border-[hsl(var(--text-500)/0.1)] p-4">
                        <div class="flex flex-col items-center gap-4 opacity-50 italic">
                            <div class="w-8 h-8 border-4 border-[var(--accent-brand)] border-t-transparent rounded-full animate-spin"></div>
                            <Typography variant="body">Diagramm wird generiert...</Typography>
                        </div>
                    </div>
                {/if}
            </div>
        {:else if selectedAttribute}
            <div class="py-20 text-center bg-[var(--text-primary)]/5 rounded-3xl border border-dashed border-[hsl(var(--text-500)/0.2)]">
                <Typography variant="body" class="opacity-50 italic">Keine validen Daten für "{selectedAttribute}" gefunden.</Typography>
            </div>
        {:else}
            <div class="py-20 text-center bg-[var(--text-primary)]/5 rounded-3xl border border-dashed border-[hsl(var(--text-500)/0.2)]">
                <Typography variant="body" class="opacity-50 italic">Bitte wähle oben ein Attribut aus, um den Vergleich zwischen Auswahl und Gesamtgraph zu starten.</Typography>
            </div>
        {/if}
    </div>

    {#snippet footer()}
        <div class="flex justify-end p-4">
            <Button onclick={() => open = false} variant="outline" class="rounded-xl px-8">Schließen</Button>
        </div>
    {/snippet}
</Modal>

<style>
    :global(.aea-table-container) {
        max-width: 100%;
    }
</style>
