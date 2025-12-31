<script>
	import "$appcss";
	import { WEBSITE_NAME } from "$config";
	import { Button } from "$components/ui/button";
	import { Separator } from "$components/ui/separator";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { auth } from "$lib/auth/client.svelte";
	import OnboardingOverlay from "$lib/components/auth/OnboardingOverlay.svelte";

	let { data, children } = $props();

	let sidebarOpen = $state(false);

	let showOnboarding = $derived(!data.user.profile);

	async function signOut() {
		await auth.logout();
		goto("/");
	}

	function getInitialName(name) {
		return name ? name[0].toUpperCase() : "?";
	}

	function getDisplayName() {
		return data.user.nickname.length > 20
			? data.user.nickname.substring(0, 20) + "..."
			: data.user.nickname;
	}

	$effect(() => {
		// Close sidebar on mobile when route changes
		if (typeof window !== 'undefined' && window.innerWidth < 1024) {
			sidebarOpen = false;
		}
	});
</script>

<div class="flex h-screen bg-background">
	<!-- Sidebar -->
	<aside
		class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-xl border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
	>
		<div class="flex flex-col h-full">
			<!-- Sidebar Header -->
			<div class="p-6 border-b border-border bg-card/40">
				<div class="flex items-center justify-between">
					<a href="/dashboard" class="flex items-center gap-2 group">
						<div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<span class="text-xl font-black tracking-tight uppercase">{WEBSITE_NAME}</span>
					</a>
					<Button
						variant="ghost"
						size="icon"
						class="lg:hidden hover:bg-accent/50"
						onclick={() => (sidebarOpen = false)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</Button>
				</div>
			</div>

			<!-- User Profile Section -->
			<div class="p-4 border-b border-border bg-muted/20">
				<div class="flex items-center gap-3 p-3 rounded-2xl bg-card/50 border border-border/40 shadow-sm hover:border-primary/20 hover:bg-card transition-all group cursor-default">
					<div class="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 transition-transform">
						{getInitialName(data.user.nickname)}
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-black truncate leading-none mb-1 text-foreground group-hover:text-primary transition-colors">{data.user.profile?.fullName || getDisplayName()}</p>
						<p class="text-[10px] text-muted-foreground truncate font-bold tracking-tight opacity-70">{data.user.profile?.kreisverband || data.user.email}</p>
						{#if data.user.role === "admin"}
							<div class="mt-1.5 flex items-center gap-1.5">
								<div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
								<span class="text-[9px] font-black uppercase tracking-widest text-primary/80">Administrator</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative">
				<!-- Scrolling Indicator (Top) -->
				<div class="sticky top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>

				<a
					href="/dashboard"
					class="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative {page.url?.pathname === '/dashboard' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}"
				>
					<div class="flex items-center gap-3">
						<div class="size-9 rounded-xl flex items-center justify-center transition-all duration-300 {page.url?.pathname === '/dashboard' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary'}">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							</svg>
						</div>
						<span class="font-bold text-sm tracking-tight">Dashboard</span>
					</div>
					{#if page.url?.pathname === '/dashboard'}
						<div class="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
					{/if}
				</a>

				<a
					href="/dashboard/graph"
					class="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative {page.url?.pathname?.startsWith('/dashboard/graph') ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}"
				>
					<div class="flex items-center gap-3">
						<div class="size-9 rounded-xl flex items-center justify-center transition-all duration-300 {page.url?.pathname?.startsWith('/dashboard/graph') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary'}">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
							</svg>
						</div>
						<span class="font-bold text-sm tracking-tight">Graph-Visualisierung</span>
					</div>
					{#if page.url?.pathname?.startsWith('/dashboard/graph')}
						<div class="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
					{/if}
				</a>

				<a
					href="/dashboard/analysis"
					class="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative {page.url?.pathname?.startsWith('/dashboard/analysis') ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}"
				>
					<div class="flex items-center gap-3">
						<div class="size-9 rounded-xl flex items-center justify-center transition-all duration-300 {page.url?.pathname?.startsWith('/dashboard/analysis') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary'}">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<span class="font-bold text-sm tracking-tight">Analyse</span>
					</div>
					{#if page.url?.pathname?.startsWith('/dashboard/analysis')}
						<div class="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
					{/if}
				</a>

				<a
					href="/dashboard/settings"
					class="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative {page.url?.pathname?.startsWith('/dashboard/settings') ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}"
				>
					<div class="flex items-center gap-3">
						<div class="size-9 rounded-xl flex items-center justify-center transition-all duration-300 {page.url?.pathname?.startsWith('/dashboard/settings') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary'}">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<span class="font-bold text-sm tracking-tight">Einstellungen</span>
					</div>
					{#if page.url?.pathname?.startsWith('/dashboard/settings')}
						<div class="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
					{/if}
				</a>

				{#if data.user.role === "admin"}
					<div class="pt-8 pb-2">
						<div class="flex items-center gap-3 px-3 mb-4">
							<div class="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent"></div>
							<div class="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Administration</div>
							<div class="h-px flex-1 bg-gradient-to-r from-transparent via-border/40 to-transparent"></div>
						</div>
					</div>
					<a
						href="/admin"
						class="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative {page.url?.pathname?.startsWith('/admin') ? 'bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'hover:bg-orange-500/10 text-muted-foreground hover:text-orange-500'}"
					>
						<div class="flex items-center gap-3">
							<div class="size-9 rounded-xl flex items-center justify-center transition-all duration-300 {page.url?.pathname?.startsWith('/admin') ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-muted/50 group-hover:bg-orange-500/10 group-hover:text-orange-500'}">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							</div>
							<span class="font-bold text-sm tracking-tight">Nutzerverwaltung</span>
						</div>
						{#if page.url?.pathname?.startsWith('/admin')}
							<div class="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
						{/if}
					</a>
				{/if}

				<!-- Scrolling Indicator (Bottom) -->
				<div class="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 -mb-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
			</nav>

			<!-- Sidebar Footer -->
			<div class="p-4 border-t border-border bg-muted/5">
				<div class="flex items-center justify-center gap-4 mb-4">
					<a href="/impressum" class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Impressum</a>
					<div class="h-1 w-1 rounded-full bg-border"></div>
					<a href="/datenschutz" class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">Datenschutz</a>
				</div>
				<Button 
					variant="outline" 
					class="w-full justify-start rounded-xl border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group h-11" 
					onclick={signOut}
				>
					<div class="size-7 rounded-lg bg-muted group-hover:bg-destructive/10 flex items-center justify-center mr-3 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</div>
					<span class="font-black text-[10px] uppercase tracking-[0.2em]">Abmelden</span>
				</Button>
			</div>
		</div>
	</aside>

	<!-- Overlay for mobile -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 bg-black/50 z-40 lg:hidden"
			onclick={() => (sidebarOpen = false)}
			onkeydown={(e) => { if (e.key === 'Escape') sidebarOpen = false; }}
			role="button"
			tabindex="0"
			aria-label="Sidebar schließen"
		></div>
	{/if}

	<!-- Main Content -->
	<div class="flex-1 flex flex-col min-h-0 overflow-hidden">
		<!-- Top Bar -->
		<header class="lg:hidden border-b border-border bg-card/80 backdrop-blur-xl p-4 flex items-center justify-between sticky top-0 z-40">
			<Button variant="ghost" size="icon" onclick={() => (sidebarOpen = true)} class="hover:bg-accent/50 rounded-xl">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
				</svg>
			</Button>
			<a href="/dashboard" class="flex items-center gap-2 group">
				<div class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<span class="text-lg font-black tracking-tight uppercase">{WEBSITE_NAME}</span>
			</a>
			<div class="w-10 flex justify-end">
				<div class="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
					{getInitialName(data.user.nickname)}
				</div>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto custom-scrollbar relative bg-muted/5">
			<div class="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10">
				{@render children()}
			</div>
		</main>
	</div>
</div>

{#if showOnboarding}
	<OnboardingOverlay user={data.user} />
{/if}

