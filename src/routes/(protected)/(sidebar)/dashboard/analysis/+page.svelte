<script>
	import { 
		Card, 
		CardContent, 
		CardDescription, 
		CardHeader, 
		CardTitle,
		Button,
		Typography
	} from "$lib/components/aea";
	import { goto } from "$app/navigation";
	import SavedAnalysesOverview from "$components/analysis/SavedAnalysesOverview.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Analyse - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col gap-1">
		<Typography tag="h1" variant="h1">Analyse-Tools</Typography>
		<Typography variant="body" class="text-muted-foreground">Erweiterte Analyse- und Inspektionstools für die Daten</Typography>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<Card variant="glass" class="flex flex-col">
			<CardHeader>
				<CardTitle>Daten-Inspektion</CardTitle>
				<CardDescription>
					Detaillierte Inspektion der Graph-Daten und Metadaten
				</CardDescription>
			</CardHeader>
			<CardContent class="mt-auto">
				<Button onclick={() => goto("/dashboard/graph")} class="w-full" variant="secondary">
					Zur Graph-Visualisierung
				</Button>
			</CardContent>
		</Card>

		<Card variant="glass" class="flex flex-col border-[hsl(var(--accent-pro-100)/0.2)] bg-[hsl(var(--accent-pro-100)/0.02)]">
			<CardHeader>
				<CardTitle class="text-[hsl(var(--accent-pro-100))]">Dichte-Analyse</CardTitle>
				<CardDescription>
					Erweiterte Dichtekarten-Visualisierung basierend auf Gruppen-Daten
				</CardDescription>
			</CardHeader>
			<CardContent class="mt-auto">
				<Button onclick={() => goto("/dashboard/analysis/density")} class="w-full bg-[hsl(var(--accent-pro-100))] hover:bg-[hsl(var(--accent-pro-100)/0.9)] text-white">
					Neue Analyse starten
				</Button>
			</CardContent>
		</Card>

		<Card variant="glass" class="flex flex-col opacity-60 grayscale-[0.5]">
			<CardHeader>
				<CardTitle>Statistiken</CardTitle>
				<CardDescription>
					Übersicht über Knoten, Verbindungen und Projekte (Demnächst)
				</CardDescription>
			</CardHeader>
			<CardContent class="mt-auto text-center py-4">
				<Typography variant="body" class="text-xs text-muted-foreground italic">
					Derzeit in die Graph-Visualisierung integriert.
				</Typography>
			</CardContent>
		</Card>
	</div>

	<div class="pt-4 border-t border-border/50">
		<SavedAnalysesOverview />
	</div>
</div>

