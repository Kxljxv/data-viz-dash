<script>
	import "$appcss";
	import { WEBSITE_NAME } from "$config";
	import { Button } from "$components/ui/button";
	import { Separator } from "$components/ui/separator";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { auth } from "$lib/auth/client.svelte";

	let { data, children } = $props();

	let sidebarOpen = $state(false);

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
		class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
	>
		<div class="flex flex-col h-full">
			<!-- Sidebar Header -->
			<div class="p-6 border-b border-border">
				<div class="flex items-center justify-between">
					<a href="/dashboard" class="text-xl font-bold">
						{WEBSITE_NAME}
					</a>
					<Button
						variant="ghost"
						size="icon"
						class="lg:hidden"
						onclick={() => (sidebarOpen = false)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</Button>
				</div>
			</div>

			<!-- User Profile Section -->
			<div class="p-6 border-b border-border">
				<div class="flex items-center gap-3">
					<div class="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
						{getInitialName(data.user.nickname)}
					</div>
					<div class="flex-1 min-w-0">
						<p class="font-semibold truncate">{getDisplayName()}</p>
						<p class="text-sm text-muted-foreground truncate">{data.user.email}</p>
						{#if data.user.role === "admin"}
							<span class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-primary/10 text-primary">
								Admin
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
				<a
					href="/dashboard"
					class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent {page.url?.pathname === '/dashboard' ? 'bg-accent' : ''}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					<span>Dashboard</span>
				</a>
				<a
					href="/dashboard/graph"
					class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent {page.url?.pathname?.startsWith('/dashboard/graph') ? 'bg-accent' : ''}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
					</svg>
					<span>Graph-Visualisierung</span>
				</a>
				<a
					href="/dashboard/analysis"
					class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent {page.url?.pathname?.startsWith('/dashboard/analysis') ? 'bg-accent' : ''}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<span>Analyse</span>
				</a>
				<a
					href="/dashboard/settings"
					class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent {page.url?.pathname?.startsWith('/dashboard/settings') ? 'bg-accent' : ''}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span>Einstellungen</span>
				</a>
				{#if data.user.role === "admin"}
					<Separator class="my-4" />
					<div class="text-xs font-semibold text-muted-foreground uppercase px-3 py-2">Admin Panel</div>
					<a
						href="/admin"
						class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent {page.url?.pathname?.startsWith('/admin') ? 'bg-accent' : ''}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
						<span>Admin Dashboard</span>
					</a>
				{/if}
			</nav>

			<!-- Sidebar Footer -->
			<div class="p-4 border-t border-border">
				<Button variant="ghost" class="w-full justify-start" onclick={signOut}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					Abmelden
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
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Top Bar -->
		<header class="lg:hidden border-b border-border bg-card p-4 flex items-center justify-between">
			<Button variant="ghost" size="icon" onclick={() => (sidebarOpen = true)}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
				</svg>
			</Button>
			<a href="/dashboard" class="text-lg font-bold">
				{WEBSITE_NAME}
			</a>
			<div class="w-10"></div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto p-6 custom-scrollbar">
			{@render children()}
		</main>
	</div>
</div>

