<script>
	let { children } = $props();
	import "$appcss";
	import { WEBSITE_NAME } from "$config";
	import { Button } from "$components/ui/button";
	import { Separator } from "$components/ui/separator";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
</script>

<nav class="border-b bg-background">
	<div class="container mx-auto px-4 py-4 flex items-center justify-between">
		<a href="/" class="text-2xl font-bold">
			{WEBSITE_NAME}
		</a>
		<div class="hidden sm:flex items-center gap-4">
			<Button variant="ghost" onclick={() => goto("/sign-in")}>
				Anmelden
			</Button>
		</div>
		<div class="sm:hidden">
			<Button variant="ghost" size="icon" onclick={() => goto("/sign-in")}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
				</svg>
			</Button>
		</div>
	</div>
</nav>

<div class="min-h-screen">
	{@render children()}
</div>

<Separator />

<footer class="container mx-auto px-4 py-10">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<div>
			<h3 class="font-semibold mb-4">Erkunden</h3>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li><a href="/dashboard" class="hover:text-foreground">Zum Dashboard</a></li>
			</ul>
		</div>
		<div>
			<h3 class="font-semibold mb-4">Über</h3>
			<p class="text-sm text-muted-foreground">
				{WEBSITE_NAME} - Interaktive Netzwerk-Visualisierung für politische Anträge und Unterstützer.
			</p>
		</div>
		<div>
			<h3 class="font-semibold mb-4">Copyright</h3>
			<p class="text-sm text-muted-foreground">
				© 2024 - Alle Rechte vorbehalten
			</p>
		</div>
	</div>
</footer>

