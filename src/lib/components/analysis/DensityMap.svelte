<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import * as d3 from 'd3';

    let Sigma;
    let Graph;

    if (browser) {
        Promise.all([
            import('sigma'),
            import('graphology')
        ]).then(([sigmaMod, graphologyMod]) => {
            Sigma = sigmaMod.default;
            Graph = graphologyMod.default;
        });
    }

    let { 
        data, 
        options = {}, 
        className = '', 
        opacity = 0.8,
        weightMultiplier = 5, 
        weightExponent = 2, // 2 means square root (1/2), 3 means cubic root (1/3)
        bounds = null // Optional project bounds to sync normalization
    } = $props();

    let container;
    let canvas;
    let renderer;
    let contours = [];
    let contourPathGenerator;
    let colorScale;
    let transform = $state({ x: 0, y: 0, ratio: 1, angle: 0 });
    let calculationTimer;
    
    // Grid configuration state
    let gridState = {
        width: 1,
        height: 1,
        gridW: 100,
        gridH: 100,
        minX: 0,
        minY: 0
    };

    // We use an effect to re-initialize or update when data or parameters change
    $effect(() => {
        // Access reactive props to ensure this effect re-runs when they change
        // We exclude 'opacity' because it's handled via CSS style binding on the canvas
        const _data = data;
        const _multiplier = weightMultiplier;
        const _exponent = weightExponent;
        const _bandwidth = options.bandwidth;
        const _thresholds = options.thresholds;
        const _resolution = options.resolution;
        const _bounds = bounds;

        if (!container || !data?.groups || !canvas) return;
        
        // Debounce heavy calculations
        clearTimeout(calculationTimer);
        calculationTimer = setTimeout(() => {
            calculateDensity();
        }, 30); // Slightly faster debounce for better feel

        return () => clearTimeout(calculationTimer);
    });

    function calculateDensity() {
        if (!Sigma || !Graph) {
            // If not yet loaded, retry in a bit
            clearTimeout(calculationTimer);
            calculationTimer = setTimeout(calculateDensity, 100);
            return;
        }

        // 1. Prepare Nodes and Weights
        const nodes = [];
        data.groups.forEach(node => {
            // Calculate weight based on user formula with parameters
            const initiated = node.initiated || 0;
            const supported = node.supported || 0;
            let weight = 1;
            
            // Formula: if ((Math.sqrt(5 * initiated + supported)/2) > 1) ...
            // Generalizing: Math.pow(multiplier * initiated + supported, 1/exponent) / 2
            const inner = weightMultiplier * (5 * initiated + supported);
            const calculated = Math.pow(Math.max(0, inner), 1 / weightExponent) / 2;
            
            if (calculated > 1) {
                weight = calculated;
            }

            nodes.push({
                id: node.id,
                x: node.x,
                y: node.y,
                weight: weight
            });
        });

        if (nodes.length === 0) return;

        // 2. Initialize Sigma (only if not exists) for interaction/coordinates
        if (!renderer) {
            const graph = new Graph();
            // Add invisible nodes to define the bounding box for Sigma
            nodes.forEach(n => {
                graph.addNode(n.id, {
                    x: n.x,
                    y: n.y,
                    size: 1, // Minimal size
                    color: 'rgba(0,0,0,0)' // Invisible
                });
            });

            // Add anchor nodes from project bounds to ensure same normalization as overlay
            if (bounds) {
                if (!graph.hasNode('__anchor_min')) {
                    graph.addNode('__anchor_min', { x: bounds.minX, y: bounds.minY, size: 0.1, color: 'rgba(0,0,0,0)' });
                }
                if (!graph.hasNode('__anchor_max')) {
                    graph.addNode('__anchor_max', { x: bounds.maxX, y: bounds.maxY, size: 0.1, color: 'rgba(0,0,0,0)' });
                }
            }

            renderer = new Sigma(graph, container, {
                allowInvalidContainer: true,
                renderEdgeLabels: false,
                renderLabels: false,
                defaultNodeColor: 'rgba(0,0,0,0)',
                defaultEdgeColor: 'rgba(0,0,0,0)',
                hideEdgesOnMove: true,
                hideLabelsOnMove: true,
            });
            
            // Apply initial transform if we have one
            if (transform.ratio !== 1 || transform.x !== 0 || transform.y !== 0) {
                renderer.getCamera().setState({
                    x: transform.x,
                    y: transform.y,
                    ratio: transform.ratio,
                    angle: transform.angle
                });
            }
        }

        // 3. Calculate Density Contours
        // Use provided bounds if available for cross-graph normalization sync
        let domainX, domainY;
        
        if (bounds) {
            // Use global bounds but add a small relative padding (5%)
            const bWidth = bounds.maxX - bounds.minX;
            const bHeight = bounds.maxY - bounds.minY;
            const padX = bWidth * 0.05;
            const padY = bHeight * 0.05;
            
            domainX = [bounds.minX - padX, bounds.maxX + padX];
            domainY = [bounds.minY - padY, bounds.maxY + padY];
        } else {
            // Fallback to local data extent
            const xExtent = d3.extent(nodes, d => d.x);
            const yExtent = d3.extent(nodes, d => d.y);
            const padding = Math.max(
                (xExtent[1] - xExtent[0]) * 0.1,
                (yExtent[1] - yExtent[0]) * 0.1,
                50
            );
            domainX = [xExtent[0] - padding, xExtent[1] + padding];
            domainY = [yExtent[0] - padding, yExtent[1] + padding];
        }
        
        const width = domainX[1] - domainX[0];
        const height = domainY[1] - domainY[0];
        
        // Aspect ratio for the grid
        const aspect = width / height;
        const baseResolution = options.resolution || 800;
        let gridW = baseResolution;
        let gridH = baseResolution / aspect;
        
        if (aspect < 1) {
            gridH = baseResolution;
            gridW = baseResolution * aspect;
        }

        // Store grid state for rendering
        gridState = {
            width,
            height,
            gridW,
            gridH,
            minX: domainX[0],
            minY: domainY[0]
        };

        // Scales to map World -> Grid
        const scaleX = d3.scaleLinear().domain(domainX).range([0, gridW]);
        const scaleY = d3.scaleLinear().domain(domainY).range([0, gridH]); 
        
        // Calculate bandwidth in Grid Units
        const bandwidthWorld = options.bandwidth || 30;
        const scaleFactor = gridW / width;
        const bandwidthGrid = bandwidthWorld * scaleFactor;

        const density = d3.contourDensity()
            .x(d => scaleX(d.x))
            .y(d => scaleY(d.y))
            .weight(d => d.weight)
            .size([gridW, gridH])
            .bandwidth(bandwidthGrid)
            .thresholds(options.thresholds || 15);

        // Compute contours (in Grid Coordinates)
        contours = density(nodes);

        // Path generator without projection (we handle transform in canvas)
        contourPathGenerator = d3.geoPath(null);

        // Define Color Scale
        const maxVal = d3.max(contours, d => d.value) || 1;
        
        // Custom color interpolator
        colorScale = d3.scaleLinear()
            .domain([0, maxVal])
            .range(['#fff7f3', '#49006a'])
            .interpolate(d3.interpolateRgb); 

        // Trigger render
        render();
    }

    $effect(() => {
        return () => {
            if (renderer) renderer.kill();
            renderer = null;
            clearTimeout(calculationTimer);
        };
    });

    function render() {
        if (!canvas || !contours.length) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        }

        // Clear
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Use Sigma's own projection to stay perfectly in sync
        // We need to map Grid coordinates [0, gridW] -> World -> Screen
        
        // 1. Define 3 points in Grid coordinates
        const pGrid0 = { x: 0, y: 0 };
        const pGrid1 = { x: 1, y: 0 };
        const pGrid2 = { x: 0, y: 1 };
        
        // 2. Map to World coordinates
        const gwScaleX = gridState.width / gridState.gridW;
        const gwScaleY = gridState.height / gridState.gridH;
        
        const pWorld0 = { x: gridState.minX, y: gridState.minY };
        const pWorld1 = { x: gridState.minX + gwScaleX, y: gridState.minY };
        const pWorld2 = { x: gridState.minX, y: gridState.minY + gwScaleY };
        
        // 3. Map to Viewport coordinates using Sigma's renderer
        const v0 = renderer.graphToViewport(pWorld0);
        const v1 = renderer.graphToViewport(pWorld1);
        const v2 = renderer.graphToViewport(pWorld2);
        
        // 4. Derive affine transform matrix components
        const a = v1.x - v0.x;
        const b = v1.y - v0.y;
        const c = v2.x - v0.x;
        const d = v2.y - v0.y;
        const e = v0.x;
        const f = v0.y;

        // Apply to canvas with DPR scaling
        ctx.setTransform(
            a * dpr, b * dpr, 
            c * dpr, d * dpr, 
            e * dpr, f * dpr
        );

        // Draw Contours
        contourPathGenerator.context(ctx);
        
        contours.forEach(geometry => {
            ctx.beginPath();
            contourPathGenerator(geometry);
            ctx.fillStyle = colorScale(geometry.value);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();
        });
        
        contourPathGenerator.context(null); // Detach
    }

    export function updateTransform(newTransform) {
        let state = {};
        if (newTransform.ratio !== undefined) {
            state = newTransform;
            transform = { 
                x: state.x, 
                y: state.y, 
                ratio: state.ratio,
                angle: state.angle || 0 
            };
        } else if (newTransform.k !== undefined) {
            // Convert from GraphVisualization format (x, y, k)
            // k is scale. ratio = 1/k.
            state = {
                x: newTransform.x,
                y: newTransform.y,
                ratio: 1 / newTransform.k,
                angle: newTransform.angle || 0
            };
            transform = { 
                x: state.x, 
                y: state.y, 
                ratio: state.ratio,
                angle: state.angle || 0 
            };
        }

        if (renderer) {
            renderer.getCamera().setState(state);
            render();
        }
    }

    export async function getExportData(format) {
        if (!canvas) return null;
        if (format === 'png') {
            return canvas.toDataURL('image/png');
        }
        return null;
    }

    onDestroy(() => {
        if (renderer) renderer.kill();
    });
</script>

<div bind:this={container} class="w-full h-full relative {className}">
    <canvas 
        bind:this={canvas} 
        class="absolute top-0 left-0 w-full h-full pointer-events-none"
        style="opacity: {opacity}"
    ></canvas>
</div>

<style>
    div {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        background: transparent; /* Ensure transparency */
    }
</style>