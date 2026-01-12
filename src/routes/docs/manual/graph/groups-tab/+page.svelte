<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconBox, IconPlus, IconUpload, IconDownload } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1">Gruppen-Tab</Typography>
        <Typography variant="body" class="text-muted-foreground/80">
            Organisiere deine Analyse durch Gruppierung von Knoten nach Themen, Regionen oder anderen Kriterien.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Gruppen erstellen</Typography>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconPlus size={20} />
                    <Typography variant="h4">Manuelle Gruppe</Typography>
                </div>
                <Typography variant="body" class="text-sm text-muted-foreground/60">
                    Erstelle eine leere Gruppe und füge Knoten über das Kontextmenü oder das Detail-Panel einzeln hinzu.
                </Typography>
            </Card>
            <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                <div class="flex items-center gap-3 text-brand">
                    <IconBox size={20} />
                    <Typography variant="h4">KV-Gruppe</Typography>
                </div>
                <Typography variant="body" class="text-sm text-muted-foreground/60">
                    Wähle einen oder mehrere Kreisverbände aus, um automatisch alle zugehörigen Mitglieder in einer Gruppe zusammenzufassen.
                </Typography>
            </Card>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Gruppen-Verwaltung</Typography>
        <div class="space-y-4">
            <Typography variant="body" class="text-muted-foreground/60 leading-relaxed">
                Jede Gruppe wird mit ihrem Namen, der Anzahl der enthaltenen Knoten und einer frei wählbaren Farbe in der Liste angezeigt. Ein Klick auf eine Gruppe öffnet den Bearbeitungsmodus.
            </Typography>
            <div class="p-6 rounded-2xl bg-muted/20 border border-border/50">
                <Typography variant="h4" class="mb-2">Visuelle Highlights</Typography>
                <Typography variant="body" class="text-sm text-muted-foreground/50">
                    In den Gruppeneinstellungen kannst du eine "Density-Map" (Hitzekarte) aktivieren, die Bereiche mit hoher Konzentration von Gruppenmitgliedern farblich hervorhebt.
                </Typography>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Import & Export</Typography>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconDownload size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Export</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Speichere deine Gruppen als JSON-Datei auf deinem Computer, um sie später wieder zu verwenden oder zu teilen.</Typography>
                </div>
            </div>
            <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconUpload size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Import</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Lade eine zuvor exportierte JSON-Datei hoch, um deine Gruppenkonfigurationen wiederherzustellen.</Typography>
                </div>
            </div>
        </div>
    </section>
</div>
