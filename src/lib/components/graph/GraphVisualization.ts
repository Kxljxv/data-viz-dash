import Graph from 'graphology';
import * as gexf from 'graphology-gexf';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeArrowProgram, EdgeRectangleProgram } from 'sigma/rendering';
import type { GraphNode, GraphLink, GraphSettings, GraphGroup } from '$lib/types/graph';
import * as d3 from 'd3'; // Used for types and compatibility

// Old color palette constants
const COLOR_AMENDMENT = '#d86b74';
const COLOR_SUPPORTER = '#7dff00';
const COLOR_LINK = 'rgba(70,70,70,0.005)';
const COLOR_LABEL = 'hsl(50, 9%, 73.7%)';
const FONT_LABEL = 'ModernDense, sans-serif';

export default class GraphVisualization {

    projectName: string | null;
    containerId: string;
    graph: Graph;
    renderer: Sigma | null = null;
    ogma: any | null = null;
    isUsingOgma: boolean = false;
    
    // UI State
    selectedNode: any | null = null;
    hoveredNode: any | null = null;
    highlightedNodeId: string | null = null;
    groups: GraphGroup[] = [];
    
    // Settings
    settings: GraphSettings = {
        showLabels: false,
        showLinks: true,
        showAntraege: true,
        showSupporters: true,
        nodeSize: 1,
        linearZoom: true
    };

    // Transform state (D3-like for compatibility)
    transform = { x: 0, y: 0, k: 1 };
    
    // Data accessors for UI
    get allNodes() {
        if (!this.graph) return [];
        return this.graph.mapNodes((id, attr) => ({
            id,
            ...attr,
            x: attr.x,
            y: attr.y,
            size: attr.size,
            color: attr.color,
            label: attr.label
        }));
    }

    get allLinks() {
        if (!this.graph) return [];
        return this.graph.mapEdges((id, attr, source, target) => ({
            id,
            source,
            target,
            ...attr
        }));
    }

