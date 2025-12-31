<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import { Badge } from "$components/ui/badge";
	import { Separator } from "$components/ui/separator";
	import { Table, TableBody, TableCell, TableHead, TableRow } from "$components/ui/table";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { 
		Users, 
		BarChart3, 
		Activity, 
		Map, 
		Loader2, 
		ArrowUpRight,
		UserCheck,
		Database
	} from "lucide-svelte";

	let { data } = $props();
	
	let stats = $state(null);
	let isLoading = $state(true);
	let error = $state(null);

	async function fetchStats() {
		isLoading = true;
		try {
			const response = await fetch('/api/admin/stats');
			if (!response.ok) throw new Error('Fehler beim Laden der Statistiken');
			stats = await response.json();
		} catch (e) {
			error = e.message;
		} finally {
			isLoading = false;
		}
	}

	function formatDate(dateString) {
		if (!dateString) return 'Nie';
		return new Intl.DateTimeFormat('de-DE', {
			day: '2.digit',
			month: '2.digit',
			year: 'numeric',
			hour: '2.digit',
			minute: '2.digit'
		}).format(new Date(dateString));
	}

	onMount(fetchStats);
</script>

<svelte:head>
	<title>Admin Dashboard - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-8 pb-12">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
			<p class="text-muted-foreground mt-1">Detaillierte Nutzungsstatistiken und Plattform-Verwaltung</p>
		</div>
		<Button onclick={fetchStats} variant="outline" size="sm" disabled={isLoading} class="gap-2">
			{#if isLoading}
				<Loader2 class="w-4 h-4 animate-spin" />
			{/if}
			Daten aktualisieren
		</Button>
	</div>

	{#if isLoading && !stats}
		<div class="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl opacity-50">
			<Loader2 class="w-12 h-12 animate-spin mb-4 text-primary" />
			<p class="text-lg font-medium">Statistiken werden berechnet...</p>
		</div>
	{:else if error}
		<div class="p-6 bg-destructive/10 text-destructive rounded-3xl border border-destructive/20 max-w-2xl">
			<h2 class="text-lg font-semibold flex items-center gap-2 mb-2">
				<Activity class="w-5 h-5" />
				Fehler beim Laden
			</h2>
			<p class="text-sm opacity-80">{error}</p>
			<Button onclick={fetchStats} variant="outline" class="mt-4 border-destructive/30 hover:bg-destructive/10">Erneut versuchen</Button>
		</div>
	{:else}
		<!-- Quick Stats Summary -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card class="bg-primary/5 border-primary/10">
				<CardHeader class="pb-2">
					<CardDescription class="text-xs uppercase tracking-wider font-bold">Gesamt-Nutzer</CardDescription>
					<CardTitle class="text-3xl font-black flex items-center justify-between">
						{stats.summary.totalUsers}
						<Users class="w-6 h-6 text-primary opacity-50" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card class="bg-[hsl(var(--accent-pro-100)/0.05)] border-[hsl(var(--accent-pro-100)/0.1)]">
				<CardHeader class="pb-2">
					<CardDescription class="text-xs uppercase tracking-wider font-bold text-[hsl(var(--accent-pro-100))]">Aktive Nutzer (7 Tage)</CardDescription>
					<CardTitle class="text-3xl font-black flex items-center justify-between text-[hsl(var(--accent-pro-100))]">
						{stats.summary.activeUsersLast7Days}
						<UserCheck class="w-6 h-6 opacity-50" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card class="bg-orange-500/5 border-orange-500/10">
				<CardHeader class="pb-2">
					<CardDescription class="text-xs uppercase tracking-wider font-bold text-orange-600">Gespeicherte Analysen</CardDescription>
					<CardTitle class="text-3xl font-black flex items-center justify-between text-orange-600">
						{stats.summary.totalAnalyses}
						<BarChart3 class="w-6 h-6 opacity-50" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card class="bg-blue-500/5 border-blue-500/10">
				<CardHeader class="pb-2">
					<CardDescription class="text-xs uppercase tracking-wider font-bold text-blue-600">KV Verteilung</CardDescription>
					<CardTitle class="text-3xl font-black flex items-center justify-between text-blue-600">
						{Object.keys(stats.kvDistribution).length}
						<Map class="w-6 h-6 opacity-50" />
					</CardTitle>
				</CardHeader>
			</Card>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
			<!-- User Table -->
			<div class="lg:col-span-2 space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold flex items-center gap-2">
						<Users class="w-5 h-5 text-primary" />
						Nutzer-Details
					</h2>
					<Badge variant="outline" class="font-mono text-[10px]">{stats.users.length} Profile</Badge>
				</div>
				<Card class="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
					<div class="overflow-x-auto custom-scrollbar">
						<Table>
							<thead>
								<TableRow class="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
										<TableHead class="text-[10px] uppercase font-bold py-4 px-6 whitespace-nowrap">Nutzer</TableHead>
										<TableHead class="text-[10px] uppercase font-bold py-4 px-6 whitespace-nowrap">Kreisverband</TableHead>
										<TableHead class="text-[10px] uppercase font-bold py-4 px-6 text-center whitespace-nowrap">Analysen</TableHead>
										<TableHead class="text-[10px] uppercase font-bold py-4 px-6 whitespace-nowrap">Zuletzt Aktiv</TableHead>
									</TableRow>
								</thead>
								<TableBody>
									{#each stats.users as user}
										<TableRow class="group hover:bg-primary/5 transition-colors border-b border-border/40 last:border-0">
											<TableCell class="py-5 px-6">
												<div class="flex items-center gap-3 max-w-[280px]">
													<div class="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
														{user.fullName ? user.fullName[0].toUpperCase() : '?'}
													</div>
													<div class="flex flex-col min-w-0 overflow-hidden">
														<span class="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors leading-tight" title={user.fullName}>{user.fullName}</span>
														<span class="text-[10px] text-muted-foreground font-mono opacity-60 tracking-tighter truncate" title={user.userId}>{user.userId}</span>
													</div>
												</div>
											</TableCell>
											<TableCell class="px-6">
												<div class="flex items-center max-w-[150px]">
													<Badge variant="secondary" class="text-[10px] font-black uppercase tracking-widest bg-secondary/30 border-secondary/20 text-secondary-foreground hover:bg-secondary/50 transition-colors px-2 py-0.5 rounded-md truncate block w-full text-center" title={user.kreisverband}>
														{user.kreisverband}
													</Badge>
												</div>
											</TableCell>
										<TableCell class="text-center px-6">
											<div class="inline-flex items-center justify-center">
												<span class="font-mono font-black text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{user.analysisCount}</span>
											</div>
										</TableCell>
										<TableCell class="text-xs text-muted-foreground px-6 whitespace-nowrap">
											<div class="flex items-center gap-2.5">
												<div class="relative flex h-2 w-2">
													{#if new Date(user.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
														<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
													{/if}
													<span class="relative inline-flex rounded-full h-2 w-2 {new Date(user.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'bg-success' : 'bg-muted-foreground/30'}"></span>
												</div>
												<span class="font-medium tracking-tight">{formatDate(user.lastActive)}</span>
											</div>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</Card>
			</div>

			<!-- KV Distribution List -->
			<div class="space-y-4">
				<h2 class="text-xl font-bold flex items-center gap-2">
					<Map class="w-5 h-5 text-primary" />
					Kreisverbände
				</h2>
				<Card class="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
					<CardContent class="p-0">
						<div class="divide-y divide-border/40">
							{#each Object.entries(stats.kvDistribution).sort((a, b) => b[1] - a[1]) as [kv, count]}
								<div class="flex items-center justify-between p-4 group hover:bg-primary/5 transition-colors">
									<span class="text-sm font-medium">{kv}</span>
									<div class="flex items-center gap-3">
										<div class="h-1.5 w-24 bg-muted rounded-full overflow-hidden hidden sm:block">
											<div 
												class="h-full bg-primary" 
												style="width: {(count / stats.summary.totalUsers) * 100}%"
											></div>
										</div>
										<Badge class="min-w-[2.5rem] justify-center font-black">{count}</Badge>
									</div>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>

				<Card class="mt-8 border-primary/20 bg-primary/5 border-dashed">
					<CardHeader>
						<CardTitle class="text-sm flex items-center gap-2">
							<Database class="w-4 h-4" />
							Daten-Integrität
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-[11px] text-muted-foreground leading-relaxed">
							Die Statistiken werden in Echtzeit aus dem Cloudflare KV-Speicher berechnet. 
							Nur Nutzer mit abgeschlossener Onboarding-Profilierung werden hier aufgeführt.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	{/if}

	<!-- Legacy Section -->
	<Separator class="my-12" />
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 grayscale-[0.5] pointer-events-none">
		<Card>
			<CardHeader>
				<CardTitle>Benutzer-Verwaltung</CardTitle>
				<CardDescription>Zugriffsrechte und Rollen (In Kürze)</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="outline" class="w-full">Legacy-Ansicht</Button>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Daten-Konfiguration</CardTitle>
				<CardDescription>Projekt-Zuweisung (In Kürze)</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="outline" class="w-full">Legacy-Ansicht</Button>
			</CardContent>
		</Card>
	</div>
</div>

