<script>
    import { Card, Button, Typography, Badge } from '$lib/components/aea';

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
            <Typography variant="body" class="opacity-70 mt-1">Wählen Sie ein Projekt aus, um die Netzwerk-Visualisierung zu öffnen.</Typography>
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
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <Badge variant="outline" class="text-[10px] opacity-60">{project.date}</Badge>
                        </div>
                        <Typography variant="h3" class="group-hover:text-brand transition-colors text-white">{project.name}</Typography>
                        <Typography variant="label" class="line-clamp-2 mt-1 opacity-50">{project.description}</Typography>
                    {/snippet}
                    
                    <div class="flex items-center gap-4 text-xs font-modern-dense uppercase tracking-wider text-white/40">
                        <div class="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16" />
                            </svg>
                            {project.nodeCount} Knoten
                        </div>
                    </div>
                </Card>
            </a>
        {/each}
    </div>
</div>
