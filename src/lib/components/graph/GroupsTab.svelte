<script>
    import { 
        Card, 
        CardContent,
        Button,
        Badge,
        Slider,
        Typography,
        Select
    } from '$lib/components/aea';
    import { 
        IconPlus, 
        IconCirclePlus, 
        IconChevronRight, 
        IconUpload, 
        IconDownload 
    } from "@tabler/icons-svelte";

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

<div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <!-- Header with Actions -->
    <div class="flex flex-col space-y-3">
        <div class="flex justify-between items-center">
            <Typography variant="label" class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Aktive Gruppen</Typography>
            <div class="flex gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onclick={() => handleAction('create_kv')}
                    class="h-8 px-3 text-[9px] font-black tracking-widest uppercase border border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                    KV-Gruppe
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onclick={() => handleAction('create')}
                    class="h-8 px-3 text-[9px] font-black tracking-widest uppercase bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 transition-all"
                >
                    <IconPlus size={14} class="mr-1" />
                    Neu
                </Button>
            </div>
        </div>

        <div class="space-y-2">
            {#if groups.length === 0}
                <div class="flex flex-col items-center justify-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                    <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <IconCirclePlus size={16} class="text-white/20" />
                    </div>
                    <Typography variant="body" class="text-[10px] font-medium text-white/20 uppercase tracking-widest">Keine Gruppen vorhanden</Typography>
                </div>
            {:else}
                {#each groups as group (group.id)}
                    <Card 
                        interactive 
                        onclick={() => handleEdit(group)}
                        class="group overflow-hidden border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                    >
                        <CardContent class="p-4 flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div 
                                    class="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125" 
                                    style="background-color: {group.color}; box-shadow: 0 0 12px {group.color}40"
                                ></div>
                                <div>
                                    <Typography variant="h4" class="text-sm font-serif text-white/90 group-hover:text-white transition-colors leading-none mb-1.5">{group.name}</Typography>
                                    <div class="flex items-center">
                                        <span class="text-[9px] font-black text-white/30 uppercase tracking-tighter">
                                            {group.nodes?.length || 0} Knoten
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-white/20 group-hover:text-white/60 transition-all transform group-hover:translate-x-1">
                                <IconChevronRight size={16} />
                            </div>
                        </CardContent>
                    </Card>
                {/each}
            {/if}
        </div>
    </div>

    <!-- View Settings Section -->
    <div class="space-y-4 pt-4 border-t border-white/5">
        <Typography variant="label" class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Darstellung</Typography>
        
        <div class="grid grid-cols-2 gap-3">
            <Button 
                variant="outline"
                onclick={() => handleAction('import')}
                class="h-11 flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
                <IconUpload size={14} class="opacity-50" />
                <span>Import</span>
            </Button>
            <Button 
                variant="outline"
                onclick={() => handleAction('export_all')}
                class="h-11 flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
                <IconDownload size={14} class="opacity-50" />
                <span>Export All</span>
            </Button>
        </div>
    </div>
</div>

<style>
</style>
