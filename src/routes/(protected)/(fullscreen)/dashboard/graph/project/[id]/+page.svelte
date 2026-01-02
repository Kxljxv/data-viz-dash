<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import ControlPanel from '$components/graph/ControlPanel.svelte';
    import StatusBar from '$components/graph/StatusBar.svelte';
    import ContextMenu from '$components/graph/ContextMenu.svelte';
    import { Spinner, Typography, Button, Card } from '$lib/components/aea';
    import GraphVisualizationModule from '$components/graph/GraphVisualization';
    import { tourStore } from '$lib/stores/tourStore.svelte';
    import { IconChevronRight, IconChevronLeft, IconX, IconMap } from '@tabler/icons-svelte';
    import * as d3 from 'd3';
    import { marked } from 'marked';
    import RoughShape from '$lib/components/tour/RoughShape.svelte';

    let graphInstance = $state(null);
    let stats = $state({
        nodes: 0,
        links: 0,
        activeFilters: 0,
        project: 'bdk'
    });

    // Tour State
    let activeTour = $derived(tourStore.getTour(stats.project));
    let isTourActive = $state(false);
    let currentSlideIndex = $state(0);
    let showTourPrompt = $state(false);
    let graphTransform = $state({ x: 0, y: 0, k: 1 });

    // Watch for tour availability
    $effect(() => {
        if (activeTour && !isTourActive) {
            // Check if user has already seen it? For now always show prompt
            // Use a session storage flag to avoid annoying on reload
            const seenKey = `tour_seen_${stats.project}`;
            if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(seenKey)) {
                showTourPrompt = true;
            }
        }
    });

    function startTour() {
        if (!activeTour) return;
        isTourActive = true;
        showTourPrompt = false;
        currentSlideIndex = 0;
        applySlide(activeTour.slides[0]);
    }

    function dismissTour() {
        showTourPrompt = false;
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(`tour_seen_${stats.project}`, 'true');
        }
    }

    function applySlide(slide) {
        if (!graphInstance || !slide.cameraState) return;
        const { x, y, k } = slide.cameraState;
        graphInstance.setTransform(d3.zoomIdentity.translate(x, y).scale(k));
    }

    function nextSlide() {
        if (!activeTour) return;
        if (currentSlideIndex < activeTour.slides.length - 1) {
            currentSlideIndex++;
            applySlide(activeTour.slides[currentSlideIndex]);
        } else {
            endTour();
        }
    }

    function prevSlide() {
        if (!activeTour) return;
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            applySlide(activeTour.slides[currentSlideIndex]);
        }
    }

    function endTour() {
        isTourActive = false;
        dismissTour();
    }

    onMount(() => {
        const handleZoom = (e) => {
            graphTransform = {
                x: e.detail.transform.x,
                y: e.detail.transform.y,
                k: e.detail.transform.k
            };
        };
        window.addEventListener('aea-graph-zoom', handleZoom);
        
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
            window.removeEventListener('aea-graph-zoom', handleZoom);
        };
    });
</script>

<svelte:head>
    <title>Graph-Visualisierung - AEA</title>
</svelte:head>

