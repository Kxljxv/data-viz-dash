<script>
	import { 
		Card, 
		CardContent, 
		CardHeader, 
		CardTitle,
		Typography
	} from "$lib/components/aea";
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
		<Card variant="glass" class="border-border/40 shadow-xl">
		<CardHeader>
			<Typography tag="h1" variant="h1">Impressum</Typography>
		</CardHeader>
		<CardContent class="space-y-6">
			<section>
				<Typography tag="h2" variant="h3" class="border-b border-border pb-2 mb-4">Privater Betrieb</Typography>
				<Typography variant="body" class="text-muted-foreground">
					Dies ist eine rein <strong>private Webseite</strong>. Sie dient nicht-kommerziellen Zwecken 
					und stellt ein persönliches Projekt dar.
				</Typography>
			</section>

			<section>
				<Typography tag="h2" variant="h3" class="border-b border-border pb-2 mb-4">Kontakt</Typography>
				<Typography variant="body" class="text-muted-foreground">
					E-Mail: koljavvoehringer@gmail.com
				</Typography>
			</section>

		</CardContent>
	</Card>
	</div>
</div>
