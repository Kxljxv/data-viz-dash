<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { 
        IconInfoCircle, 
        IconTarget, 
        IconFocus2, 
        IconPlus, 
        IconFileText 
    } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1">Kontextmenü</Typography>
        <Typography variant="body" class="text-muted-foreground/80">
            Das Kontextmenü bietet schnellen Zugriff auf knotenspezifische Aktionen, ohne dass du die Seitenleiste nutzen musst.
        </Typography>
    </header>

    <section class="space-y-6">
        <Typography tag="h2" variant="h2">Aktionen</Typography>
        
        <div class="space-y-4">
            <Card class="p-6 bg-muted/20 border-border/50 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconInfoCircle size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Details</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Öffnet das detail-Panel in der rechten Seitenleiste für den ausgewählten Knoten.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-muted/20 border-border/50 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconFocus2 size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Fokus</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Zentriert die Kamera auf den Knoten und zoomt leicht hinein, um eine bessere Übersicht zu erhalten.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-muted/20 border-border/50 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconTarget size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Hervorheben</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Markiert den Knoten visuell im Graphen, ohne die Kamera zu bewegen. Hilfreich, um Referenzpunkte zu setzen.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-muted/20 border-border/50 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconPlus size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Zu Gruppe hinzufügen</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Öffnet einen Dialog, um den Knoten einer bestehenden oder neuen Analyse-Gruppe hinzuzufügen.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-muted/20 border-border/50 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 shrink-0">
                    <IconFileText size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4">Öffnen (Nur Anträge)</Typography>
                    <Typography variant="body" class="text-sm text-muted-foreground/50">Öffnet das zugehörige PDF-Dokument direkt im integrierten PDF-Viewer.</Typography>
                </div>
            </Card>
        </div>
    </section>

    <div class="p-6 rounded-2xl border border-border/10 bg-muted/10">
        <Typography variant="label" class="text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-4 block">Bedienung</Typography>
        <Typography variant="body" class="text-sm text-muted-foreground/60">
            Klicke mit der <strong>rechten Maustaste</strong> auf einen beliebigen Knoten im Graphen oder auf ein Suchergebnis im Search-Tab, um das Menü zu öffnen. Das Menü schließt sich automatisch, wenn du eine Aktion wählst oder daneben klickst.
        </Typography>
    </div>
</div>
