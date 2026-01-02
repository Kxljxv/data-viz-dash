<script>
    import * as Select from "$lib/components/ui/select/index.js";
    import { IconFilter } from '@tabler/icons-svelte';
    
    let { column } = $props();
    
    let facetedUniqueValues = $derived(column.getFacetedUniqueValues());
    let sortedUniqueValues = $derived(Array.from(facetedUniqueValues.keys()).sort());
    let filterValue = $derived(column.getFilterValue()?.toString() || "");

    function onValueChange(v) {
        // If "all" is selected (empty string), clear filter
        if (v === "all") {
            column.setFilterValue(undefined);
        } else {
            column.setFilterValue(v);
        }
    }
</script>

<div class="relative w-full">
    <Select.Root type="single" value={filterValue || "all"} onValueChange={onValueChange}>
        <Select.Trigger class="w-full h-7 text-[10px] bg-muted border-white/10 px-2 py-1 hover:bg-muted/80 transition-colors">
            <div class="flex items-center gap-2 truncate">
                <IconFilter size={12} class={filterValue ? 'text-brand' : 'text-muted-foreground/30'} />
                <span class="truncate">
                    {filterValue || "Alle"}
                </span>
            </div>
        </Select.Trigger>
        <Select.Content class="max-h-[200px] bg-[#1a1a1a] border-white/10 shadow-2xl backdrop-blur-md">
            <Select.Item value="all" label="Alle" class="text-xs" />
            {#each sortedUniqueValues as value}
                <Select.Item value={String(value)} label={String(value)} class="text-xs" />
            {/each}
        </Select.Content>
    </Select.Root>
</div>