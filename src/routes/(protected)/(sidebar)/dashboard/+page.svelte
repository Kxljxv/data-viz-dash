<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { Badge } from "$components/ui/badge";
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

<div class="space-y-12 pb-12">
	<div class="relative overflow-hidden rounded-[2.5rem] bg-card border border-border/40 p-8 md:p-12 shadow-2xl shadow-primary/5">
		<div class="absolute top-0 right-0 p-8 opacity-5">
			<svg xmlns="http://www.w3.org/2000/svg" class="size-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		</div>
		<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest mb-4">
					<div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
					System Online
				</div>
				<h1 class="text-4xl md:text-5xl font-black tracking-tight mb-3 italic">
					Hallo, {data.user.nickname.split(' ')[0]}!
				</h1>
				<p class="text-muted-foreground text-lg max-w-xl">
					Willkommen in deinem AEA Analyse-Dashboard. Hier hast du Zugriff auf alle Visualisierungen und Tools.
				</p>
			</div>
			<div class="flex flex-col sm:flex-row gap-4">
				<Button onclick={() => goto("/dashboard/graph")} size="lg" class="rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-primary/20 text-base font-bold">
					<ArrowRight class="size-5" />
					Graph Visualisierung
				</Button>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		<Card class="group hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm rounded-[2.5rem] border-border/40 overflow-hidden relative">
			<div class="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
			<CardHeader class="pb-6 p-8">
				<div class="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-primary/5">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
					</svg>
				</div>
				<CardTitle class="text-2xl font-black italic mb-2 tracking-tight">Graph-Visualisierung</CardTitle>
				<CardDescription class="text-base leading-relaxed font-medium text-muted-foreground/80">
					Interaktive Netzwerk-Visualisierung für politische Anträge und Unterstützer.
				</CardDescription>
			</CardHeader>
			<CardContent class="px-8 pb-8">
				<Button onclick={() => goto("/dashboard/graph")} variant="secondary" class="w-full h-12 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] shadow-sm">
					Zum Graph Starten
				</Button>
			</CardContent>
		</Card>

		<Card class="group hover:border-[hsl(var(--accent-pro-100))]/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-accent/10 bg-card/50 backdrop-blur-sm rounded-[2.5rem] border-border/40 overflow-hidden relative">
			<div class="absolute top-0 right-0 w-40 h-40 bg-[hsl(var(--accent-pro-100))]/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
			<CardHeader class="pb-6 p-8">
				<div class="size-14 rounded-2xl bg-[hsl(var(--accent-pro-100))]/10 text-[hsl(var(--accent-pro-100))] flex items-center justify-center mb-6 group-hover:bg-[hsl(var(--accent-pro-100))] group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg shadow-accent/5">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<CardTitle class="text-2xl font-black italic mb-2 tracking-tight">Analyse-Tools</CardTitle>
				<CardDescription class="text-base leading-relaxed font-medium text-muted-foreground/80">
					Erweiterte Analyse- und Inspektionstools für tiefe Dateneinblicke.
				</CardDescription>
			</CardHeader>
			<CardContent class="px-8 pb-8">
				<Button onclick={() => goto("/dashboard/analysis")} variant="secondary" class="w-full h-12 rounded-2xl group-hover:bg-[hsl(var(--accent-pro-100))] group-hover:text-white transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] shadow-sm">
					Zur Analyse Öffnen
				</Button>
			</CardContent>
		</Card>

		<Card class="group hover:border-foreground/20 transition-all duration-500 shadow-sm hover:shadow-2xl bg-card/50 backdrop-blur-sm rounded-[2.5rem] border-border/40 overflow-hidden relative">
			<div class="absolute top-0 right-0 w-40 h-40 bg-foreground/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
			<CardHeader class="pb-6 p-8">
				<div class="size-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/5">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<CardTitle class="text-2xl font-black italic mb-2 tracking-tight">Einstellungen</CardTitle>
				<CardDescription class="text-base leading-relaxed font-medium text-muted-foreground/80">
					Passe dein Profil und deine Präferenzen für die Nutzung an.
				</CardDescription>
			</CardHeader>
			<CardContent class="px-8 pb-8">
				<Button onclick={() => goto("/dashboard/settings")} variant="secondary" class="w-full h-12 rounded-2xl group-hover:bg-foreground group-hover:text-background transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] shadow-sm">
					Einstellungen Verwalten
				</Button>
			</CardContent>
		</Card>
	</div>

	<div class="mt-16">
		<div class="flex items-center gap-3 mb-8 italic">
			<FolderOpen class="size-8 text-primary" />
			<h2 class="text-3xl font-black italic">Verfügbare Projekte</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each AVAILABLE_PROJECTS as project}
				<Card 
					class="group hover:bg-card hover:border-primary/40 transition-all cursor-pointer border-border/40 shadow-sm hover:shadow-xl rounded-[2rem] bg-card/30 backdrop-blur-sm overflow-hidden relative" 
					onclick={() => goto(`/dashboard/graph?project=${project}`)}
				>
					<div class="absolute bottom-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
						<FolderOpen class="size-24" />
					</div>
					<CardHeader class="p-6">
						<CardTitle class="capitalize text-xl font-black group-hover:text-primary transition-colors flex items-center justify-between">
							{project}
							<div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all">
								<ArrowRight class="size-4 text-primary" />
							</div>
						</CardTitle>
						<CardDescription class="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-2">
							Netzwerk-Datenbank
						</CardDescription>
					</CardHeader>
				</Card>
			{/each}
		</div>
	</div>
</div>

