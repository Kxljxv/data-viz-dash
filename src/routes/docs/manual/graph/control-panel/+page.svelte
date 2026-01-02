<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconLayoutSidebarRight, IconSearch, IconSettings, IconBox } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Control Panel</Typography>
        <Typography variant="body" class="text-white/60">
            Das Control Panel in der rechten Seitenleiste bündelt alle Analyse-Werkzeuge und Einstellungen.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Die drei Tabs</Typography>
        
        <div class="grid grid-cols-1 gap-4">
            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-center">
                <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <IconSearch size={24} />
                </div>
                <div class="flex-1 space-y-1">
                    <Typography variant="h4" class="text-white">Suche</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Finde spezifische Anträge oder Personen über ihren Namen oder ihre ID.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-center">
                <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <IconSettings size={24} />
                </div>
                <div class="flex-1 space-y-1">
                    <Typography variant="h4" class="text-white">Ansicht</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Passe die Visualisierung an, filtere Element-Typen und steuere die Knotengröße.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-center">
                <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <IconBox size={24} />
                </div>
                <div class="flex-1 space-y-1">
                    <Typography variant="h4" class="text-white">Gruppen</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Verwalte deine Analyse-Gruppen, erstelle KV-basierte Gruppierungen und exportiere deine Daten.</Typography>
                </div>
            </Card>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Zusatzfunktionen</Typography>
        <div class="space-y-4">
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <Typography variant="h4" class="text-white mb-2">Responsives Design</Typography>
                <Typography variant="body" class="text-sm text-white/40">
                    Auf Desktop-Monitoren ist das Control Panel standardmäßig geöffnet. Auf mobilen Geräten kann es über das Menü-Icon oben rechts ein- und ausgeblendet werden, um mehr Platz für den Graphen zu schaffen.
                </Typography>
            </div>
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <Typography variant="h4" class="text-white mb-2">Dynamische Statistiken</Typography>
                <Typography variant="body" class="text-sm text-white/40">
                    Unten im Panel findest du stets aktuelle Informationen zur Anzahl der geladenen Knoten und Verbindungen sowie zum aktiven Projekt.
                </Typography>
            </div>
        </div>
    </section>
</div>
