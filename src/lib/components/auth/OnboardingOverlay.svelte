<script>
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "$components/ui/card";
    import { Button } from "$components/ui/button";
    import { Input } from "$components/ui/input";
    import { Label } from "$components/ui/label";
    import { Loader2, UserCircle2, MapPin } from "lucide-svelte";
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
    <Card class="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader class="space-y-1">
            <CardTitle class="text-2xl font-bold text-center">Willkommen!</CardTitle>
            <CardDescription class="text-center">
                Bevor Sie AEA nutzen können, benötigen wir noch ein paar Informationen von Ihnen.
            </CardDescription>
        </CardHeader>
        <form onsubmit={handleSubmit}>
            <CardContent class="space-y-4 py-4">
                {#if error}
                    <div class="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                        {error}
                    </div>
                {/if}

                <div class="space-y-2">
                    <Label for="full-name" class="flex items-center gap-2">
                        <UserCircle2 class="w-4 h-4 text-muted-foreground" />
                        Vollständiger Name
                    </Label>
                    <Input 
                        id="full-name" 
                        placeholder="z.B. Max Mustermann" 
                        bind:value={fullName}
                        required
                        class="bg-muted/50"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="kreisverband" class="flex items-center gap-2">
                        <MapPin class="w-4 h-4 text-muted-foreground" />
                        Kreisverband
                    </Label>
                    <Input 
                        id="kreisverband" 
                        placeholder="z.B. KV Berlin-Mitte" 
                        bind:value={kreisverband}
                        required
                        class="bg-muted/50"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" class="w-full gap-2" disabled={isSaving}>
                    {#if isSaving}
                        <Loader2 class="w-4 h-4 animate-spin" />
                        Wird gespeichert...
                    {:else}
                        Profil vervollständigen & Starten
                    {/if}
                </Button>
            </CardFooter>
        </form>
    </Card>
</div>
