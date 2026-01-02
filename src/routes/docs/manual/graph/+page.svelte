<script>
    import { Typography, Card, Badge, Button } from '$lib/components/aea';
    import { 
        IconArrowRight, 
        IconNetwork, 
        IconSearch, 
        IconSettings, 
        IconLayoutSidebarRight,
        IconBook,
        IconLayoutDashboard,
        IconChartBar,
        IconUsers,
        IconUserCircle
    } from '@tabler/icons-svelte';
    import { goto } from '$app/navigation';
</script>

<div class="space-y-12">
    <!-- Hero Section -->
    <header class="space-y-6">
        <Badge variant="outline" class="text-brand border-brand/20 bg-brand/5">Benutzerhandbuch</Badge>
        <Typography tag="h1" variant="display" class="text-white">Graph-Visualisierung</Typography>
        <Typography variant="body" class="text-xl text-white/60 leading-relaxed max-w-2xl">
            Willkommen im Benutzerhandbuch der AEA Graph-Visualisierung. Dieses Tool ermöglicht es dir, komplexe Netzwerke von Anträgen und deren Unterstützern zu analysieren und visuell zu explorieren.
        </Typography>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card interactive class="p-8 group" onclick={() => goto('/docs/manual/dashboard')}>
            <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <IconLayoutDashboard size={24} />
            </div>
            <Typography variant="h3" class="text-white mb-3">Dashboard</Typography>
            <Typography variant="body" class="text-sm text-white/50 mb-6">
                Dein zentraler Ausgangspunkt für alle Projekte und Analysen.
            </Typography>
            <div class="flex items-center text-brand text-xs font-black uppercase tracking-widest gap-2">
                Mehr erfahren <IconArrowRight size={14} class="group-hover:translate-x-1 transition-transform" />
            </div>
        </Card>

        <Card interactive class="p-8 group" onclick={() => goto('/docs/manual/graph/interaction')}>
            <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <IconNetwork size={24} />
            </div>
            <Typography variant="h3" class="text-white mb-3">Der Graph</Typography>
            <Typography variant="body" class="text-sm text-white/50 mb-6">
                Interaktion mit der Hauptansicht, Navigation und Zoom-Funktionen.
            </Typography>
            <div class="flex items-center text-brand text-xs font-black uppercase tracking-widest gap-2">
                Mehr erfahren <IconArrowRight size={14} class="group-hover:translate-x-1 transition-transform" />
            </div>
        </Card>

        <Card interactive class="p-8 group" onclick={() => goto('/docs/manual/analysis/density')}>
            <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <IconChartBar size={24} />
            </div>
            <Typography variant="h3" class="text-white mb-3">Spezial-Analysen</Typography>
            <Typography variant="body" class="text-sm text-white/50 mb-6">
                Nutze fortgeschrittene Metriken wie die Dichte-Analyse für tiefere Einblicke.
            </Typography>
            <div class="flex items-center text-brand text-xs font-black uppercase tracking-widest gap-2">
                Mehr erfahren <IconArrowRight size={14} class="group-hover:translate-x-1 transition-transform" />
            </div>
        </Card>
    </div>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Schnelleinstieg</Typography>
        <div class="space-y-4">
            <div class="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-mono text-sm">01</div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Navigation</Typography>
                    <Typography variant="body" class="text-sm text-white/40">Nutze die Maus zum Verschieben (Klicken & Ziehen) und das Scrollrad zum Zoomen.</Typography>
                </div>
            </div>
            <div class="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-mono text-sm">02</div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Details abrufen</Typography>
                    <Typography variant="body" class="text-sm text-white/40">Klicke auf einen Knoten, um das Detail-Panel mit allen Metadaten und PDF-Links zu öffnen.</Typography>
                </div>
            </div>
            <div class="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-mono text-sm">03</div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Kontextmenü</Typography>
                    <Typography variant="body" class="text-sm text-white/40">Rechtsklicke auf einen Knoten, um Schnellaktionen wie "Fokus" oder "Hervorheben" auszuführen.</Typography>
                </div>
            </div>
        </div>
    </section>
</div>
