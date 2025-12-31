<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import ControlPanel from '$components/graph/ControlPanel.svelte';
    import StatusBar from '$components/graph/StatusBar.svelte';
    import ContextMenu from '$components/graph/ContextMenu.svelte';
    import { Spinner, Typography } from '$lib/components/aea';
    import GraphVisualizationModule from '$components/graph/GraphVisualization';

    let graphInstance = $state(null);
    let stats = $state({
        nodes: 0,
        links: 0,
        activeFilters: 0,
        project: 'bdk'
    });

    onMount(() => {
        stats.project = $page.params.id || 'bdk';

        const handleDataLoaded = (event) => {
            stats.nodes = event.detail.nodes.length;
            stats.links = event.detail.links.length;
        };

        const handleFilterChange = (event) => {
            // Count active filters in the graph
            if (window.graph && window.graph.settings) {
                let count = 0;
                const s = window.graph.settings;
                if (!s.showAntraege) count++;
                if (!s.showSupporters) count++;
                // Add more as needed
                stats.activeFilters = count;
            }
        };

        window.addEventListener('aea-data-loaded', handleDataLoaded);
        window.addEventListener('aea-filter-change', handleFilterChange);

        const initGraph = () => {
            // Wait for D3.js to be available
            if (typeof d3 === 'undefined') {
                setTimeout(initGraph, 100);
                return;
            }

            // Use GraphVisualization from module or window
            if (GraphVisualization) {
                // Initialize graph
                graphInstance = new GraphVisualization(stats.project);
                window.graph = graphInstance;
                
                // Sync initial stats if data already loaded
                if (graphInstance.allNodes) {
                    stats.nodes = graphInstance.allNodes.length;
                    stats.links = graphInstance.allLinks.length;
                }
            } else {
                setTimeout(initGraph, 100);
            }
        };

        initGraph();

        return () => {
            window.removeEventListener('aea-data-loaded', handleDataLoaded);
            window.removeEventListener('aea-filter-change', handleFilterChange);
        };
    });
</script>

<svelte:head>
    <title>Graph-Visualisierung - AEA</title>
</svelte:head>

<div class="relative h-screen w-screen overflow-hidden bg-[var(--bg-graph)]">
    <canvas id="graph-canvas" class="z-10" aria-label="Interaktive Netzwerk-Visualisierung"></canvas>

    <div id="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-background">
        <div class="text-center flex flex-col items-center gap-6">
            <Typography variant="h2" class="text-white">Graph wird vorbereitet...</Typography>
            <Spinner size="lg" color="brand" />
            <Typography variant="label" id="loading-text" class="opacity-40">Lade Daten...</Typography>
        </div>
    </div>

    <!-- Svelte Control Panel -->
    <div class="absolute top-0 right-0 z-20 h-full">
        <ControlPanel graph={graphInstance} backUrl="/dashboard/graph" />
    </div>

    <!-- Svelte Status Bar -->
    <StatusBar 
        nodeCount={stats.nodes} 
        linkCount={stats.links} 
        activeFilters={stats.activeFilters} 
        project={stats.project}
    />

    <!-- Context Menu -->
    <ContextMenu graph={graphInstance} />
</div>

<style>
    :global(body) {
        margin: 0;
        overflow: hidden;
        background-color: var(--bg-graph);
    }
</style>

