import Graph from 'graphology';
import * as gexf from 'graphology-gexf';
import type Sigma from 'sigma';
import type { GraphNode, GraphLink, GraphSettings, GraphGroup } from '$lib/types/graph';
import { color as d3Color, hsl as d3Hsl } from 'd3';

// Dynamic imports for Sigma to avoid SSR issues
let SigmaClass: any;
let NodeCircleProgram: any;
let EdgeArrowProgram: any;
let EdgeRectangleProgram: any;

const loadSigma = async () => {
    if (typeof window === 'undefined') return;
    if (SigmaClass) return;
    
    const sigmaMod = await import('sigma');
    SigmaClass = sigmaMod.default;
    
    const renderingMod = await import('sigma/rendering');
    NodeCircleProgram = renderingMod.NodeCircleProgram;
    EdgeArrowProgram = renderingMod.EdgeArrowProgram;
    EdgeRectangleProgram = renderingMod.EdgeRectangleProgram;
};

// Helper to get CSS variables
const getCSSVar = (name: string) => {
    if (typeof window === 'undefined') return '';
    // Try documentElement first, then body as fallback
    let val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!val) {
        val = getComputedStyle(document.body).getPropertyValue(name).trim();
    }
    return val;
};

const getThemeColor = (name: string, alpha?: number): string => {
    const isDark = typeof window !== 'undefined' ? document.documentElement.getAttribute('data-mode') === 'dark' : true;
    let hslValue = getCSSVar(name);
    
    // Default fallbacks if CSS variables aren't resolved
    if (!hslValue) {
        if (name === '--danger-100') return '#dc2626';
        if (name === '--success-100') return '#16a34a';
        if (name === '--pictogram-200') return isDark ? '#444444' : '#cccccc';
        if (name === '--graph-label') return isDark ? '#f5f5f5' : '#141414';
        return isDark ? '#333333' : '#cccccc';
    }
    
    try {
        let colorString: string;
        
        if (hslValue.includes('hsl') || hslValue.includes('rgb') || hslValue.startsWith('#')) {
            colorString = hslValue;
        } else {
            // Standardize the HSL string for D3
            const parts = hslValue.split(/[\s,+/]+/).filter(p => p.length > 0);
            if (parts.length >= 3) {
                const h = parts[0];
                const s = parts[1].includes('%') ? parts[1] : `${parts[1]}%`;
                const l = parts[2].includes('%') ? parts[2] : `${parts[2]}%`;
                const a = alpha ?? (parts[3] || 1);
                
                colorString = `hsla(${h}, ${s}, ${l}, ${a})`;
            } else {
                colorString = `hsl(${hslValue})`;
            }
        }
        
        const normalized = d3Color(colorString);
        if (normalized) {
            return normalized.formatHex();
        }
        return isDark ? '#333333' : '#cccccc';
    } catch (e) {
        return isDark ? '#333333' : '#cccccc';
    }
};

