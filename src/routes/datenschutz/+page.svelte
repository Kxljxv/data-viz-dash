<script>
	import { Card, CardContent, CardHeader, CardTitle } from "$components/ui/card";
	import { WEBSITE_NAME } from "$config";
</script>

<svelte:head>
	<title>Datenschutz - {WEBSITE_NAME}</title>
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
			<CardTitle class="text-3xl font-bold">Datenschutzerklärung</CardTitle>
		</CardHeader>
		<CardContent class="prose prose-invert max-w-none space-y-6">
			<section>
				<h2 class="text-xl font-semibold border-b border-border pb-2 mb-4">1. Datenschutz auf einen Blick</h2>
				<p class="text-muted-foreground">
					Dies ist eine <strong>private Webseite</strong>. Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
					Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b border-border pb-2 mb-4">2. Datenerfassung auf unserer Webseite</h2>
				<h3 class="text-lg font-medium text-foreground mt-4 mb-2">Cookies</h3>
				<p class="text-sm text-muted-foreground leading-relaxed">
					Die Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
				</p>
				
				<h3 class="text-lg font-medium text-foreground mt-4 mb-2">Server-Log-Dateien</h3>
				<p class="text-sm text-muted-foreground leading-relaxed">
					Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b border-border pb-2 mb-4">3. Nutzerregistrierung & Profil</h2>
				<p class="text-sm text-muted-foreground leading-relaxed">
					Im Rahmen der Nutzung dieser privaten Plattform speichern wir die von Ihnen angegebenen Daten (vollständiger Name, Kreisverband) sowie Ihre E-Mail-Adresse und Ihren Nicknamen zur Bereitstellung der Funktionen. Diese Daten werden ausschließlich auf Cloudflare-Infrastruktur gespeichert und nicht an Dritte weitergegeben.
				</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold border-b border-border pb-2 mb-4">4. Ihre Rechte</h2>
				<p class="text-sm text-muted-foreground leading-relaxed">
					Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
				</p>
			</section>
		</CardContent>
	</Card>
	</div>
</div>
