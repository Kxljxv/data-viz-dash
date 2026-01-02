export type ShapeType = 'rect' | 'circle' | 'arrow' | 'text' | 'draw';

export interface Annotation {
    id: string;
    type: ShapeType;
    x: number; // Graph world X
    y: number; // Graph world Y
    width?: number; // Graph world width
    height?: number; // Graph world height
    content?: string;
    color?: string; // Stroke color
    fill?: string; // Fill color
    fontSize?: number;
    fontFamily?: string;
    strokeWidth?: number;
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    roughness?: number; // 0 = clean, >0 = sloppy
    edges?: 'sharp' | 'round';
    cornerRadius?: number; // For rounded edges
    rotation?: number; // Degrees
    customStyle?: string; // Custom CSS properties
    points?: {x: number, y: number}[]; // For freehand drawing
    smoothing?: number; // 0 = none, 1 = max
    fillStyle?: 'solid' | 'hachure' | 'zigzag' | 'cross-hatch' | 'dots'; // RoughJS fill style
}

export interface CameraState {
    x: number;
    y: number;
    k: number;
}

export interface Slide {
    id: string;
    title: string;
    description?: string;
    cameraState: CameraState;
    annotations: Annotation[];
    order: number;
}

export interface Tour {
    id: string;
    projectId: string;
    name: string;
    slides: Slide[];
}
