<script>
	import "$appcss";
	import { WEBSITE_NAME } from "$config";
	import { 
		Button, 
		Sidebar, 
		SidebarItem, 
		SidebarGroup, 
		SidebarFooter, 
		BottomNav,
		Avatar,
		Badge,
		Typography
	} from "$lib/components/aea";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { auth } from "$lib/auth/client.svelte";
	import OnboardingOverlay from "$lib/components/auth/OnboardingOverlay.svelte";

	let { data, children } = $props();

	let sidebarOpen = $state(false);
	let isMini = $state(false);

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

	const navItems = $derived([
		{ 
			id: 'dashboard', 
			label: 'Dashboard', 
			href: '/dashboard', 
			active: page.url?.pathname === '/dashboard',
			icon: iconHome
		},
		{ 
			id: 'graph', 
			label: 'Graph', 
			href: '/dashboard/graph', 
			active: page.url?.pathname?.startsWith('/dashboard/graph'),
			icon: iconGraph
		},
		{ 
			id: 'analysis', 
			label: 'Analyse', 
			href: '/dashboard/analysis', 
			active: page.url?.pathname?.startsWith('/dashboard/analysis'),
			icon: iconAnalysis
		},
		{ 
			id: 'settings', 
			label: 'Einstellungen', 
			href: '/dashboard/settings', 
			active: page.url?.pathname?.startsWith('/dashboard/settings'),
			icon: iconSettings
		}
	]);

	const activeNavId = $derived(navItems.find(item => item.active)?.id || '');
</script>

<div class="flex h-screen bg-background text-foreground font-modern overflow-hidden">
	<!-- Sidebar -->
	<Sidebar 
		brandTitle={WEBSITE_NAME} 
		bind:isMini 
		bind:isOpen={sidebarOpen}
	>
		{#snippet logo()}
			<div class="h-8 w-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
		{/snippet}

		<!-- User Context in Sidebar -->
		<div class="px-3 mb-6">
			<div class="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5 overflow-hidden transition-all {isMini ? 'justify-center p-1' : ''}">
				<Avatar 
					fallback={getInitialName(data.user.nickname)} 
					size={isMini ? "sm" : "md"}
					class="shrink-0"
				/>
				{#if !isMini}
					<div class="flex-1 min-w-0">
						<Typography variant="body" class="text-xs font-bold truncate mb-0.5 text-white">
							{data.user.profile?.fullName || getDisplayName()}
						</Typography>
						<Typography variant="label" class="text-[9px] truncate opacity-50">
							{data.user.profile?.kreisverband || data.user.email}
						</Typography>
					</div>
				{/if}
			</div>
		</div>

		<!-- Navigation -->
		<SidebarGroup title={isMini ? "" : "Navigation"}>
			{#each navItems as item}
				<SidebarItem 
					href={item.href} 
					label={item.label} 
					active={item.active}
					icon={item.icon}
				/>
			{/each}
		</SidebarGroup>

		{#if data.user.role === "admin"}
			<SidebarGroup title={isMini ? "" : "Administration"}>
				<SidebarItem 
					href="/admin" 
					label="Nutzerverwaltung" 
					active={page.url?.pathname?.startsWith('/admin')}
					icon={iconAdmin}
					class={page.url?.pathname?.startsWith('/admin') ? '!text-orange-500 !bg-orange-500/10' : ''}
				/>
			</SidebarGroup>
		{/if}

		{#snippet footer()}
			<SidebarFooter>
				<Button 
					variant="ghost" 
					size="sm" 
					class="w-full justify-start text-xs opacity-60 hover:opacity-100 hover:text-danger" 
					onclick={signOut}
				>
					{#snippet icon()}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					{/snippet}
					{#if !isMini}Abmelden{/if}
				</Button>
				
				{#if !isMini}
					<div class="mt-4 flex items-center justify-center gap-4 border-t border-white/5 pt-4">
						<a href="/impressum" class="text-[8px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Impressum</a>
						<a href="/datenschutz" class="text-[8px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Datenschutz</a>
					</div>
				{/if}
			</SidebarFooter>
		{/snippet}
	</Sidebar>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
		<!-- Top Bar Mobile -->
		<header class="lg:hidden border-b border-white/5 bg-background/80 backdrop-blur-xl p-4 flex items-center justify-between sticky top-0 z-40">
			<Button variant="ghost" size="icon" onclick={() => (sidebarOpen = true)} class="rounded-xl">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
				</svg>
			</Button>
			<div class="flex items-center gap-2">
				<div class="h-6 w-6 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<span class="text-sm font-black tracking-tight uppercase text-white">{WEBSITE_NAME}</span>
			</div>
			<Avatar fallback={getInitialName(data.user.nickname)} size="sm" />
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

{#snippet iconHome()}
	<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
	</svg>
{/snippet}

{#snippet iconGraph()}
	<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
	</svg>
{/snippet}

{#snippet iconAnalysis()}
	<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
	</svg>
{/snippet}

{#snippet iconSettings()}
	<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
{/snippet}

{#snippet iconAdmin()}
	<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
	</svg>
{/snippet}

{#if showOnboarding}
	<OnboardingOverlay user={data.user} />
{/if}