<div class="relative h-screen w-screen overflow-hidden bg-[var(--bg-graph)]">
    <canvas id="graph-canvas" class="z-10" aria-label="Interaktive Netzwerk-Visualisierung"></canvas>

    <div id="loading" class="absolute inset-0 z-[10000] flex items-center justify-center bg-[hsl(var(--bg-300))] backdrop-blur-xl">
        <div class="text-center flex flex-col items-center gap-6">
            <Typography variant="h2" class="color-[hsl(var(--text-300))]">Graph wird vorbereitet...</Typography>
            <Spinner size="lg" color="hsl(var(--text-500))" />
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

    <!-- Tour Overlay -->
    {#if isTourActive && activeTour}
        {@const slide = activeTour.slides[currentSlideIndex]}
        
        <div class="absolute inset-0 z-50 pointer-events-none">
            <!-- SVG Annotations -->
            <svg class="w-full h-full">
                <g transform="translate({graphTransform.x}, {graphTransform.y}) scale({graphTransform.k})">
                    {#each slide.annotations as annotation}
                        <g 
                            transform="rotate({annotation.rotation || 0}, {annotation.x + (annotation.width || 100)/2}, {annotation.y + (annotation.height || 100)/2})"
                            style="opacity: 0.9; {annotation.customStyle || ''}"
                        >
                            {#if annotation.type === 'text'}
                                <foreignObject 
                                    x={annotation.x} 
                                    y={annotation.y} 
                                    width={annotation.width || 200} 
                                    height={annotation.height || 100}
                                    style="overflow: visible;"
                                >
                                    <div 
                                        class="prose prose-invert prose-sm annotation-text-content"
                                        style="color: {annotation.color}; font-size: {annotation.fontSize || 16}px; font-family: {annotation.fontFamily || 'var(--default-font)'};"
                                    >
                                        {@html marked.parse(annotation.content || '')}
                                    </div>
                                </foreignObject>
                            {:else}
                                <RoughShape {annotation} />
                            {/if}
                        </g>
                    {/each}
                </g>
            </svg>
            
            <!-- Controls -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[hsl(var(--bg-200))]/90 backdrop-blur border border-white/10 rounded-xl p-6 flex flex-col gap-4 min-w-[400px] pointer-events-auto shadow-2xl">
                <div>
                    <Typography variant="h4" class="text-white mb-2">{slide.title}</Typography>
                    {#if slide.description}
                        <Typography variant="body" class="text-white/70 text-sm">{slide.description}</Typography>
                    {/if}
                </div>
                
                <div class="flex justify-between items-center">
                    <div class="flex gap-2">
                        {#each activeTour.slides as _, i}
                            <div class="w-2 h-2 rounded-full transition-colors {i === currentSlideIndex ? 'bg-brand' : 'bg-white/20'}"></div>
                        {/each}
                    </div>
                    
                    <div class="flex gap-2">
                        {#if currentSlideIndex > 0}
                            <Button variant="secondary" size="sm" onclick={prevSlide}>Zurück</Button>
                        {/if}
                        <Button variant="primary" size="sm" onclick={nextSlide}>
                            {currentSlideIndex === activeTour.slides.length - 1 ? 'Beenden' : 'Weiter'}
                            <IconChevronRight size={16} class="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
            
            <button 
                class="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white pointer-events-auto transition-colors backdrop-blur"
                onclick={endTour}
                title="Tour beenden"
            >
                <IconX size={24} />
            </button>
        </div>
    {/if}

    <!-- Tour Prompt Modal -->
    {#if showTourPrompt && !isTourActive}
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Card class="max-w-md w-full m-4 pointer-events-auto border-brand/20 shadow-brand/10 shadow-2xl">
                <div class="flex flex-col items-center text-center p-4">
                    <div class="p-4 bg-brand/10 rounded-full text-brand mb-4">
                        <IconMap size={48} />
                    </div>
                    <Typography variant="h2" class="mb-2">Willkommen!</Typography>
                    <Typography variant="body" class="text-white/70 mb-6">
                        Möchtest du eine kurze Tour durch die Visualisierung machen? 
                        Bei der Tour werden dir der Nutzen und die wichtigsten Funktionen und Zusammenhänge der Visualisierung vorgestellt.
                    </Typography>
                    
                    <div class="flex gap-3 w-full">
                        <Button variant="secondary" class="flex-1" onclick={dismissTour}>Nein, danke</Button>
                        <Button variant="primary" class="flex-1" onclick={startTour}>Tour starten</Button>
                    </div>
                </div>
            </Card>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        margin: 0;
        overflow: hidden;
        background-color: var(--bg-graph);
    }

    :global(.annotation-text-content) {
        pointer-events: none;
    }
    
    :global(.annotation-text-content *) {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        color: inherit !important;
    }

    :global(.annotation-text-content p:not(:last-child)) {
        margin-bottom: 0.5em !important;
    }

    :global(.annotation-text-content h1, 
            .annotation-text-content h2, 
            .annotation-text-content h3) {
        font-weight: bold !important;
        line-height: 1.2 !important;
        margin-bottom: 0.3em !important;
    }

    :global(.annotation-text-content ul, 
            .annotation-text-content ol) {
        padding-left: 1.2em !important;
        margin-bottom: 0.5em !important;
    }

    :global(.annotation-text-content li) {
        margin-bottom: 0.2em !important;
    }
</style>

