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
        <Typography tag="h1" variant="h1" class="text-white">Kontextmenü</Typography>
        <Typography variant="body" class="text-white/60">
            Das Kontextmenü bietet schnellen Zugriff auf knotenspezifische Aktionen, ohne dass du die Seitenleiste nutzen musst.
        </Typography>
    </header>

    <section class="space-y-6">
        <Typography tag="h2" variant="h2" class="text-white">Aktionen</Typography>
        
        <div class="space-y-4">
            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconInfoCircle size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Details</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Öffnet das Detail-Panel in der rechten Seitenleiste für den ausgewählten Knoten.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconFocus2 size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Fokus</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Zentriert die Kamera auf den Knoten und zoomt leicht hinein, um eine bessere Übersicht zu erhalten.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconTarget size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Hervorheben</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Markiert den Knoten visuell im Graphen, ohne die Kamera zu bewegen. Hilfreich, um Referenzpunkte zu setzen.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconPlus size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Zu Gruppe hinzufügen</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Öffnet einen Dialog, um den Knoten einer bestehenden oder neuen Analyse-Gruppe hinzuzufügen.</Typography>
                </div>
            </Card>

            <Card class="p-6 bg-white/[0.02] border-white/5 flex gap-6 items-start">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                    <IconFileText size={20} />
                </div>
                <div class="space-y-1">
                    <Typography variant="h4" class="text-white">Öffnen (Nur Anträge)</Typography>
                    <Typography variant="body" class="text-sm text-white/50">Öffnet das zugehörige PDF-Dokument direkt im integrierten PDF-Viewer.</Typography>
                </div>
            </Card>
        </div>
    </section>

    <div class="p-6 rounded-2xl border border-white/10 bg-slate-900/50">
        <Typography variant="label" class="text-[10px] text-white/30 uppercase tracking-widest mb-4 block">Bedienung</Typography>
        <Typography variant="body" class="text-sm text-white/60">
            Klicke mit der <strong>rechten Maustaste</strong> auf einen beliebigen Knoten im Graphen oder auf ein Suchergebnis im Search-Tab, um das Menü zu öffnen. Das Menü schließt sich automatisch, wenn du eine Aktion wählst oder daneben klickst.
        </Typography>
    </div>
</div>
