<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { hexbin } from 'd3-hexbin';
    import * as Plot from '@observablehq/plot';

    let { data, options = {}, opacity = 0.8, type = 'hexbin', weightMultiplier = 1.0, weightExponent = 1.0, class: className = '' } = $props();
    let canvas = $state();
    let container = $state();
    let transform = $state(d3.zoomIdentity);
    let plotContainer = $state();
    let renderTimeout = null;

    $effect(() => {
        // Track all reactive dependencies for re-rendering
        const _data = data;
        const _type = type;
        const _opacity = opacity;
        const _radius = options.radius;
        const _transform = transform;
        const _multiplier = weightMultiplier;
        const _exponent = weightExponent;
        const _bandwidth = options.bandwidth;
        const _thresholds = options.thresholds;
        
        if (_data && (canvas || plotContainer)) {
            // Debounce rendering during zoom for better performance
            if (renderTimeout) clearTimeout(renderTimeout);
            renderTimeout = setTimeout(() => {
                renderVisualization();
            }, 5);
        }
    });

    function renderVisualization() {
        if (!data || !data.groups || data.groups.length === 0) return;
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        // Use Observable Plot for complex visualizations, keep Canvas for basic ones if needed
        // For now, let's try to migrate the most intensive ones
        if (['hexbin', 'contours', 'voronoi', 'density'].includes(type)) {
            renderWithPlot(width, height);
            if (canvas) canvas.style.display = 'none';
            if (plotContainer) plotContainer.style.display = 'block';
            return;
        }

        if (plotContainer) plotContainer.style.display = 'none';
        if (canvas) {
            canvas.style.display = 'block';
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            
            ctx.save();
            ctx.translate(transform.x, transform.y);
            ctx.scale(transform.k, transform.k);

            const points = data.groups.map(d => {
                const p = [d.x, d.y];
                let weight = (d.weight || 1) * weightMultiplier;
                if (weightExponent !== 1) {
                    weight = Math.pow(weight, 1 / weightExponent);
                }
                p.weight = weight;
                p.id = d.id;
                return p;
            });

            if (type === 'delaunay') {
                renderDelaunay(ctx, points);
            }
            ctx.restore();
        }
    }

    function renderWithPlot(width, height) {
        if (!plotContainer) return;

        // Use cached points if possible or pre-calculate
        const currentPoints = data.groups.map(d => ({
            x: d.x,
            y: d.y,
            weight: weightExponent === 1 ? (d.weight || 1) * weightMultiplier : Math.pow((d.weight || 1) * weightMultiplier, 1 / weightExponent)
        }));

        // Adjust scales based on transform to match Force Graph
        const xDomain = [(-transform.x) / transform.k, (width - transform.x) / transform.k];
        const yDomain = [(-transform.y) / transform.k, (height - transform.y) / transform.k];

        let marks = [];
        
        if (type === 'hexbin') {
            marks.push(
                Plot.dot(currentPoints, Plot.hexbin({
                    fill: "sum",
                    r: "sum"
                }, {
                    x: "x",
                    y: "y",
                    fill: "weight",
                    binWidth: (options.radius || 12) * 2,
                    stroke: "white",
                    strokeOpacity: 0.1
                }))
            );
        } else if (type === 'contours') {
            marks.push(
                Plot.density(currentPoints, {
                    x: "x",
                    y: "y",
                    weight: "weight",
                    fill: "density",
                    bandwidth: options.bandwidth || 30,
                    thresholds: options.thresholds || 15,
                    fillOpacity: 0.3 * opacity
                })
            );
        } else if (type === 'voronoi') {
            marks.push(
                Plot.voronoi(currentPoints, {
                    x: "x",
                    y: "y",
                    fill: "weight",
                    fillOpacity: 0.3 * opacity,
                    stroke: "white",
                    strokeOpacity: 0.1
                })
            );
        } else if (type === 'density') {
            marks.push(
                Plot.dot(currentPoints, {
                    x: "x",
                    y: "y",
                    fill: "weight",
                    r: d => Math.sqrt(d.weight) * 2,
                    fillOpacity: 0.1 * opacity,
                    blur: 10
                })
            );
        }

        const plot = Plot.plot({
            width,
            height,
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            style: {
                background: "transparent",
                color: "white",
                overflow: "visible"
            },
            x: { axis: null, domain: xDomain, clamp: false },
            y: { axis: null, domain: yDomain, clamp: false, reverse: true },
            color: {
                scheme: "turbo",
                label: "Gewicht",
                legend: false
            },
            marks
        });

        plotContainer.innerHTML = '';
        plotContainer.appendChild(plot);
    }

    function renderDelaunay(ctx, points) {
        const delaunay = d3.Delaunay.from(points);
        ctx.strokeStyle = `rgba(127, 109, 242, ${0.4 * opacity})`;
        ctx.lineWidth = 1 / transform.k;
        ctx.beginPath();
        delaunay.render(ctx);
        ctx.stroke();

        // Highlight points with weighted size
        points.forEach(p => {
            const weight = p.weight || 1;
            ctx.fillStyle = '#7f6df2';
            ctx.beginPath();
            // Point size scales with the visual radius (sqrt of weight/area)
            const radius = (2 + Math.sqrt(weight) * 0.5) / transform.k;
            ctx.arc(p[0], p[1], radius, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    export function updateTransform(newTransform) {
        if (!newTransform) return;
        
        // Only update if the transform has actually changed significantly
        if (Math.abs(transform.x - newTransform.x) < 0.1 && 
            Math.abs(transform.y - newTransform.y) < 0.1 && 
            Math.abs(transform.k - newTransform.k) < 0.001) {
            return;
        }

        transform = newTransform;
        
        // For Plot-based visualizations, we need to re-render to update the domain
        // For Canvas-based ones, renderVisualization will be called by the $effect
    }

    onMount(() => {
        const resizeObserver = new ResizeObserver(() => {
            if (container) {
                if (canvas) {
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                }
                renderVisualization();
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });

    export async function getExportData(format, graphCanvas = null) {
        if (format === 'json') return JSON.stringify(data);
        if (format !== 'png') return null;

        let baseDataUrl = null;
        let width, height;

        // Case 1: Canvas visualization (Delaunay)
        if (canvas && canvas.style.display !== 'none') {
            width = canvas.width;
            height = canvas.height;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const ctx = tempCanvas.getContext('2d');
            
            // Fill background with slate-950 (matching the UI)
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(canvas, 0, 0);
            baseDataUrl = tempCanvas.toDataURL('image/png');
        }

        // Case 2: Plot visualization (SVG)
        if (!baseDataUrl && plotContainer && plotContainer.style.display !== 'none') {
            const svgElement = plotContainer.querySelector('svg');
            if (svgElement) {
                width = svgElement.clientWidth || 800;
                height = svgElement.clientHeight || 600;
                
                baseDataUrl = await new Promise((resolve) => {
                    try {
                        const clonedSvg = svgElement.cloneNode(true);
                        clonedSvg.setAttribute('width', width);
                        clonedSvg.setAttribute('height', height);

                        const svgData = new XMLSerializer().serializeToString(clonedSvg);
                        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(svgBlob);

                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        
                        img.onload = () => {
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = width;
                            tempCanvas.height = height;
                            const ctx = tempCanvas.getContext('2d');
                            
                            ctx.fillStyle = '#020617';
                            ctx.fillRect(0, 0, width, height);
                            
                            ctx.drawImage(img, 0, 0);
                            URL.revokeObjectURL(url);
                            resolve(tempCanvas.toDataURL('image/png'));
                        };
                        
                        img.onerror = () => {
                            URL.revokeObjectURL(url);
                            resolve(null);
                        };
                        
                        img.src = url;
                    } catch (e) {
                        resolve(null);
                    }
                });
            }
        }

        if (!baseDataUrl) return null;

        // If a graph canvas is provided, overlay it on top of the density map
        if (graphCanvas) {
            return new Promise((resolve) => {
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = width;
                finalCanvas.height = height;
                const ctx = finalCanvas.getContext('2d');

                const baseImg = new Image();
                baseImg.onload = () => {
                    ctx.drawImage(baseImg, 0, 0);
                    // Draw the force graph on top
                    ctx.drawImage(graphCanvas, 0, 0, width, height);
                    resolve(finalCanvas.toDataURL('image/png'));
                };
                baseImg.src = baseDataUrl;
            });
        }

        return baseDataUrl;
    }
</script>

<div bind:this={container} class="w-full h-full {className}">
    <canvas bind:this={canvas}></canvas>
    <div bind:this={plotContainer} class="w-full h-full"></div>
</div>

<style>
    canvas, .w-full {
        display: block;
        width: 100%;
        height: 100%;
    }
    :global(svg) {
        display: block;
    }
</style>
