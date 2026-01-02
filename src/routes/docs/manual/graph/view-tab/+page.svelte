<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconSettings, IconRefresh, IconEye, IconMaximize } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Ansicht-Tab</Typography>
        <Typography variant="body" class="text-white/60">
            Passe die visuelle Darstellung des Graphen an deine Bedürfnisse an.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Filter-Optionen</Typography>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                <Typography variant="h4" class="text-white">Anträge anzeigen</Typography>
                <Typography variant="body" class="text-sm text-white/50">
                    Schaltet die Sichtbarkeit aller Antrags-Knoten (rot) im Graphen um.
                </Typography>
            </Card>
            <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                <Typography variant="h4" class="text-white">Unterstützer anzeigen</Typography>
                <Typography variant="body" class="text-sm text-white/50">
                    Schaltet die Sichtbarkeit aller Personen-Knoten (blau) um.
                </Typography>
            </Card>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Darstellungseinstellungen</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconEye size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Beschriftungen & Verbindungen</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Du kannst die Namen der Knoten und die Verbindungslinien separat ein- oder ausblenden. Dies ist besonders bei großen Graphen hilfreich, um die Übersichtlichkeit zu erhöhen.
                    </Typography>
                </div>
            </div>

            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconMaximize size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Knotengröße</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Mit dem Schieberegler lässt sich die Größe aller Knoten skalieren (0.1x bis 3.0x). Größere Knoten sind einfacher zu klicken, während kleinere Knoten ein dichteres Netzwerk ermöglichen.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Aktionen</Typography>
        <div class="p-6 rounded-2xl bg-brand/5 border border-brand/10 flex items-center gap-6">
            <div class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <IconRefresh size={24} />
            </div>
            <div class="space-y-1">
                <Typography variant="h4" class="text-brand">Ansicht zurücksetzen</Typography>
                <Typography variant="body" class="text-sm text-white/50">
                    Setzt Zoom und Position des Graphen auf die Standardwerte zurück, sodass wieder das gesamte Netzwerk sichtbar ist.
                </Typography>
            </div>
        </div>
    </section>
</div>
