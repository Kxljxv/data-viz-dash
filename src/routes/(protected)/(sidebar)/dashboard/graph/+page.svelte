<script>
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';

    let { data } = $props();
    const projects = $derived(data.projects || []);
</script>

<svelte:head>
    <title>Graph-Übersicht - AEA</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Graph-Visualisierungen</h1>
            <p class="text-muted-foreground mt-1">Wählen Sie ein Projekt aus, um die Netzwerk-Visualisierung zu öffnen.</p>
        </div>
        <Button>Neuer Graph</Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each projects as project}
            <a href="/dashboard/graph/project/{project.id}" class="block group">
                <Card class="h-full transition-all hover:shadow-lg border-border/50 group-hover:border-primary/50 bg-slate-900/50 backdrop-blur-sm">
                    <CardHeader>
                        <div class="flex justify-between items-start">
                            <div class="p-2 bg-primary/10 rounded-lg text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <span class="text-xs font-medium text-muted-foreground">{project.date}</span>
                        </div>
                        <CardTitle class="mt-4 group-hover:text-primary transition-colors">{project.name}</CardTitle>
                        <CardDescription class="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-4 text-sm text-muted-foreground">
                            <div class="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16" />
                                </svg>
                                {project.nodeCount} Knoten
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </a>
        {/each}
    </div>
</div>
