<script>
    import { Button, Card, Separator, Typography, Badge, Pagination, BottomNav } from '$lib/components/aea';
    import { goto } from '$app/navigation';
    import { 
        IconCheck, 
        IconLoader, 
        IconCircle, 
        IconArrowRight,
        IconNetwork,
        IconSearch,
        IconSettings
    } from '@tabler/icons-svelte';

    const components = [
        { name: 'Accordion', status: 'done', category: 'Feedback' },
        { name: 'Alert', status: 'done', category: 'Feedback' },
        { name: 'Autocomplete', status: 'done', category: 'Input' },
        { name: 'Avatar', status: 'done', category: 'Display' },
        { name: 'Badge', status: 'done', category: 'Feedback' },
        { name: 'Banner', status: 'done', category: 'Feedback' },
        { name: 'BottomNav', status: 'done', category: 'Structure' },
        { name: 'Breadcrumb', status: 'done', category: 'Structure' },
        { name: 'Button', status: 'done', category: 'Interaction' },
        { name: 'Card', status: 'done', category: 'Structure' },
        { name: 'Carousel', status: 'done', category: 'Display' },
        { name: 'Charts', status: 'done', category: 'Display' },
        { name: 'Checkbox', status: 'done', category: 'Input' },
        { name: 'Clipboard', status: 'done', category: 'Input' },
        { name: 'ColorPicker', status: 'done', category: 'Input' },
        { name: 'Datepicker', status: 'done', category: 'Input' },
        { name: 'Drawer', status: 'done', category: 'Structure' },
        { name: 'Dropdown', status: 'done', category: 'Interaction' },
        { name: 'Footer', status: 'done', category: 'Structure' },
        { name: 'Input', status: 'done', category: 'Input' },
        { name: 'Jumbotron', status: 'done', category: 'Structure' },
        { name: 'Media', status: 'done', category: 'Display' },
        { name: 'Modal', status: 'done', category: 'Feedback' },
        { name: 'Pagination', status: 'done', category: 'Interaction' },
        { name: 'PdfViewer', status: 'done', category: 'Display' },
        { name: 'ProgressBar', status: 'done', category: 'Feedback' },
        { name: 'Radio', status: 'done', category: 'Input' },
        { name: 'Select', status: 'done', category: 'Input' },
        { name: 'Sidebar', status: 'done', category: 'Structure' },
        { name: 'Table', status: 'done', category: 'Structure' },
        { name: 'Tabs', status: 'done', category: 'Interaction' },
        { name: 'Timeline', status: 'done', category: 'Structure' },
        { name: 'Toasts', status: 'done', category: 'Feedback' },
        { name: 'Toggle', status: 'done', category: 'Input' },
        { name: 'Tooltip', status: 'done', category: 'Feedback' },
        { name: 'Typography', status: 'done', category: 'Display' },
    ];

    let searchQuery = $state('');
    const filteredComponents = $derived(
        components.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const counts = $derived({
        done: components.filter(c => c.status === 'done').length,
        progress: components.filter(c => c.status === 'progress').length,
        pending: components.filter(c => c.status === 'pending').length
    });
</script>

<div class="min-h-screen bg-background text-foreground font-modern">
    <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Hero Section -->
        <section class="mb-16">
            <div class="p-12 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-white/10 relative overflow-hidden">
                <div class="relative z-10 max-w-2xl">
                    <Badge variant="outline" class="mb-4 text-brand border-brand/20 bg-brand/5">
                        System Documentation
                    </Badge>
                    <Typography tag="h2" variant="display" class="mb-6 leading-tight text-white">
                        Modern Technical Interface System
                    </Typography>
                    <Typography variant="body" class="text-lg mb-8">
                        A high-performance design library built for data-heavy applications. Cyberpunk-Lite aesthetic with glassmorphism, functional minimalism, and WCAG AA compliance.
                    </Typography>
                    <div class="flex gap-4">
                        <Button variant="primary" onclick={() => goto('/docs/manual/graph')}>
                            User Manual
                        </Button>
                        <Button variant="outline" onclick={() => {
                            const el = document.getElementById('components');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            Component Library
                        </Button>
                    </div>
                </div>
                <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand opacity-[0.03] rounded-full blur-[100px]"></div>
                <div class="absolute bottom-0 right-0 p-8 opacity-10 grayscale pointer-events-none">
                    <div class="text-8xl font-serif">AEA</div>
                </div>
            </div>
        </section>

        <!-- Status Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" id="components">
            <Card class="flex items-center gap-4 p-6">
                <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <IconCheck size={24} />
                </div>
                <div>
                    <div class="text-2xl font-serif text-white">{counts.done}</div>
                    <Typography variant="label" class="text-[10px]">Components Ready</Typography>
                </div>
            </Card>
            <Card class="flex items-center gap-4 p-6">
                <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <IconLoader size={24} class="animate-spin" />
                </div>
                <div>
                    <div class="text-2xl font-serif text-white">{counts.progress}</div>
                    <Typography variant="label" class="text-[10px]">In Development</Typography>
                </div>
            </Card>
            <Card class="flex items-center gap-4 p-6">
                <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <IconCircle size={24} />
                </div>
                <div>
                    <div class="text-2xl font-serif text-white">{counts.pending}</div>
                    <Typography variant="label" class="text-[10px]">Pending</Typography>
                </div>
            </Card>
        </div>

        <!-- Search & Filter -->
        <div class="mb-12 flex justify-between items-center">
            <Typography tag="h3" variant="h2" class="text-white">Component Library</Typography>
            <div class="relative w-64">
                <input 
                    type="text" 
                    bind:value={searchQuery}
                    placeholder="Search components..." 
                    class="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-all outline-none text-white"
                />
            </div>
        </div>

        <!-- Component Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each filteredComponents as comp}
                <Card interactive class="group h-full">
                    {#snippet header()}
                        <div class="flex justify-between items-center mb-2">
                            <Typography variant="label" class="text-[10px] text-brand">{comp.category}</Typography>
                            <span class="text-xs">
                                {#if comp.status === 'done'}
                                    <IconCheck size={14} class="text-green-500" />
                                {:else if comp.status === 'progress'}
                                    <IconLoader size={14} class="text-amber-500 animate-spin" />
                                {:else}
                                    <IconCircle size={14} class="text-red-500" />
                                {/if}
                            </span>
                        </div>
                        <Typography variant="h3" class="group-hover:text-brand transition-colors text-white">{comp.name}</Typography>
                    {/snippet}
                    <Typography variant="body" class="text-sm opacity-60">
                        Technical implementation of the {comp.name} component.
                    </Typography>
                    {#snippet footer()}
                        <Button variant="ghost" size="sm" class="w-full justify-between group/btn">
                            View Details
                            <IconArrowRight size={16} class="transform group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    {/snippet}
                </Card>
            {/each}
        </div>

        <!-- Component Previews -->
        <section class="mt-20">
            <Typography tag="h3" variant="h2" class="mb-12 text-white">Interactive Previews</Typography>
            
            <div class="space-y-12">
                <!-- Pagination Preview -->
                <Card class="p-8">
                    <Typography variant="label" class="mb-4">Pagination - Standard & Glass</Typography>
                    <div class="flex flex-col gap-8">
                        <Pagination totalPages={10} currentPage={1} />
                        <Pagination totalPages={5} currentPage={3} glass={true} />
                    </div>
                </Card>

                <!-- Bottom Nav Preview -->
                <Card class="p-8 overflow-hidden relative min-h-[200px]">
                    <Typography variant="label" class="mb-4">Bottom Navigation (Mobile Optimized)</Typography>
                    <Typography variant="body" class="text-xs mb-8">Visible only on mobile by default. Forced visible here for demo.</Typography>
                    
                    <div class="border border-white/5 rounded-2xl p-4 bg-slate-900/50 min-h-[300px] relative overflow-hidden">
                         <BottomNav 
                            forceShow={true}
                            class="!absolute !bottom-0"
                            activeId="nav-graph"
                            items={[
                                { 
                                    id: 'nav-graph', 
                                    label: 'Graph', 
                                    href: '#',
                                    icon: iconGraph
                                },
                                { 
                                    id: 'nav-search', 
                                    label: 'Search', 
                                    href: '#',
                                    icon: iconSearch
                                },
                                { 
                                    id: 'nav-settings', 
                                    label: 'Settings', 
                                    href: '#',
                                    icon: iconSettings
                                }
                            ]} 
                        />
                    </div>
                </Card>
            </div>
        </section>
    </div>
</div>

{#snippet iconGraph()}
    <IconNetwork size={20} class="aea-bottom-nav-icon" />
{/snippet}

{#snippet iconSearch()}
    <IconSearch size={20} class="aea-bottom-nav-icon" />
{/snippet}

{#snippet iconSettings()}
    <IconSettings size={20} class="aea-bottom-nav-icon" />
{/snippet}
