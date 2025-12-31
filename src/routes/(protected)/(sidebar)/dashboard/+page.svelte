<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { goto } from "$app/navigation";
	import { AVAILABLE_PROJECTS } from "$config";

	import { FolderOpen, Clock, ArrowRight, Trash2 } from "lucide-svelte";
	import { onMount } from "svelte";

	let { data } = $props();
	let savedAnalyses = $state([]);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch('/api/saved-analysis');
			if (response.ok) {
				const result = await response.json();
				savedAnalyses = result.analyses || [];
			}
		} catch (e) {
			console.error("Failed to load saved analyses", e);
		} finally {
			isLoading = false;
		}
	});

	async function deleteAnalysis(id, event) {
		event.stopPropagation();
		if (!confirm("Analyse wirklich löschen?")) return;
		
		const updated = savedAnalyses.filter(a => a.id !== id);
		savedAnalyses = updated;

		try {
			await fetch('/api/saved-analysis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ analyses: updated })
			});
		} catch (e) {
			console.error("Failed to delete analysis", e);
		}
	}
</script>

<svelte:head>
	<title>Dashboard - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Dashboard</h1>
		<p class="text-muted-foreground mt-2">Willkommen zurück, {data.user.nickname}!</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<Card>
			<CardHeader>
				<CardTitle>Graph-Visualisierung</CardTitle>
				<CardDescription>
					Interaktive Netzwerk-Visualisierung für politische Anträge und Unterstützer
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto("/dashboard/graph")} class="w-full">
					Graph öffnen
				</Button>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Analyse-Tools</CardTitle>
				<CardDescription>
					Erweiterte Analyse- und Inspektionstools für Daten
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto("/dashboard/analysis")} class="w-full" variant="outline">
					Zur Analyse
				</Button>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Einstellungen</CardTitle>
				<CardDescription>
					Benutzer-Einstellungen und Präferenzen verwalten
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto("/dashboard/settings")} class="w-full" variant="outline">
					Einstellungen
				</Button>
			</CardContent>
		</Card>
	</div>

	<div class="mt-8">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-2xl font-bold">Deine gespeicherten Analysen</h2>
			{#if savedAnalyses.length > 0}
				<Button variant="ghost" size="sm" onclick={() => goto("/dashboard/analysis/density")}>
					Alle ansehen <ArrowRight class="ml-2 size-4" />
				</Button>
			{/if}
		</div>

		{#if isLoading}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each Array(3) as _}
					<Card class="animate-pulse">
						<CardHeader class="h-24 bg-muted/50"></CardHeader>
					</Card>
				{/each}
			</div>
		{:else}
			{#if savedAnalyses.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each savedAnalyses.slice(0, 3) as analysis}
						<Card 
							class="group cursor-pointer hover:border-[hsl(var(--accent-pro-100))] transition-all relative overflow-hidden"
							onclick={() => goto(`/dashboard/analysis/density?load=${analysis.id}`)}
						>
							<CardHeader>
								<div class="flex justify-between items-start">
									<div class="flex items-center gap-2 text-[hsl(var(--accent-pro-100))]">
										<FolderOpen class="size-4" />
										<span class="text-xs font-bold uppercase tracking-wider">{analysis.selectedProject}</span>
									</div>
									<Button 
										variant="ghost" 
										size="icon" 
										class="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
										onclick={(e) => deleteAnalysis(analysis.id, e)}
									>
										<Trash2 class="size-3.5" />
									</Button>
								</div>
								<CardTitle class="text-lg group-hover:text-[hsl(var(--accent-pro-100))] transition-colors">
									{analysis.name}
								</CardTitle>
								<CardDescription class="flex items-center gap-1.5">
									<Clock class="size-3" />
									{new Date(analysis.timestamp).toLocaleDateString()}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div class="text-xs text-muted-foreground">
									{analysis.analysisResults.length} Gruppe(n) analysiert
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			{:else}
				<Card class="border-dashed">
					<CardContent class="flex flex-col items-center justify-center py-12 text-center">
						<div class="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
							<FolderOpen class="size-6 text-muted-foreground" />
						</div>
						<h3 class="text-lg font-medium">Noch keine Analysen gespeichert</h3>
						<p class="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
							Erstelle deine erste Dichte-Analyse, um sie hier für den schnellen Zugriff zu speichern.
						</p>
						<Button onclick={() => goto("/dashboard/analysis/density")}>
							Analyse starten
						</Button>
					</CardContent>
				</Card>
			{/if}
		{/if}
	</div>

	<div class="mt-8">
		<h2 class="text-2xl font-bold mb-4">Verfügbare Projekte</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each AVAILABLE_PROJECTS as project}
				<Card>
					<CardHeader>
						<CardTitle class="capitalize">{project}</CardTitle>
					</CardHeader>
					<CardContent>
						<Button 
							onclick={() => goto(`/dashboard/graph?project=${project}`)} 
							class="w-full" 
							variant="outline"
						>
							Projekt öffnen
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</div>

