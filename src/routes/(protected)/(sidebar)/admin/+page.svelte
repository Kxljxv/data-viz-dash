<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { goto } from "$app/navigation";

	let { data } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Admin Dashboard</h1>
		<p class="text-muted-foreground mt-2">Verwaltung und Konfiguration der Plattform</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<Card>
			<CardHeader>
				<CardTitle>Benutzer-Verwaltung</CardTitle>
				<CardDescription>
					Verwalte Benutzer und deren Zugriffsrechte
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={() => goto("/admin/users")} class="w-full">
					Benutzer verwalten
				</Button>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>System-Status</CardTitle>
				<CardDescription>
					Übersicht über System-Status und Metriken
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Status: <span class="text-green-500">Online</span>
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Daten-Verwaltung</CardTitle>
				<CardDescription>
					Verwalte Projektdaten und Konfigurationen
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Daten-Verwaltung wird in einer zukünftigen Version verfügbar sein.
				</p>
			</CardContent>
		</Card>
	</div>
</div>

