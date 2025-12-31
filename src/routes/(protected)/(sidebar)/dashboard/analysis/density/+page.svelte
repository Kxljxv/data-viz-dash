<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { AVAILABLE_PROJECTS } from "$config";
	import { goto } from "$app/navigation";
	import FileUploadStatus from "$components/aea/FileUploadStatus.svelte";
	import { AlertCircle, CheckCircle2, Loader2, Download, Info, Eye, EyeOff, Save, FolderOpen, Trash2 } from "lucide-svelte";
    import * as Tooltip from "$components/ui/tooltip";
    import DensityMap from "$lib/components/analysis/DensityMap.svelte";
    import GraphVisualizationModule from "$components/graph/GraphVisualization.js";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

	let step = $state(1); // 1: Select Graph, 2: Upload group.json, 3: Result
	let selectedProject = $state("");
	let uploadFiles = $state([]);
	let isProcessing = $state(false);
	let analysisResults = $state([]); // Array of results for multi-window
	let error = $state("");
    let savedProjects = $state([]);
    let mapComponents = $state([]); // Array of map component instances
    let globalTransform = $state(null); // Shared zoom/pan transform
    let densityOpacity = $state(0.8);
    let densityRadius = $state(15);
    let visualizationType = $state('hexbin');
    let overlayOpacity = $state(1.0);
    let weightMultiplier = $state(1.0);
    let weightExponent = $state(1.0);
    let contourBandwidth = $state(30);
    let contourThresholds = $state(15);
    let showForceGraph = $state(false);
    let projectData = $state(null);
    let simulatedNodes = $state([]);
    let graphInstances = $state([]);
    let isSaving = $state(false);

    // Load saved projects on mount
    onMount(() => {
        const stored = localStorage.getItem('aea_density_projects');
        if (stored) {
            try {
                savedProjects = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse saved projects", e);
            }
        }
    });

    // Save projects to localStorage whenever savedProjects changes
    $effect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('aea_density_projects', JSON.stringify(savedProjects));
        }
    });

    function saveProject() {
        const name = prompt("Projektname eingeben:", `Analyse ${new Date().toLocaleString()}`);
        if (!name) return;

        isSaving = true;
        const newProject = {
            id: crypto.randomUUID(),
            name,
            timestamp: new Date().toISOString(),
            selectedProject,
            analysisResults,
            parameters: {
                densityOpacity,
                densityRadius,
                visualizationType,
                overlayOpacity,
                weightMultiplier,
                weightExponent,
                contourBandwidth,
                contourThresholds,
                showForceGraph
            },
            globalTransform
        };

        savedProjects = [newProject, ...savedProjects];
        isSaving = false;
    }

    async function loadProject(project) {
        isProcessing = true;
        try {
            // 1. Restore base project data
            selectedProject = project.selectedProject;
            
            // Re-load simulated nodes for coordinates (needed for processing and context)
            const simResponse = await fetch(`/data/${selectedProject}/simulated/nodes.json`);
            if (simResponse.ok) {
                simulatedNodes = await simResponse.json();
            } else {
                const nodesResponse = await fetch(`/data/${selectedProject}/nodes.json`);
                if (nodesResponse.ok) simulatedNodes = await nodesResponse.json();
                else simulatedNodes = [];
            }

            // 2. Restore analysis results
            analysisResults = project.analysisResults;

            // 3. Restore parameters
            const p = project.parameters;
            densityOpacity = p.densityOpacity;
            densityRadius = p.densityRadius;
            visualizationType = p.visualizationType;
            overlayOpacity = p.overlayOpacity;
            weightMultiplier = p.weightMultiplier;
            weightExponent = p.weightExponent;
            contourBandwidth = p.contourBandwidth;
            contourThresholds = p.contourThresholds;
            showForceGraph = p.showForceGraph;

            // 4. Restore transform (will be applied via effect)
            globalTransform = project.globalTransform;

            step = 3;
            
            // Give a tiny bit of time for map components to mount
            setTimeout(() => {
                if (globalTransform) {
                    mapComponents.forEach(map => {
                        if (map) map.updateTransform(globalTransform);
                    });
                }
            }, 500);

        } catch (e) {
            error = "Fehler beim Laden des Projekts: " + e.message;
        } finally {
            isProcessing = false;
        }
    }

    function deleteSavedProject(id, event) {
        event.stopPropagation();
        if (confirm("Dieses Projekt wirklich löschen?")) {
            savedProjects = savedProjects.filter(p => p.id !== id);
        }
    }

    // Sync overlayOpacity with graph instances dimming
    $effect(() => {
        graphInstances.forEach(instance => {
            if (instance) {
                instance.graphDimming = 1 - overlayOpacity;
                instance.render();
            }
        });
    });

    // Effect to initialize/cleanup graphs and sync transforms
    $effect(() => {
        if (step === 3 && typeof window !== 'undefined') {
            const handleZoom = (e) => {
                const newTransform = e.detail.transform;
                const sourceId = e.detail.sourceId; // Check who triggered it
                
                globalTransform = newTransform;
                
                // Update all map components with the same transform
                mapComponents.forEach(map => {
                    if (map) map.updateTransform(newTransform);
                });

                // Update all graph instances (except source)
                graphInstances.forEach(graph => {
                    if (graph && graph.canvasId !== sourceId) {
                        graph.setTransform(newTransform);
                    }
                });
            };
            
            window.addEventListener('aea-graph-zoom', handleZoom);
            
            if (showForceGraph) {
                // Ensure d3 is on window for GraphVisualization
                window.d3 = d3;
                
                // Give time for canvas to mount
                const timer = setTimeout(() => {
                    const GraphClass = GraphVisualizationModule?.default || window.GraphVisualization;
                    if (GraphClass) {
                        // Clear previous instances
                        graphInstances.forEach(g => g?.destroy());
                        graphInstances = [];

                        // Initialize one graph per result
                        const newInstances = [];
                        analysisResults.forEach((_, i) => {
                            const canvasId = `graph-canvas-${i}`;
                            const instance = new GraphClass(selectedProject, canvasId);
                            instance.graphDimming = 1 - overlayOpacity;
                            newInstances.push(instance);
                        });
                        
                        graphInstances = newInstances;
                        // Expose first instance for debugging/compatibility
                        if (graphInstances.length > 0) {
                            window.graph = graphInstances[0];
                        }
                    }
                }, 100);
                
                return () => {
                    clearTimeout(timer);
                    window.removeEventListener('aea-graph-zoom', handleZoom);
                    graphInstances.forEach(g => g?.destroy());
                    graphInstances = [];
                    window.graph = null;
                };
            }
            
            return () => {
                window.removeEventListener('aea-graph-zoom', handleZoom);
            };
        }
    });

	async function selectProject(project) {
		selectedProject = project;
        isProcessing = true;
        try {
            // Load main data
            const response = await fetch(`/data/${project}/data.json`);
            if (!response.ok) throw new Error("Projekt-Daten konnten nicht geladen werden.");
            projectData = await response.json();

            // Load simulated nodes for coordinates
            const simResponse = await fetch(`/data/${project}/simulated/nodes.json`);
            if (simResponse.ok) {
                simulatedNodes = await simResponse.json();
            } else {
                // Fallback to nodes.json
                const nodesResponse = await fetch(`/data/${project}/nodes.json`);
                if (nodesResponse.ok) {
                    simulatedNodes = await nodesResponse.json();
                } else {
                    simulatedNodes = [];
                }
            }

            step = 2;
        } catch (e) {
            error = e.message;
        } finally {
            isProcessing = false;
        }
	}

	async function handleFileSelect(fileList) {
        isProcessing = true;
        error = "";
        
        try {
            for (const file of fileList) {
                if (!file.name.endsWith(".json")) {
                    error = `Datei ${file.name} ist keine .json Datei.`;
                    continue;
                }

                const content = await file.text();
                let groupJson = JSON.parse(content);
                
                let nodesToProcess = [];
                if (Array.isArray(groupJson)) {
                    nodesToProcess = groupJson;
                } else if (groupJson && typeof groupJson === 'object') {
                    if (Array.isArray(groupJson.nodeGroups)) nodesToProcess = groupJson.nodeGroups.map(ng => ng.nodeId || ng.id);
                    else if (Array.isArray(groupJson.nodes)) nodesToProcess = groupJson.nodes;
                    else if (Array.isArray(groupJson.groups)) nodesToProcess = groupJson.groups;
                    else if (Array.isArray(groupJson.data)) nodesToProcess = groupJson.data;
                    else if (groupJson.id || groupJson.application_id) nodesToProcess = [groupJson];
                }

                if (nodesToProcess.length === 0) {
                    error = `Keine Knoten in ${file.name} gefunden.`;
                    continue;
                }

                await processDensity(nodesToProcess, file.name);
            }
        } catch (e) {
            error = "Fehler beim Lesen der Dateien: " + e.message;
        } finally {
            isProcessing = false;
        }
	}

	async function processDensity(groupJson, fileName) {
		try {
            if (simulatedNodes.length === 0) {
                error = "Keine Koordinaten-Daten für dieses Projekt geladen.";
                return;
            }

            const nodes = [];
            const nodeIds = Array.from(new Set(groupJson.map(item => {
                if (typeof item === 'string') return item.trim();
                if (typeof item === 'object' && item !== null) {
                    return (item.nodeId || item.id || item.application_id || item.code || item.name || "").toString().trim();
                }
                return "";
            }))).filter(id => id.length > 0);
            
            nodeIds.forEach(id => {
                let node = simulatedNodes.find(n => n.id === id);
                if (!node) {
                    node = simulatedNodes.find(n => 
                        n.id.includes(id) || 
                        (n.label && n.label === id) ||
                        (n.application_id && n.application_id === id)
                    );
                }
                if (!node) {
                    const lowerId = id.toLowerCase();
                    node = simulatedNodes.find(n => 
                        n.id.toLowerCase() === lowerId || 
                        (n.label && n.label.toLowerCase() === lowerId)
                    );
                }

                if (node && node.x !== undefined && node.y !== undefined) {
                    let weight = 1;
                    if (node.size) {
                        weight = node.size;
                    } else if (node.linkCount !== undefined) {
                        const baseRadius = Math.sqrt(node.linkCount) * 1.5 + 0.25;
                        weight = Math.pow(baseRadius, 2);
                    }
                    nodes.push({ id: node.id, x: node.x, y: node.y, weight: weight });
                }
            });

            if (nodes.length === 0) {
                error = `Keine passenden Knoten für ${fileName} gefunden.`;
                return;
            }

			const response = await fetch("/api/density-analysis", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					project: selectedProject,
					groups: nodes,
					options: { quality: "high" }
				})
			});

			const result = await response.json();
			if (result.success) {
				analysisResults = [...analysisResults, {
                    ...result,
                    fileName,
                    groups: nodes,
                    backgroundNodes: simulatedNodes.map(n => ({ x: n.x, y: n.y, type: n.type }))
                }];
				step = 3;
			} else {
				error = result.error || "Analyse fehlgeschlagen";
			}
		} catch (e) {
            console.error("ProcessDensity Error:", e);
			error = "Fehler bei der Verarbeitung: " + e.message;
		}
	}

    async function exportMap(index, format) {
        const map = mapComponents[index];
        if (map) {
            // Check if Force Graph is visible and get its canvas
            let graphCanvas = null;
            if (showForceGraph) {
                graphCanvas = document.getElementById(`graph-canvas-${index}`);
            }

            const data = await map.getExportData(format, graphCanvas);
            if (data) {
                const link = document.createElement('a');
                link.href = data;
                link.download = `density-map-${analysisResults[index].projectId || 'export'}-${analysisResults[index].fileName}.${format}`;
                link.click();
            }
        }
    }

    function reset() {
        step = 1;
        selectedProject = "";
        uploadFiles = [];
        analysisResults = [];
        mapComponents = [];
        error = "";
    }

    function removeResult(index) {
        analysisResults = analysisResults.filter((_, i) => i !== index);
        mapComponents = mapComponents.filter((_, i) => i !== index);
        if (analysisResults.length === 0) step = 2;
    }