    constructor(projectName: string | null = null, containerId: string = 'graph-container') {
        this.projectName = projectName;
        this.containerId = containerId;
        
        // Handle different import behaviors for Graphology
        const GraphConstructor = (Graph as any).default || Graph;
        this.graph = new GraphConstructor();
        
        // Wait for DOM to be ready if needed, or just init
        setTimeout(() => this.init(), 0);
    }

    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn(`Container #${this.containerId} not found. Retrying...`);
            setTimeout(() => this.init(), 100);
            return;
        }

        await this.loadData();

        // Prevent browser context menu on the container to allow Sigma's rightClickNode to fire
        container.addEventListener('contextmenu', (e) => e.preventDefault());

        const OgmaGlobal = (window as any).Ogma;
        if (OgmaGlobal) {
            this.isUsingOgma = true;
            this.ogma = new OgmaGlobal({ container: this.containerId });
            this.ogma.graph.setData({ nodes: this.allNodes, edges: this.allLinks });
            this.setupEventsOgma();
            this.setupUIListeners();
            window.dispatchEvent(new CustomEvent('aea-data-loaded', {
                detail: {
                    nodes: this.allNodes,
                    links: this.allLinks
                }
            }));
            const loadingEl = document.getElementById('loading');
            if (loadingEl) loadingEl.style.display = 'none';
            this.applyOgmaStyles();
            return;
        }

        // Initialize Sigma
        const SigmaConstructor = (Sigma as any).default || Sigma;
        this.renderer = new SigmaConstructor(this.graph, container, {
            minCameraRatio: 0.1,
            maxCameraRatio: 10,
            allowInvalidContainer: true,
            renderLabels: true,
            labelFont: FONT_LABEL,
            labelColor: { color: COLOR_LABEL },
            defaultEdgeColor: COLOR_LINK,
            defaultEdgeType: "line",
            edgeColor: "attribute", // Force use of the attributes we set in loadData
            enableEdgeEvents: false, 
            zIndex: true,
            // Linear zoom settings
            nodeSizeReference: this.settings.linearZoom ? "positions" : "pixels",
            edgeSizeReference: this.settings.linearZoom ? "positions" : "pixels",
            zoomToSizeRatioFunction: this.settings.linearZoom ? (x: number) => x : () => 1,
            autoRescale: !this.settings.linearZoom,
            // Disable label background and ensure label is shown on hover
            hoverRenderer: (context, data, settings) => {
                const { label, size } = data;
                if (!label) return;

                const font = settings.labelFont;
                const weight = settings.labelWeight;
                const colorLabel = settings.labelColor.color || COLOR_LABEL;

                context.fillStyle = colorLabel;
                context.font = `${weight} ${size}px ${font}`;
                context.fillText(label, data.x + size + 3, data.y + size / 3);
            },
            nodeProgramClasses: {
                circle: NodeCircleProgram,
                antrag: NodeCircleProgram,
                applicant: NodeCircleProgram,
                supporter: NodeCircleProgram,
                amendment: NodeCircleProgram,
                person: NodeCircleProgram,
                prs: NodeCircleProgram
            },
            // Removed edgeProgramClasses for default line rendering
        });

        this.setupEventsSigma();
        this.setupUIListeners();
        
        // Dispatch loaded event
        window.dispatchEvent(new CustomEvent('aea-data-loaded', {
            detail: {
                nodes: this.allNodes,
                links: this.allLinks
            }
        }));

        // Hide loading screen
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'none';
    }

    async loadData() {
        try {
            // Load the GEXF file
            const project = this.projectName || 'bdk';
            
            // Potential paths to try - prioritize the flat structure in static/data
            const pathsToTry = [
                `/data/${project}.gexf.gz`,
                `/data/${project}.gexf`,
                `/data/${project}/algorithms/forceatlas/graph.gexf.gz`,
                `/data/${project}/algorithms/forceatlas/graph.gexf`
            ];
            
            let response: Response | null = null;
            let loadedPath = '';
            
            for (const path of pathsToTry) {
                try {
                    console.log(`Trying to fetch: ${path}`);
                    const res = await fetch(path);
                    if (res.ok) {
                        // Check if it's actually a valid GZIP by looking at the first few bytes if possible,
                        // or just trust the extension for now.
                        response = res;
                        loadedPath = path;
                        break;
                    }
                } catch (e) {
                    console.warn(`Fetch failed for ${path}:`, e);
                    continue;
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Failed to load GEXF file for project ${project} from any expected path`);
            }
            
            let gexfString: string;
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Check for GZIP magic number: 0x1F 0x8B
            const isGzip = uint8Array.length > 2 && uint8Array[0] === 0x1F && uint8Array[1] === 0x8B;
            
            if (isGzip && typeof DecompressionStream !== 'undefined') {
                try {
                    console.log(`Detected GZIP magic number for ${loadedPath}, decompressing...`);
                    const stream = new ReadableStream({
                        start(controller) {
                            controller.enqueue(uint8Array);
                            controller.close();
                        }
                    });
                    const decompressionStream = new DecompressionStream('gzip');
                    const decompressedResponse = new Response(stream.pipeThrough(decompressionStream));
                    gexfString = await decompressedResponse.text();
                } catch (e) {
                    console.error("Decompression failed despite GZIP header:", e);
                    // Fallback to text if decompression fails for some reason
                    gexfString = new TextDecoder().decode(uint8Array);
                }
            } else {
                if (isGzip) {
                    console.warn("GZIP detected but DecompressionStream is not available.");
                }
                // It's either not GZIP or we can't decompress it
                gexfString = new TextDecoder().decode(uint8Array);
                
                // If it was supposed to be XML but looks like garbage, it might be a different compression or truly corrupt
                if (gexfString.trim().startsWith('<?xml') === false && !isGzip) {
                    console.warn("Data does not look like XML/GEXF. Path:", loadedPath);
                }
            }
            
            // Parse GEXF into Graphology graph
            // Handle different import behaviors for CommonJS modules in Vite
            const parser = (gexf as any).parse || (gexf as any).default?.parse;
            
            if (!parser) {
                throw new Error("GEXF parser not found in imported module");
            }
            
            const GraphConstructor = (Graph as any).default || Graph;
            this.graph = parser(GraphConstructor, gexfString);
            
            console.log(`Loaded graph with ${this.graph.order} nodes and ${this.graph.size} edges`);

            // Post-process: Apply colors based on type and preserve original size from GEXF
            this.graph.forEachNode((node, attr) => {
                // Ensure size from GEXF is used. If not present, default to 5.
                if (!attr.size) {
                    this.graph.setNodeAttribute(node, 'size', 5);
                }
                
                // Set default colors based on type
                if (attr.type === 'antrag' || attr.type === 'amendment') {
                    this.graph.setNodeAttribute(node, 'color', COLOR_AMENDMENT);
                } else if (attr.type === 'supporter' || attr.type === 'person' || attr.type === 'prs') {
                    this.graph.setNodeAttribute(node, 'color', COLOR_SUPPORTER);
                } else if (!attr.color) {
                    this.graph.setNodeAttribute(node, 'color', '#999');
                }
                
                // Ensure label exists
                if (!attr.label) this.graph.setNodeAttribute(node, 'label', attr.name || node);
            });

            // Post-process edges: apply colors and types for density visualization
            this.graph.forEachEdge((edge) => {
                this.graph.setEdgeAttribute(edge, 'color', COLOR_LINK);
                this.graph.setEdgeAttribute(edge, 'size', 0.1);
                this.graph.setEdgeAttribute(edge, 'type', 'line');
            });

        } catch (error) {
            console.error('Error loading graph data:', error);
        }
    }

    setupEventsSigma() {
        if (!this.renderer) return;

        // Click Node
        this.renderer.on('clickNode', (event) => {
            const nodeId = event.node;
            const attr = this.graph.getNodeAttributes(nodeId);
            
            this.selectedNode = { id: nodeId, ...attr };
            
            // Dispatch event for UI
            window.dispatchEvent(new CustomEvent('aea-node-selected', {
                detail: { node: this.selectedNode, openPanel: true }
            }));
            
            this.refreshReducers();
        });

        // Hover Node
        this.renderer.on('enterNode', (event) => {
            this.hoveredNode = event.node;
            this.refreshReducers();
        });

        this.renderer.on('leaveNode', () => {
            this.hoveredNode = null;
            this.refreshReducers();
        });

        // Click Stage (Background)
        this.renderer.on('clickStage', () => {
            this.selectedNode = null;
            window.dispatchEvent(new CustomEvent('aea-node-selected', {
                detail: { node: null }
            }));
            this.refreshReducers();
        });

        // Right click node
        this.renderer.on('rightClickNode', (event) => {
            this.handleContextMenu(event, true);
        });

        // Right click stage
        this.renderer.on('rightClickStage', (event) => {
            this.handleContextMenu(event, false);
        });

        // Camera move (Zoom/Pan)
        this.renderer.getCamera().on('updated', (state) => {
            this.transform = {
                x: state.x,
                y: state.y,
                k: 1 / state.ratio
            };
            
            window.dispatchEvent(new CustomEvent('aea-graph-zoom', {
                detail: { transform: this.transform }
            }));
        });
    }

    setupEventsOgma() {
        if (!this.ogma) return;
        this.ogma.events.on('click:node', (event: any) => {
            const nodeId = event.target.getId();
            const attr = this.graph.getNodeAttributes(nodeId);
            this.selectedNode = { id: nodeId, ...attr };
            window.dispatchEvent(new CustomEvent('aea-node-selected', {
                detail: { node: this.selectedNode, openPanel: true }
            }));
            this.applyOgmaStyles();
        });
        this.ogma.events.on('hover:node', (event: any) => {
            this.hoveredNode = event.target.getId();
            this.applyOgmaStyles();
        });
        this.ogma.events.on('leave:node', () => {
            this.hoveredNode = null;
            this.applyOgmaStyles();
        });
        this.ogma.events.on('click:background', () => {
            this.selectedNode = null;
            window.dispatchEvent(new CustomEvent('aea-node-selected', {
                detail: { node: null }
            }));
            this.applyOgmaStyles();
        });
        this.ogma.view.on('change', (state: any) => {
            this.transform = {
                x: state.center.x,
                y: state.center.y,
                k: state.zoom
            };
            window.dispatchEvent(new CustomEvent('aea-graph-zoom', {
                detail: { transform: this.transform }
            }));
        });
    }

    private handleContextMenu(event: any, isNode: boolean) {
        const sigmaEvent = event.event;
        const nativeEvent = sigmaEvent.originalEvent;
        
        // Use clientX/Y from native event for fixed positioning
        const x = nativeEvent ? nativeEvent.clientX : sigmaEvent.x;
        const y = nativeEvent ? nativeEvent.clientY : sigmaEvent.y;

        if (isNode) {
            const nodeId = event.node;
            const attr = this.graph.getNodeAttributes(nodeId);
            
            window.dispatchEvent(new CustomEvent('aea-context-menu', {
                detail: { 
                    node: { id: nodeId, ...attr },
                    x,
                    y
                }
            }));
        } else {
            // Hide menu if clicking stage
            window.dispatchEvent(new CustomEvent('aea-context-menu-hide'));
        }
        
        if (nativeEvent && nativeEvent.preventDefault) {
            nativeEvent.preventDefault();
            nativeEvent.stopPropagation();
        }
    }

    setupUIListeners() {
        // Listen for UI actions
        window.addEventListener('aea-view-action', (event: any) => {
            const { action, nodeId } = event.detail;
            switch (action) {
                case 'center':
                    if (nodeId) this.centerOnNode(nodeId);
                    else this.centerGraph();
                    break;
                case 'highlight':
                    if (nodeId) this.highlightNode(nodeId);
                    break;
                case 'select':
                    if (nodeId) this.selectNodeById(nodeId);
                    break;
                case 'reset':
                    this.centerGraph();
                    this.resetHighlight();
                    break;
            }
        });

        window.addEventListener('aea-filter-change', (event: any) => {
            const { type, value } = event.detail;
            this.updateSettings({ [type]: value });
        });

        window.addEventListener('aea-group-update', (event: any) => {
            this.groups = event.detail.groups;
            this.updateNodeStyles();
        });
    }

    updateNodeStyles() {
        if (this.isUsingOgma) this.applyOgmaStyles();
        else this.refreshReducers();
    }

    private dimColor(color: string): string {
        try {
            const c = d3.hsl(color);
            c.s *= 0.3; // Desaturate
            c.l *= 0.2; // Darken
            return c.toString();
        } catch (e) {
            return "#222";
        }
    }

    refreshReducers() {
        if (this.isUsingOgma) return;
        if (!this.renderer) return;

        // Node Reducer
        this.renderer.setSetting("nodeReducer", (node, data) => {
            const res = { ...data };
            const attr = this.graph.getNodeAttributes(node);
            
            // 1. Visibility Filters
            if (!this.settings.showAntraege && (attr.type === 'antrag' || attr.type === 'amendment')) {
                res.hidden = true;
                return res;
            }
            if (!this.settings.showSupporters && (attr.type === 'supporter' || attr.type === 'person')) {
                res.hidden = true;
                return res;
            }

            // 2. Base Color & Group Inheritance
            const group = this.groups.find(g => g.nodes.includes(node));
            if (group) {
                res.color = group.color;
            } else {
                // Default color based on type
                if (attr.type === 'antrag' || attr.type === 'amendment') res.color = COLOR_AMENDMENT;
                else if (attr.type === 'supporter' || attr.type === 'person') res.color = COLOR_SUPPORTER;
                else res.color = attr.color || '#999';
            }

            // 3. Selection & Highlighting logic
            if (this.selectedNode) {
                const isSelected = node === this.selectedNode.id;
                const isNeighbor = this.graph.areNeighbors(node, this.selectedNode.id);

                if (isSelected) {
                    res.highlighted = true;
                    res.zIndex = 90; // Just below links
                } else if (isNeighbor) {
                    res.zIndex = 60; // Below selected node
                    // Keep original color
                } else {
                    // Background layer (dimmed)
                    res.color = this.dimColor(res.color || "#999"); 
                    res.label = "";
                    res.zIndex = 0;
                    res.alpha = 0.3;
                }
            } else if (this.highlightedNodeId) {
                const isHighlighted = node === this.highlightedNodeId;
                const isNeighbor = this.graph.areNeighbors(node, this.highlightedNodeId);

                if (isHighlighted) {
                    res.highlighted = true;
                    res.zIndex = 90;
                } else if (isNeighbor) {
                    res.zIndex = 60;
                } else {
                    res.color = this.dimColor(res.color || "#999");
                    res.label = "";
                    res.zIndex = 0;
                }
            }

            // 4. Hover logic (ensure label is shown)
            if (this.hoveredNode === node) {
                res.label = attr.label || attr.name || node;
                res.zIndex = 20;
            }

            // 5. Node size multiplier
            if (this.settings.nodeSize !== 1) {
                res.size = (attr.size || 5) * this.settings.nodeSize;
            }

            // 6. Labels (global toggle)
            if (!this.settings.showLabels && this.hoveredNode !== node && (!this.selectedNode || this.selectedNode.id !== node)) {
                res.label = "";
            }

            return res;
        });

        // Edge Reducer
        this.renderer.setSetting("edgeReducer", (edge, data) => {
            const res = { ...data };
            
            // 1. Visibility Filter
            if (!this.settings.showLinks) {
                res.hidden = true;
                return res;
            }

            // 2. Selection/Highlighting Filter
            const activeNodeId = (this.selectedNode?.id) || this.highlightedNodeId;
            if (activeNodeId) {
                if (!this.graph.hasExtremity(edge, activeNodeId)) {
                    // Dim non-connected edges to be virtually invisible
                    res.color = 'rgba(70,70,70,0.001)';
                    res.zIndex = 0;
                } else {
                    // Highlighted edges connected to the active node
                    res.color = 'rgba(153,153,153,0.6)';
                    res.zIndex = 100;
                }
            } else {
                // Ensure default color is applied even if not in attributes
                res.color = COLOR_LINK;
                res.zIndex = 0;
            }

            return res;
        });

        this.renderer.refresh();
    }

    highlightNode(nodeId: string) {
        this.highlightedNodeId = nodeId;
        if (this.isUsingOgma) this.applyOgmaStyles();
        else this.refreshReducers();
    }

    selectNodeById(nodeId: string) {
        if (!this.graph.hasNode(nodeId)) return;
        
        const attr = this.graph.getNodeAttributes(nodeId);
        this.selectedNode = { id: nodeId, ...attr };
        
        // Dispatch event so UI can update (but do NOT open the detail panel automatically)
        window.dispatchEvent(new CustomEvent('aea-node-selected', {
            detail: { node: this.selectedNode, openPanel: false }
        }));
        
        if (this.isUsingOgma) this.applyOgmaStyles();
        else this.refreshReducers();
    }

    resetHighlight() {
        this.highlightedNodeId = null;
        if (this.isUsingOgma) this.applyOgmaStyles();
        else this.refreshReducers();
    }

    centerOnNode(nodeId: string) {
        if (this.isUsingOgma) {
            if (!this.ogma || !this.graph.hasNode(nodeId)) return;
            const node = this.ogma.getNode(nodeId);
            if (!node) return;
            const pos = node.getPosition();
            this.ogma.view.animate({ center: pos, zoom: 6 }, { duration: 600 });
        } else {
            if (!this.renderer || !this.graph.hasNode(nodeId)) return;
            const sigmaPos = this.renderer.getNodeDisplayData(nodeId);
            if (!sigmaPos) return;
            this.renderer.getCamera().animate({
                x: sigmaPos.x,
                y: sigmaPos.y,
                ratio: 0.15
            }, { duration: 600 });
        }
    }

    // API for UI to control the graph
    
    setTransform(transform: any) {
        if (this.isUsingOgma) {
            if (!this.ogma) return;
            const { x, y, k } = transform;
            if (x !== undefined && y !== undefined && k !== undefined) {
                this.ogma.view.animate({ center: { x, y }, zoom: k }, { duration: 500 });
            }
        } else {
            if (!this.renderer) return;
            const { x, y, k } = transform;
            if (x !== undefined && y !== undefined && k !== undefined) {
                this.renderer.getCamera().animate({
                    x: x,
                    y: y,
                    ratio: 1 / k
                }, { duration: 500 });
            }
        }
    }

    centerGraph() {
        if (this.isUsingOgma) {
            if (!this.ogma) return;
            this.ogma.view.animate({ center: { x: 0.5, y: 0.5 }, zoom: 1 }, { duration: 500 });
        } else {
            if (!this.renderer) return;
            this.renderer.getCamera().animate({ x: 0.5, y: 0.5, ratio: 1 }, { duration: 500 });
        }
    }

    updateSettings(newSettings: Partial<GraphSettings>) {
        this.settings = { ...this.settings, ...newSettings };
        
        if (this.isUsingOgma) {
            this.applyOgmaStyles();
        } else {
            if (!this.renderer) return;
            if (newSettings.linearZoom !== undefined) {
                this.renderer.setSetting("nodeSizeReference", this.settings.linearZoom ? "positions" : "pixels");
                this.renderer.setSetting("edgeSizeReference", this.settings.linearZoom ? "positions" : "pixels");
                this.renderer.setSetting("zoomToSizeRatioFunction", this.settings.linearZoom ? (x: number) => x : () => 1);
                this.renderer.setSetting("autoRescale", !this.settings.linearZoom);
            }
            this.refreshReducers();
        }
    }

    destroy() {
        if (this.isUsingOgma) {
            this.ogma = null;
        } else {
            if (this.renderer) {
                this.renderer.kill();
            }
        }
    }

    private applyOgmaStyles() {
        if (!this.ogma) return;
        const selectedId = this.selectedNode?.id || null;
        const rules: any[] = [];
        rules.push({ selector: 'edge', style: { color: COLOR_LINK, width: this.settings.showLinks ? 0.1 : 0 } });
        rules.push({ selector: 'node[type="antrag"], node[type="amendment"]', style: { color: COLOR_AMENDMENT } });
        rules.push({ selector: 'node[type="supporter"], node[type="person"], node[type="prs"]', style: { color: COLOR_SUPPORTER } });
        if (selectedId) {
            rules.push({ selector: `edge[source="${selectedId}"], edge[target="${selectedId}"]`, style: { color: 'rgba(153,153,153,0.6)', width: 1 } });
        }
        this.ogma.styles.clear();
        this.ogma.styles.addRules(rules);
    }
}
