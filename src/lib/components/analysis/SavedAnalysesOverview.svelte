<script>
    import { onMount } from 'svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
    import { Button } from "$components/ui/button";
    import { Badge } from "$components/ui/badge";
    import { Loader2, Trash2, FolderOpen, Calendar, Clock, Database, BarChart2 } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let analyses = $state([]);
    let isLoading = $state(true);
    let error = $state(null);
    let isDeleting = $state(null); // ID of the analysis being deleted

    async function fetchAnalyses() {
        isLoading = true;
        error = null;
        try {
            const response = await fetch('/api/saved-analysis');
            if (!response.ok) throw new Error('Fehler beim Laden der Analysen');
            const data = await response.json();
            const serverAnalyses = data.analyses || [];
            
            // Migration/Sync Logic: Check if there's local data to sync
            const localStored = localStorage.getItem('aea_density_projects');
            if (localStored) {
                try {
                    const localAnalyses = JSON.parse(localStored);
                    if (localAnalyses.length > 0 && serverAnalyses.length === 0) {
                        console.log("Migrating local analyses to server...");
                        await syncToServer(localAnalyses);
                        analyses = localAnalyses;
                        isLoading = false;
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse local storage", e);
                }
            }

            analyses = serverAnalyses;
        } catch (e) {
            console.error(e);
            error = e.message;
        } finally {
            isLoading = false;
        }
    }

    async function syncToServer(projects) {
        try {
            await fetch('/api/saved-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analyses: projects })
            });
        } catch (e) {
            console.error("Failed to sync analyses to server", e);
        }
    }

    async function deleteAnalysis(id) {
        if (!confirm('Möchten Sie diese Analyse wirklich löschen?')) return;
        
        isDeleting = id;
        try {
            const updatedAnalyses = analyses.filter(a => a.id !== id);
            const response = await fetch('/api/saved-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analyses: updatedAnalyses })
            });

            if (!response.ok) throw new Error('Fehler beim Löschen');
            
            analyses = updatedAnalyses;
            // Sync with localStorage as well, since density page uses it as fallback
            localStorage.setItem('aea_density_projects', JSON.stringify(updatedAnalyses));
        } catch (e) {
            alert('Fehler beim Löschen: ' + e.message);
        } finally {
            isDeleting = null;
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Unbekannt';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('de-DE', {
            day: '2.digit',
            month: '2.digit',
            year: 'numeric'
        }).format(date);
    }

    function formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('de-DE', {
            hour: '2.digit',
            minute: '2.digit'
        }).format(date);
    }

    onMount(fetchAnalyses);
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold flex items-center gap-2">
            <Database class="w-5 h-5 text-primary" />
            Gespeicherte Analysen
        </h2>
        <Button variant="outline" size="sm" onclick={fetchAnalyses} disabled={isLoading}>
            {#if isLoading}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            {/if}
            Aktualisieren
        </Button>
    </div>

    {#if isLoading && analyses.length === 0}
        <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl opacity-50">
            <Loader2 class="w-8 h-8 animate-spin mb-4" />
            <p>Analysen werden geladen...</p>
        </div>
    {:else if error}
        <div class="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
            <p class="font-medium">Fehler beim Laden</p>
            <p class="text-sm opacity-80">{error}</p>
        </div>
    {:else if analyses.length === 0}
        <div class="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
            <BarChart2 class="w-12 h-12 mb-4 opacity-20" />
            <p class="font-medium">Keine gespeicherten Analysen gefunden</p>
            <p class="text-sm">Starten Sie eine Dichte-Analyse, um Ergebnisse zu speichern.</p>
            <Button variant="link" onclick={() => goto('/dashboard/analysis/density')} class="mt-2">
                Neue Analyse erstellen
            </Button>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each analyses as analysis (analysis.id)}
                <Card class="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col">
                    <CardHeader class="pb-3 bg-muted/30">
                        <div class="flex justify-between items-start gap-2">
                            <CardTitle class="text-base line-clamp-1">{analysis.name || 'Unbenannte Analyse'}</CardTitle>
                            <Badge variant="secondary" class="text-[10px] uppercase tracking-wider font-bold">
                                {analysis.selectedProject || 'Kein Projekt'}
                            </Badge>
                        </div>
                        <CardDescription class="flex items-center gap-3 text-[10px]">
                            <span class="flex items-center gap-1">
                                <Calendar class="w-3 h-3" />
                                {formatDate(analysis.timestamp)}
                            </span>
                            <span class="flex items-center gap-1">
                                <Clock class="w-3 h-3" />
                                {formatTime(analysis.timestamp)}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="pt-4 flex-grow flex flex-col">
                        <div class="flex flex-wrap gap-2 mb-4">
                            {#if analysis.analysisResults}
                                <Badge variant="outline" class="text-[10px]">
                                    {analysis.analysisResults.length} Fenster
                                </Badge>
                            {/if}
                            {#if analysis.parameters?.visualizationType}
                                <Badge variant="outline" class="text-[10px]">
                                    {analysis.parameters.visualizationType}
                                </Badge>
                            {/if}
                        </div>
                        
                        <div class="mt-auto flex gap-2">
                            <Button 
                                size="sm" 
                                class="flex-grow gap-2" 
                                onclick={() => goto(`/dashboard/analysis/density?load=${analysis.id}`)}
                            >
                                <FolderOpen class="w-4 h-4" />
                                Öffnen
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                class="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                onclick={() => deleteAnalysis(analysis.id)}
                                disabled={isDeleting === analysis.id}
                            >
                                {#if isDeleting === analysis.id}
                                    <Loader2 class="w-4 h-4 animate-spin" />
                                {:else}
                                    <Trash2 class="w-4 h-4" />
                                {/if}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    {/if}
</div>
