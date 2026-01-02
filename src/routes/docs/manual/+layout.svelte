<script>
    import { page } from '$app/stores';
    import { Typography, Badge, Button } from '$lib/components/aea';
    import { 
        IconBook, 
        IconNetwork, 
        IconMenu2, 
        IconSettings, 
        IconSearch, 
        IconClick, 
        IconBox, 
        IconLayoutSidebarRight,
        IconArrowLeft,
        IconLayoutDashboard,
        IconChartBar,
        IconUsers,
        IconTicket,
        IconUserCircle
    } from '@tabler/icons-svelte';
    import { goto } from '$app/navigation';

    let { children } = $props();

    const menuItems = [
        {
            title: 'Allgemein',
            items: [
                { id: 'introduction', label: 'Einführung', icon: IconBook, href: '/docs/manual/graph' },
                { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard, href: '/docs/manual/dashboard' },
            ]
        },
        {
            title: 'Graph-Analyse',
            items: [
                { id: 'graph-interaction', label: 'Der Graph', icon: IconNetwork, href: '/docs/manual/graph/interaction' },
                { id: 'context-menu', label: 'Kontextmenü', icon: IconClick, href: '/docs/manual/graph/context-menu' },
                { id: 'control-panel', label: 'Control Panel', icon: IconLayoutSidebarRight, href: '/docs/manual/graph/control-panel' },
            ]
        },
        {
            title: 'Funktionen',
            items: [
                { id: 'search-tab', label: 'Suche-Tab', icon: IconSearch, href: '/docs/manual/graph/search-tab' },
                { id: 'view-tab', label: 'Ansicht-Tab', icon: IconSettings, href: '/docs/manual/graph/view-tab' },
                { id: 'groups-tab', label: 'Gruppen-Tab', icon: IconBox, href: '/docs/manual/graph/groups-tab' },
                { id: 'modals', label: 'Modale & Details', icon: IconMenu2, href: '/docs/manual/graph/modals' },
            ]
        },
        {
            title: 'Spezial-Analysen',
            items: [
                { id: 'density', label: 'Dichte-Analyse', icon: IconChartBar, href: '/docs/manual/analysis/density' },
            ]
        },
        {
            title: 'Einstellungen',
            items: [
                { id: 'settings', label: 'Profil & Sicherheit', icon: IconUserCircle, href: '/docs/manual/settings' },
            ]
        }
    ];

    const currentPath = $derived($page.url.pathname);
</script>

<div class="min-h-screen bg-background text-foreground flex font-modern">
    <!-- Sidebar -->
    <aside class="w-72 border-r border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto flex flex-col">
        <div class="p-6 border-b border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_20px_rgba(var(--brand-rgb),0.2)]">
                <IconBook size={20} />
            </div>
            <div>
                <Typography variant="h4" class="text-white leading-none mb-1">Handbuch</Typography>
                <Typography variant="label" class="text-[8px] uppercase tracking-widest opacity-40">User Documentation</Typography>
            </div>
        </div>

        <nav class="flex-1 p-4 space-y-8 mt-4">
            {#each menuItems as section}
                <div class="space-y-2">
                    <Typography variant="label" class="px-4 text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">{section.title}</Typography>
                    <div class="space-y-1">
                        {#each section.items as item}
                            <a 
                                href={item.href}
                                class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                                    {currentPath === item.href 
                                        ? 'bg-brand/10 text-brand border border-brand/20 shadow-[0_0_15px_rgba(var(--brand-rgb),0.1)]' 
                                        : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'}"
                            >
                                <item.icon size={18} class="opacity-60 group-hover:opacity-100 transition-opacity" />
                                <span class="text-sm font-medium">{item.label}</span>
                                {#if currentPath === item.href}
                                    <div class="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand-rgb),0.8)]"></div>
                                {/if}
                            </a>
                        {/each}
                    </div>
                </div>
            {/each}
        </nav>

        <div class="p-4 border-t border-white/5">
            <Button variant="ghost" class="w-full justify-start text-white/40 hover:text-white" onclick={() => goto('/dashboard/graph')}>
                <IconArrowLeft size={16} class="mr-2" />
                Zurück zum Graph
            </Button>
        </div>
    </aside>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(var(--brand-rgb),0.03),transparent_40%)]">
        <div class="max-w-4xl mx-auto px-12 py-16">
            {@render children()}
        </div>
    </main>
</div>

<style>
    :global(html) {
        scroll-behavior: smooth;
    }
</style>
