<script>
    import { onMount } from 'svelte';
    import { 
        Button, 
        Typography
    } from '$lib/components/aea';
    import { 
        IconLine, 
        IconPolygon, 
        IconChartLine,
        IconTrash
    } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {any} graph - Die Instanz der Graph-Visualisierung
     * @property {(nodes: any[]) => void} [onOpenComposition] - Callback to open composition modal
     */

    let { graph, onOpenComposition } = $props();

    let activeTool = $state(null); // 'line', 'polygon'
    let results = $state({
        edgeCount: 0,
        nodeCount: 0,
        selectedNodes: [] // Track nodes in area
    });

    // Drawing state
    let isDrawing = false;
    let startPoint = null;
    let currentPoint = null;
    let polygonPoints = [];
    let canvas = null;
    let ctx = null;

    onMount(() => {
        setupOverlay();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            removeOverlay();
            window.removeEventListener('resize', resizeCanvas);
        };
    });

    function setupOverlay() {
        const container = document.getElementById('graph-container');
        if (!container) return;

        canvas = document.createElement('canvas');
        canvas.id = 'tools-overlay';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '15';
        container.parentElement.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resizeCanvas();

        // Add event listeners for drawing to the parent or a transparent layer
        const inputLayer = document.createElement('div');
        inputLayer.id = 'tools-input-layer';
        inputLayer.style.position = 'absolute';
        inputLayer.style.top = '0';
        inputLayer.style.left = '0';
        inputLayer.style.width = '100%';
        inputLayer.style.height = '100%';
        inputLayer.style.zIndex = '16';
        inputLayer.style.display = 'none';
        container.parentElement.appendChild(inputLayer);

        inputLayer.addEventListener('mousedown', handleMouseDown);
        inputLayer.addEventListener('mousemove', handleMouseMove);
        inputLayer.addEventListener('mouseup', handleMouseUp);
    }

    function removeOverlay() {
        const overlay = document.getElementById('tools-overlay');
        if (overlay) overlay.remove();
        const inputLayer = document.getElementById('tools-input-layer');
        if (inputLayer) inputLayer.remove();
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw();
    }

    function toggleTool(tool) {
        if (activeTool === tool) {
            activeTool = null;
            document.getElementById('tools-input-layer').style.display = 'none';
        } else {
            activeTool = tool;
            document.getElementById('tools-input-layer').style.display = 'block';
            document.getElementById('tools-input-layer').style.cursor = 'crosshair';
        }
        resetDrawing();
        draw();
    }

    function resetDrawing() {
        isDrawing = false;
        startPoint = null;
        currentPoint = null;
        polygonPoints = [];
        results.edgeCount = 0;
        results.nodeCount = 0;
        results.selectedNodes = [];
    }

    function handleMouseDown(e) {
        if (!activeTool) return;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (activeTool === 'line') {
            startPoint = { x, y };
            currentPoint = { x, y };
        } else if (activeTool === 'polygon') {
            polygonPoints = [{ x, y }];
        }
    }

    function handleMouseMove(e) {
        if (!isDrawing || !activeTool) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === 'line') {
            currentPoint = { x, y };
        } else if (activeTool === 'polygon') {
            polygonPoints = [...polygonPoints, { x, y }];
        }
        draw();
    }

    function handleMouseUp() {
        if (!isDrawing) return;
        isDrawing = false;
        
        if (activeTool === 'line') {
            countEdges();
        } else if (activeTool === 'polygon') {
            countNodes();
        }
        draw();
    }

    function draw() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw current tool
        if (activeTool === 'line' && startPoint && currentPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(currentPoint.x, currentPoint.y);
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (results.edgeCount > 0) {
                ctx.fillStyle = 'cyan';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(`Edges: ${results.edgeCount}`, currentPoint.x + 10, currentPoint.y + 10);
            }
        }

        if (activeTool === 'polygon' && polygonPoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
            for (let i = 1; i < polygonPoints.length; i++) {
                ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
            }
            if (!isDrawing) ctx.closePath();
            ctx.strokeStyle = 'magenta';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
            ctx.fill();

            if (results.nodeCount > 0) {
                ctx.fillStyle = 'magenta';
                ctx.font = 'bold 14px sans-serif';
                const lastPoint = polygonPoints[polygonPoints.length - 1];
                ctx.fillText(`Nodes: ${results.nodeCount}`, lastPoint.x + 10, lastPoint.y + 10);
            }
        }
    }

    function countEdges() {
        if (!graph || !startPoint || !currentPoint) return;
        
        const p1 = graph.viewportToGraph(startPoint.x, startPoint.y);
        const p2 = graph.viewportToGraph(currentPoint.x, currentPoint.y);
        
        let count = 0;
        const edges = graph.allLinks;
        
        for (const edge of edges) {
            const s = { x: edge.source.x, y: edge.source.y };
            const t = { x: edge.target.x, y: edge.target.y };
            
            if (intersect(p1.x, p1.y, p2.x, p2.y, s.x, s.y, t.x, t.y)) {
                count++;
            }
        }
        results.edgeCount = count;
    }

    function countNodes() {
        if (!graph || polygonPoints.length < 3) return;
        
        const graphPoints = polygonPoints.map(p => graph.viewportToGraph(p.x, p.y));
        
        const nodes = graph.allNodes;
        const foundNodes = [];
        
        for (const node of nodes) {
            if (isPointInPolygon({ x: node.x, y: node.y }, graphPoints)) {
                foundNodes.push(node);
            }
        }
        results.nodeCount = foundNodes.length;
        results.selectedNodes = foundNodes;
    }

    // Helper: Line-Line intersection
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const det = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
        if (det === 0) return false;
        const lambda = ((y4 - y3) * (x4 - x1) + (x3 - x4) * (y4 - y1)) / det;
        const gamma = ((y1 - y2) * (x4 - x1) + (x2 - x1) * (y4 - y1)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }

    // Helper: Point in Polygon
    function isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function clearTools() {
        activeTool = null;
        document.getElementById('tools-input-layer').style.display = 'none';
        resetDrawing();
        draw();
    }
