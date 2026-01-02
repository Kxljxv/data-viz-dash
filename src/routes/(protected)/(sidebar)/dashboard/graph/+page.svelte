<script>
    import { Card, Button, Typography, Badge } from '$lib/components/aea';
    import { IconMap, IconHash } from '@tabler/icons-svelte';

    let { data } = $props();
    const projects = $derived(data.projects || []);
</script>

<svelte:head>
    <title>Graph-Übersicht - AEA</title>
</svelte:head>

<div class="space-y-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <Typography tag="h1" variant="h1" class="text-white">Graph-Visualisierungen</Typography>
            <Typography variant="body" class="opacity-70 mt-1">Wähle ein Projekt aus, um die Netzwerk-Visualisierung zu öffnen.</Typography>
        </div>
        <Button variant="primary">Neuer Graph</Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each projects as project}
            <a href="/dashboard/graph/project/{project.id}" class="block group">
                <Card interactive class="h-full card-glass">
                    {#snippet header()}
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-brand/10 rounded-lg text-brand">
                                <IconMap size={24} />
                            </div>
                            <Badge variant="outline" class="text-[10px] opacity-60">{project.date}</Badge>
                        </div>
                        <Typography variant="h3" class="group-hover:text-brand transition-colors text-white">{project.name}</Typography>
                        <Typography variant="label" class="line-clamp-2 mt-1 opacity-50">{project.description}</Typography>
                    {/snippet}
                    
                    <div class="flex items-center gap-4 text-xs font-modern-dense uppercase tracking-wider text-white/40">
                        <div class="flex items-center gap-1.5">
                            <IconHash size={14} />
                            {project.nodeCount} Knoten
                        </div>
                    </div>
                </Card>
            </a>
        {/each}
    </div>
</div>
