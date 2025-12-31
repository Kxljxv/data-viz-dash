<script>
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";

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
		<h1 class="text-3xl font-bold">Einstellungen</h1>
		<p class="text-muted-foreground mt-2">Verwalte deine Benutzer-Präferenzen</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Card>
			<CardHeader>
				<CardTitle>Benutzer-Informationen</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<label class="text-sm font-medium">E-Mail</label>
					<p class="text-sm text-muted-foreground">{data.user.email}</p>
				</div>
				<div>
					<label class="text-sm font-medium">Name</label>
					<p class="text-sm text-muted-foreground">{data.user.nickname}</p>
				</div>
				<div>
					<label class="text-sm font-medium">Rolle</label>
					<p class="text-sm text-muted-foreground capitalize">{data.user.role}</p>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Präferenzen</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<label class="text-sm font-medium">Theme</label>
					<p class="text-sm text-muted-foreground">Dark Mode (Standard)</p>
				</div>
				<div>
					<label class="text-sm font-medium">Schriftart</label>
					<p class="text-sm text-muted-foreground capitalize">{settings.font}</p>
				</div>
				<Button onclick={saveSettings} class="w-full">
					Einstellungen speichern
				</Button>
			</CardContent>
		</Card>
	</div>
</div>

