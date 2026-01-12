<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconLayoutDashboard, IconChartBar, IconNetwork, IconHistory } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1">Dashboard</Typography>
        <Typography variant="body" class="text-muted-foreground">
            Dein zentraler Ausgangspunkt für alle Analysen und Projekte. Hier erhältst du einen schnellen Überblick über den Status deiner Daten.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Statistiken & Übersicht</Typography>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconNetwork size={20} />
                    <Typography variant="h4">Projekte</Typography>
                </div>
                <Typography variant="body" class="text-sm text-muted-foreground/80">
                    Sieh auf einen Blick, wie viele Projekte aktiv sind und greife direkt auf deine zuletzt bearbeiteten Graphen zu.
                </Typography>
            </Card>
            <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconChartBar size={20} />
                    <Typography variant="h4">Analysen</Typography>
                </div>
                <Typography variant="body" class="text-sm text-muted-foreground/80">
                    Verfolge den Fortschritt deiner laufenden Analysen und sieh, welche Ergebnisse bereits zur Verfügung stehen.
                </Typography>
            </Card>
            <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconHistory size={20} />
                    <Typography variant="h4">Aktivität</Typography>
                </div>
                <Typography variant="body" class="text-sm text-muted-foreground/80">
                    Bleibe informiert über die letzten Änderungen in deinen Projekten oder neue Zuweisungen durch Administratoren.
                </Typography>
            </Card>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Navigation</Typography>
        <div class="space-y-6">
            <Typography variant="body" class="text-muted-foreground/80 leading-relaxed">
                Über die Seitenleiste links kannst du jederzeit zwischen den Hauptbereichen der Anwendung wechseln:
            </Typography>
            <div class="space-y-4">
                <div class="flex gap-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                    <div class="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-brand shrink-0">
                        <IconLayoutDashboard size={24} />
                    </div>
                    <div class="space-y-2">
                        <Typography variant="h4">Home</Typography>
                        <Typography variant="body" class="text-sm text-muted-foreground/60">
                            Kehre jederzeit zur Übersicht zurück, um einen neuen Arbeitsbereich zu wählen.
                        </Typography>
                    </div>
                </div>
                <div class="flex gap-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                    <div class="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-brand shrink-0">
                        <IconNetwork size={24} />
                    </div>
                    <div class="space-y-2">
                        <Typography variant="h4">Graph-Explorer</Typography>
                        <Typography variant="body" class="text-sm text-muted-foreground/60">
                            Der Kern der Anwendung. Hier visualisierst und analysierst du die Beziehungen zwischen deinen Datenpunkten.
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-muted/20 border border-border/50">
        <Typography variant="label" class="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-4 block">Profi-Tipp</Typography>
        <Typography variant="body" class="text-sm text-muted-foreground">
            Nutze die Suchfunktion im Dashboard, um schnell nach bestimmten Projekten oder Analyse-Ergebnissen zu suchen, ohne durch alle Listen scrollen zu müssen.
        </Typography>
    </section>
</div>
