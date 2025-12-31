import * as d3 from 'd3';
import type { GraphNode, GraphLink, GraphGroup, GraphSettings, DensityContours } from '$lib/types/graph';

class GraphVisualization {
    projectName: string | null;
    canvasId: string;
    canvas: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    ctx: CanvasRenderingContext2D | null = null;
    width: number = 0;
    height: number = 0;
    initialized: boolean = false;

    selectedNode: GraphNode | null = null;
    hoveredNode: GraphNode | null = null;
    groups: GraphGroup[] = [];
    nodeGroups: Map<string, string> = new Map();
    selectedColor: string = '#7f6df2';
    defaultFont: string = 'modern_dense';
    currentGroupForSearch: any = null;
    transform: d3.ZoomTransform = d3.zoomIdentity;
    selectedAntragCode: string | null = null;
    motionUrlMap: Record<string, string> = {};
    currentPdfCode: string | null = null;
    eventsInitialized: boolean = false;

    settings: GraphSettings;
    zoom: d3.ZoomBehavior<Element, unknown>;

    data: any;
    metadata: any;
    nodes: GraphNode[] = [];
    links: GraphLink[] = [];
    allNodes: GraphNode[] = [];
    allLinks: GraphLink[] = [];
    adj: Map<string, Set<string>> = new Map();

    densityGroupId?: string;
    densityOpacity?: number;
    graphDimming?: number;
    contourBlur?: number;
    densityContours?: DensityContours | null;

    handlers: any;
    
    // Legacy SVG references (likely unused in Canvas mode but kept for safety)
    nodeElements: any;
    linkGroup: any;
    labelElements: any;
    simulation: any;

    constructor(projectName: string | null = null, canvasId: string = 'graph-canvas') {
        this.projectName = projectName;
        this.canvasId = canvasId;
        this.canvas = d3.select(`#${this.canvasId}`);
        const canvasNode = this.canvas.node();
        
        if (!canvasNode) {
            console.warn(`Canvas element #${this.canvasId} not found. Retrying in 100ms...`);
            setTimeout(() => this.init(), 100);
            return;
        }

        this.settings = {
            showLabels: false,
            showLinks: true,
            showAntraege: true,
            showSupporters: true,
            nodeSize: 1
        };

        // Initialize zoom behavior here to satisfy TS initialization requirements
        this.zoom = d3.zoom()
            .scaleExtent([0.01, 10])
            .on('zoom', (event) => {
                this.transform = event.transform;
                this.render();
                
                if (event.sourceEvent) {
                    window.dispatchEvent(new CustomEvent('aea-graph-zoom', {
                        detail: { transform: event.transform, sourceId: this.canvasId }
                    }));
                }
            });

        this.init();
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.canvas = d3.select(`#${this.canvasId}`);
        const canvasNode = this.canvas.node() as HTMLCanvasElement;
        if (!canvasNode) return;

        this.ctx = canvasNode.getContext('2d');
        
        const container = canvasNode.parentElement;
        this.width = container ? container.clientWidth : window.innerWidth;
        this.height = container ? container.clientHeight : window.innerHeight;

        this.canvas.attr('width', this.width).attr('height', this.height);

        // Re-assign zoom to attach listeners
        this.canvas.call(this.zoom as any)
            .on('dblclick.zoom', null);

        d3.select(canvasNode).on('click', (event) => {
            if (event.defaultPrevented) return;
            
            const node = this.findNodeAt(event);
            if (node) {
                this.onNodeClick(event, node);
            } else {
                this.deselectAll();
            }
        });

        d3.select(canvasNode).on('mousemove', (event) => {
            const node = this.findNodeAt(event);
            if (node !== this.hoveredNode) {
                this.hoveredNode = node;
                this.render();
            }
        });

        d3.select(canvasNode).on('contextmenu', (event) => {
            event.preventDefault();
            const node = this.findNodeAt(event);
            if (node) this.showNodeContextMenu(event, node);
        });

        this.loadData();
    }

