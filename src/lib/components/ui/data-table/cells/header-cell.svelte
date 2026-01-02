<script>
    import { IconArrowsSort } from '@tabler/icons-svelte';
    import FacetedFilter from './faceted-filter.svelte';
    
    let { label, column } = $props();
    let isSorted = $derived(column.getIsSorted());
</script>

<div class="flex flex-col gap-2 py-2 min-w-[120px]">
    <div class="flex items-center justify-between">
        <span class="text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">{label}</span>
    </div>
    <div class="flex items-center gap-2">
        <button 
            class="p-1.5 hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10 {isSorted ? 'text-brand' : 'text-muted-foreground/30'}"
            onclick={(e) => { e.stopPropagation(); column.toggleSorting(isSorted === "asc") }}
            title="Sortieren"
        >
            <IconArrowsSort size={14} />
        </button>
        <div class="flex-1 min-w-0">
            <FacetedFilter {column} />
        </div>
    </div>
</div>
