<script>
	import { WEBSITE_NAME, WEBSITE_DESCRIPTION } from "$config";
	import { Button } from "$components/ui/button";
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Separator } from "$components/ui/separator";
	import { goto } from "$app/navigation";
</script>

<svelte:head>
	<title>{WEBSITE_NAME}</title>
	<meta name="description" content={WEBSITE_DESCRIPTION} />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Hero Section -->
	<section class="container mx-auto px-4 py-20 md:py-32">
		<div class="max-w-4xl mx-auto text-center space-y-8">
			<h1 class="text-4xl md:text-6xl font-bold tracking-tight">
				Interaktive Netzwerk-Visualisierung
				<span class="text-primary"> für politische Daten</span>
			</h1>
			<p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
				{WEBSITE_DESCRIPTION}
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<Button size="lg" onclick={() => goto("/sign-in")}>
					Jetzt anmelden
				</Button>
			</div>
		</div>
	</section>

	<Separator />

	<!-- Features Section -->
	<section class="container mx-auto px-4 py-20">
		<div class="max-w-6xl mx-auto">
			<h2 class="text-3xl md:text-4xl font-bold text-center mb-12">
				Plattform-Features
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Interaktive Graph-Visualisierung</CardTitle>
						<CardDescription>
							Erkunde komplexe Netzwerke zwischen Anträgen und Unterstützern mit einer leistungsstarken Canvas-basierten Visualisierung.
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Erweiterte Analyse-Tools</CardTitle>
						<CardDescription>
							Analysiere Daten mit detaillierten Inspektionstools, Filtern und Suchfunktionen.
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Gruppen-Management</CardTitle>
						<CardDescription>
							Erstelle und verwalte benutzerdefinierte Gruppen von Knoten für gezielte Analysen.
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Export-Funktionen</CardTitle>
						<CardDescription>
							Exportiere deine Gruppen und Analysen für weitere Verarbeitung.
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Mehrere Projekte</CardTitle>
						<CardDescription>
							Unterstützung für verschiedene Konferenzen und Projekte (BDK, LA, LDK).
						</CardDescription>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Responsive Design</CardTitle>
						<CardDescription>
							Optimiert für Desktop und Mobile mit modernem, zugänglichem Design.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		</div>
	</section>
</div>

