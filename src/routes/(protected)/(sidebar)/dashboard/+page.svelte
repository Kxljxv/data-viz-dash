<script>
	import { 
		Card, 
		Button, 
		Badge, 
		Typography 
	} from "$lib/components/aea";
	import { goto } from "$app/navigation";
	import { AVAILABLE_PROJECTS } from "$config";

	import { onMount } from "svelte";
	import { 
		IconArrowRight, 
		IconFolder, 
		IconBolt, 
		IconMap, 
		IconChartBar, 
		IconSettings 
	} from "@tabler/icons-svelte";

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
			<IconBolt size={256} />
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
					<IconArrowRight size={20} />
					Graph Visualisierung
				</Button>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		<Card interactive class="card-accent-brand">
			{#snippet header()}
				<div class="size-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 shadow-lg shadow-brand/5">
					<IconMap size={28} />
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
					<IconChartBar size={28} />
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
					<IconSettings size={28} />
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
			<IconFolder size={32} class="text-brand" />
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
							<IconArrowRight size={16} class="text-brand" />
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

