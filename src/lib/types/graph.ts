export interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    sublabel?: string;
    type: 'antrag' | 'supporter' | 'amendment' | 'person';
    color: string;
    linkCount: number;
    font: string;
    size?: number;
    degree?: number;
    closeness?: number;
    betweenness?: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
    weight: number;
}

export interface GraphGroup {
    id: string;
    color: string;
    nodes: string[];
}

export interface GraphSettings {
    showLabels: boolean;
    showLinks: boolean;
    showAntraege: boolean;
    showSupporters: boolean;
    nodeSize: number;
    linearZoom: boolean;
}

export interface DensityContours {
    paths: d3.GeoGeometryObjects[];
    offsetX: number;
    offsetY: number;
    color: string;
}
