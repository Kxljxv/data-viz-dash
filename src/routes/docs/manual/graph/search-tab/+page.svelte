<script>
    import { Typography, Card, Badge } from '$lib/components/aea';
    import { IconSearch, IconSearchOff, IconClick } from '@tabler/icons-svelte';
</script>

<div class="space-y-12">
    <header class="space-y-4">
        <Typography tag="h1" variant="h1" class="text-white">Suche-Tab</Typography>
        <Typography variant="body" class="text-white/60">
            Das Suche-Tab ermöglicht das schnelle Auffinden von Entitäten im Graphen.
        </Typography>
    </header>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Funktionsweise</Typography>
        <div class="space-y-4">
            <Typography variant="body" class="text-white/50 leading-relaxed">
                Die Suche durchsucht in Echtzeit alle geladenen Knoten. Es werden folgende Felder berücksichtigt:
            </Typography>
            <ul class="space-y-2 list-disc list-inside text-white/40 text-sm ml-4">
                <li><strong>Label:</strong> Der Name der Person oder der Titel des Antrags.</li>
                <li><strong>Sublabel:</strong> Zusatzinformationen wie der Kreisverband (KV).</li>
                <li><strong>ID:</strong> Die eindeutige technische Kennung.</li>
            </ul>
        </div>
    </section>

    <section class="space-y-8">
        <Typography tag="h2" variant="h2" class="text-white">Suchergebnisse</Typography>
        <div class="space-y-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand shrink-0">
                    <IconClick size={24} />
                </div>
                <div class="space-y-2">
                    <Typography variant="h4" class="text-white">Navigation per Klick</Typography>
                    <Typography variant="body" class="text-sm text-white/40">
                        Ein Klick auf ein Suchergebnis zentriert den Graphen sofort auf diesen Knoten und hebt ihn hervor. Gleichzeitig werden seine Details im Detail-Panel angezeigt.
                    </Typography>
                </div>
            </div>

            <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
                <Typography variant="h4" class="text-white mb-2">Keine Ergebnisse?</Typography>
                <Typography variant="body" class="text-sm text-white/40">
                    Die Suche beginnt ab einer Eingabe von <strong>2 Zeichen</strong>. Wenn keine Ergebnisse gefunden werden, stelle sicher, dass der Suchbegriff korrekt geschrieben ist oder probiere einen Teil des Namens.
                </Typography>
            </div>
        </div>
    </section>

    <section class="p-8 rounded-3xl bg-slate-900/50 border border-white/5">
        <Typography variant="label" class="text-[10px] text-white/30 uppercase tracking-widest mb-4 block">Erweiterte Info</Typography>
        <Typography variant="body" class="text-sm text-white/50">
            Die Suchergebnisse sind auf die relevantesten Treffer begrenzt, um die Performance hochzuhalten. Falls du eine Person nicht findest, könnte es sein, dass sie unter einem anderen Namen (z.B. mit/ohne Titel) geführt wird.
        </Typography>
    </section>
</div>
