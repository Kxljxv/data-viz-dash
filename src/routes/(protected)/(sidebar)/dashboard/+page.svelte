<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { goto } from "$app/navigation";
	import { AVAILABLE_PROJECTS } from "$config";

	let { data } = $props();
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

