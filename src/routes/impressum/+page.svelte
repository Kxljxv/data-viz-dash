<script>
	import { 
		Card, 
		CardContent, 
		CardHeader, 
		CardTitle,
		Typography
	} from "$lib/components/aea";
	import { WEBSITE_NAME } from "$config";
	import { IconArrowLeft } from "@tabler/icons-svelte";
</script>

<svelte:head>
	<title>Impressum - {WEBSITE_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
		<div class="mb-6">
			<a href="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-2">
				<IconArrowLeft size={16} />
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
