<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { tourStore } from '$lib/stores/tourStore.svelte';
    import type { Tour, Slide, Annotation, ShapeType } from '$lib/types/tour';
    import { Button, Typography, Input } from '$lib/components/aea';
    import { 
        IconDeviceFloppy, 
        IconPlus, 
        IconTrash, 
        IconCamera, 
        IconSquare, 
        IconCircle, 
        IconArrowRight, 
        IconTypography,
        IconPointer,
        IconChevronLeft,
        IconChevronRight,
        IconPlayerPlay,
        IconHandStop,
        IconPencil, 
        IconPalette,
        IconCopy,
        IconArrowBackUp,
        IconArrowForwardUp,
        IconDotsVertical,
        IconDownload,
        IconUpload
    } from '@tabler/icons-svelte';
    import * as d3 from 'd3';
    import { marked } from 'marked';
    import GraphVisualization from '$lib/components/graph/GraphVisualization';
    import Transformer from '$lib/components/tour/Transformer.svelte';
    import RoughShape from '$lib/components/tour/RoughShape.svelte';

    let projectId = $page.params.projectId;
    let tour = $state<Tour>(tourStore.getTour(projectId) || tourStore.createTour(projectId, `Tour ${projectId}`));
    let activeSlideIndex = $state(0);
    let graphInstance: any = null;
    let activeTool = $state<ShapeType | 'select' | 'pan' | 'draw'>('select');
    let selectedAnnotationId = $state<string | null>(null);
    let isPlaying = $state(false);
    let graphTransform = $state({ x: 0, y: 0, k: 1 });
    let isDrawing = $state(false);
    let currentPoints = $state<{x: number, y: number}[]>([]);

    // History for Undo/Redo
    let history = $state<string[]>([]);
    let historyIndex = $state(-1);
    let isApplyingHistory = false;

    // Clipboard for copy/paste
    let clipboard = $state<Annotation | null>(null);
    let draggedSlideIndex = $state<number | null>(null);
    let dragOverIndex = $state<number | null>(null);

    function handleSlideDragStart(index: number) {
        draggedSlideIndex = index;
    }

    function handleSlideDragOver(e: DragEvent, index: number) {
        e.preventDefault();
        dragOverIndex = index;
    }

    function handleSlideDrop(index: number) {
        if (draggedSlideIndex !== null && draggedSlideIndex !== index) {
            moveSlide(draggedSlideIndex, index);
        }
        draggedSlideIndex = null;
        dragOverIndex = null;
    }

    function pushHistory() {
        if (isApplyingHistory || !tour) return;
        
        const state = JSON.stringify(tour);
        // If the state is the same as the current history entry, don't push
        if (historyIndex >= 0 && history[historyIndex] === state) return;

        // Truncate history if we are in the middle of it
        history = history.slice(0, historyIndex + 1);
        history.push(state);
        
        // Limit history size to 50 steps
        if (history.length > 50) {
            history.shift();
        } else {
            historyIndex++;
        }
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            applyHistoryState(history[historyIndex]);
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            applyHistoryState(history[historyIndex]);
        }
    }

    function applyHistoryState(stateStr: string) {
        if (!tour) return;
        isApplyingHistory = true;
        const state = JSON.parse(stateStr);
        
        // Deep copy properties to existing tour object to maintain reactivity if possible
        // but simpler to just replace and ensure save
        tour.name = state.name;
        tour.slides = state.slides;
        
        // Ensure active slide index is still valid
        if (activeSlideIndex >= tour.slides.length) {
            activeSlideIndex = Math.max(0, tour.slides.length - 1);
        }
        
        tourStore.saveTour(tour);
        
        // If we switched slides or camera changed, we might need to restore view
        if (activeSlide) {
            restoreView(activeSlide);
        }
        
        setTimeout(() => {
            isApplyingHistory = false;
        }, 50);
    }

    let activeSlide = $derived(tour?.slides[activeSlideIndex]);

    onMount(() => {
        // Initial history state
        if (tour) {
            pushHistory();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isPlaying) return;

            // Don't trigger shortcuts if user is typing in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;

            if (isMod && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            } else if (isMod && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            } else if (isMod && e.key.toLowerCase() === 'c') {
                if (selectedAnnotationId) {
                    e.preventDefault();
                    copyElement();
                }
            } else if (isMod && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                pasteElement();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedAnnotationId) {
                    e.preventDefault();
                    deleteAnnotation(selectedAnnotationId);
                }
            } else if (isMod && e.key.toLowerCase() === 'd') {
                if (selectedAnnotationId) {
                    e.preventDefault();
                    duplicateElement();
                } else {
                    e.preventDefault();
                    duplicateSlide(activeSlideIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const handleZoom = (e: any) => {
            graphTransform = { 
                x: e.detail.transform.x, 
                y: e.detail.transform.y, 
                k: e.detail.transform.k 
            };
        };
        window.addEventListener('aea-graph-zoom', handleZoom);

        // Initialize Graph
        // We need to wait a bit for the container to be ready
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                graphInstance = new GraphVisualization(projectId, 'admin-graph-canvas');
                window.graph = graphInstance;
                
                // Set initial transform
                if (graphInstance.transform) {
                    graphTransform = {
                        x: graphInstance.transform.x,
                        y: graphInstance.transform.y,
                        k: graphInstance.transform.k
                    };
                }

                // If we have slides, restore the first one
                if (activeSlide) {
                    restoreView(activeSlide);
                }
            }
        }, 500);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('aea-graph-zoom', handleZoom);
            if (graphInstance) {
                graphInstance.destroy();
            }
        };
    });

    // Track state changes for history
    $effect(() => {
        if (tour && !isApplyingHistory) {
            // We use a small debounce or just rely on explicit pushHistory for big actions
            // and maybe an effect for small property changes
            const state = JSON.stringify(tour);
            const timeout = setTimeout(() => {
                pushHistory();
            }, 1000); // Auto-save history every second if changes occur
            return () => clearTimeout(timeout);
        }
    });

    function addSlide() {
        if (!tour) return;
        
        const transform = graphInstance ? graphInstance.transform : { x: 0, y: 0, k: 1 };
        
        const newSlide: Slide = {
            id: crypto.randomUUID(),
            title: `Slide ${tour.slides.length + 1}`,
            cameraState: { x: transform.x, y: transform.y, k: transform.k },
            annotations: [],
            order: tour.slides.length
        };

        tour.slides = [...tour.slides, newSlide];
        activeSlideIndex = tour.slides.length - 1;
        tourStore.saveTour(tour);
        pushHistory();
    }

    function duplicateSlide(index: number) {
        if (!tour || !tour.slides[index]) return;
        
        const sourceSlide = tour.slides[index];
        const newSlide: Slide = {
            ...JSON.parse(JSON.stringify(sourceSlide)),
            id: crypto.randomUUID(),
            title: `${sourceSlide.title} (Kopie)`,
            order: tour.slides.length
        };
        
        // Ensure all annotation IDs are also new
        newSlide.annotations = newSlide.annotations.map(ann => ({
            ...ann,
            id: crypto.randomUUID()
        }));

        tour.slides = [...tour.slides.slice(0, index + 1), newSlide, ...tour.slides.slice(index + 1)];
        // Update orders
        tour.slides.forEach((s, i) => s.order = i);
        
        activeSlideIndex = index + 1;
        tourStore.saveTour(tour);
        pushHistory();
    }

    function deleteSlide(index: number) {
        if (!tour) return;
        tour.slides = tour.slides.filter((_, i) => i !== index);
        // Update orders
        tour.slides.forEach((s, i) => s.order = i);
        
        if (activeSlideIndex >= tour.slides.length) {
            activeSlideIndex = Math.max(0, tour.slides.length - 1);
        }
        tourStore.saveTour(tour);
        pushHistory();
    }

    function moveSlide(fromIndex: number, toIndex: number) {
        if (!tour) return;
        const slides = [...tour.slides];
        const [movedSlide] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, movedSlide);
        
        // Update orders
        slides.forEach((s, i) => s.order = i);
        
        tour.slides = slides;
        activeSlideIndex = toIndex;
        tourStore.saveTour(tour);
        pushHistory();
    }

    function captureView() {
        if (!activeSlide || !graphInstance) return;
        const t = graphInstance.transform;
        activeSlide.cameraState = { x: t.x, y: t.y, k: t.k };
        // Trigger reactivity update
        tour!.slides = [...tour!.slides]; 
        tourStore.saveTour(tour!);
        pushHistory();
    }

    function restoreView(slide: Slide, smooth = false) {
        if (!graphInstance || !slide.cameraState) return;
        const { x, y, k } = slide.cameraState;
        const transform = d3.zoomIdentity.translate(x, y).scale(k);
        
        if (smooth && graphInstance.transitionTo) {
            graphInstance.transitionTo(transform, 2000);
        } else {
            graphInstance.setTransform(transform);
        }
    }

    function updateCameraState(key: 'x' | 'y' | 'k', value: number) {
        if (!activeSlide || !graphInstance) return;
        
        // When updating zoom 'k' via input, we want to zoom relative to the center of the viewport
        // to maintain a consistent "focus" point, rather than jumping.
        if (key === 'k') {
            const oldK = activeSlide.cameraState.k;
            const newK = value;
            
            // Current center of the view in world coordinates
            const centerX = (graphInstance.width / 2 - activeSlide.cameraState.x) / oldK;
            const centerY = (graphInstance.height / 2 - activeSlide.cameraState.y) / oldK;
            
            // Calculate new x and y to keep the same world center at the new scale
            const newX = graphInstance.width / 2 - centerX * newK;
            const newY = graphInstance.height / 2 - centerY * newK;
            
            activeSlide.cameraState = {
                x: newX,
                y: newY,
                k: newK
            };
        } else {
            activeSlide.cameraState = {
                ...activeSlide.cameraState,
                [key]: value
            };
        }
        
        const { x, y, k } = activeSlide.cameraState;
        const transform = d3.zoomIdentity.translate(x, y).scale(k);
        graphInstance.setTransform(transform);
        
        // Reactivity update
        tour!.slides = [...tour!.slides];
        tourStore.saveTour(tour!);
    }

    function selectSlide(index: number) {
        activeSlideIndex = index;
        if (tour?.slides[index]) {
            restoreView(tour.slides[index]);
        }
    }

    // Annotation Logic
    function addAnnotation(type: ShapeType) {
        if (!activeSlide || !graphInstance) return;
        
        const rect = svgElement.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Convert to world coordinates
        const worldX = (centerX - graphTransform.x) / graphTransform.k;
        const worldY = (centerY - graphTransform.y) / graphTransform.k;
        
        const newAnnotation: Annotation = {
            id: crypto.randomUUID(),
            type,
            x: worldX,
            y: worldY,
            width: 150 / graphTransform.k,
            height: 100 / graphTransform.k,
            content: type === 'text' ? 'Neuer Text' : undefined,
            color: '#00a8ff',
            fill: 'none',
            fontSize: 24 / graphTransform.k,
            strokeWidth: 2 / graphTransform.k,
            rotation: 0,
            roughness: 1,
            strokeStyle: 'solid',
            fillStyle: 'solid',
            edges: 'sharp',
            cornerRadius: 0,
            customStyle: ''
        };

        activeSlide.annotations = [...activeSlide.annotations, newAnnotation];
        selectedAnnotationId = newAnnotation.id;
        pushHistory();
    }

    function deleteAnnotation(id: string) {
        if (!activeSlide) return;
        activeSlide.annotations = activeSlide.annotations.filter(ann => ann.id !== id);
        if (selectedAnnotationId === id) selectedAnnotationId = null;
        pushHistory();
    }

    function copyElement() {
        if (!activeSlide || !selectedAnnotationId) return;
        const ann = activeSlide.annotations.find(a => a.id === selectedAnnotationId);
        if (ann) {
            clipboard = JSON.parse(JSON.stringify(ann));
        }
    }

    function pasteElement() {
        if (!activeSlide || !clipboard) return;
        
        const newAnnotation: Annotation = {
            ...JSON.parse(JSON.stringify(clipboard)),
            id: crypto.randomUUID(),
            // Offset a bit so it's visible if pasted in the same spot
            x: clipboard.x + 20 / graphTransform.k,
            y: clipboard.y + 20 / graphTransform.k
        };
        
        activeSlide.annotations = [...activeSlide.annotations, newAnnotation];
        selectedAnnotationId = newAnnotation.id;
        pushHistory();
    }

    function duplicateElement() {
        if (!activeSlide || !selectedAnnotationId) return;
        const ann = activeSlide.annotations.find(a => a.id === selectedAnnotationId);
        if (ann) {
            const newAnnotation: Annotation = {
                ...JSON.parse(JSON.stringify(ann)),
                id: crypto.randomUUID(),
                x: ann.x + 20 / graphTransform.k,
                y: ann.y + 20 / graphTransform.k
            };
            activeSlide.annotations = [...activeSlide.annotations, newAnnotation];
            selectedAnnotationId = newAnnotation.id;
            pushHistory();
        }
    }

    function updateAnnotation(id: string, updates: Partial<Annotation>) {
        if (!activeSlide) return;
        const idx = activeSlide.annotations.findIndex(a => a.id === id);
        if (idx >= 0) {
            activeSlide.annotations[idx] = { ...activeSlide.annotations[idx], ...updates };
            activeSlide.annotations = [...activeSlide.annotations];
        }
    }

    // Canvas Interaction
    let svgElement: SVGSVGElement;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let initialPos = { x: 0, y: 0 };

    function handleCanvasMouseDown(e: MouseEvent) {
        if (isPlaying) return;

        if (activeTool === 'draw') {
             isDrawing = true;
             const rect = svgElement.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const y = e.clientY - rect.top;
             
             // Convert to world
             const worldX = (x - graphTransform.x) / graphTransform.k;
             const worldY = (y - graphTransform.y) / graphTransform.k;
             
             currentPoints = [{x: worldX, y: worldY}];
             selectedAnnotationId = null;
        } else if (activeTool === 'select') {
             selectedAnnotationId = null;
        }
    }

    function handleMouseDown(e: MouseEvent, annotation: Annotation) {
        if (activeTool !== 'select' || isPlaying) return;
        e.stopPropagation();
        selectedAnnotationId = annotation.id;
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
        initialPos = { x: annotation.x, y: annotation.y };
    }

    function handleMouseMove(e: MouseEvent) {
        if (isPlaying || !activeSlide) return;

        if (isDrawing && activeTool === 'draw') {
             const rect = svgElement.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const y = e.clientY - rect.top;
             const worldX = (x - graphTransform.x) / graphTransform.k;
             const worldY = (y - graphTransform.y) / graphTransform.k;
             
             // Optimization: Only add point if it's far enough from the last point
             const lastPoint = currentPoints[currentPoints.length - 1];
             if (lastPoint) {
                 const dx = worldX - lastPoint.x;
                 const dy = worldY - lastPoint.y;
                 const distSq = dx * dx + dy * dy;
                 // 2 pixels threshold in world space (squared for performance)
                 const threshold = 2 / graphTransform.k;
                 if (distSq < threshold * threshold) return;
             }

             currentPoints.push({x: worldX, y: worldY});
             return;
        }

        if (!isDragging || !selectedAnnotationId) return;
        
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        // Convert px delta to world delta
        const worldDx = dx / graphTransform.k;
        const worldDy = dy / graphTransform.k;
        
        updateAnnotation(selectedAnnotationId, {
            x: initialPos.x + worldDx,
            y: initialPos.y + worldDy
        });
    }

    function handleMouseUp() {
        if (isDrawing && activeTool === 'draw') {
            isDrawing = false;
            if (currentPoints.length > 1) {
                // Compute bounds
                const xs = currentPoints.map(p => p.x);
                const ys = currentPoints.map(p => p.y);
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                const maxX = Math.max(...xs);
                const maxY = Math.max(...ys);
                
                const width = Math.max(maxX - minX, 1);
                const height = Math.max(maxY - minY, 1);
                
                const normalizedPoints = currentPoints.map(p => ({
                    x: p.x - minX,
                    y: p.y - minY
                }));
                
                const newAnnotation: Annotation = {
                    id: crypto.randomUUID(),
                    type: 'draw',
                    x: minX,
                    y: minY,
                    width,
                    height,
                    points: normalizedPoints,
                    color: '#00a8ff',
                    strokeWidth: 2 / graphTransform.k,
                    roughness: 2,
                    smoothing: 1.0,
                    strokeStyle: 'solid',
            fill: 'none',
            rotation: 0,
            fillStyle: 'solid',
            customStyle: ''
        };
                
                activeSlide.annotations = [...activeSlide.annotations, newAnnotation];
                selectedAnnotationId = newAnnotation.id;
                // Keep drawing tool active
            }
            currentPoints = [];
        }

        isDragging = false;
        if (tour) tourStore.saveTour(tour);
    }

    // Playback
    function exportTour() {
        if (!tour) return;
        const data = JSON.stringify(tour, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tour.name.replace(/\s+/g, '_')}_export.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importTour() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const importedTour = JSON.parse(text);
                
                // Basic validation
                if (!importedTour.slides || !Array.isArray(importedTour.slides)) {
                    alert('Ungültiges Tour-Format');
                    return;
                }
                
                if (confirm('Möchtest du die aktuelle Tour durch die importierten Daten ersetzen?')) {
                    tour!.slides = importedTour.slides;
                    tour!.name = importedTour.name || tour!.name;
                    activeSlideIndex = 0;
                    tourStore.saveTour(tour!);
                    pushHistory();
                    if (activeSlide) restoreView(activeSlide);
                }
            } catch (err) {
                console.error('Import failed:', err);
                alert('Fehler beim Importieren der Datei');
            }
        };
        input.click();
    }

    function togglePlay() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            selectedAnnotationId = null;
            activeSlideIndex = 0;
            if (activeSlide) restoreView(activeSlide, true);
            playNext();
        }
    }

    function playNext() {
        if (!isPlaying) return;
        
        const tourLength = tour?.slides.length || 0;
        if (activeSlideIndex < tourLength - 1) {
            setTimeout(() => {
                if (!isPlaying) return;
                activeSlideIndex++;
                if (activeSlide) restoreView(activeSlide, true);
                playNext();
            }, 4000);
        } else {
            setTimeout(() => {
                isPlaying = false;
            }, 4000);
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (isPlaying) return;
        // Ignore if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        switch(e.key.toLowerCase()) {
            case 'v': activeTool = 'select'; break;
            case 'h': activeTool = 'pan'; selectedAnnotationId = null; break;
            case 'r': addAnnotation('rect'); break;
            case 'c': addAnnotation('circle'); break;
            case 'a': addAnnotation('arrow'); break;
            case 'd': activeTool = 'draw'; break;
            case 't': addAnnotation('text'); break;
            case 'delete':
            case 'backspace':
                if (selectedAnnotationId) {
                    deleteAnnotation(selectedAnnotationId);
                    selectedAnnotationId = null;
                }
                break;
        }
    }

