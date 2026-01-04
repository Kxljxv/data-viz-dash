<script>
    import { onMount } from 'svelte';
    import { 
        Typography, Spinner,
        Tabs, TabList, Tab, TabPanels, TabPanel,
        Modal, Button as AeaButton,
        Card
    } from '$lib/components/aea';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { DataTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table';
    import HeaderCell from '$lib/components/ui/data-table/cells/header-cell.svelte';
    import ActionCell from '$lib/components/ui/data-table/cells/action-cell.svelte';
    import ListTriggerCell from '$lib/components/ui/data-table/cells/list-trigger-cell.svelte';
    import { 
        IconExternalLink,
        IconSearch
    } from '@tabler/icons-svelte';
    import { goto } from '$app/navigation';
    import { createRawSnippet } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let supporters = $state([]);
    let amendments = $state([]);
    let activeTab = $state('supporters');
    
    // TanStack Table State
    let supporterSorting = $state([]);
    let supporterColumnFilters = $state([]);
    let supporterGlobalFilter = $state("");
    
    let amendmentSorting = $state([]);
    let amendmentColumnFilters = $state([]);
    let amendmentGlobalFilter = $state("");

    // Modal state
    let modalOpen = $state(false);
    let modalTitle = $state('');
    let modalItems = $state([]); // Array of { id, label }
    let modalProject = $state(''); // For linking context

    onMount(async () => {
        try {
            const res = await fetch('/api/database');
            if (!res.ok) throw new Error('Failed to load data');
            const data = await res.json();
            supporters = data.supporters;
            amendments = data.amendments;
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    });

    function openModal(title, items, project) {
        modalTitle = title;
        modalItems = items;
        modalProject = project;
        modalOpen = true;
    }

    function goToGraph(project, nodeId) {
        goto(`/dashboard/graph/project/${project}?node=${encodeURIComponent(nodeId)}`);
    }



    // Supporter Columns
    const supporterColumns = [
        {
            accessorKey: "name",
            header: (ctx) => renderComponent(HeaderCell, { label: "Name", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<div class="font-medium text-sm">${val}</div>`
                })));
            },
            meta: { description: "Name des Unterstützers" }
        },
        {
            accessorKey: "kv",
            header: (ctx) => renderComponent(HeaderCell, { label: "KV / Gliederung", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<div class="text-xs opacity-70 italic">${val || "-"}</div>`
                })));
            },
            meta: { description: "Kreisverband oder Gliederung" }
        },
        {
            accessorKey: "project",
            header: (ctx) => renderComponent(HeaderCell, { label: "Projekt", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<span class="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand/80 border border-brand/20">${val}</span>`
                })));
            },
            meta: { description: "Zugehöriges Projekt" }
        },
        {
            accessorKey: "applied",
            header: (ctx) => renderComponent(HeaderCell, { label: "Antragsteller", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                const row = ctx.row.original;
                return renderComponent(ListTriggerCell, {
                    count: val.length,
                    title: `Anträge von ${row.name}`,
                    items: val,
                    project: row.project,
                    onOpenModal: openModal
                });
            },
            meta: { description: "Anzahl der selbst gestellten Anträge" }
        },
        {
            accessorKey: "supported",
            header: (ctx) => renderComponent(HeaderCell, { label: "Unterstützt", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                const row = ctx.row.original;
                return renderComponent(ListTriggerCell, {
                    count: val.length,
                    title: `Unterstützte Anträge von ${row.name}`,
                    items: val,
                    project: row.project,
                    onOpenModal: openModal
                });
            },
            meta: { description: "Anzahl der unterstützten Anträge" }
        },
        {
            id: "actions",
            header: "Aktion",
            cell: (ctx) => {
                const row = ctx.row.original;
                return renderComponent(ActionCell, {
                    project: row.project,
                    id: row.graphId,
                    onclick: goToGraph
                });
            },
            meta: { description: "Zum Graphen springen" }
        }
    ];

    // Amendment Columns
    const amendmentColumns = [
        {
            accessorKey: "id",
            header: (ctx) => renderComponent(HeaderCell, { label: "ID", column: ctx.column }),
            cell: (ctx) => renderSnippet(createRawSnippet(() => ({
                render: () => `<code class="text-[10px] opacity-70 bg-white/5 px-1 rounded">${ctx.getValue()}</code>`
            }))),
            meta: { description: "Antrags-ID" }
        },
        {
            accessorKey: "label",
            header: (ctx) => renderComponent(HeaderCell, { label: "Titel", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<div class="max-w-[300px] truncate text-sm" title="${val}">${val}</div>`
                })));
            },
            meta: { description: "Titel des Antrags" }
        },
        {
            accessorKey: "project",
            header: (ctx) => renderComponent(HeaderCell, { label: "Projekt", column: ctx.column }),
            cell: (ctx) => {
                const val = ctx.getValue();
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<span class="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand/80 border border-brand/20">${val}</span>`
                })));
            },
            meta: { description: "Zugehöriges Projekt" }
        },
        {
            accessorKey: "applicantLabels",
            header: (ctx) => renderComponent(HeaderCell, { label: "Antragsteller", column: ctx.column }),
            cell: (ctx) => {
                const labels = ctx.getValue();
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<div class="max-w-[200px] truncate text-xs opacity-80" title="${labels}">${labels}</div>`
                })));
            },
            meta: { description: "Liste der Antragsteller" }
        },
        {
            accessorKey: "supporterCount",
            header: (ctx) => renderComponent(HeaderCell, { label: "Unterstützer", column: ctx.column }),
            cell: (ctx) => {
                const row = ctx.row.original;
                return renderComponent(ListTriggerCell, {
                    count: ctx.getValue(),
                    title: `Unterstützer von ${row.id}`,
                    items: row.supporters,
                    project: row.project,
                    onOpenModal: openModal
                });
            },
            meta: { description: "Anzahl der Unterstützer" }
        },
        {
            accessorKey: "url",
            header: (ctx) => renderComponent(HeaderCell, { label: "URL", column: ctx.column }),
            cell: (ctx) => {
                const url = ctx.getValue();
                if (!url) return "-";
                return renderSnippet(createRawSnippet(() => ({
                    render: () => `<a href="${url}" target="_blank" class="text-brand hover:underline text-[10px] font-black tracking-tighter">DOCS</a>`
                })));
            },
            meta: { description: "Link zum Dokument" }
        },
        {
            id: "actions",
            header: "Aktion",
            cell: (ctx) => {
                const row = ctx.row.original;
                return renderComponent(ActionCell, {
                    project: row.project,
                    id: row.id,
                    onclick: goToGraph
                });
            },
            meta: { description: "Zum Graphen springen" }
        }
    ];

    // Remove duplicate onMount at the end of the script tag if it exists