</script>

<div class="space-y-10">
    <div class="space-y-6">
        <Typography variant="label" class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Werkzeuge</Typography>
        
        <div class="grid grid-cols-1 gap-4">
            <!-- Edge Counting Line -->
            <button 
                onclick={() => toggleTool('line')}
                class="flex items-center justify-between p-4 rounded-2xl transition-all border {activeTool === 'line' ? 'bg-cyan-500/20 border-cyan-500' : 'bg-[var(--text-primary)]/5 border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10'}"
            >
                <div class="flex items-center gap-4">
                    <div class="p-2 rounded-lg {activeTool === 'line' ? 'bg-cyan-500 text-white' : 'bg-[var(--text-primary)]/10'}">
                        <IconLine size={20} />
                    </div>
                    <div class="text-left">
                        <Typography variant="label" class="text-xs font-bold font-modern uppercase tracking-wider">Kanten zählen (Linie)</Typography>
                        <Typography variant="body" class="text-[9px] text-[var(--text-tertiary)] font-medium leading-tight">Ziehe eine Linie, um Schnittpunkte zu zählen</Typography>
                    </div>
                </div>
            </button>

            <!-- Node Counting Freehand -->
            <button 
                onclick={() => toggleTool('polygon')}
                class="flex items-center justify-between p-4 rounded-2xl transition-all border {activeTool === 'polygon' ? 'bg-magenta-500/20 border-magenta-500' : 'bg-[var(--text-primary)]/5 border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10'}"
            >
                <div class="flex items-center gap-4">
                    <div class="p-2 rounded-lg {activeTool === 'polygon' ? 'bg-magenta-500 text-white' : 'bg-[var(--text-primary)]/10'}" style="background-color: {activeTool === 'polygon' ? '#d946ef' : ''}">
                        <IconPolygon size={20} />
                    </div>
                    <div class="text-left">
                        <Typography variant="label" class="text-xs font-bold font-modern uppercase tracking-wider">Knoten zählen (Freihand)</Typography>
                        <Typography variant="body" class="text-[9px] text-[var(--text-tertiary)] font-medium leading-tight">Zeichne eine Fläche, um Knoten zu zählen</Typography>
                    </div>
                </div>
            </button>

            {#if results.nodeCount > 0}
                <button 
                    onclick={() => onOpenComposition?.(results.selectedNodes)}
                    class="flex items-center justify-between p-4 rounded-2xl transition-all border bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                >
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-lg bg-amber-500 text-white">
                            <IconChartLine size={20} />
                        </div>
                        <div class="text-left">
                            <Typography variant="label" class="text-xs font-bold font-modern uppercase tracking-wider">Attribut-Zusammensetzung</Typography>
                            <Typography variant="body" class="text-[9px] text-[var(--text-tertiary)] font-medium leading-tight">Analysiere die {results.nodeCount} ausgewählten Knoten</Typography>
                        </div>
                    </div>
                </button>
            {/if}
        </div>
    </div>

    {#if activeTool}
        <div class="pt-4 border-t border-[hsl(var(--text-500)/0.1)]">
            <Button 
                onclick={clearTools}
                variant="outline"
                class="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 rounded-2xl flex items-center justify-center gap-2"
            >
                <IconTrash size={14} />
                Werkzeuge zurücksetzen
            </Button>
        </div>
    {/if}
</div>

<style>
    /* Add any custom styles here */
</style>
