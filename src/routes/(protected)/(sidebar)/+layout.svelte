<script>
	import "$appcss";
	import { WEBSITE_NAME } from "$config";
	import { 
		Button, 
		Sidebar, 
		SidebarItem, 
		SidebarGroup, 
		SidebarFooter, 
		Avatar,
		Badge,
		Typography
	} from "$lib/components/aea";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { auth } from "$lib/auth/client.svelte";
	import OnboardingOverlay from "$lib/components/auth/OnboardingOverlay.svelte";

	import { 
		IconHome, 
		IconChartDots, 
		IconAnalyze, 
		IconSettings, 
		IconUsers, 
		IconLogout, 
		IconMenu2, 
		IconBolt,
		IconDatabase
	} from "@tabler/icons-svelte";

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
			icon: IconHome
		},
		{ 
			id: 'graph', 
			label: 'Graph', 
			href: '/dashboard/graph', 
			active: page.url?.pathname?.startsWith('/dashboard/graph'),
			icon: IconChartDots
		},
		{ 
			id: 'analysis', 
			label: 'Analyse', 
			href: '/dashboard/analysis', 
			active: page.url?.pathname?.startsWith('/dashboard/analysis'),
			icon: IconAnalyze
		},
		{
			id: 'database',
			label: 'Datenbank',
			href: '/dashboard/database',
			active: page.url?.pathname?.startsWith('/dashboard/database'),
			icon: IconDatabase
		},
		{ 
			id: 'settings', 
			label: 'Einstellungen', 
			href: '/dashboard/settings', 
			active: page.url?.pathname?.startsWith('/dashboard/settings'),
			icon: IconSettings
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
				<IconBolt size={20} class="text-white" />
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
					icon={IconUsers}
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
						<IconLogout size={16} />
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
				<IconMenu2 size={20} />
			</Button>
			<div class="flex items-center gap-2">
				<div class="h-6 w-6 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
					<IconBolt size={16} class="text-white" />
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

{#if showOnboarding}
	<OnboardingOverlay user={data.user} />
{/if}

