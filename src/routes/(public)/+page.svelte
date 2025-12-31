<script>
	import { WEBSITE_NAME, WEBSITE_DESCRIPTION } from "$config";
	import { Button, Card, Separator, Typography, Badge } from "$lib/components/aea";
	import { goto } from "$app/navigation";
</script>

<svelte:head>
	<title>{WEBSITE_NAME}</title>
	<meta name="description" content={WEBSITE_DESCRIPTION} />
</svelte:head>

<div class="min-h-screen bg-background font-modern">
	<!-- Hero Section -->
	<section class="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden">
		<!-- Background Glow -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px] pointer-events-none"></div>
		
		<div class="max-w-4xl mx-auto text-center space-y-8 relative z-10">
			<Badge variant="outline" class="mb-4 text-brand border-brand/20 bg-brand/5">
				AEA ANALYTICS SYSTEM v2.0
			</Badge>
			
			<Typography tag="h1" variant="display" class="text-white leading-tight">
				Interaktive Netzwerk-Visualisierung
				<span class="text-brand"> für politische Daten</span>
			</Typography>
			
			<Typography variant="body" class="text-xl opacity-70 max-w-2xl mx-auto">
				{WEBSITE_DESCRIPTION}
			</Typography>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
				<Button variant="primary" size="lg" onclick={() => goto("/sign-in")}>
					Systemzugang
				</Button>
				<Button variant="outline" size="lg" onclick={() => goto("/docs")}>
					Dokumentation
				</Button>
			</div>
		</div>
	</section>

	<div class="container mx-auto px-4">
		<Separator />
	</div>

	<!-- Features Section -->
	<section class="container mx-auto px-4 py-24">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-16">
				<Typography tag="h2" variant="h1" class="text-white mb-4">Plattform-Features</Typography>
				<Typography variant="body" class="opacity-40">Moderne Tools für komplexe Datenanalysen</Typography>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				<Card interactive class="card-glass">
					{#snippet header()}
						<Typography variant="h3" class="text-white">Interaktive Visualisierung</Typography>
						<Typography variant="label" class="opacity-40 text-[10px]">Visualisierung</Typography>
					{/snippet}
					<Typography variant="body" class="text-sm opacity-60">
						Erkunde komplexe Netzwerke zwischen Anträgen und Unterstützern mit einer leistungsstarken Canvas-basierten Visualisierung.
					</Typography>
				</Card>

				<Card interactive class="card-glass">
					{#snippet header()}
						<Typography variant="h3" class="text-white">Analyse-Tools</Typography>
						<Typography variant="label" class="opacity-40 text-[10px]">Analyse</Typography>
					{/snippet}
					<Typography variant="body" class="text-sm opacity-60">
						Analysiere Daten mit detaillierten Inspektionstools, Filtern und Suchfunktionen für maximale Präzision.
					</Typography>
				</Card>

				<Card interactive class="card-glass">
					{#snippet header()}
						<Typography variant="h3" class="text-white">Gruppen-Management</Typography>
						<Typography variant="label" class="opacity-40 text-[10px]">Management</Typography>
					{/snippet}
					<Typography variant="body" class="text-sm opacity-60">
						Erstelle und verwalte benutzerdefinierte Gruppen von Knoten für gezielte Analysen und Vergleiche.
					</Typography>
				</Card>

				<Card interactive class="card-glass">
					{#snippet header()}
						<Typography variant="h3" class="text-white">Daten-Export</Typography>
						<Typography variant="label" class="opacity-40 text-[10px]">Export</Typography>
					{/snippet}
					<Typography variant="body" class="text-sm opacity-60">
						Exportiere deine Gruppen und Analyseergebnisse für die weitere Verarbeitung in externen Tools.
					</Typography>
				</Card>

				<Card interactive class="card-glass">
					{#snippet header()}
						<Typography variant="h3" class="text-white">Multi-Projekt</Typography>
						<Typography variant="label" class="opacity-40 text-[10px]">Projekte</Typography>
					{/snippet}
					<Typography variant="body" class="text-sm opacity-60">
						Vollständige Unterstützung für verschiedene Konferenzen und Projekte wie BDK, LA und LDK.
					</Typography>
				</Card>

				<Card interactive class="card-glass">
					{#snippet header()}
						<Typography variant="h3" class="text-white">Modernes Interface</Typography>
						<Typography variant="label" class="opacity-40 text-[10px]">Design</Typography>
					{/snippet}
					<Typography variant="body" class="text-sm opacity-60">
						Optimiert für Desktop und Mobile mit einem modernen, technischen und zugänglichen Designsystem.
					</Typography>
				</Card>
			</div>
		</div>
	</section>
</div>

