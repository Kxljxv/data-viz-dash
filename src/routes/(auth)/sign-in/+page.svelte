<script>
	import { onMount } from 'svelte';
	import { auth } from '$lib/auth/client.svelte';
	import { Button, Card, Typography, Spinner, Alert } from '$lib/components/aea';

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

<div class="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
	<!-- Background Glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>

	<Card class="w-full max-w-md card-glass relative z-10">
		{#snippet header()}
			<div class="text-center mb-4">
				<div class="h-12 w-12 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20 mx-auto mb-6">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<Typography variant="h2" class="text-white">AEA Analytics</Typography>
				<Typography variant="label" class="opacity-40">Systemzugang</Typography>
			</div>
		{/snippet}

		<div class="space-y-6">
			{#if error}
				<Alert variant="danger" title="Zugriffsfehler">
					{error}
				</Alert>
			{/if}

			{#if auth.loading}
				<div class="flex flex-col items-center justify-center py-8 gap-4">
					<Spinner size="lg" color="brand" />
					<Typography variant="label" class="opacity-40">Initialisierung...</Typography>
				</div>
			{:else}
				<div class="space-y-4">
					<Button 
						onclick={handleLogin}
						variant="primary"
						class="w-full h-12 rounded-xl"
					>
						Mit Auth0 anmelden
					</Button>
					
					<Button 
						onclick={() => goto("/")}
						variant="ghost"
						class="w-full text-xs opacity-40 hover:opacity-100"
					>
						&larr; Zurück zur Startseite
					</Button>
				</div>
			{/if}

			<div class="text-center pt-4 border-t border-white/5">
				<Typography variant="body" class="text-[10px] opacity-40 leading-relaxed uppercase tracking-wider">
					Für Zugriff auf diese Plattform benötigst du einen freigeschalteten Account.
				</Typography>
			</div>
		</div>
	</Card>
</div>

