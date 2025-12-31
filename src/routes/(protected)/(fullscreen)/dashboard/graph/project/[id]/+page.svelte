<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import ControlPanel from '$components/graph/ControlPanel.svelte';
    import StatusBar from '$components/graph/StatusBar.svelte';
    import ContextMenu from '$components/graph/ContextMenu.svelte';
    import '$assets/styles/style.css';
    import GraphVisualizationModule from '$components/graph/GraphVisualization.js';

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
            const GraphClass = GraphVisualizationModule?.default || window.GraphVisualization;
            if (GraphClass) {
                graphInstance = new GraphClass(stats.project);
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

    <div id="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-graph)]">
        <div class="text-center">
            <h2 class="mb-4 font-serif text-3xl text-[var(--text-primary)]">Graph wird vorbereitet...</h2>
            <div role="status">
                <svg aria-hidden="true" class="inline h-10 w-10 animate-spin fill-[hsl(var(--accent-main-100))] text-gray-600" viewBox="0 0 100 101" fill="none">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
            </div>
            <p id="loading-text" class="mt-4 font-mono text-sm text-[var(--text-tertiary)]">Lade Daten...</p>
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