</script>

<svelte:head>
	<title>Dichte-Analyse - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-6 max-w-10xl mx-auto">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Dichte-Analyse</h1>
			<p class="text-muted-foreground mt-2">
				Erstelle hochauflösende Dichtekarten basierend auf Gruppen-Positionen
			</p>
		</div>
		{#if step > 1}
			<Button variant="outline" onclick={reset}>Zurück zum Start</Button>
		{/if}
	</div>

	{#if error}
		<div class="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3">
			<AlertCircle class="size-5" />
			<p>{error}</p>
		</div>
	{/if}

	{#if step === 1}
		<div class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section class="space-y-4">
                <h2 class="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 class="size-3.5" />
                    Basis-Graph wählen
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {#each AVAILABLE_PROJECTS as project}
                        <Card 
                            class="cursor-pointer hover:border-[hsl(var(--accent-pro-100))] transition-all group"
                            onclick={() => selectProject(project)}
                        >
                            <CardHeader>
                                <CardTitle class="capitalize group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">
                                    {project}
                                </CardTitle>
                                <CardDescription>Basis-Graph für die Analyse wählen</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div class="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                                    <span class="text-xs text-muted-foreground uppercase font-black tracking-widest">Vorschau</span>
                                </div>
                            </CardContent>
                        </Card>
                    {/each}
                </div>
            </section>

            {#if savedProjects.length > 0}
                <section class="space-y-4">
                    <h2 class="text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--accent-pro-100))] flex items-center gap-2">
                        <FolderOpen class="size-3.5" />
                        Gespeicherte Analysen
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each savedProjects as project}
                            <Card 
                                class="cursor-pointer hover:border-[hsl(var(--accent-pro-100))] transition-all group relative overflow-hidden"
                                onclick={() => loadProject(project)}
                            >
                                <CardHeader class="pb-3">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <CardTitle class="text-sm font-bold group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">
                                                {project.name}
                                            </CardTitle>
                                            <CardDescription class="text-[10px]">
                                                {new Date(project.timestamp).toLocaleString()}
                                            </CardDescription>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            class="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onclick={(e) => deleteSavedProject(project.id, e)}
                                        >
                                            <Trash2 class="size-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div class="flex items-center gap-3">
                                        <div class="px-2 py-1 bg-muted rounded text-[10px] font-mono uppercase text-muted-foreground">
                                            {project.selectedProject}
                                        </div>
                                        <div class="text-[10px] text-muted-foreground">
                                            {project.analysisResults.length} Gruppen
                                        </div>
                                    </div>
                                </CardContent>
                                <div class="absolute bottom-0 left-0 h-1 bg-[hsl(var(--accent-pro-100))] w-0 group-hover:w-full transition-all duration-300"></div>
                            </Card>
                        {/each}
                    </div>
                </section>
            {/if}
		</div>
	{:else if step === 2}
		<Card class="animate-in fade-in slide-in-from-bottom-4 duration-500">
			<CardHeader>
				<CardTitle>Gruppen-Daten hochladen</CardTitle>
				<CardDescription>
					Lade die <code>group.json</code> Datei hoch, die die Knoten-Positionen enthält.
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<FileUploadStatus 
					files={uploadFiles} 
					accept=".json"
					allowMultiple={false}
					label="group.json Datei"
					onselect={handleFileSelect}
				/>

				{#if isProcessing}
					<div class="flex flex-col items-center justify-center py-12 space-y-4">
						<Loader2 class="size-12 animate-spin text-[hsl(var(--accent-pro-100))]" />
						<p class="text-sm font-medium animate-pulse">Analysiere Daten und generiere Dichtekarte...</p>
					</div>
				{/if}
			</CardContent>
		</Card>
	{:else if step === 3}
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
			<div class="lg:col-span-3 space-y-6">
                <div class="grid grid-cols-1 {analysisResults.length > 1 ? 'md:grid-cols-2' : ''} gap-6">
                    {#each analysisResults as result, i}
                        <Card class="overflow-hidden relative group/card">
                            <CardHeader class="border-b bg-muted/20 py-3 px-4 flex flex-row items-center justify-between">
                                <div class="flex flex-col">
                                    <CardTitle class="text-xs font-bold truncate max-w-[200px]">{result.fileName}</CardTitle>
                                    <span class="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedProject}</span>
                                </div>
                                <div class="flex gap-2">
                                    <div class="flex bg-muted/50 rounded-lg p-0.5">
                                        <Button variant="ghost" size="icon" class="size-7" onclick={() => exportMap(i, 'png')}>
                                            <Download class="size-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" class="size-7 text-destructive hover:text-destructive hover:bg-destructive/10" onclick={() => removeResult(i)}>
                                            <AlertCircle class="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent class="p-0 bg-slate-950 aspect-square relative">
                                <div class="absolute inset-0 z-0 pointer-events-none opacity-20">
                                    <!-- Background nodes visualization could be added here if needed -->
                                </div>

                                <DensityMap 
                                    bind:this={mapComponents[i]}
                                    data={result} 
                                    opacity={densityOpacity}
                                    type={visualizationType}
                                    weightMultiplier={weightMultiplier}
                                    weightExponent={weightExponent}
                                    options={{ 
                                        quality: 'high', 
                                        radius: densityRadius,
                                        bandwidth: contourBandwidth,
                                        thresholds: contourThresholds
                                    }} 
                                    class="relative z-10 pointer-events-none"
                                />

                                {#if showForceGraph}
                                    <div class="absolute inset-0 z-0 pointer-events-none">
                                        <canvas id="graph-canvas-{i}" class="w-full h-full pointer-events-auto"></canvas>
                                    </div>
                                {/if}

                                <div class="absolute bottom-3 right-3 z-20 pointer-events-none">
                                    <div class="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg text-[8px] text-white/40 font-mono">
                                        POINTS: {result.groups.length}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    {/each}

                    {#if analysisResults.length > 0}
                        <Card 
                            class="border-dashed flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-muted/30 transition-colors group"
                            onclick={() => step = 2}
                        >
                            <div class="size-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CheckCircle2 class="size-6 text-muted-foreground" />
                            </div>
                            <p class="text-sm font-medium">Weitere Gruppe hinzufügen</p>
                            <p class="text-xs text-muted-foreground mt-1">Lade eine weitere JSON-Datei hoch</p>
                        </Card>
                    {/if}
                </div>
			</div>

			<div class="space-y-6">
                <Card class="bg-[hsl(var(--accent-pro-100))]/5 border-[hsl(var(--accent-pro-100))]/20">
                    <CardHeader class="pb-2">
                        <CardTitle class="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--accent-pro-100))]">Globale Steuerung</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <label class="text-xs font-medium cursor-pointer" for="show-graph">Force-Graph Overlay</label>
                                <Button 
                                    variant={showForceGraph ? "default" : "outline"} 
                                    size="sm" 
                                    class="h-8 px-3"
                                    onclick={() => showForceGraph = !showForceGraph}
                                >
                                    {showForceGraph ? "Aktiv" : "Inaktiv"}
                                </Button>
                            </div>
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                class="w-full h-9 border-[hsl(var(--accent-pro-100))]/30 text-[hsl(var(--accent-pro-100))] hover:bg-[hsl(var(--accent-pro-100))] hover:text-white transition-all gap-2"
                                onclick={saveProject}
                                disabled={isSaving}
                            >
                                {#if isSaving}
                                    <Loader2 class="size-3.5 animate-spin" />
                                {:else}
                                    <Save class="size-3.5" />
                                {/if}
                                Projekt speichern
                            </Button>
                        </div>

                        {#if showForceGraph}
                            <div class="space-y-2 pt-2 border-t border-[hsl(var(--accent-pro-100))]/10">
                                <div class="flex items-center justify-between">
                                    <label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Overlay Deckkraft</label>
                                    <span class="text-[10px] font-mono">{Math.round(overlayOpacity * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.01" 
                                    bind:value={overlayOpacity}
                                    class="w-full accent-[hsl(var(--accent-pro-100))]"
                                />
                            </div>
                        {/if}
                    </CardContent>
                </Card>

				<Card>
					<CardHeader>
						<CardTitle class="text-[10px] font-black uppercase tracking-[0.2em]">Analyse-Parameter</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground" for="viz-type">Typ</label>
							</div>
							<select 
                                id="viz-type" 
                                class="w-full bg-muted/50 border-none rounded-lg text-xs p-2"
                                bind:value={visualizationType}
                            >
								<option value="hexbin">Hexbin Aggregation</option>
								<option value="voronoi">Voronoi Diagramm</option>
								<option value="delaunay">Delaunay Triangulierung</option>
								<option value="contours">Kontur-Polygone</option>
								<option value="density">Dichteschätzung (Heatmap)</option>
							</select>
						</div>

                        {#if visualizationType === 'hexbin'}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Hex-Radius</label>
                                    <span class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{densityRadius}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="2" max="50" step="1" 
                                    bind:value={densityRadius}
                                    class="w-full"
                                />
                            </div>
                        {/if}

                        {#if visualizationType === 'contours' || visualizationType === 'density'}
                             <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Bandbreite (Smooth)</label>
                                    <span class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{contourBandwidth}px</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="5" max="100" step="1" 
                                    bind:value={contourBandwidth}
                                    class="w-full"
                                />
                            </div>
                        {/if}
                        
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Multiplikator</label>
                                <span class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{weightMultiplier.toFixed(2)}x</span>
							</div>
							<input 
                                type="range" 
                                min="0.1" max="10" step="0.1" 
                                bind:value={weightMultiplier}
                                class="w-full"
                            />
						</div>

                        <div class="space-y-2">
							<div class="flex items-center justify-between">
								<label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Exponent (Wurzel)</label>
                                <span class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{weightExponent.toFixed(1)}</span>
							</div>
							<input 
                                type="range" 
                                min="1" max="5" step="0.1" 
                                bind:value={weightExponent}
                                class="w-full"
                            />
						</div>

                        <div class="space-y-2">
							<div class="flex items-center justify-between">
								<label class="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Deckkraft</label>
                                <span class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{Math.round(densityOpacity * 100)}%</span>
							</div>
							<input 
                                type="range" 
                                min="0" max="1" step="0.01" 
                                bind:value={densityOpacity}
                                class="w-full"
                            />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	{/if}
</div>

<style>
    @reference "../../../../../../app.css";

	:global(.aea-upload-root) {
		@apply border-2 border-dashed border-border rounded-2xl p-8 text-center transition-all;
	}
	:global(.aea-drop-zone.is-dragging) {
		@apply border-[hsl(var(--accent-pro-100))] bg-[hsl(var(--accent-pro-100)/0.05)];
	}
    code {
        @apply bg-muted px-1.5 py-0.5 rounded text-[hsl(var(--accent-pro-100))] font-mono;
    }
</style>