</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} onkeydown={handleKeyDown} />

<div class="h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
    <!-- Toolbar -->
    <div class="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-bg-200/50 backdrop-blur">
        <div class="flex items-center gap-4">
            <Typography variant="h3" class="text-white">{tour?.name}</Typography>
        </div>
        <div class="flex items-center gap-2">
            <div class="flex items-center border-r border-white/10 pr-2 mr-2">
                <button 
                    class="p-2 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 transition-all"
                    onclick={undo}
                    disabled={historyIndex <= 0}
                    title="Rückgängig (Ctrl+Z)"
                >
                    <IconArrowBackUp size={20} />
                </button>
                <button 
                    class="p-2 rounded hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 transition-all"
                    onclick={redo}
                    disabled={historyIndex >= history.length - 1}
                    title="Wiederholen (Ctrl+Y)"
                >
                    <IconArrowForwardUp size={20} />
                </button>
            </div>
            <Button variant="secondary" size="sm" onclick={() => history.back()}>
                <IconChevronLeft size={16} class="mr-1" />
                Zurück
            </Button>
            <Button variant="secondary" size="sm" onclick={importTour}>
                <IconUpload size={16} class="mr-1" />
                Import
            </Button>
            <Button variant="secondary" size="sm" onclick={exportTour}>
                <IconDownload size={16} class="mr-1" />
                Export
            </Button>
            <Button variant="primary" size="sm" onclick={() => tour && tourStore.saveTour(tour)}>
                <IconDeviceFloppy size={16} class="mr-1" />
                Speichern
            </Button>
        </div>
    </div>

    <!-- Floating Toolbar -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-bg-200/90 backdrop-blur border border-white/10 p-2 rounded-xl flex gap-2 shadow-2xl z-30">
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'select' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => activeTool = 'select'}
            title="Auswählen (V)"
        >
            <IconPointer size={20} />
        </button>
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'pan' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => { activeTool = 'pan'; selectedAnnotationId = null; }}
            title="Verschieben (H)"
        >
            <IconHandStop size={20} />
        </button>
        <div class="w-px bg-white/10 mx-1"></div>
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'rect' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => addAnnotation('rect')}
            title="Rechteck (R)"
        >
            <IconSquare size={20} />
        </button>
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'circle' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => addAnnotation('circle')}
            title="Kreis (C)"
        >
            <IconCircle size={20} />
        </button>
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'arrow' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => addAnnotation('arrow')}
            title="Pfeil (A)"
        >
            <IconArrowRight size={20} />
        </button>
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'draw' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => activeTool = 'draw'}
            title="Zeichnen (D)"
        >
            <IconPencil size={20} />
        </button>
        <button 
            class="p-3 rounded-lg hover:bg-white/10 transition-all {activeTool === 'text' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-white/60'}"
            onclick={() => addAnnotation('text')}
            title="Text (T)"
        >
            <IconTypography size={20} />
        </button>
    </div>

    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar -->
        <div class="w-64 border-r border-white/10 bg-bg-200/30 flex flex-col">
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
                <Typography variant="label">Folien</Typography>
                <button class="text-brand hover:text-brand-light" onclick={addSlide}>
                    <IconPlus size={18} />
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-2 space-y-2">
                {#if tour}
                    {#each tour.slides as slide, i}
                        <div 
                            role="button"
                            tabindex="0"
                            draggable="true"
                            class="p-3 rounded-lg border cursor-pointer transition-all group relative {activeSlideIndex === i ? 'bg-brand/10 border-brand' : 'bg-white/5 border-transparent hover:bg-white/10'} {dragOverIndex === i ? 'border-t-brand border-t-2' : ''} {draggedSlideIndex === i ? 'opacity-40' : ''}"
                            onclick={() => selectSlide(i)}
                            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectSlide(i)}
                            ondragstart={() => handleSlideDragStart(i)}
                            ondragover={(e) => handleSlideDragOver(e, i)}
                            ondragleave={() => dragOverIndex = null}
                            ondrop={() => handleSlideDrop(i)}
                        >
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-white/90">Folie {i + 1}</span>
                                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        class="text-white/20 hover:text-brand transition-colors p-1"
                                        onclick={(e) => { e.stopPropagation(); duplicateSlide(i); }}
                                        title="Duplizieren"
                                    >
                                        <IconCopy size={14} />
                                    </button>
                                    <button 
                                        class="text-white/20 hover:text-danger transition-colors p-1"
                                        onclick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                                        title="Löschen"
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </div>
                            </div>
                            <input 
                                type="text" 
                                bind:value={slide.title}
                                class="w-full bg-transparent border-none text-xs text-white/60 focus:text-white p-0 focus:ring-0"
                                onclick={(e) => e.stopPropagation()}
                            />
                        </div>
                    {/each}
                {/if}
            </div>

            <!-- Slide Camera Settings -->
            {#if activeSlide}
                <div class="p-4 border-t border-white/10 bg-bg-300/20">
                    <Typography variant="label" class="mb-4 block text-white/70">Kamera-Einstellungen</Typography>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label for="cam-x" class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Position X</label>
                                <Input 
                                    id="cam-x"
                                    type="number" 
                                    value={Math.round(graphTransform.x)} 
                                    onchange={(e) => updateCameraState('x', parseFloat(e.currentTarget.value))}
                                    class="h-8 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                            <div>
                                <label for="cam-y" class="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Position Y</label>
                                <Input 
                                    id="cam-y"
                                    type="number" 
                                    value={Math.round(graphTransform.y)} 
                                    onchange={(e) => updateCameraState('y', parseFloat(e.currentTarget.value))}
                                    class="h-8 text-xs bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <label for="cam-k" class="text-[10px] uppercase tracking-wider text-white/40">Zoom (k)</label>
                                <span class="text-[10px] text-brand font-mono">{graphTransform.k.toFixed(2)}x</span>
                            </div>
                            <input 
                                id="cam-k"
                                type="range" 
                                min="0.05" 
                                max="2" 
                                step="0.05"
                                value={graphTransform.k}
                                oninput={(e) => updateCameraState('k', parseFloat(e.currentTarget.value))}
                                class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand"
                            />
                        </div>
                    </div>
                </div>
            {/if}

            <div class="p-4 border-t border-white/10">
                <Button variant="secondary" class="w-full" onclick={togglePlay}>
                    <IconPlayerPlay size={16} class="mr-2" />
                    {isPlaying ? 'Stop' : 'Vorschau'}
                </Button>
            </div>
        </div>

        <!-- Stage -->
        <div class="flex-1 relative bg-bg-graph overflow-hidden">
            <!-- Graph Layer -->
            <canvas id="admin-graph-canvas" class="absolute inset-0 w-full h-full z-0"></canvas>
            
            <!-- Annotation Layer -->
            <svg 
                bind:this={svgElement}
                role="presentation"
                class="absolute inset-0 w-full h-full z-10 {isPlaying ? 'pointer-events-none' : 'pointer-events-auto'}"
                onmousedown={handleCanvasMouseDown}
            >
                <g transform="translate({graphTransform.x}, {graphTransform.y}) scale({graphTransform.k})">
                    {#if activeSlide}
                        {#each activeSlide.annotations as annotation (annotation.id)}
                            <g 
                                role="button"
                                tabindex="0"
                                class="{activeTool === 'select' && !isPlaying ? 'cursor-move' : ''} {activeTool === 'pan' ? 'pointer-events-none' : 'pointer-events-auto'}"
                                onmousedown={(e) => handleMouseDown(e, annotation)}
                                transform="rotate({annotation.rotation || 0}, {annotation.x + (annotation.width||0)/2}, {annotation.y + (annotation.height||0)/2})"
                            >
                                {#if annotation.type === 'text'}
                                    <foreignObject 
                                        x={annotation.x} 
                                        y={annotation.y} 
                                        width={annotation.width || 200} 
                                        height={annotation.height || 100}
                                        style="overflow: visible;"
                                    >
                                        <div 
                                            class="prose prose-invert prose-sm leading-snug select-none annotation-text-content"
                                            style="color: {annotation.color}; font-size: {annotation.fontSize || 24}px; font-family: {annotation.fontFamily || 'var(--default-font)'}; {annotation.customStyle || ''}"
                                        >
                                            {@html marked.parse(annotation.content || '')}
                                        </div>
                                    </foreignObject>
                                {:else}
                                    <g style={annotation.customStyle || ''}>
                                        <RoughShape annotation={annotation} />
                                    </g>
                                {/if}

                                <!-- Transformer (Only for non-draw or selected) -->
                                {#if selectedAnnotationId === annotation.id && !isPlaying}
                                    <Transformer 
                                        bind:x={annotation.x}
                                        bind:y={annotation.y}
                                        bind:width={annotation.width}
                                        bind:height={annotation.height}
                                        bind:rotation={annotation.rotation}
                                        zoom={graphTransform.k}
                                        color={annotation.color || '#00a8ff'}
                                    />
                                {/if}
                            </g>
                        {/each}
                    {/if}
                    
                    <!-- Current Drawing -->
                    {#if isDrawing && currentPoints.length > 1}
                        <path 
                            d={`M ${currentPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            fill="none"
                            stroke="#00a8ff"
                            stroke-width={2 / graphTransform.k}
                            stroke-opacity="0.5"
                        />
                    {/if}
                </g>
            </svg>

            <!-- Properties Panel (Floating) -->
            {#if selectedAnnotationId && activeSlide}
                {@const ann = activeSlide.annotations.find(a => a.id === selectedAnnotationId)}
                {#if ann}
                    <div class="absolute top-4 right-4 w-72 bg-bg-200/95 backdrop-blur border border-white/10 rounded-lg p-4 z-20 shadow-xl max-h-[80vh] overflow-y-auto">
                        <div class="flex justify-between items-center mb-4">
                            <Typography variant="label">Eigenschaften</Typography>
                            <button 
                                class="text-danger hover:text-danger-light"
                                onclick={() => deleteAnnotation(ann.id)}
                            >
                                <IconTrash size={16} />
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            <!-- Position & Size -->
                            <div class="space-y-2">
                                <label class="text-xs text-white/50 block font-bold uppercase">Abmessungen</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label for="prop-x-{ann.id}" class="text-[10px] text-white/40 block mb-1">X</label>
                                        <input id="prop-x-{ann.id}" type="number" bind:value={ann.x} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                    </div>
                                    <div>
                                        <label for="prop-y-{ann.id}" class="text-[10px] text-white/40 block mb-1">Y</label>
                                        <input id="prop-y-{ann.id}" type="number" bind:value={ann.y} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                    </div>
                                    {#if ann.type !== 'draw'}
                                        <div>
                                            <label for="prop-w-{ann.id}" class="text-[10px] text-white/40 block mb-1">Breite</label>
                                            <input id="prop-w-{ann.id}" type="number" bind:value={ann.width} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                        </div>
                                        <div>
                                            <label for="prop-h-{ann.id}" class="text-[10px] text-white/40 block mb-1">Höhe</label>
                                            <input id="prop-h-{ann.id}" type="number" bind:value={ann.height} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                        </div>
                                    {/if}
                                </div>
                            </div>

                            {#if ann.type === 'text'}
                                <div class="space-y-3">
                                    <div>
                                        <label for="prop-content-{ann.id}" class="text-xs text-white/50 mb-1 block">Inhalt (Markdown)</label>
                                        <textarea 
                                            id="prop-content-{ann.id}"
                                            bind:value={ann.content} 
                                            class="w-full bg-white/5 rounded px-2 py-1 text-sm text-white border border-white/10 min-h-[100px]"
                                        ></textarea>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label for="prop-fontsize-{ann.id}" class="text-xs text-white/50 mb-1 block">Schriftgröße</label>
                                            <input id="prop-fontsize-{ann.id}" type="number" bind:value={ann.fontSize} class="w-full bg-white/5 rounded px-2 py-1 text-sm text-white border border-white/10" />
                                        </div>
                                        <div>
                                            <label for="prop-font-{ann.id}" class="text-xs text-white/50 mb-1 block">Schriftart</label>
                                            <select 
                                                id="prop-font-{ann.id}" 
                                                bind:value={ann.fontFamily}
                                                class="w-full bg-bg-200 text-white rounded px-2 py-1 text-sm border border-white/10"
                                            >
                                                <option value="var(--default-font)">Modern Dense</option>
                                                <option value="var(--serif-font)">Serif</option>
                                                <option value="ModernWide">Modern Wide</option>
                                                <option value="Dyslexic">Dyslexic</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                            
                            <!-- Stroke -->
                            <div class="space-y-2">
                                <label class="text-xs text-white/50 block font-bold uppercase">Linie</label>
                                
                                <!-- Quick Palette -->
                                <div class="flex gap-1 mb-1 flex-wrap">
                                    {#each ['#00a8ff', '#00cc66', '#ffaa00', '#ff4444', '#ffffff', '#aaaaaa', '#000000'] as color}
                                        <button 
                                            class="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110"
                                            style="background-color: {color};"
                                            onclick={() => ann.color = color}
                                            title={color}
                                        ></button>
                                    {/each}
                                </div>

                                <div class="flex items-center justify-between">
                                    <label for="prop-color-{ann.id}" class="text-xs text-white/70">Farbe</label>
                                    <input id="prop-color-{ann.id}" type="color" bind:value={ann.color} class="bg-transparent border-none w-8 h-8 cursor-pointer" />
                                </div>
                                <div class="flex items-center justify-between">
                                    <label for="prop-sw-{ann.id}" class="text-xs text-white/70">Breite</label>
                                    <input id="prop-sw-{ann.id}" type="range" min="0.5" max="20" step="0.5" bind:value={ann.strokeWidth} class="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand" />
                                    <span class="text-xs text-white/50 w-8 text-right">{ann.strokeWidth}</span>
                                </div>

                                {#if ann.type === 'draw'}
                                    <div class="flex items-center justify-between">
                                        <label for="prop-smooth-{ann.id}" class="text-xs text-white/70">Glättung</label>
                                        <input id="prop-smooth-{ann.id}" type="range" min="0" max="5" step="0.1" bind:value={ann.smoothing} class="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand" />
                                        <span class="text-xs text-white/50 w-8 text-right">{Math.round((ann.smoothing || 0) * 20)}%</span>
                                    </div>
                                {/if}

                                {#if ann.type === 'rect'}
                                    <div class="flex items-center justify-between">
                                        <label for="prop-round-{ann.id}" class="text-xs text-white/70">Abgerundet</label>
                                        <input 
                                            id="prop-round-{ann.id}"
                                            type="checkbox" 
                                            checked={ann.edges === 'round'} 
                                            onchange={(e) => ann.edges = e.currentTarget.checked ? 'round' : 'sharp'}
                                            class="w-4 h-4 rounded border-white/10 bg-white/5 text-brand focus:ring-brand" 
                                        />
                                    </div>
                                    {#if ann.edges === 'round'}
                                        <div class="flex items-center justify-between">
                                            <label for="prop-radius-{ann.id}" class="text-xs text-white/70 ml-2">Radius</label>
                                            <input 
                                                id="prop-radius-{ann.id}"
                                                type="range" 
                                                min="0" 
                                                max={Math.min(ann.width || 0, ann.height || 0) / 2} 
                                                step="1" 
                                                bind:value={ann.cornerRadius} 
                                                class="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand" 
                                            />
                                            <span class="text-xs text-white/50 w-8 text-right">{Math.round(ann.cornerRadius || 0)}</span>
                                        </div>
                                    {/if}
                                {/if}
                            </div>

                            <!-- Custom CSS -->
                            <div class="space-y-2 border-t border-white/10 pt-2">
                                <label for="prop-css-{ann.id}" class="text-xs text-white/50 block font-bold uppercase">Custom CSS</label>
                                <textarea 
                                    id="prop-css-{ann.id}"
                                    bind:value={ann.customStyle} 
                                    placeholder="filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));"
                                    class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10 min-h-[60px] font-mono"
                                ></textarea>
                                <p class="text-[10px] text-white/30 italic">z.B. filter: drop-shadow(...), opacity: 0.5</p>
                            </div>

                            <!-- Fill -->
                            {#if ann.type !== 'arrow' && ann.type !== 'draw' && ann.type !== 'text'}
                                <div class="space-y-2 border-t border-white/10 pt-2">
                                    <label class="text-xs text-white/50 block font-bold uppercase">Füllung</label>
                                    
                                    <!-- Quick Palette -->
                                    <div class="flex gap-1 mb-1 flex-wrap">
                                        <button 
                                            class="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110 bg-transparent relative"
                                            onclick={() => ann.fill = 'none'}
                                            title="Keine Füllung"
                                        >
                                            <div class="absolute inset-0 border-r border-red-500 transform rotate-45"></div>
                                        </button>
                                        {#each ['#00a8ff', '#00cc66', '#ffaa00', '#ff4444', '#ffffff', '#aaaaaa', '#000000'] as color}
                                            <button 
                                                class="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110"
                                                style="background-color: {color};"
                                                onclick={() => ann.fill = color}
                                                title={color}
                                            ></button>
                                        {/each}
                                    </div>

                                    <div class="flex items-center justify-between">
                                        <label for="prop-fill-{ann.id}" class="text-xs text-white/70">Farbe</label>
                                        <input id="prop-fill-{ann.id}" type="color" bind:value={ann.fill} class="bg-transparent border-none w-8 h-8 cursor-pointer" />
                                    </div>
                                </div>
                            {/if}

                            <!-- Geometry -->
                            <div class="space-y-2 border-t border-white/10 pt-2">
                                <label class="text-xs text-white/50 block font-bold uppercase">Geometrie</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-[10px] text-white/40">Breite</label>
                                        <input type="number" bind:value={ann.width} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] text-white/40">Höhe</label>
                                        <input type="number" bind:value={ann.height} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] text-white/40">Rotation</label>
                                        <input type="number" bind:value={ann.rotation} class="w-full bg-white/5 rounded px-2 py-1 text-xs text-white border border-white/10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    :global(.annotation-text-content) {
        pointer-events: none;
    }
    
    :global(.annotation-text-content *) {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        color: inherit !important;
    }

    :global(.annotation-text-content p:not(:last-child)) {
        margin-bottom: 0.5em !important;
    }

    :global(.annotation-text-content h1, 
            .annotation-text-content h2, 
            .annotation-text-content h3) {
        font-weight: bold !important;
        line-height: 1.2 !important;
        margin-bottom: 0.3em !important;
    }

    :global(.annotation-text-content ul, 
            .annotation-text-content ol) {
        padding-left: 1.2em !important;
        margin-bottom: 0.5em !important;
    }

    :global(.annotation-text-content li) {
        margin-bottom: 0.2em !important;
    }
</style>
