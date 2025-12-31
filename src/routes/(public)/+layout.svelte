<script>
	let { children } = $props();
	import "$appcss";
	import { WEBSITE_NAME } from "$config";
	import { Button } from "$components/ui/button";
	import { Separator } from "$components/ui/separator";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
</script>

<nav class="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
	<div class="container mx-auto px-4 py-4 flex items-center justify-between">
		<a href="/" class="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
			<div class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<span class="text-xl font-black tracking-tight uppercase">{WEBSITE_NAME}</span>
		</a>
		<div class="hidden sm:flex items-center gap-6">
			<a href="/impressum" class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Impressum</a>
			<a href="/datenschutz" class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Datenschutz</a>
			<Button variant="default" class="rounded-xl font-bold px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all" onclick={() => goto("/sign-in")}>
				Anmelden
			</Button>
		</div>
		<div class="sm:hidden">
			<Button variant="ghost" size="icon" class="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onclick={() => goto("/sign-in")}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
				</svg>
			</Button>
		</div>
	</div>
</nav>

<div class="min-h-screen bg-muted/5">
	{@render children()}
</div>

<footer class="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-auto">
	<div class="container mx-auto px-4 py-16">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-12">
			<div class="space-y-6">
				<a href="/" class="flex items-center gap-2 group">
					<div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<span class="text-lg font-black tracking-tight uppercase">{WEBSITE_NAME}</span>
				</a>
				<p class="text-sm text-muted-foreground leading-relaxed font-medium">
					Professionelle Netzwerk-Visualisierung für politische Anträge und strategische Planung.
				</p>
			</div>

			<div>
				<h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Plattform</h3>
				<ul class="space-y-4">
					<li><a href="/dashboard" class="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
						<div class="h-1 w-1 rounded-full bg-primary/40"></div>
						Dashboard
					</a></li>
					<li><a href="/sign-in" class="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
						<div class="h-1 w-1 rounded-full bg-primary/40"></div>
						Anmelden
					</a></li>
				</ul>
			</div>

			<div>
				<h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Rechtliches</h3>
				<ul class="space-y-4">
					<li><a href="/impressum" class="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
						<div class="h-1 w-1 rounded-full bg-primary/40"></div>
						Impressum
					</a></li>
					<li><a href="/datenschutz" class="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
						<div class="h-1 w-1 rounded-full bg-primary/40"></div>
						Datenschutz
					</a></li>
				</ul>
			</div>

			<div class="bg-primary/5 rounded-3xl p-6 border border-primary/10">
				<h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Copyright</h3>
				<p class="text-sm font-bold text-foreground">
					© 2026 AEA
				</p>
				<p class="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">
					Alle Rechte vorbehalten
				</p>
			</div>
		</div>
	</div>
</footer>

