<script>
    import { auth } from '$lib/auth.svelte';
    import { 
        Button, 
        Card, 
        CardContent, 
        Badge 
    } from '$lib/components/aea';
    import { IconX } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {any} selectedNode - The currently selected node
     * @property {any} stats - Graph statistics (nodes, links)
     * @property {() => void} onDeselect - Callback to deselect the node
     */

    let { selectedNode = null, stats, onDeselect } = $props();
</script>

<div class="space-y-8">
    {#if selectedNode}
        <Card class="bg-[var(--text-primary)]/5 border-[hsl(var(--accent-pro-100))]/30 overflow-hidden group">
            <CardContent class="p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <h4 class="text-[10px] font-black text-[hsl(var(--accent-pro-100))] uppercase tracking-[0.2em]">Auswahl</h4>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onclick={onDeselect} 
                        class="h-6 w-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label="Auswahl aufheben"
                    >
                        <IconX size={16} />
                    </Button>
                </div>
                <div>
                    <div class="text-lg font-serif text-[var(--text-primary)] group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">{selectedNode.label}</div>
                    {#if selectedNode.sublabel}
                        <div class="text-xs text-[var(--text-tertiary)] mt-1 font-modern">{selectedNode.sublabel}</div>
                    {:else}
                        <div class="text-[10px] text-[var(--text-tertiary)] mt-1 font-bold uppercase tracking-wider">{selectedNode.id}</div>
                    {/if}
                </div>
                <div class="grid grid-cols-2 gap-2 pt-2">
                    <div class="p-3 bg-[var(--bg-graph)]/50 rounded-xl border border-[var(--text-primary)]/5">
                        <div class="text-[8px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Typ</div>
                        <Badge variant="outline" class="text-[10px] uppercase font-bold border-[hsl(var(--accent-pro-100))]/30 text-[hsl(var(--accent-pro-100))]">{selectedNode.type}</Badge>
                    </div>
                    <div class="p-3 bg-[var(--bg-graph)]/50 rounded-xl border border-[var(--text-primary)]/5">
                        <div class="text-[8px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mb-1">Links</div>
                        <div class="text-xs text-[var(--text-primary)] font-mono font-bold">{selectedNode.linkCount || 0}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    {/if}

    <div class="space-y-1 px-2">
        <div class="text-xl font-serif text-[hsl(var(--text-100))] uppercase tracking-widest leading-tight">{stats.project}</div>
        <div class="text-[10px] font-black text-[var(--text-300)] uppercase tracking-[0.2em]">Aktives Projekt</div>
    </div>
    
    <Card class="bg-[hsl(var(--accent-pro-100))]/5 border-[hsl(var(--accent-pro-100))]/10 overflow-hidden">
        <CardContent class="p-8 space-y-6">
            <h4 class="text-[10px] font-black text-[hsl(var(--accent-pro-100))] uppercase tracking-[0.2em]">Benutzerprofil</h4>
            <div class="flex items-center space-x-4">
                {#if auth.user?.picture}
                    <img src={auth.user.picture} alt="" class="w-12 h-12 rounded-2xl border-2 border-[hsl(var(--accent-pro-100))]/30 shadow-lg" />
                {:else}
                    <div class="w-12 h-12 rounded-2xl border-2 border-[hsl(var(--accent-pro-100))]/30 bg-[hsl(var(--accent-pro-100))]/10 flex items-center justify-center text-[hsl(var(--accent-pro-100))] font-bold text-xl">
                        {auth.user?.name?.charAt(0) || 'G'}
                    </div>
                {/if}
                <div class="flex flex-col">
                    <div class="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">{auth.user?.name || 'Gast'}</div>
                    <div class="flex flex-wrap gap-1 mt-1">
                        {#each auth.roles as role}
                            <Badge variant="secondary" class="text-[8px] uppercase tracking-tighter px-1.5 py-0 h-4">{role}</Badge>
                        {/each}
                        {#if auth.roles.length === 0}
                            <span class="text-[10px] text-[var(--text-tertiary)] font-mono">Keine Rollen</span>
                        {/if}
                    </div>
                </div>
            </div>
            <Button 
                variant="destructive"
                onclick={() => auth.logout()}
                class="w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-destructive/10"
            >
                Abmelden
            </Button>
        </CardContent>
    </Card>
</div>