<script>
    import { onMount, onDestroy } from 'svelte';
    import Graph from 'graphology';
    import Sigma from 'sigma';
    import { bindWebGLLayer, createContoursProgram } from '@sigma/layer-webgl';

    let { 
        data, 
        options = {}, 
        className = '', 
        weightMultiplier = 5, 
        weightExponent = 2 // 2 means square root (1/2), 3 means cubic root (1/3)
    } = $props();
    let container;
    let renderer;
    let webglLayer;

    // We use an effect to re-initialize or update when data or parameters change
    $effect(() => {
        if (!container || !data?.groups) return;

        // Cleanup previous if exists
        if (webglLayer) webglLayer();
        if (renderer) renderer.kill();

        // 1. Create Graph
        const graph = new Graph();
        
        data.groups.forEach(node => {
            if (!graph.hasNode(node.id)) {
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

                graph.addNode(node.id, {
                    x: node.x,
                    y: node.y,
                    size: 5, 
                    color: 'rgba(0,0,0,0)', 
                    weight: weight,
                    initiated,
                    supported
                });
            }
        });

        // 2. Initialize Sigma
        renderer = new Sigma(graph, container, {
            allowInvalidContainer: true,
            renderEdgeLabels: false,
            renderLabels: false,
            defaultNodeColor: 'rgba(0,0,0,0)',
            defaultEdgeColor: 'rgba(0,0,0,0)',
        });

        // 3. Bind WebGL Layer (Contours)
        const bandwidth = options.bandwidth || 30;
        const thresholds = options.thresholds || 15;
        
        const levels = [];
        const step = 1.0 / thresholds;
        for (let i = 0; i < thresholds; i++) {
            const t = i * step;
            levels.push({
                color: interpolateColor('#fff7f3', '#49006a', t),
                threshold: t
            });
        }

        const contourProgram = createContoursProgram(graph.nodes(), {
            radius: bandwidth,
            feather: 1,
            levels: levels,
        });

        webglLayer = bindWebGLLayer('contours', renderer, contourProgram);
        
        // Return cleanup function for the effect
        return () => {
            if (webglLayer) webglLayer();
            if (renderer) renderer.kill();
        };
    });

    export function updateTransform(transform) {
        if (!renderer) return;

        let state = {};
        if (transform.ratio !== undefined) {
            state = transform;
        } else if (transform.k !== undefined) {
            // Convert from the format emitted by GraphVisualization (x, y, k=1/ratio)
            // to Sigma camera state (x, y, ratio)
            state = {
                x: transform.x,
                y: transform.y,
                ratio: 1 / transform.k,
                angle: transform.angle || 0
            };
        }

        renderer.getCamera().setState(state);
    }

    export async function getExportData(format) {
        if (!renderer) return null;
        if (format === 'png') {
            // Use Sigma's export mechanism or just canvas toDataURL
            // Since we are using WebGL, we might need to preserve drawing buffer or render explicitly
            const gl = renderer.getGL();
            const canvas = renderer.getContainer().querySelector('canvas');
            if (canvas) {
                 return canvas.toDataURL('image/png');
            }
        }
        return null;
    }

    onDestroy(() => {
        if (webglLayer) webglLayer(); // Unbind
        if (renderer) renderer.kill();
    });

    function interpolateColor(color1, color2, factor) {
        // Simple linear interpolation
        // Assuming hex colors
        // This is a helper, but might be better to use d3-scale if available or simple implementation
        // For brevity, I'll use a simple implementation or hardcoded colors if this is complex
        // But let's try a simple hex lerp
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);

        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);

        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
</script>

<div bind:this={container} class="w-full h-full {className}"></div>

<style>
    div {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>