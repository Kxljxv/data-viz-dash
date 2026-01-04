import Graph from 'graphology';
import * as gexf from 'graphology-gexf';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeArrowProgram, EdgeRectangleProgram } from 'sigma/rendering';
import type { GraphNode, GraphLink, GraphSettings, GraphGroup } from '$lib/types/graph';
import * as d3 from 'd3'; // Used for types and compatibility

// Old color palette constants
const COLOR_AMENDMENT = '#d86b74';
const COLOR_SUPPORTER = '#7dff00';
const COLOR_LINK = 'rgba(153, 153, 153, 0.3)';
const COLOR_LABEL = 'hsl(50, 9%, 73.7%)';
const FONT_LABEL = 'ModernDense, sans-serif';

export default class GraphVisualization {

    projectName: string | null;
    containerId: string;
    graph: Graph;
    renderer: Sigma | null = null;
    
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
            zIndex: true,
            // Linear zoom settings from snippet
            itemSizesReference: this.settings.linearZoom ? "positions" : "pixels",
            zoomToSizeRatioFunction: this.settings.linearZoom ? (x: number) => x : Math.sqrt,
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
                person: NodeCircleProgram
            },
            edgeProgramClasses: {
                line: EdgeRectangleProgram,
                arrow: EdgeArrowProgram,
                applicant: EdgeRectangleProgram,
                supporter: EdgeRectangleProgram
            }
        });

        this.setupEvents();
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
            // Note: We use the specific path provided by the user, but made it dynamic for the project
            const project = this.projectName || 'bdk';
            const response = await fetch(`/data/${project}/algorithms/forceatlas/graph.gexf`);
            if (!response.ok) throw new Error(`Failed to load GEXF file for project ${project}`);
            
            const gexfString = await response.text();
            
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
                } else if (attr.type === 'supporter' || attr.type === 'person') {
                    this.graph.setNodeAttribute(node, 'color', COLOR_SUPPORTER);
                } else if (!attr.color) {
                    this.graph.setNodeAttribute(node, 'color', '#999');
                }
                
                // Ensure label exists
                if (!attr.label) this.graph.setNodeAttribute(node, 'label', attr.name || node);
            });

        } catch (error) {
            console.error('Error loading graph data:', error);
        }
    }

    setupEvents() {
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
        this.refreshReducers();
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
                    // Dim non-connected edges
                    res.color = "#111"; // Very dark
                    res.zIndex = 0;
                    res.alpha = 0.1;
                } else {
                    res.color = "rgba(153, 153, 153, 0.8)"; // More opaque active links
                    res.zIndex = 100; // Top layer (above nodes/i's)
                }
            } else {
                res.color = COLOR_LINK; // Default link color
                res.zIndex = 0;
            }

            return res;
        });

        this.renderer.refresh();
    }

    highlightNode(nodeId: string) {
        this.highlightedNodeId = nodeId;
        this.refreshReducers();
    }

    resetHighlight() {
        this.highlightedNodeId = null;
        this.refreshReducers();
    }

    centerOnNode(nodeId: string) {
        if (!this.renderer || !this.graph.hasNode(nodeId)) return;
        const attr = this.graph.getNodeAttributes(nodeId);
        this.renderer.getCamera().animate({
            x: attr.x,
            y: attr.y,
            ratio: 0.2
        }, { duration: 500 });
    }

    // API for UI to control the graph
    
    setTransform(transform: any) {
        if (!this.renderer) return;
        
        // Transform d3-like transform {x, y, k} to Sigma camera
        const { x, y, k } = transform;
        if (x !== undefined && y !== undefined && k !== undefined) {
            this.renderer.getCamera().animate({
                x: x,
                y: y,
                ratio: 1 / k
            }, { duration: 500 });
        }
    }

    centerGraph() {
        if (!this.renderer) return;
        this.renderer.getCamera().animate({ x: 0.5, y: 0.5, ratio: 1 }, { duration: 500 });
    }

    updateSettings(newSettings: Partial<GraphSettings>) {
        this.settings = { ...this.settings, ...newSettings };
        
        if (!this.renderer) return;

        // Apply linear zoom settings if changed
        if (newSettings.linearZoom !== undefined) {
            this.renderer.setSetting("itemSizesReference", this.settings.linearZoom ? "positions" : "pixels");
            this.renderer.setSetting("zoomToSizeRatioFunction", this.settings.linearZoom ? (x: number) => x : Math.sqrt);
            this.renderer.setSetting("autoRescale", !this.settings.linearZoom);
        }

        this.refreshReducers();
    }

    destroy() {
        if (this.renderer) {
            this.renderer.kill();
        }
    }
}
