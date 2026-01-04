<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconUsers, IconShieldLock, IconUserPlus, IconMail } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Benutzer-Management</Typography>
        <Typography variant="body" class="text-white/60">
            Verwalte den Zugriff auf die Plattform, teile Berechtigungen zu und behalte die Sicherheit deines Systems im Blick.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Rollen & Rechte</Typography>
        <div class="space-y-6">
            <Typography variant="body" class="text-white/50 leading-relaxed">
                Das System nutzt ein rollenbasiertes Zugriffssystem (RBAC). Du kannst Benutzern verschiedene Rollen zuweisen, die bestimmen, welche Funktionen sie nutzen können.
            </Typography>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconShieldLock size={20} />
                        <Typography variant="h4" class="text-white">Administrator</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Vollständiger Zugriff auf alle Projekte, Benutzerverwaltungen und System-Einstellungen.
                    </Typography>
                </Card>
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconUsers size={20} />
                        <Typography variant="h4" class="text-white">Analyst</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Kann Graphen erkunden, Analysen durchführen und Touren erstellen, hat aber keinen Zugriff auf die Benutzerverwaltung.
                    </Typography>
                </Card>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Benutzerverwaltung</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconUserPlus size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Einladungen versenden</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Füge neue Teammitglieder per E-Mail hinzu. Sie erhalten einen Link zur Registrierung und werden automatisch deinem Workspace zugeordnet.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-slate-900/50 border border-white/5">
        <Typography variant="label" class="text-[10px] text-white/30 uppercase tracking-widest mb-4 block">Sicherheitshinweis</Typography>
        <div class="flex items-start gap-3">
            <IconMail size={18} class="text-brand shrink-0 mt-0.5" />
            <Typography variant="body" class="text-sm text-white/60">
                Achte darauf, dass Einladungs-Links aus Sicherheitsgründen nach 48 Stunden ablaufen. Nicht genutzte Einladungen können im Dashboard jederzeit neu versendet oder gelöscht werden.
            </Typography>
        </div>
    </section>
</div>
