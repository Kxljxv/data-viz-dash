<script>
    import { Button } from '$lib/components/ui/button';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { Slider } from '$lib/components/ui/slider';
    import { Label } from '$lib/components/ui/label';
    import { IconRefresh } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {any} settings - The current visualization settings
     * @property {(key: string, value: any) => void} onUpdate - Callback to update a setting
     * @property {() => void} onReset - Callback to reset the view
     */

    let { settings, onUpdate, onReset } = $props();
</script>

<div class="space-y-10">
    <div class="space-y-6">
        <h4 class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Filter</h4>
        <div class="grid grid-cols-1 gap-4">
            <div class="flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                <div class="flex flex-col">
                    <Label for="showAntraege" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Anträge anzeigen</Label>
                    <span class="text-[8px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mt-1">Status: {settings.showAntraege ? 'Aktiv' : 'Inaktiv'}</span>
                </div>
                <Checkbox 
                    id="showAntraege"
                    checked={settings.showAntraege}
                    onCheckedChange={(checked) => onUpdate('showAntraege', checked)}
                />
            </div>

            <div class="flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                <div class="flex flex-col">
                    <Label for="showSupporters" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Unterstützer anzeigen</Label>
                    <span class="text-[8px] text-[var(--text-tertiary)] uppercase font-black tracking-widest mt-1">Status: {settings.showSupporters ? 'Aktiv' : 'Inaktiv'}</span>
                </div>
                <Checkbox 
                    id="showSupporters"
                    checked={settings.showSupporters}
                    onCheckedChange={(checked) => onUpdate('showSupporters', checked)}
                />
            </div>
        </div>
    </div>

    <div class="space-y-6">
        <h4 class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Darstellung</h4>
        <div class="space-y-8">
            <div class="grid grid-cols-1 gap-3">
                <div class="flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                    <div class="flex flex-col">
                        <Label for="showLabels" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Beschriftungen anzeigen</Label>
                    </div>
                    <Checkbox 
                        id="showLabels"
                        checked={settings.showLabels}
                        onCheckedChange={(checked) => onUpdate('showLabels', checked)}
                    />
                </div>

                <div class="flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                    <div class="flex flex-col">
                        <Label for="showLinks" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Verbindungen anzeigen</Label>
                    </div>
                    <Checkbox 
                        id="showLinks"
                        checked={settings.showLinks}
                        onCheckedChange={(checked) => onUpdate('showLinks', checked)}
                    />
                </div>
            </div>

            <div class="space-y-4 px-2">
                <div class="flex justify-between items-center">
                    <Label class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Knotengröße</Label>
                    <span class="text-xs font-mono text-[hsl(var(--accent-pro-100))] font-bold">{settings.nodeSize}x</span>
                </div>
                <Slider 
                    value={[settings.nodeSize]}
                    onValueChange={(val) => onUpdate('nodeSize', val[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                />
                <div class="flex justify-between text-[8px] text-[var(--text-tertiary)] uppercase font-black tracking-widest">
                    <span>0.1x</span>
                    <span>3.0x</span>
                </div>
            </div>
        </div>
    </div>

    <Button 
        onclick={onReset}
        variant="outline"
        class="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 rounded-2xl flex items-center justify-center gap-2"
        aria-label="Ansicht zurücksetzen"
    >
        <IconRefresh size={14} />
        Ansicht zurücksetzen
    </Button>
</div>