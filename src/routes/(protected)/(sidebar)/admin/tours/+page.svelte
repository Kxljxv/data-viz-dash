<script lang="ts">
    import { Typography, Card, Button, Badge } from '$lib/components/aea';
    import { IconMap, IconPlus, IconEdit, IconTrash } from '@tabler/icons-svelte';
    import { tourStore } from '$lib/stores/tourStore.svelte';
    import { goto } from '$app/navigation';

    // Dummy projects for now - ideally this comes from a project store
    const projects = [
        { id: 'bdk', name: 'BDK 2024', description: 'Netzwerk der Anträge und Unterstützer' },
        { id: 'climate', name: 'Klima-Allianz', description: 'Verbindungen zwischen NGOs' }
    ];

    function createTour(project: any) {
        // Check if tour already exists
        let tour = tourStore.getTour(project.id);
        if (!tour) {
            tour = tourStore.createTour(project.id, `Tour für ${project.name}`);
        }
        goto(`/admin/tours/${project.id}`);
    }

    function deleteTour(tourId: string, e: Event) {
        e.stopPropagation();
        if (confirm('Tour wirklich löschen?')) {
            tourStore.deleteTour(tourId);
        }
    }
</script>

<div class="space-y-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <Typography tag="h1" variant="h1" class="text-white">Interaktive Touren</Typography>
            <Typography variant="body" class="opacity-70 mt-1">Erstelle und verwandle geführte Touren für die Graph-Visualisierungen.</Typography>
        </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each projects as project}
            {@const tour = tourStore.getTour(project.id)}
            <Card class="h-full card-glass relative group">
                {#snippet header()}
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-brand/10 rounded-lg text-brand">
                            <IconMap size={24} />
                        </div>
                        {#if tour}
                            <Badge variant="success">Aktiv</Badge>
                        {:else}
                            <Badge variant="outline" class="opacity-50">Keine Tour</Badge>
                        {/if}
                    </div>
                    <Typography variant="h3" class="text-white">{project.name}</Typography>
                    <Typography variant="label" class="line-clamp-2 mt-1 opacity-50">{project.description}</Typography>
                {/snippet}

                <div class="mt-6 flex gap-2">
                    {#if tour}
                        <Button variant="secondary" class="flex-1 gap-2" onclick={() => goto(`/admin/tours/${project.id}`)}>
                            <IconEdit size={16} />
                            Bearbeiten
                        </Button>
                        <button 
                            class="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            onclick={(e) => deleteTour(tour.id, e)}
                            title="Tour löschen"
                        >
                            <IconTrash size={20} />
                        </button>
                    {:else}
                        <Button variant="primary" class="w-full gap-2" onclick={() => createTour(project)}>
                            <IconPlus size={16} />
                            Tour erstellen
                        </Button>
                    {/if}
                </div>
            </Card>
        {/each}
    </div>
</div>
