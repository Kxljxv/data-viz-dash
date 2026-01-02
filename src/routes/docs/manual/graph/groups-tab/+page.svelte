<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconBox, IconPlus, IconUpload, IconDownload } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Gruppen-Tab</Typography>
        <Typography variant="body" class="text-white/60">
            Organisiere deine Analyse durch Gruppierung von Knoten nach Themen, Regionen oder anderen Kriterien.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Gruppen erstellen</Typography>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconPlus size={20} />
                    <Typography variant="h4" class="text-white">Manuelle Gruppe</Typography>
                </div>
                <Typography variant="body" class="text-sm text-white/50">
                    Erstelle eine leere Gruppe und füge Knoten über das Kontextmenü oder das Detail-Panel einzeln hinzu.
                </Typography>
            </Card>
            <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconBox size={20} />
                    <Typography variant="h4" class="text-white">KV-Gruppe</Typography>
                </div>
                <Typography variant="body" class="text-sm text-white/50">
                    Wähle einen oder mehrere Kreisverbände aus, um automatisch alle zugehörigen Mitglieder in einer Gruppe zusammenzufassen.
                </Typography>
            </Card>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Gruppen-Verwaltung</Typography>
        <div class="space-y-4">
            <Typography variant="body" class="text-white/50 leading-relaxed">
                Jede Gruppe wird mit ihrem Namen, der Anzahl der enthaltenen Knoten und einer frei wählbaren Farbe in der Liste angezeigt. Ein Klick auf eine Gruppe öffnet den Bearbeitungsmodus.
            </Typography>
            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <Typography variant="h4" class="text-white mb-2">Visuelle Highlights</Typography>
                <Typography variant="body" class="text-sm text-white/40">
                    In den Gruppeneinstellungen kannst du eine "Density-Map" (Hitzekarte) aktivieren, die Bereiche mit hoher Konzentration von Gruppenmitgliedern farblich hervorhebt.
                </Typography>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Import & Export</Typography>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconDownload size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Export</Typography>
                    <Typography variant="body" class="text-sm text-white/40">Speichere deine Gruppen als JSON-Datei auf deinem Computer, um sie später wieder zu verwenden oder zu teilen.</Typography>
                </div>
            </div>
            <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconUpload size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Import</Typography>
                    <Typography variant="body" class="text-sm text-white/40">Lade eine zuvor exportierte JSON-Datei hoch, um deine Gruppenkonfigurationen wiederherzustellen.</Typography>
                </div>
            </div>
        </div>
    </section>
</div>
