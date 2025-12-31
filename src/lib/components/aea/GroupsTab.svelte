<script>
    import { 
        Card, 
        CardContent, 
        Button, 
        Badge, 
        Slider, 
        Select 
    } from '$lib/components/aea';

    /**
     * @typedef {Object} Props
     * @property {any[]} groups - List of active node groups.
     * @property {(action: string, data: any) => void} onGroupAction - Callback for general group actions (create, import, export_all).
     * @property {(group: any) => void} onEditGroup - Callback to start editing a specific group.
     */

    /** @type {Props} */
    let { groups = [], onGroupAction, onEditGroup } = $props();

    let densityGroup = $state('');
    let densityOpacity = $state(0.5);
    let graphDimming = $state(0);
    let contourBlur = $state(0);

    function handleDensityChange() {
        if (onGroupAction) {
            onGroupAction('density_settings', {
                groupId: densityGroup,
                opacity: densityOpacity,
                dimming: graphDimming,
                blur: contourBlur
            });
        }
    }

    /**
     * Internal handler for general group actions.
     * @param {string} action - The action type.
     * @param {any} data - Associated data for the action.
     */
    function handleAction(action, data) {
        if (onGroupAction) {
            onGroupAction(action, data);
        }
    }

    /**
     * Triggers the edit flow for a specific group.
     * @param {any} group - The group to edit.
     */
    function handleEdit(group) {
        if (onEditGroup) {
            onEditGroup(group);
        }
    }
</script>

<div class="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div class="flex justify-between items-center mb-2">
        <span class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Aktive Gruppen</span>
        <div class="flex space-x-1">
            <Button 
                variant="ghost" 
                size="sm" 
                onclick={() => handleAction('create_kv')}
                class="text-[10px] font-black tracking-widest uppercase border border-[var(--text-primary)]/10"
            >
                KV-Gruppe
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onclick={() => handleAction('create')}
                class="text-[10px] font-black tracking-widest uppercase border border-[var(--text-primary)]/10"
            >
                + Neu
            </Button>
        </div>
    </div>

    <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {#if groups.length === 0}
            <div class="text-center py-8 border-2 border-dashed border-[hsl(var(--text-500)/0.2)] rounded-xl">
                <span class="text-xs text-[var(--text-tertiary)] italic">Keine Gruppen vorhanden</span>
            </div>
        {:else}
            {#each groups as group (group.id)}
                <Card 
                    interactive 
                    onclick={() => handleEdit(group)}
                    class="group"
                >
                    <CardContent class="p-4 flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div 
                                class="w-3 h-3 rounded-full shadow-lg transition-transform group-hover:scale-125" 
                                style="background-color: {group.color}"
                            ></div>
                            <div>
                                <div class="text-sm font-serif text-[var(--text-primary)] group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">{group.name}</div>
                                <div class="flex items-center mt-1">
                                    <Badge variant="neutral" class="text-[8px] px-1.5 py-0">
                                        {group.nodes?.length || 0} Knoten
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div class="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        {/if}
    </div>

    <hr class="mb-2 mt-2 border-[hsl(var(--text-500)/0.2)]">

    <div class="  grid grid-cols-2 gap-2">

        


        <Button 
            variant="outline"
            onclick={() => handleAction('import')}
            class="flex items-center justify-center space-x-2 p-3 text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--text-primary)]/10"
        >
            <span>📥</span>
            <span>Import</span>
        </Button>
        <Button 
            variant="outline"
            onclick={() => handleAction('export_all')}
            class="flex items-center justify-center space-x-2 p-3 text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--text-primary)]/10"
        >
            <span>📤</span>
            <span>Export All</span>
        </Button>
    </div>

</div>

<style>
</style>
