<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconChartBar, IconChartDots, IconFocus2, IconFilter } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Dichte-Analyse</Typography>
        <Typography variant="body" class="text-white/60">
            Identifiziere Ballungszentren und hochvernetzte Bereiche in deinem Graphen. Die Dichte-Analyse hilft dir, strukturelle Muster und Cluster zu erkennen.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Funktionsweise</Typography>
        <div class="space-y-6">
            <Typography variant="body" class="text-white/50 leading-relaxed">
                Diese Analyse berechnet die relative Vernetzung von Knoten innerhalb bestimmter Gruppen oder des gesamten Graphen. So lassen sich "Hotspots" identifizieren, in denen Informationen besonders stark fließen oder viele Akteure interagieren.
            </Typography>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconChartDots size={20} />
                        <Typography variant="h4" class="text-white">Cluster-Erkennung</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Automatische Identifikation von Knoten, die enger miteinander verbunden sind als mit dem Rest des Graphen.
                    </Typography>
                </Card>
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconFocus2 size={20} />
                        <Typography variant="h4" class="text-white">Zentralitäts-Maße</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Berechnung von Metriken wie Betweenness- oder Eigenvector-Zentralität, um die einflussreichsten Knoten zu finden.
                    </Typography>
                </Card>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Bedienung</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconFilter size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Filter & Parameter</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Passe die Sensitivität der Analyse an. Du kannst entscheiden, ob nur direkte Verbindungen oder auch indirekte Pfade berücksichtigt werden sollen.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-slate-900/50 border border-white/5">
        <Typography variant="label" class="text-[10px] text-white/30 uppercase tracking-widest mb-4 block">Wichtiger Hinweis</Typography>
        <Typography variant="body" class="text-sm text-white/60">
            Große Graphen können bei komplexen Dichte-Berechnungen eine gewisse Rechenzeit beanspruchen. Du erhältst eine Benachrichtigung, sobald deine Analyse fertiggestellt wurde.
        </Typography>
    </section>
</div>
