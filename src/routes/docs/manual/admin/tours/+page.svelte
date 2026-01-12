<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconTicket, IconPlus, IconEdit, IconPlayerPlay } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1">Touren-Management</Typography>
        <Typography variant="body" class="text-muted-foreground/80">
            Erstelle geführte Touren durch deine Daten, um komplexe Zusammenhänge verständlich zu präsentieren oder neue Benutzer einzuarbeiten.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Einführung</Typography>
        <div class="space-y-6">
            <Typography variant="body" class="text-muted-foreground/60 leading-relaxed">
                Touren bestehen aus einer Abfolge von "Steps". Jeder Step fokussiert einen bestimmten Bereich des Graphen oder zeigt eine spezifische Information an. So kannst du eine Geschichte innerhalb deiner Daten erzählen.
            </Typography>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconPlus size={20} />
                        <Typography variant="h4">Neue Tour erstellen</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">
                        Klicke auf den Button "Tour hinzufügen", vergib einen Namen und eine Beschreibung, um den Editor zu starten.
                    </Typography>
                </Card>
                <Card class="p-6 bg-muted/20 border-border/50 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconEdit size={20} />
                        <Typography variant="h4">Steps bearbeiten</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">
                        Definiere für jeden Schritt die Kameraposition im Graphen, hervorgehobene Knoten und den erklärenden Text.
                    </Typography>
                </Card>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2">Präsentation</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                <div class="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-brand shrink-0">
                    <IconPlayerPlay size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4">Vorschau & Veröffentlichung</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">
                        Teste deine Tour im Vorschaumodus, bevor du sie für andere Benutzer freischaltest. Du kannst Touren jederzeit pausieren oder aktualisieren.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-muted/10 border border-border/50">
        <Typography variant="label" class="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-4 block">Best Practice</Typography>
        <Typography variant="body" class="text-sm text-muted-foreground/60">
            Halte deine Touren kurz (5-10 Schritte). Nutze klare Titel und erläutere nicht nur, *was* zu sehen ist, sondern auch, *warum* diese Information wichtig ist.
        </Typography>
    </section>
</div>
