<script lang="ts" generics="TData, TValue">
    import { 
        type ColumnDef, 
        getCoreRowModel, 
        getSortedRowModel,
        getFilteredRowModel,
        getFacetedRowModel,
        getFacetedUniqueValues,
        getFacetedMinMaxValues,
        type SortingState,
        type ColumnFiltersState
    } from "@tanstack/table-core";
    import {
        createSvelteTable,
    } from "./index.js";
    import FlexRender from "./flex-render.svelte";
    import * as Table from "$lib/components/ui/table/index.js";

    import { 
        IconInfoCircle,
    } from "@tabler/icons-svelte";

    type DataTableProps<TData, TValue> = {
        columns: ColumnDef<TData, TValue>[];
        data: TData[];
        sorting?: SortingState;
        columnFilters?: ColumnFiltersState;
        globalFilter?: string;
        onSortingChange?: (sorting: SortingState) => void;
        onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
        onGlobalFilterChange?: (globalFilter: string) => void;
    };

    let { 
        data, 
        columns, 
        sorting = $bindable([]), 
        columnFilters = $bindable([]),
        globalFilter = $bindable(""),
    }: DataTableProps<TData, TValue> = $props();

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns,
        state: {
            get sorting() {
                return sorting;
            },
            get columnFilters() {
                return columnFilters;
            },
            get globalFilter() {
                return globalFilter;
            },
            columnPinning: {},
            columnVisibility: {},
            rowSelection: {},
            columnOrder: [],
            columnSizing: {},
            columnSizingInfo: {} as any,
            pagination: { pageIndex: 0, pageSize: 100 },
            expanded: {},
        },
        onSortingChange: (updater) => {
            if (typeof updater === "function") {
                sorting = updater(sorting);
            } else {
                sorting = updater;
            }
        },
        onColumnFiltersChange: (updater) => {
            if (typeof updater === "function") {
                columnFilters = updater(columnFilters);
            } else {
                columnFilters = updater;
            }
        },
        onGlobalFilterChange: (updater) => {
             if (typeof updater === "function") {
                globalFilter = updater(globalFilter);
            } else {
                globalFilter = updater;
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
    });

    $effect(() => {
        table.setOptions((prev) => ({
            ...prev,
            data,
            columns,
            state: {
                ...prev.state,
                sorting,
                columnFilters,
                globalFilter,
                columnPinning: prev.state?.columnPinning || {},
                columnVisibility: prev.state?.columnVisibility || {},
                rowSelection: prev.state?.rowSelection || {},
                columnOrder: prev.state?.columnOrder || [],
                columnSizing: prev.state?.columnSizing || {},
                columnSizingInfo: prev.state?.columnSizingInfo || {} as any,
                pagination: prev.state?.pagination || { pageIndex: 0, pageSize: 100 },
                expanded: prev.state?.expanded || {},
            },
        }));
    });

    const headerGroups = $derived.by(() => {
        // Dependency tracking for Svelte 5
        const _ = { data, columns, sorting, columnFilters, globalFilter };
        return table.getHeaderGroups();
    });

    const rowModel = $derived.by(() => {
        // Dependency tracking for Svelte 5
        const _ = { data, columns, sorting, columnFilters, globalFilter };
        return table.getRowModel();
    });
</script>

<div class="rounded-md border bg-card/50 backdrop-blur-md">
    <Table.Root>
        <Table.Header class="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            {#each headerGroups as headerGroup (headerGroup.id)}
                <Table.Row>
                    {#each headerGroup.headers as header (header.id)}
                        <Table.Head colspan={header.colSpan}>
                            {#if !header.isPlaceholder}
                                <FlexRender
                                    content={header.column.columnDef.header}
                                    context={header.getContext()}
                                />
                            {/if}
                        </Table.Head>
                    {/each}
                </Table.Row>
            {/each}
        </Table.Header>
        <Table.Body>
            <!-- Description Row -->
            <Table.Row class="bg-brand/5 border-b border-brand/10">
                {#each columns as column}
                    <Table.Cell class="py-2 px-4">
                        <div class="flex items-center gap-2 text-[10px] text-brand/60 italic">
                            <IconInfoCircle size={12} class="shrink-0" />
                            <span>{column.meta?.description || "-"}</span>
                        </div>
                    </Table.Cell>
                {/each}
            </Table.Row>

            {#each rowModel.rows as row (row.id)}
                <Table.Row data-state={row.getIsSelected() && "selected"}>
                    {#each row.getVisibleCells() as cell (cell.id)}
                        <Table.Cell>
                            <FlexRender
                                content={cell.column.columnDef.cell}
                                context={cell.getContext()}
                            />
                        </Table.Cell>
                    {/each}
                </Table.Row>
            {:else}
                <Table.Row>
                    <Table.Cell colspan={columns.length} class="h-24 text-center">
                        Keine Ergebnisse.
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
</div>

<style>
    /* Ensure the container can handle the sticky header */
    :global(.rounded-md.border) {
        max-height: 70vh;
        overflow-y: auto;
    }
</style>
