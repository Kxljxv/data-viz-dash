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
	<title>Datenschutz - {WEBSITE_NAME}</title>
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
			<Typography tag="h1" variant="h1">Datenschutzerklärung</Typography>
		</CardHeader>
		<CardContent class="space-y-6">
			<section>
				<Typography tag="h2" variant="h3" class="border-b border-border pb-2 mb-4">1. Datenschutz auf einen Blick</Typography>
				<Typography variant="body" class="text-muted-foreground">
					Dies ist eine <strong>private Webseite</strong>. Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
					Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
				</Typography>
			</section>

			<section>
				<Typography tag="h2" variant="h3" class="border-b border-border pb-2 mb-4">2. Datenerfassung auf unserer Webseite</Typography>
				<Typography tag="h3" variant="h4" class="text-foreground mt-4 mb-2">Cookies</Typography>
				<Typography variant="body" class="text-sm text-muted-foreground leading-relaxed">
					Die Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
				</Typography>
				
				<Typography tag="h3" variant="h4" class="text-foreground mt-4 mb-2">Server-Log-Dateien</Typography>
				<Typography variant="body" class="text-sm text-muted-foreground leading-relaxed">
					Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse.
				</Typography>
			</section>

			<section>
				<Typography tag="h2" variant="h3" class="border-b border-border pb-2 mb-4">3. Nutzerregistrierung & Profil</Typography>
				<Typography variant="body" class="text-sm text-muted-foreground leading-relaxed">
					Im Rahmen der Nutzung dieser privaten Plattform speichern wir die von Ihnen angegebenen Daten (vollständiger Name, Kreisverband) sowie Ihre E-Mail-Adresse und Ihren Nicknamen zur Bereitstellung der Funktionen. Diese Daten werden ausschließlich auf Cloudflare-Infrastruktur gespeichert und nicht an Dritte weitergegeben.
				</Typography>
			</section>

			<section>
				<Typography tag="h2" variant="h3" class="border-b border-border pb-2 mb-4">4. Ihre Rechte</Typography>
				<Typography variant="body" class="text-sm text-muted-foreground leading-relaxed">
					Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
				</Typography>
			</section>
		</CardContent>
	</Card>
	</div>
</div>
