<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth } from '$lib/auth/client.svelte';
	import { Button } from '$components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$components/ui/card';

	let { data } = $props();
	let error = $state(null);

	onMount(() => {
		auth.init();

		// Check for error in URL
		const urlParams = new URLSearchParams(window.location.search);
		const errorParam = urlParams.get('error');
		if (errorParam) {
			switch (errorParam) {
				case 'no_access':
					error = 'Dein Account wurde noch nicht für die Website freigeschaltet. Bitte kontaktiere den Administrator.';
					break;
				case 'no_code':
					error = 'Authentifizierung fehlgeschlagen. Bitte versuche es erneut.';
					break;
				case 'token_exchange_failed':
					error = 'Fehler beim Authentifizieren. Bitte versuche es erneut.';
					break;
				default:
					error = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
			}
		}

		// If already authenticated, redirect to dashboard
		if (auth.isAuthenticated && auth.hasAeaRole) {
			const redirectPath = urlParams.get('redirect') || '/dashboard';
			window.location.href = redirectPath;
		}
	});

	function handleLogin() {
		if (data.auth0LoginUrl) {
			window.location.href = data.auth0LoginUrl;
		}
	}
</script>

<svelte:head>
	<title>Anmelden - AEA Graph Visualization</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-background p-4">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl">AEA Graph Visualization</CardTitle>
			<CardDescription>Bitte melde dich an, um fortzufahren</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if error}
				<div class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
					{error}
				</div>
			{/if}

			{#if auth.loading}
				<div class="flex items-center justify-center py-8">
					<div class="w-8 h-8 border-4 border-primary/20 border-t-primary animate-spin rounded-full"></div>
				</div>
			{:else}
				<Button 
					onclick={handleLogin}
					class="w-full"
					size="lg"
				>
					Mit Auth0 anmelden
				</Button>
			{/if}

			<div class="text-center text-sm text-muted-foreground pt-4">
				<p>Für Zugriff auf diese Plattform benötigst du einen freigeschalteten Account.</p>
			</div>
		</CardContent>
	</Card>
</div>