</script>

<div class="space-y-6">
    <div class="flex flex-col gap-1">
        <Typography tag="h1" variant="h1">Datenbank</Typography>
        <Typography variant="body" class="text-muted-foreground">Durchsuche alle Unterstützer und Anträge projektübergreifend.</Typography>
    </div>

    {#if loading}
        <div class="flex justify-center p-12">
            <Spinner size="lg" />
        </div>
    {:else if error}
        <div class="p-4 text-red-500 bg-red-500/10 rounded-lg">
            Fehler: {error}
        </div>
    {:else}
        <div class="flex items-center gap-4 mb-4">
            <div class="relative flex-1 max-w-sm">
                <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={16} />
                <Input 
                    type="search"
                    placeholder="Suche..." 
                    class="pl-9 bg-muted border-white/10 focus:bg-background transition-colors"
                    value={activeTab === 'supporters' ? supporterGlobalFilter : amendmentGlobalFilter}
                    oninput={(e) => {
                        if (activeTab === 'supporters') {
                            supporterGlobalFilter = e.target.value;
                        } else {
                            amendmentGlobalFilter = e.target.value;
                        }
                    }}
                />
            </div>

            {#if supporterSorting.length > 0 || supporterColumnFilters.length > 0 || amendmentSorting.length > 0 || amendmentColumnFilters.length > 0 || supporterGlobalFilter || amendmentGlobalFilter}
                <Button 
                    variant="outline" 
                    size="sm" 
                    onclick={() => {
                        supporterSorting = [];
                        supporterColumnFilters = [];
                        supporterGlobalFilter = "";
                        amendmentSorting = [];
                        amendmentColumnFilters = [];
                        amendmentGlobalFilter = "";
                    }}
                >
                    Filter & Sortierung zurücksetzen
                </Button>
            {/if}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => activeTab = v}>
            <TabList class="mb-4">
                <Tab value="supporters">Unterstützer ({supporters.length})</Tab>
                <Tab value="amendments">Anträge ({amendments.length})</Tab>
            </TabList>

            <TabPanels>
                <TabPanel value="supporters">
                    <DataTable 
                        data={supporters} 
                        columns={supporterColumns} 
                        bind:sorting={supporterSorting}
                        bind:columnFilters={supporterColumnFilters}
                        bind:globalFilter={supporterGlobalFilter}
                    />
                </TabPanel>
                <TabPanel value="amendments">
                    <DataTable 
                        data={amendments} 
                        columns={amendmentColumns} 
                        bind:sorting={amendmentSorting}
                        bind:columnFilters={amendmentColumnFilters}
                        bind:globalFilter={amendmentGlobalFilter}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    {/if}
</div>

<Modal bind:open={modalOpen} title={modalTitle}>
    <div class="space-y-4">
        <div class="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
            {#each modalItems as item}
                <div class="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-brand/30 transition-all group">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-medium">{item.label || item.id}</span>
                        {#if item.id && item.label}
                            <span class="text-[10px] opacity-50 font-mono uppercase">{item.id}</span>
                        {/if}
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-brand"
                        onclick={() => {
                            modalOpen = false;
                            goToGraph(modalProject, item.graphId || item.id);
                        }}
                    >
                        <IconExternalLink size={14} />
                    </Button>
                </div>
            {/each}
            {#if modalItems.length === 0}
                <div class="text-center py-8 text-muted-foreground italic">
                    Keine Einträge gefunden.
                </div>
            {/if}
        </div>
        <div class="flex justify-end">
            <AeaButton onclick={() => modalOpen = false}>Schließen</AeaButton>
        </div>
    </div>
</Modal>
