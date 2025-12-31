<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { goto } from "$app/navigation";

	let { data } = $props();
</script>

<svelte:head>
	<title>Analyse - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Analyse-Tools</h1>
		<p class="text-muted-foreground mt-2">Erweiterte Analyse- und Inspektionstools für die Daten</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Card>
			<CardHeader>
				<CardTitle>Daten-Inspektion</CardTitle>
				<CardDescription>
					Detaillierte Inspektion der Graph-Daten und Metadaten
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto("/dashboard/graph")} class="w-full">
					Zur Graph-Visualisierung
				</Button>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Statistiken</CardTitle>
				<CardDescription>
					Übersicht über Knoten, Verbindungen und Projekte
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Statistiken werden in der Graph-Visualisierung angezeigt.
				</p>
			</CardContent>
		</Card>

		<Card class="border-[hsl(var(--accent-pro-100)/0.2)] bg-[hsl(var(--accent-pro-100)/0.02)]">
			<CardHeader>
				<CardTitle class="text-[hsl(var(--accent-pro-100))]">Dichte-Analyse</CardTitle>
				<CardDescription>
					Erweiterte Dichtekarten-Visualisierung basierend auf Gruppen-Daten
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto("/dashboard/analysis/density")} class="w-full bg-[hsl(var(--accent-pro-100))] hover:bg-[hsl(var(--accent-pro-100)/0.9)] text-white">
					Dichte-Analyse starten
				</Button>
			</CardContent>
		</Card>
	</div>
</div>

