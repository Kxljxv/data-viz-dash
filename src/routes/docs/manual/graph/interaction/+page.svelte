<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconMouse, IconZoomIn, IconHandStop, IconClick } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Interaktion mit dem Graphen</Typography>
        <Typography variant="body" class="text-white/60">
            Der interaktive Graph ist das Herzstück der Anwendung. Hier erfährst du, wie du effizient navigierst und Daten explorierst.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Navigation</Typography>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card class="p-6 bg-white/[0.02] border-white/5">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <IconHandStop size={20} />
                    </div>
                    <Typography variant="h4" class="text-white">Verschieben (Panning)</Typography>
                </div>
                <Typography variant="body" class="text-sm text-white/50">
                    Klicke auf eine freie Stelle im Graphen und ziehe die Maus, um die Ansicht zu verschieben.
                </Typography>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <IconZoomIn size={20} />
                    </div>
                    <Typography variant="h4" class="text-white">Zoomen</Typography>
                </div>
                <Typography variant="body" class="text-sm text-white/50">
                    Nutze das Mausrad, um hinein- oder herauszuzoomen. Der Zoom erfolgt immer zum Mauszeiger hin.
                </Typography>
            </Card>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Knoten-Interaktion</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconClick size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Linksklick: Auswahl</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Ein Klick auf einen Knoten wählt diesen aus und öffnet das Detail-Panel in der rechten Seitenleiste. Der Knoten wird im Graphen hervorgehoben und seine direkten Verbindungen werden deutlicher dargestellt.
                    </Typography>
                </div>
            </div>

            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconMouse size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Rechtsklick: Kontextmenü</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Öffnet ein Schnellwahl-Menü für Aktionen wie das Zentrieren der Ansicht auf den Knoten oder das Hinzufügen zu einer Gruppe.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-brand/5 border border-brand/10">
        <Typography variant="h4" class="text-brand mb-2">Pro-Tipp</Typography>
        <Typography variant="body" class="text-sm text-white/60">
            Wenn der Graph zu unübersichtlich wird, nutze die Filter im "Ansicht"-Tab, um zum Beispiel nur Anträge oder nur bestimmte Verbindungstypen anzuzeigen.
        </Typography>
    </section>
</div>