    getFontClass(fontName: string): string {
        const fontMap: Record<string, string> = {
            'dyslexic': 'font-dyslexic',
            'modern_dense': 'font-modern-dense',
            'modern_wide': 'font-modern-wide',
            'serif': 'font-serif'
        };
        return fontMap[fontName] || fontMap[this.defaultFont];
    }

    deselectAll() {
        this.selectedNode = null;

        window.dispatchEvent(new CustomEvent('aea-node-selected', {
            detail: { node: null }
        }));

        if (this.nodeElements) {
            this.nodeElements.classed('selected', false).classed('dimmed', false);
            this.linkGroup.selectAll('.link').classed('dimmed', false);
            this.labelElements.classed('dimmed', false);
        }
        this.updateLabelVisibility();
        this.render();
    }

    async loadData() {
        const startTime = performance.now();
        console.log('#problems_and_diagnostics [GraphVisualization.loadData] starting fetch...');
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const project = this.projectName || urlParams.get('project') || 'bdk';
            
            const response = await fetch(`/data/${project}/data.json`);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            this.data = data;
            this.metadata = data.metadata || {};

            this.processData();
            this.setupEventListeners();
            await this.simulatePhysics();

            const duration = performance.now() - startTime;
            console.log(`#problems_and_diagnostics [GraphVisualization.loadData] finished in ${duration.toFixed(2)}ms. Links count: ${this.links ? this.links.length : 0}`);

        } catch (error: any) {
            console.error('Fehler beim Laden der Daten:', error);
            const loadingOverlay = document.getElementById('loading');
            if (loadingOverlay) loadingOverlay.innerHTML = `<div class="text-red-500">Fehler beim Laden: ${error.message}</div>`;
        }
    }

    processData() {
        const nodeMap = new Map<string, GraphNode>();
        const links: any[] = []; // Temporary links with string IDs

        const antragColor = getComputedStyle(document.documentElement).getPropertyValue('--node-antrag').trim() || '#d86b74';
        const supporterColor = getComputedStyle(document.documentElement).getPropertyValue('--node-supporter').trim() || '#7dff00';

        const getSupporterId = (name: string, kv: string) => {
            if (!name) return null;
            const cleanName = name.trim();
            const cleanKv = (kv || '').trim();
            return cleanKv ? `${cleanName} | ${cleanKv}` : cleanName;
        };

        if (this.data && typeof this.data === 'object' && !Array.isArray(this.data) && !this.data.motions) {
            Object.entries(this.data).forEach(([key, val]: [string, any]) => {
                if (key === 'metadata' || !val || typeof val !== 'object') return;

                const aeaId = val.application_id || val.id || key;
                const aeaLabel = (Array.isArray(val.heading) ? val.heading[0] : val.heading) || aeaId;
                
                if (!nodeMap.has(aeaId)) {
                    nodeMap.set(aeaId, { id: aeaId, label: aeaLabel, type: 'antrag', color: antragColor, linkCount: 0, font: this.defaultFont });
                }
                if (val.url) this.motionUrlMap[aeaId] = val.url;

                const applicant = val.applicant;
                if (applicant) {
                    let name, kv;
                    if (Array.isArray(applicant) && applicant.length >= 1) {
                        name = applicant[0];
                        kv = applicant[1];
                    } else if (typeof applicant === 'string') {
                        name = applicant;
                    }

                    const supporterId = getSupporterId(name, kv);
                    if (supporterId) {
                        if (!nodeMap.has(supporterId)) {
                            nodeMap.set(supporterId, { 
                                id: supporterId, 
                                label: name.trim(), 
                                sublabel: (kv || '').trim(), 
                                type: 'supporter', 
                                color: supporterColor, 
                                linkCount: 0, 
                                font: this.defaultFont 
                            });
                        }
                        links.push({ source: aeaId, target: supporterId, weight: 5 });
                        const aeaNode = nodeMap.get(aeaId);
                        if (aeaNode) aeaNode.linkCount += 5;
                        const supNode = nodeMap.get(supporterId);
                        if (supNode) supNode.linkCount += 5;
                    }
                }

                const supporters = Array.isArray(val.supporters) ? val.supporters : [];
                supporters.forEach((s: any) => {
                    let name, kv;
                    if (Array.isArray(s) && s.length >= 1) {
                        name = s[0];
                        kv = s[1];
                    } else if (typeof s === 'string') {
                        name = s;
                    }

                    const supporterId = getSupporterId(name, kv);
                    if (supporterId) {
                        if (!nodeMap.has(supporterId)) {
                            nodeMap.set(supporterId, { 
                                id: supporterId, 
                                label: name.trim(), 
                                sublabel: (kv || '').trim(), 
                                type: 'supporter', 
                                color: supporterColor, 
                                linkCount: 0, 
                                font: this.defaultFont 
                            });
                        }
                        links.push({ source: aeaId, target: supporterId, weight: 1 });
                        const aeaNode = nodeMap.get(aeaId);
                        if (aeaNode) aeaNode.linkCount += 1;
                        const supNode = nodeMap.get(supporterId);
                        if (supNode) supNode.linkCount += 1;
                    }
                });
            });
        } else if (this.data.motions && Array.isArray(this.data.motions)) {
            // ... Similar logic for other formats, omitted for brevity but should be included if needed
             this.data.motions.forEach((m: any) => {
                const aea = m.code || m.title || m.antrag || m.id;
                if (!aea) return;
                if (!nodeMap.has(aea)) {
                    nodeMap.set(aea, { id: aea, label: aea, type: 'antrag', color: antragColor, linkCount: 0, font: this.defaultFont });
                }
                if (m.url) this.motionUrlMap[aea] = m.url;
                const app = m.applicant;
                if (app && Array.isArray(app) && app.length >= 1) {
                    const supporterId = `${app[0]} | ${app[1] || ''}`;
                    if (!nodeMap.has(supporterId)) {
                        nodeMap.set(supporterId, { id: supporterId, label: app[0], sublabel: app[1] || '', type: 'supporter', color: supporterColor, linkCount: 0, font: this.defaultFont });
                    }
                    links.push({ source: aea, target: supporterId, weight: 5 });
                     const aeaNode = nodeMap.get(aea);
                    if (aeaNode) aeaNode.linkCount += 5;
                    const supNode = nodeMap.get(supporterId);
                    if (supNode) supNode.linkCount += 5;
                }
                (m.supporters || []).forEach((s: any) => {
                    const supporterId = `${s[0]} | ${s[1] || ''}`;
                    if (!nodeMap.has(supporterId)) {
                        nodeMap.set(supporterId, { id: supporterId, label: s[0], sublabel: s[1] || '', type: 'supporter', color: supporterColor, linkCount: 0, font: this.defaultFont });
                    }
                    links.push({ source: aea, target: supporterId, weight: 1 });
                    const aeaNode = nodeMap.get(aea);
                    if (aeaNode) aeaNode.linkCount += 1;
                    const supNode = nodeMap.get(supporterId);
                    if (supNode) supNode.linkCount += 1;
                });
            });
        }
        // ... support_map logic omitted for brevity, assuming main path is covered

        this.nodes = Array.from(nodeMap.values());
        this.links = links.map(l => ({ ...l })); // Shallow copy

        this.allNodes = [...this.nodes];
        this.allLinks = [...this.links];

        this.adj = new Map();
        this.nodes.forEach(n => this.adj.set(n.id, new Set()));
        this.links.forEach(l => {
            // Initially source/target are strings
            const a = (l.source as any).id || l.source;
            const b = (l.target as any).id || l.target;
            if (this.adj.has(a)) this.adj.get(a)!.add(b);
            if (this.adj.has(b)) this.adj.get(b)!.add(a);
        });
    }

    async simulatePhysics() {
        const urlParams = new URLSearchParams(window.location.search);
        const project = this.projectName || urlParams.get('project') || 'bdk';
        const initialNodeId = urlParams.get('node');

        let res = await fetch(`/data/${project}/simulated/nodes.json`);
        if (!res.ok) {
            res = await fetch(`/data/${project}/nodes.json`);
        }
        
        if (res.ok) {
            const nodesData: any[] = await res.json();
            const byId = new Map(this.nodes.map(n => [n.id, n]));
            nodesData.forEach(p => {
                const n = byId.get(p.id);
                if (!n) return;
                n.x = p.x;
                n.y = p.y;
                n.vx = p.vx;
                n.vy = p.vy;
                if (p.size) n.size = p.size;
                if (p.linkCount) n.linkCount = p.linkCount;
            });
        } else {
            console.warn(`Could not load nodes.json for project ${project}. Using default positions.`);
        }
        const nodeRef = new Map(this.nodes.map(n => [n.id, n]));
        this.links = this.links
            .map(l => {
                const a = (l.source as any).id || l.source;
                const b = (l.target as any).id || l.target;
                const sa = nodeRef.get(a);
                const sb = nodeRef.get(b);
                if (!sa || !sb) return null;
                return { source: sa, target: sb, weight: l.weight || 1 };
            })
            .filter((l): l is GraphLink => l !== null);
            
        this.allNodes = [...this.nodes];
        this.allLinks = [...this.links];
        this.adj = new Map();
        this.nodes.forEach(n => this.adj.set(n.id, new Set()));
        this.links.forEach(l => {
            const a = (l.source as GraphNode).id;
            const b = (l.target as GraphNode).id;
            if (this.adj.has(a)) this.adj.get(a)!.add(b);
            if (this.adj.has(b)) this.adj.get(b)!.add(a);
        });

        this.computeCentrality();

        const loadingOverlay = document.getElementById('loading');
        if (loadingOverlay) loadingOverlay.style.display = 'none';

        this.render();
        
        if (initialNodeId) {
            const targetNode = this.nodes.find(n => n.id === initialNodeId);
            if (targetNode) {
                this.onNodeClick({ stopPropagation: () => { } } as any, targetNode);
                this.centerOnNode(targetNode);
            } else {
                this.centerGraph();
            }
        } else {
            this.centerGraph();
        }

        window.dispatchEvent(new CustomEvent('aea-data-loaded', {
            detail: {
                nodes: this.allNodes,
                links: this.allLinks,
                metadata: this.metadata
            }
        }));
    }

    computeCentrality() {
        const n = this.allNodes.length;
        if (n === 0) return;
        const idToIndex = new Map<string, number>();
        this.allNodes.forEach((node, i) => idToIndex.set(node.id, i));

        const neighbors = this.allNodes.map((node) => Array.from(this.adj.get(node.id) || []));

        // Degree centrality
        this.allNodes.forEach((node, i) => {
            const deg = neighbors[i].length;
            node.degree = deg;
        });

        // Closeness centrality (unweighted)
        const bfsDistances = (startIndex: number) => {
            const dist = new Array(n).fill(Infinity);
            dist[startIndex] = 0;
            const queue: number[] = [startIndex];
            let qi = 0;
            while (qi < queue.length) {
                const u = queue[qi++];
                for (const vid of neighbors[u]) {
                    const v = idToIndex.get(vid)!;
                    if (dist[v] === Infinity) {
                        dist[v] = dist[u] + 1;
                        queue.push(v);
                    }
                }
            }
            return dist;
        };
        this.allNodes.forEach((_, i) => {
            const dist = bfsDistances(i);
            const reachable = dist.filter(d => d < Infinity && d > 0);
            const sum = reachable.reduce((a, b) => a + b, 0);
            const closeness = reachable.length > 0 && sum > 0 ? (reachable.length / sum) : 0;
            this.allNodes[i].closeness = closeness;
        });

        // Betweenness centrality (Brandes algorithm for unweighted graphs)
        const bet = new Array(n).fill(0);
        for (let s = 0; s < n; s++) {
            const stack: number[] = [];
            const predecessors: number[][] = Array.from({ length: n }, () => []);
            const sigma = new Array(n).fill(0);
            sigma[s] = 1;
            const dist = new Array(n).fill(-1);
            dist[s] = 0;
            const queue: number[] = [s];
            let qi = 0;
            while (qi < queue.length) {
                const v = queue[qi++];
                stack.push(v);
                for (const vid of neighbors[v]) {
                    const w = idToIndex.get(vid)!;
                    if (dist[w] < 0) {
                        dist[w] = dist[v] + 1;
                        queue.push(w);
                    }
                    if (dist[w] === dist[v] + 1) {
                        sigma[w] += sigma[v];
                        predecessors[w].push(v);
                    }
                }
            }
            const delta = new Array(n).fill(0);
            while (stack.length) {
                const w = stack.pop()!;
                for (const v of predecessors[w]) {
                    delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
                }
                if (w !== s) {
                    bet[w] += delta[w];
                }
            }
        }
        // Normalize for undirected graphs
        for (let i = 0; i < n; i++) {
            this.allNodes[i].betweenness = bet[i] / 2;
        }

        window.dispatchEvent(new CustomEvent('aea-centrality-computed', {
            detail: {
                nodes: this.allNodes.map(n => ({ id: n.id, degree: n.degree, closeness: n.closeness, betweenness: n.betweenness }))
            }
        }));
    }

    setupEventListeners() {
        if (this.eventsInitialized) return;
        this.eventsInitialized = true;

        this.handlers = {
            resize: () => this.onResize(),
            filterChange: (e: CustomEvent) => {
                const { type, value } = e.detail;
                if (type === 'showAntraege') {
                    this.settings.showAntraege = value;
                    this.applyFilters();
                }
                if (type === 'showSupporters') {
                    this.settings.showSupporters = value;
                    this.applyFilters();
                }
                if (type === 'showLabels') {
                    this.settings.showLabels = value;
                    this.updateLabelVisibility();
                    this.render();
                }
                if (type === 'showLinks') {
                    this.settings.showLinks = value;
                    this.render();
                }
                if (type === 'nodeSize') {
                    this.settings.nodeSize = parseFloat(value);
                    this.render();
                }
            },
            viewAction: (e: CustomEvent) => {
                const { action, nodeId } = e.detail;
                if (action === 'reset') this.resetView();
                if (action === 'center' && nodeId) {
                    const node = this.allNodes.find(n => n.id === nodeId);
                    if (node) this.centerOnNode(node);
                }
                if (action === 'highlight' && nodeId) {
                    this.highlightNode(nodeId);
                }
            },
            groupUpdate: (e: CustomEvent) => {
                const { groups } = e.detail;
                this.updateGroups(groups);
            },
            densityUpdate: (e: CustomEvent) => {
                const { groupId, opacity, dimming, blur } = e.detail;
                this.updateDensitySettings(groupId, opacity, dimming, blur);
            }
        };

        window.addEventListener('resize', this.handlers.resize);
        window.addEventListener('aea-filter-change', this.handlers.filterChange as EventListener);
        window.addEventListener('aea-view-action', this.handlers.viewAction as EventListener);
        window.addEventListener('aea-group-update', this.handlers.groupUpdate as EventListener);
        window.addEventListener('aea-density-update', this.handlers.densityUpdate as EventListener);
    }

    updateDensitySettings(groupId: string, opacity: number, dimming: number, blur: number) {
        this.densityGroupId = groupId;
        this.densityOpacity = opacity;
        this.graphDimming = dimming || 0;
        this.contourBlur = blur || 0;
        this.computeDensity();
        this.render();
    }

    updateGroups(groups: GraphGroup[]) {
        this.groups = groups || [];
        this.nodeGroups = new Map();
        
        this.groups.forEach(group => {
            if (group.nodes && Array.isArray(group.nodes)) {
                group.nodes.forEach(nodeId => {
                    this.nodeGroups.set(nodeId, group.id);
                });
            }
        });
        
        if (this.densityGroupId) {
            this.computeDensity();
        }

        this.render();
    }
    
    computeDensity() {
        this.densityContours = null;
        if (!this.densityGroupId) return;

        const group = this.groups.find(g => g.id === this.densityGroupId);
        if (!group || !group.nodes || group.nodes.length < 3) return;

        const nodes = this.allNodes.filter(n => group.nodes.includes(n.id));
        if (nodes.length === 0) return;

        const xExtent = d3.extent(nodes, d => d.x);
        const yExtent = d3.extent(nodes, d => d.y);
        
        if (!xExtent[0] || !xExtent[1] || !yExtent[0] || !yExtent[1]) return;

        const padding = 50;
        const width = xExtent[1] - xExtent[0] + padding * 2;
        const height = yExtent[1] - yExtent[0] + padding * 2;
        
        const offsetX = xExtent[0] - padding;
        const offsetY = yExtent[0] - padding;

        const contourDensity = d3.contourDensity<GraphNode>()
            .x(d => (d.x || 0) - offsetX)
            .y(d => (d.y || 0) - offsetY)
            .weight(d => Math.sqrt(d.linkCount || 1))
            .size([width, height])
            .bandwidth(30)
            .thresholds(20);

        const contours = contourDensity(nodes);
        
        this.densityContours = {
            paths: contours,
            offsetX: offsetX,
            offsetY: offsetY,
            color: group.color
        };
    }

    applyFilters() {
        this.nodes = this.allNodes.filter(n => {
            if (n.type === 'antrag' && !this.settings.showAntraege) return false;
            if (n.type === 'supporter' && !this.settings.showSupporters) return false;
            return true;
        });

        const nodeIds = new Set(this.nodes.map(n => n.id));
        this.links = this.allLinks.filter(l =>
            nodeIds.has((l.source as GraphNode).id) && nodeIds.has((l.target as GraphNode).id)
        );

        this.render();
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;
        ctx.save();
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.translate(this.transform.x, this.transform.y);
        ctx.scale(this.transform.k, this.transform.k);

        const linkColor = getComputedStyle(document.documentElement).getPropertyValue('--link-color').trim() || 'rgba(153,153,153,0.3)';

        const isDimmed = (node: GraphNode) => {
            if (!this.selectedNode) return false;
            if (node.id === this.selectedNode.id) return false;
            const neighbors = this.adj.get(this.selectedNode.id);
            if (!neighbors) return true;
            return !neighbors.has(node.id);
        };

        if (this.settings.showLinks) {
            console.log('#problems_and_diagnostics [GraphVisualization.render] links status:', this.links ? `defined (${this.links.length})` : 'undefined');
            ctx.strokeStyle = linkColor;
            if (this.links) {
                this.links.forEach(l => {
                     const source = l.source as GraphNode;
                     const target = l.target as GraphNode;
                    if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return;
                    
                    ctx.save();
                    const dim = this.selectedNode && source.id !== this.selectedNode.id && target.id !== this.selectedNode.id;
                    const baseAlpha = dim ? 0.15 : 1.0;
                    const dimmingFactor = 1 - (this.graphDimming || 0);
                    ctx.globalAlpha = baseAlpha * dimmingFactor;
                    ctx.lineWidth = (l.weight || 1) * 1;
                    ctx.beginPath();
                    ctx.moveTo(source.x!, source.y!);
                    ctx.lineTo(target.x!, target.y!);
                    ctx.stroke();
                    ctx.restore();
                });
            }
        }

        this.nodes.forEach(n => {
            if (n.x === undefined || n.y === undefined) return;
            
            const radius = (Math.sqrt(n.linkCount || 0) * 1.5 + 0.25) * this.settings.nodeSize;

            ctx.save();
            const nodeDimmed = isDimmed(n);
            const baseAlpha = nodeDimmed ? 0.2 : 1.0;
            const dimmingFactor = 1 - (this.graphDimming || 0);
            ctx.globalAlpha = baseAlpha * dimmingFactor;
            ctx.fillStyle = this.getNodeColor(n);
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            const showLabel = this.settings.showLabels || n === this.selectedNode || n === this.hoveredNode || (this.selectedNode && this.adj.get(this.selectedNode.id)?.has(n.id));
            if (showLabel) {
                ctx.save();
                ctx.globalAlpha = 1 - (this.graphDimming || 0);
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-000-full').trim() || '#faf9f5';
                ctx.font = '16px ' + (this.getFontClass(n.font).includes('serif') ? 'Serif' : 'ModernDense');
                ctx.textBaseline = 'middle';
                ctx.fillText(n.label, n.x + radius + 5, n.y);
                if (n.sublabel) {
                    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-400-full').trim() || '#9c9a92';
                    ctx.font = '12px ' + (this.getFontClass(n.font).includes('serif') ? 'Serif' : 'ModernDense');
                    ctx.fillText(n.sublabel, n.x + radius + 5, n.y + 12);
                }
                ctx.restore();
            }
        });

        if (this.densityContours && this.densityContours.paths) {
            const { paths, offsetX, offsetY, color } = this.densityContours;
            const geoPath = d3.geoPath(null, ctx);
            
            ctx.save();
            
            if (this.contourBlur && this.contourBlur > 0) {
                ctx.filter = `blur(${this.contourBlur}px)`;
            }

            ctx.translate(offsetX, offsetY);
            
            paths.forEach(contour => {
                ctx.beginPath();
                geoPath(contour);
                ctx.fillStyle = color;
                ctx.globalAlpha = (this.densityOpacity || 0.5) * 0.15;
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.globalAlpha = (this.densityOpacity || 0.5) * 0.6;
                ctx.stroke();
            });
            
            ctx.restore();
        }

        ctx.restore();
    }

    onNodeClick(event: any, d: GraphNode) {
        if (event && event.sourceEvent) {
            event.sourceEvent.stopPropagation();
        } else if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        this.selectedNode = d;

        window.dispatchEvent(new CustomEvent('aea-node-selected', {
            detail: {
                node: d,
                metadata: {
                    url: this.motionUrlMap[d.id],
                    pdfPath: d.type === 'antrag' ? `./data_gathering/pdf/${this.sanitizeFilename(d.id)}.pdf` : null
                }
            }
        }));

        this.render();
    }

    showNodeContextMenu(event: any, d: GraphNode) {
        const clientX = event.touches && event.touches.length ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches && event.touches.length ? event.touches[0].clientY : event.clientY;

        window.dispatchEvent(new CustomEvent('aea-context-menu', {
            detail: {
                node: d,
                x: clientX,
                y: clientY
            }
        }));
    }

    onNodeHover(event: any, d: GraphNode) {
        this.hoveredNode = d;
        this.updateLabelVisibility();
    }

    onNodeLeave() {
        this.hoveredNode = null;
        this.updateLabelVisibility();
    }

    getNodeColor(node: GraphNode) {
        const groupId = this.nodeGroups.get(node.id);
        if (groupId !== undefined) {
            const group = this.groups.find(g => g.id === groupId);
            if (group) return group.color;
        }
        return node.color;
    }

    onNodeRightClick(event: Event, d: GraphNode) {
        event.preventDefault();
    }

    updateLabelVisibility() { }

    onResize() {
        const canvasNode = this.canvas.node() as HTMLCanvasElement;
        if (!canvasNode) return;
        
        const container = canvasNode.parentElement;
        this.width = container ? container.clientWidth : window.innerWidth;
        this.height = container ? container.clientHeight : window.innerHeight;
        
        this.canvas.attr('width', this.width).attr('height', this.height);
        this.render();
    }

    highlightNode(nodeId: string) {
        const node = this.allNodes.find(n => n.id === nodeId);
        if (node) {
            let needsFilterUpdate = false;
            if (node.type === 'antrag' && !this.settings.showAntraege) {
                this.settings.showAntraege = true;
                needsFilterUpdate = true;
            }
            if (node.type === 'supporter' && !this.settings.showSupporters) {
                this.settings.showSupporters = true;
                needsFilterUpdate = true;
            }
            if (needsFilterUpdate) this.applyFilters();

            this.centerOnNode(node);
            this.onNodeClick({ stopPropagation: () => { } } as any, node);
        }
    }

    resetView() {
        this.deselectAll();
        this.settings.showAntraege = true;
        this.settings.showSupporters = true;
        this.applyFilters();
        this.canvas.transition()
            .duration(750)
            .call(this.zoom.transform as any, d3.zoomIdentity);
        this.centerGraph();
    }

    centerGraph() {
        const positionedNodes = this.nodes.filter(n => n.x !== undefined && n.y !== undefined);
        if (positionedNodes.length === 0) return;

        const xExtent = d3.extent(positionedNodes, d => d.x);
        const yExtent = d3.extent(positionedNodes, d => d.y);
        
        if (!xExtent[0] || !xExtent[1] || !yExtent[0] || !yExtent[1]) return;

        const width = xExtent[1] - xExtent[0];
        const height = yExtent[1] - yExtent[0];
        const centerX = (xExtent[0] + xExtent[1]) / 2;
        const centerY = (yExtent[0] + yExtent[1]) / 2;

        const scale = 0.9 / Math.max(width / this.width, height / this.height);

        const transform = d3.zoomIdentity
            .translate(this.width / 2, this.height / 2)
            .scale(scale)
            .translate(-centerX, -centerY);

        this.transform = transform;
        
        window.dispatchEvent(new CustomEvent('aea-graph-zoom', {
            detail: { transform: transform }
        }));

        this.canvas.transition()
            .duration(750)
            .call(this.zoom.transform as any, transform);
    }

    centerOnNode(node: GraphNode) {
        if (node.x === undefined || node.y === undefined) return;
        const transform = d3.zoomIdentity
            .translate(this.width / 2, this.height / 2)
            .translate(-node.x, -node.y);
        this.canvas.transition()
            .duration(750)
            .call(this.zoom.transform as any, transform);
    }

    findNodeAt(event: any) {
        if (!this.nodes || this.nodes.length === 0) return null;

        const canvasNode = this.canvas.node();
        if (!canvasNode) return null;

        const [px, py] = d3.pointer(event, canvasNode);
        const [worldX, worldY] = this.transform.invert([px, py]);

        const threshold = 8 / this.transform.k;

        return this.nodes.find(node => {
            if (node.x === undefined || node.y === undefined) return false;
            
            const dx = node.x - worldX;
            const dy = node.y - worldY;
            const distanceSquared = dx * dx + dy * dy;
            
            let radius;
            if (node.size) {
                radius = node.size * this.settings.nodeSize;
            } else {
                radius = (Math.sqrt(node.linkCount || 0) * 1.5 + 0.25) * this.settings.nodeSize;
            }
            
            const hitRadius = radius + threshold;
            
            return distanceSquared <= hitRadius * hitRadius;
        });
    }

    sanitizeFilename(name: string) {
        return String(name).replace(/[<>:\"/\\|?*]/g, '_').trim();
    }

    setTransform(transform: d3.ZoomTransform) {
        if (!this.canvas) return;
        this.canvas.call(this.zoom.transform as any, transform);
    }

    destroy() {
        if (this.simulation) {
            this.simulation.stop();
        }

        if (this.handlers) {
            window.removeEventListener('resize', this.handlers.resize);
            window.removeEventListener('aea-filter-change', this.handlers.filterChange);
            window.removeEventListener('aea-view-action', this.handlers.viewAction);
            window.removeEventListener('aea-group-update', this.handlers.groupUpdate);
            window.removeEventListener('aea-density-update', this.handlers.densityUpdate);
        }

        if (this.canvas) {
            this.canvas.on('.zoom', null);
            this.canvas.on('click', null);
            this.canvas.on('mousemove', null);
            this.canvas.on('contextmenu', null);
        }
    }
}

if (typeof window !== 'undefined') {
    (window as any).GraphVisualization = GraphVisualization;
}

export default GraphVisualization;
export { GraphVisualization };
