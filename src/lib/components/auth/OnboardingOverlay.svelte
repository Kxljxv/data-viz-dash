<script>
    import { 
        Card, 
        CardContent, 
        CardDescription, 
        CardHeader, 
        CardTitle, 
        CardFooter,
        Button,
        Input,
        Spinner,
        Typography
    } from "$lib/components/aea";
    import { UserCircle2, MapPin } from "lucide-svelte";
    import { invalidateAll } from "$app/navigation";

    let { user } = $props();
    
    let fullName = $state("");
    let kreisverband = $state("");
    let isSaving = $state(false);
    let error = $state("");

    async function handleSubmit(e) {
        e.preventDefault();
        if (!fullName || !kreisverband) {
            error = "Bitte füllen Sie alle Felder aus.";
            return;
        }

        isSaving = true;
        error = "";

        try {
            const response = await fetch('/api/user-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, kreisverband })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || data.error || "Fehler beim Speichern");
            }

            // Invalidate to refresh session data and hide onboarding
            await invalidateAll();
        } catch (err) {
            console.error(err);
            error = err.message;
        } finally {
            isSaving = false;
        }
    }
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
    <Card variant="glass" class="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader class="space-y-1">
            <Typography tag="h2" variant="h2" class="text-center">Willkommen!</Typography>
            <Typography variant="body" class="text-center opacity-70">
                Bevor Sie AEA nutzen können, benötigen wir noch ein paar Informationen von Ihnen.
            </Typography>
        </CardHeader>
        <form onsubmit={handleSubmit}>
            <CardContent class="space-y-4 py-4">
                {#if error}
                    <div class="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                        {error}
                    </div>
                {/if}

                <div class="space-y-2">
                    <Typography variant="label" class="flex items-center gap-2 mb-1">
                        <UserCircle2 class="w-4 h-4 text-primary" />
                        Vollständiger Name
                    </Typography>
                    <Input 
                        id="full-name" 
                        placeholder="z.B. Max Mustermann" 
                        bind:value={fullName}
                        required
                    />
                </div>

                <div class="space-y-2">
                    <Typography variant="label" class="flex items-center gap-2 mb-1">
                        <MapPin class="w-4 h-4 text-primary" />
                        Kreisverband
                    </Typography>
                    <Input 
                        id="kreisverband" 
                        placeholder="z.B. KV Berlin-Mitte" 
                        bind:value={kreisverband}
                        required
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" variant="primary" class="w-full gap-2" disabled={isSaving}>
                    {#if isSaving}
                        <Spinner size="sm" />
                        Wird gespeichert...
                    {:else}
                        Profil vervollständigen & Starten
                    {/if}
                </Button>
            </CardFooter>
        </form>
    </Card>
</div>
