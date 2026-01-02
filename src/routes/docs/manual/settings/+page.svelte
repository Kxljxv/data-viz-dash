<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconUserCircle, IconShieldLock, IconBell, IconPalette } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Profil & Sicherheit</Typography>
        <Typography variant="body" class="text-white/60">
            Passe dein Erlebnis an und verwalte deine persönlichen Kontoinformationen sowie Sicherheitseinstellungen.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Persönliches Profil</Typography>
        <div class="space-y-6">
            <Typography variant="body" class="text-white/50 leading-relaxed">
                Hier kannst du deinen Namen, deine E-Mail-Adresse und dein Profilbild verwalten. Diese Informationen sind für andere Teammitglieder in kollaborativen Projekten sichtbar.
            </Typography>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconPalette size={20} />
                        <Typography variant="h4" class="text-white">Darstellung</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Wähle zwischen verschiedenen Themes oder passe die Standard-Farben für deine Graphen-Visualisierungen an.
                    </Typography>
                </Card>
                <Card class="p-6 bg-white/[0.02] border-white/5 space-y-3">
                    <div class="flex items-center gap-3 text-brand">
                        <IconBell size={20} />
                        <Typography variant="h4" class="text-white">Benachrichtigungen</Typography>
                    </div>
                    <Typography variant="body" class="text-sm text-white/50">
                        Konfiguriere, worüber du informiert werden möchtest – zum Beispiel bei fertigen Analysen oder Erwähnungen in Kommentaren.
                    </Typography>
                </Card>
            </div>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Sicherheit</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconShieldLock size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Passwort & 2FA</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Ändere dein Passwort oder aktiviere die Zwei-Faktor-Authentisierung (2FA) für zusätzliche Sicherheit. Wir empfehlen dringend die Nutzung von 2FA.
                    </Typography>
                </div>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-slate-900/50 border border-white/5">
        <Typography variant="label" class="text-[10px] text-white/30 uppercase tracking-widest mb-4 block">Datenschutz</Typography>
        <Typography variant="body" class="text-sm text-white/60">
            Deine Daten werden verschlüsselt gespeichert und niemals ohne deine Zustimmung an Dritte weitergegeben. Weitere Informationen findest du in unserer Datenschutzerklärung.
        </Typography>
    </section>
</div>
