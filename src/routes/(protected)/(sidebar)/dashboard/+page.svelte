<script>
	import { 
		Card, 
		Button, 
		Badge, 
		Typography 
	} from "$lib/components/aea";
	import { goto } from "$app/navigation";
	import { AVAILABLE_PROJECTS } from "$config";

	import { FolderOpen, ArrowRight } from "lucide-svelte";
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
</script>

<svelte:head>
	<title>Dashboard - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-12 pb-12">
	<div class="card-glass p-8 md:p-12 relative overflow-hidden rounded-[2.5rem]">
		<div class="absolute top-0 right-0 p-8 opacity-5">
			<svg xmlns="http://www.w3.org/2000/svg" class="size-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
		</div>
		<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
			<div>
				<Badge variant="outline" class="mb-4 text-brand border-brand/20 bg-brand/5">
					<div class="h-1.5 w-1.5 rounded-full bg-brand animate-pulse mr-2"></div>
					System Online
				</Badge>
				<Typography tag="h1" variant="display" class="mb-3 text-white">
					Hallo, {data.user.nickname.split(' ')[0]}!
				</Typography>
				<Typography variant="body" class="text-lg opacity-70 max-w-xl">
					Willkommen in deinem AEA Analyse-Dashboard. Hier hast du Zugriff auf alle Visualisierungen und Tools.
				</Typography>
			</div>
			<div class="flex flex-col sm:flex-row gap-4">
				<Button onclick={() => goto("/dashboard/graph")} variant="primary" size="lg" class="rounded-2xl gap-2 h-14 px-8 shadow-xl shadow-brand/20">
					<ArrowRight class="size-5" />
					Graph Visualisierung
				</Button>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		<Card interactive class="card-accent-brand">
			{#snippet header()}
				<div class="size-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 shadow-lg shadow-brand/5">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
					</svg>
				</div>
				<Typography variant="h3" class="mb-2 text-white">Graph-Visualisierung</Typography>
			{/snippet}
			<Typography variant="body" class="text-sm opacity-60 leading-relaxed">
				Interaktive Netzwerk-Visualisierung für politische Anträge und Unterstützer.
			</Typography>
			{#snippet footer()}
				<Button onclick={() => goto("/dashboard/graph")} variant="secondary" class="w-full">
					Zum Graph Starten
				</Button>
			{/snippet}
		</Card>

		<Card interactive class="card-accent-brand">
			{#snippet header()}
				<div class="size-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 shadow-lg shadow-brand/5">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<Typography variant="h3" class="mb-2 text-white">Analyse-Tools</Typography>
			{/snippet}
			<Typography variant="body" class="text-sm opacity-60 leading-relaxed">
				Erweiterte Analyse- und Inspektionstools für tiefe Dateneinblicke.
			</Typography>
			{#snippet footer()}
				<Button onclick={() => goto("/dashboard/analysis")} variant="secondary" class="w-full">
					Zur Analyse Öffnen
				</Button>
			{/snippet}
		</Card>

		<Card interactive>
			{#snippet header()}
				<div class="size-14 rounded-2xl bg-white/5 text-white flex items-center justify-center mb-6 shadow-lg shadow-white/5">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<Typography variant="h3" class="mb-2 text-white">Einstellungen</Typography>
			{/snippet}
			<Typography variant="body" class="text-sm opacity-60 leading-relaxed">
				Passe dein Profil und deine Präferenzen für die Nutzung an.
			</Typography>
			{#snippet footer()}
				<Button onclick={() => goto("/dashboard/settings")} variant="secondary" class="w-full">
					Einstellungen Verwalten
				</Button>
			{/snippet}
		</Card>
	</div>

	<div class="mt-16">
		<div class="flex items-center gap-3 mb-8">
			<FolderOpen class="size-8 text-brand" />
			<Typography variant="h2" class="text-white">Verfügbare Projekte</Typography>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each AVAILABLE_PROJECTS as project}
				<Card 
					interactive 
					class="card-glass"
					onclick={() => goto(`/dashboard/graph?project=${project}`)}
				>
					{#snippet header()}
						<Typography variant="h3" class="capitalize text-white flex items-center justify-between">
							{project}
							<ArrowRight class="size-4 text-brand" />
						</Typography>
					{/snippet}
					<Typography variant="label" class="text-[10px] opacity-40">
						Netzwerk-Datenbank
					</Typography>
				</Card>
			{/each}
		</div>
	</div>
</div>

