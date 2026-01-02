<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconInfoCircle, IconFileText, IconBox, IconSettings } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Modale & Details</Typography>
        <Typography variant="body" class="text-white/60">
            Vertiefende Informationen und komplexe Konfigurationen werden in Modalen und speziellen Panels dargestellt.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Detail-Panel</Typography>
        <div class="space-y-6">
            <Typography variant="body" class="text-white/50 leading-relaxed">
                Das Detail-Panel erscheint in der rechten Seitenleiste, sobald ein Knoten ausgewählt wird. Es bietet eine strukturierte Übersicht aller verfügbaren Daten.
            </Typography>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconInfoCircle size={20} />
                        <Typography variant="h4" class="text-white">Metadaten</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Zeigt Name, ID, Typ (Antrag/Person) und spezifische Attribute wie den Kreisverband oder Antrags-Status an.
                    </Typography>
                </Card>
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconFileText size={20} />
                        <Typography variant="h4" class="text-white">Dokumente</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Bei Anträgen findest du hier direkte Links zu den PDF-Dokumenten, die im integrierten Viewer geöffnet werden können.
                    </Typography>
                </Card>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Dialoge & Modale</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconBox size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Gruppen-Editor</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Ein Modal zur Bearbeitung von Gruppennamen, Farben und Mitgliedern. Hier kannst du auch die Sichtbarkeit der Gruppe im Graphen steuern.
                    </Typography>
                </div>
            </div>

            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconSettings size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">KV-Selector</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Ein spezieller Auswahldialog für Kreisverbände. Er ermöglicht die schnelle Filterung und Gruppierung basierend auf regionalen Strukturen.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-slate-900/50 border border-white/5">
        <Typography variant="label" class="text-[10px] text-white/30 uppercase tracking-widest mb-4 block">Hinweis zum Schließen</Typography>
        <Typography variant="body" class="text-sm text-white/60">
            Die meisten Modale können durch einen Klick auf das "X" oben rechts, die Escape-Taste oder einen Klick auf den abgedunkelten Hintergrund (Overlay) geschlossen werden.
        </Typography>
    </section>
</div>