// Old color palette constants - now dynamic
const getCOLOR_AMENDMENT = () => getThemeColor('--danger-100');
const getCOLOR_SUPPORTER = () => getThemeColor('--success-100');
const getCOLOR_LINK = () => getThemeColor('--pictogram-200');
const getCOLOR_LABEL = () => getThemeColor('--graph-label');
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
    graphDimming: number = 0;
    private groupLookup: Map<string, string> = new Map();
    private dimmedColorCache: Map<string, string> = new Map();
    
    // Settings
    settings: GraphSettings = {
        showLabels: false,
        showLinks: true,
        showAntraege: true,
        showSupporters: true,
        nodeSize: 1,
        linearZoom: false,
        disableHover: false
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
        return this.graph.mapEdges((id, attr, source, target) => {
            const sourceAttr = this.graph.getNodeAttributes(source);
            const targetAttr = this.graph.getNodeAttributes(target);
            return {
                id,
                source: { id: source, ...sourceAttr },
                target: { id: target, ...targetAttr },
                ...attr
            };
        });
    }

    constructor(projectName: string | null = null, containerId: string = 'graph-container', initialSettings: Partial<GraphSettings> = {}) {
        this.projectName = projectName;
        this.containerId = containerId;
        
        // Merge initial settings if provided
        if (initialSettings) {
            this.settings = { ...this.settings, ...initialSettings };
        }
        
        // Handle different import behaviors for Graphology
        const GraphConstructor = (Graph as any).default || Graph;
        this.graph = new GraphConstructor();
        
        // Wait for DOM to be ready if needed, or just init
        setTimeout(() => this.init(), 0);
    }

    async init() {
        if (typeof window === 'undefined') return;
        
        // Ensure Sigma is loaded
        await loadSigma();
        
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

        console.log(`Initializing Sigma on container ${this.containerId} with ${this.graph.order} nodes`);

        // Initialize Sigma
        this.renderer = new SigmaClass(this.graph, container, {
            minCameraRatio: 0.1,
            maxCameraRatio: 10,
            allowInvalidContainer: true,
            renderLabels: true,
            labelFont: FONT_LABEL,
            labelSize: 11,
            labelWeight: 'bold',
            labelColor: { color: getCOLOR_LABEL() },
            defaultEdgeColor: getCOLOR_LINK(),
            defaultNodeType: "circle",
            defaultNodeColor: "#999",
            defaultEdgeType: "line",
            edgeProgramClasses: {
                line: EdgeRectangleProgram,
            },
            edgeColor: "default", // Use default color unless overridden by reducer
            enableEdgeEvents: false, 
            zIndex: true,
            // Linear zoom settings
            nodeSizeReference: this.settings.linearZoom ? "positions" : "pixels",
            edgeSizeReference: this.settings.linearZoom ? "positions" : "pixels",
            zoomToSizeRatioFunction: this.settings.linearZoom ? () => 1 : (x: number) => x,
            autoRescale: !this.settings.linearZoom,
            // Disable label background and ensure label is shown on hover
            hoverRenderer: (context, data, settings) => {
                const { label, size } = data;
                if (!label) return;

                const font = settings.labelFont;
                const weight = settings.labelWeight;
                const colorLabel = settings.labelColor.color || getCOLOR_LABEL();

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
        this.setupThemeListener();
        
        // Apply initial settings via reducers
        this.refreshReducers();
        
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

        // Auto-center the graph at the start
        this.centerGraph();
    }

    render() {
        this.refreshReducers();
    }

    async loadData() {
        try {
            // Load the GEXF file
            const project = this.projectName || 'bdk';
            
            // Potential paths to try - prioritize the flat structure in static/data
            const pathsToTry = [
                `/data/${project}/${project}.gexf.gz`,
                `/data/${project}/${project}.gexf`,
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
            
            console.log(`%c GRAPH LOADED: ${this.graph.order} nodes, ${this.graph.size} edges `, 'background: #222; color: #bada55');
            
            if (this.graph.order > 0) {
                const firstNode = this.graph.nodes()[0];
                console.log("First node sample:", this.graph.getNodeAttributes(firstNode));
            }

            // Post-process: Apply colors and sizes based on defined rules
            this.graph.forEachNode((node, attr) => {
                // Ensure x and y are present
                if (attr.x === undefined) this.graph.setNodeAttribute(node, 'x', 0);
                if (attr.y === undefined) this.graph.setNodeAttribute(node, 'y', 0);

                // Calculate connections (degree)
                const connections = this.graph.degree(node);
                this.graph.setNodeAttribute(node, 'connections', connections);

                // Determine type more robustly
                const rawType = (attr.type || attr.attr_type || "").toLowerCase();
                const isAmendment = rawType === 'amendment' || rawType === 'antrag' || !node.startsWith('prs-');
                const isPerson = rawType === 'person' || rawType === 'prs' || rawType === 'supporter' || node.startsWith('prs-');

                // Set default colors based on type
                if (isAmendment && !isPerson) {
                    this.graph.setNodeAttribute(node, 'type', 'amendment');
                    this.graph.setNodeAttribute(node, 'color', getCOLOR_AMENDMENT());
                    // size = amount of supporters (degree in bipartite graph)
                    this.graph.setNodeAttribute(node, 'size', Math.sqrt(connections)/2 > 2 ? Math.sqrt(connections)/2 : 2);
                } else if (isPerson) {
                    this.graph.setNodeAttribute(node, 'type', 'person');
                    this.graph.setNodeAttribute(node, 'color', getCOLOR_SUPPORTER());
                    
                    // size = 5 * amendments_initiated + amendments_supported
                    const initiated = attr.initiated || 0;
                    const supported = attr.supported || (connections - initiated);
                    if ((Math.sqrt(5 * initiated + supported)/2) > 1) {
                        const size = Math.sqrt(5 * initiated + supported)/2;
                        this.graph.setNodeAttribute(node, 'size', size);
                    } else {
                        this.graph.setNodeAttribute(node, 'size', 1);
                    }
                } else {
                    const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
                    this.graph.setNodeAttribute(node, 'color', isDark ? '#333333' : '#cccccc');
                    this.graph.setNodeAttribute(node, 'size', 5);
                }
            });

        // Post-process edges: apply colors and types for density visualization
        this.graph.forEachEdge((edge) => {
            this.graph.setEdgeAttribute(edge, 'color', getCOLOR_LINK());
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
            if (this.settings.disableHover) return;
            this.hoveredNode = event.node;
            this.refreshReducers();
        });

        this.renderer.on('leaveNode', () => {
            if (this.settings.disableHover) return;
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
                k: 1 / state.ratio,
                angle: state.angle || 0
            };
            
            window.dispatchEvent(new CustomEvent('aea-graph-zoom', {
                detail: { 
                    transform: this.transform,
                    sourceId: this.containerId
                }
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
            if (this.settings.disableHover) return;
            this.hoveredNode = event.target.getId();
            this.applyOgmaStyles();
        });
        this.ogma.events.on('leave:node', () => {
            if (this.settings.disableHover) return;
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
                k: state.zoom,
                angle: state.angle || 0
            };
            window.dispatchEvent(new CustomEvent('aea-graph-zoom', {
                detail: { 
                    transform: this.transform,
                    sourceId: this.containerId
                }
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

    private setupThemeListener() {
        window.addEventListener('aea-theme-change', () => {
            this.dimmedColorCache.clear();
            this.updateNodeStyles();
            if (this.renderer) {
                this.renderer.setSetting("labelColor", { color: getCOLOR_LABEL() });
                this.renderer.refresh();
            }
        });
    }

    updateNodeStyles() {
        if (this.isUsingOgma) this.applyOgmaStyles();
        else this.refreshReducers();
    }

    private dimColor(color: string): string {
        const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
        const cacheKey = `${color}-${isDark ? 'dark' : 'light'}`;
        
        if (this.dimmedColorCache.has(cacheKey)) {
            return this.dimmedColorCache.get(cacheKey)!;
        }

        try {
            const c = d3Hsl(color);
            if (isDark) {
                c.s *= 0.3; // Desaturate
                c.l *= 0.2; // Darken
            } else {
                c.s *= 0.2; // More desaturate
                c.l = 0.92; // Very light
            }
            const dimmed = c.formatHex();
            this.dimmedColorCache.set(cacheKey, dimmed);
            return dimmed;
        } catch (e) {
            return isDark ? "#222222" : "#eeeeee";
        }
    }

    refreshReducers() {
        if (this.isUsingOgma) return;
        if (!this.renderer) return;

        // 1. Pre-calculate group lookup for O(1) access
        this.groupLookup.clear();
        for (const group of this.groups) {
            for (const nodeId of group.nodes) {
                this.groupLookup.set(nodeId, group.color);
            }
        }

        // 2. Pre-calculate active node context for O(1) neighbor check
        const activeNodeId = this.selectedNode?.id || this.highlightedNodeId;
        const neighborSet = new Set<string>();
        if (activeNodeId) {
            this.graph.forEachNeighbor(activeNodeId, (neighbor) => {
                neighborSet.add(neighbor);
            });
        }

        const showAntraege = this.settings.showAntraege;
        const showSupporters = this.settings.showSupporters;
        const showLabels = this.settings.showLabels;
        const nodeSizeMultiplier = this.settings.nodeSize;
        const hoveredNode = this.hoveredNode;
        const selectedNodeId = this.selectedNode?.id;

        // Node Reducer
        this.renderer.setSetting("nodeReducer", (node, data) => {
            const res = { ...data };
            const attr = this.graph.getNodeAttributes(node);
            
            // 1. Visibility Filters (Fast check)
            const type = (attr.type || attr.attr_type || "").toLowerCase();
            const isAmendment = type === 'amendment' || type === 'antrag' || !node.startsWith('prs-');
            const isPerson = type === 'person' || type === 'prs' || type === 'supporter' || node.startsWith('prs-');

            if (!showAntraege && isAmendment && !isPerson) {
                res.hidden = true;
                return res;
            }
            if (!showSupporters && isPerson) {
                res.hidden = true;
                return res;
            }

            // 2. Base Color & Group Inheritance (O(1) lookup)
            const groupColor = this.groupLookup.get(node);
            if (groupColor) {
                res.color = groupColor;
            } else {
                // Default color based on type - OVERRIDING GEXF COLORS
                if (isPerson) {
                    res.color = getCOLOR_SUPPORTER();
                } else {
                    // Default to amendment color for everything else
                    res.color = getCOLOR_AMENDMENT();
                }
            }

            // 3. Selection & Highlighting logic (O(1) check)
            if (activeNodeId) {
                const isMain = node === activeNodeId;
                const isNeighbor = neighborSet.has(node);

                if (isMain) {
                    res.highlighted = true;
                    res.zIndex = 90;
                } else if (isNeighbor) {
                    res.zIndex = 60;
                } else {
                    // Background layer (dimmed)
                    const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
                    res.color = this.dimColor(res.color || (isDark ? '#333' : '#ccc')); 
                    res.label = "";
                    res.zIndex = 0;
                    res.alpha = 0.3 * (1 - this.graphDimming);
                }
            } else if (this.graphDimming > 0) {
                // Global dimming
                res.alpha = 1 - this.graphDimming;
                if (this.graphDimming > 0.5) res.label = "";
            }

            // 4. Hover logic (ensure label is shown)
            if (hoveredNode === node) {
                res.label = attr.label || attr.name || node;
                res.zIndex = 100; // Bring to front
                res.alpha = 1.0;
            }

            // 5. Node size multiplier
            res.size = (attr.size || 5) * nodeSizeMultiplier;

            // 6. Labels (global toggle)
            if (!showLabels && hoveredNode !== node && selectedNodeId !== node && !res.highlighted) {
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
            if (activeNodeId) {
                if (!this.graph.hasExtremity(edge, activeNodeId)) {
                    // Dim non-connected edges
                    res.color = getThemeColor('--graph-edge-dimmed');
                    res.zIndex = 0;
                    res.alpha = 0.1 * (1 - this.graphDimming);
                } else {
                    res.color = getThemeColor('--graph-edge-highlighted');
                    res.zIndex = 50;
                    res.alpha = 1.0;
                }
            } else {
                res.color = getCOLOR_LINK();
                res.zIndex = 0;
                res.alpha = 1 - this.graphDimming;
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
    
    getRenderer() {
        return this.renderer;
    }

    viewportToGraph(x: number, y: number) {
        if (!this.renderer) return { x: 0, y: 0 };
        return this.renderer.viewportToGraph({ x, y });
    }

    graphToViewport(x: number, y: number) {
        if (!this.renderer) return { x: 0, y: 0 };
        return this.renderer.graphToViewport({ x, y });
    }

    setTransform(transform: any, animate: boolean = false) {
        if (this.isUsingOgma) {
            if (!this.ogma) return;
            const { x, y, k, angle } = transform;
            if (x !== undefined && y !== undefined && k !== undefined) {
                if (animate) {
                    this.ogma.view.animate({ 
                        center: { x, y }, 
                        zoom: k,
                        angle: angle || 0
                    }, { duration: 500 });
                } else {
                    this.ogma.view.setCenter({ x, y });
                    this.ogma.view.setZoom(k);
                    this.ogma.view.setAngle(angle || 0);
                }
            }
        } else {
            if (!this.renderer) return;
            const { x, y, k, angle } = transform;
            if (x !== undefined && y !== undefined && k !== undefined) {
                const state = {
                    x: x,
                    y: y,
                    ratio: 1 / k,
                    angle: angle || 0
                };
                if (animate) {
                    this.renderer.getCamera().animate(state, { duration: 500 });
                } else {
                    this.renderer.getCamera().setState(state);
                }
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
        
        if (this.settings.disableHover) {
            this.hoveredNode = null;
        }

        if (this.isUsingOgma) {
            this.applyOgmaStyles();
        } else {
            if (!this.renderer) return;
            if (newSettings.linearZoom !== undefined) {
                this.renderer.setSetting("nodeSizeReference", this.settings.linearZoom ? "positions" : "pixels");
                this.renderer.setSetting("edgeSizeReference", this.settings.linearZoom ? "positions" : "pixels");
                this.renderer.setSetting("zoomToSizeRatioFunction", this.settings.linearZoom ? () => 1 : (x: number) => x);
                this.renderer.setSetting("autoRescale", !this.settings.linearZoom);
            }
            this.refreshReducers();
        }
    }

    getBounds() {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.graph.forEachNode((_, attr) => {
            if (attr.x < minX) minX = attr.x;
            if (attr.x > maxX) maxX = attr.x;
            if (attr.y < minY) minY = attr.y;
            if (attr.y > maxY) maxY = attr.y;
        });
        if (minX === Infinity) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
        return { minX, maxX, minY, maxY };
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
        rules.push({ selector: 'edge', style: { color: getCOLOR_LINK(), width: this.settings.showLinks ? 0.1 : 0 } });
        rules.push({ selector: 'node[type="antrag"], node[type="amendment"]', style: { color: getCOLOR_AMENDMENT() } });
        rules.push({ selector: 'node[type="supporter"], node[type="person"], node[type="prs"]', style: { color: getCOLOR_SUPPORTER() } });
        if (selectedId) {
            rules.push({ selector: `edge[source="${selectedId}"], edge[target="${selectedId}"]`, style: { color: getThemeColor('--graph-edge-highlighted'), width: 1 } });
        }
        this.ogma.styles.clear();
        this.ogma.styles.addRules(rules);
    }
}
