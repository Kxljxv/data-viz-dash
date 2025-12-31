<script>
	import { onMount } from 'svelte';
	import { 
		Card, 
		CardContent, 
		CardDescription, 
		CardHeader, 
		CardTitle,
		Button,
		Typography
	} from "$lib/components/aea";

	let { data } = $props();

	let settings = $state({
		theme: 'dark',
		font: 'modern_dense',
		notifications: true
	});

	onMount(() => {
		// Load settings from localStorage
		const stored = localStorage.getItem('aea-settings');
		if (stored) {
			try {
				settings = { ...settings, ...JSON.parse(stored) };
			} catch (e) {
				console.error('Error loading settings:', e);
			}
		}
	});

	function saveSettings() {
		localStorage.setItem('aea-settings', JSON.stringify(settings));
		alert('Einstellungen gespeichert!');
	}
</script>

<svelte:head>
	<title>Einstellungen - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<Typography tag="h1" variant="h1">Einstellungen</Typography>
		<Typography variant="body" class="text-muted-foreground mt-2">Verwalte deine Benutzer-Präferenzen</Typography>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Card variant="glass">
			<CardHeader>
				<CardTitle>Benutzer-Informationen</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<Typography variant="label" class="text-sm font-medium">E-Mail</Typography>
					<Typography variant="body" class="text-sm text-muted-foreground">{data.user.email}</Typography>
				</div>
				<div>
					<Typography variant="label" class="text-sm font-medium">Name</Typography>
					<Typography variant="body" class="text-sm text-muted-foreground">{data.user.nickname}</Typography>
				</div>
				<div>
					<Typography variant="label" class="text-sm font-medium">Rolle</Typography>
					<Typography variant="body" class="text-sm text-muted-foreground capitalize">{data.user.role}</Typography>
				</div>
			</CardContent>
		</Card>

		<Card variant="glass">
			<CardHeader>
				<CardTitle>Präferenzen</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<Typography variant="label" class="text-sm font-medium">Theme</Typography>
					<Typography variant="body" class="text-sm text-muted-foreground">Dark Mode (Standard)</Typography>
				</div>
				<div>
					<Typography variant="label" class="text-sm font-medium">Schriftart</Typography>
					<Typography variant="body" class="text-sm text-muted-foreground capitalize">{settings.font}</Typography>
				</div>
				<Button onclick={saveSettings} class="w-full mt-4">
					Einstellungen speichern
				</Button>
			</CardContent>
		</Card>
	</div>
</div>

