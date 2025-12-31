<script>
	import { Card, CardContent, CardHeader, CardTitle } from "$components/ui/card";
	import { WEBSITE_NAME } from "$config";
</script>

<svelte:head>
	<title>Impressum - {WEBSITE_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
		<div class="mb-6">
			<a href="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Zurück zur Startseite
			</a>
		</div>
		<Card class="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
		<CardHeader>
			<CardTitle class="text-3xl font-bold">Impressum</CardTitle>
		</CardHeader>
		<CardContent class="prose prose-invert max-w-none space-y-6">
			<section>
				<h2 class="text-xl font-semibold border-b border-border pb-2 mb-4">Privater Betrieb</h2>
				<p class="text-muted-foreground">
					Dies ist eine rein <strong>private Webseite</strong>. Sie dient nicht-kommerziellen Zwecken 
					und stellt ein persönliches Projekt dar.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b border-border pb-2 mb-4">Kontakt</h2>
				<p class="text-muted-foreground">
					E-Mail: koljavvoehringer@gmail.com
				</p>
			</section>

		</CardContent>
	</Card>
	</div>
</div>
