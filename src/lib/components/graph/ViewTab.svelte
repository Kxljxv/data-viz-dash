<script>
    import { 
        Button, 
        Checkbox, 
        Slider,
        Typography
    } from '$lib/components/aea';
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
        <Typography variant="label" class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Filter</Typography>
        <div class="grid grid-cols-1 gap-4">
            <div class="gap-5 flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                <div class="flex flex-col">
                    <Typography tag="label" for="showAntraege" variant="label" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Anträge anzeigen</Typography>
                </div>
                <Checkbox 
                    id="showAntraege"
                    checked={settings.showAntraege}
                    onchange={(checked) => onUpdate('showAntraege', checked)}
                />
            </div>

            <div class="gap-5 flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                <div class="flex flex-col">
                    <Typography tag="label" for="showSupporters" variant="label" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Unterstützer anzeigen</Typography>
                </div>
                <Checkbox 
                    id="showSupporters"
                    checked={settings.showSupporters}
                    onchange={(checked) => onUpdate('showSupporters', checked)}
                />
            </div>
        </div>
    </div>

    <div class="space-y-6">
        <Typography variant="label" class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Darstellung</Typography>
        <div class="space-y-8">
            <div class="grid grid-cols-1 gap-3">
                <div class="gap-5 flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                    <div class="flex flex-col">
                        <Typography tag="label" for="showLabels" variant="label" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Beschriftungen anzeigen</Typography>
                    </div>
                    <Checkbox 
                        id="showLabels"
                        checked={settings.showLabels}
                        onchange={(checked) => onUpdate('showLabels', checked)}
                    />
                </div>

                <div class="gap-5 flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                    <div class="flex flex-col">
                        <Typography tag="label" for="showLinks" variant="label" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Verbindungen anzeigen</Typography>
                    </div>
                    <Checkbox 
                        id="showLinks"
                        checked={settings.showLinks}
                        onchange={(checked) => onUpdate('showLinks', checked)}
                    />
                </div>

                <div class="gap-5 flex items-center justify-between p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[hsl(var(--text-500)/0.1)] hover:bg-[var(--text-primary)]/10 transition-all group">
                    <div class="flex flex-col">
                        <Typography tag="label" for="linearZoom" variant="label" class="text-xs font-bold text-[var(--text-primary)] cursor-pointer font-modern uppercase tracking-wider">Linearer Zoom</Typography>
                        <Typography variant="body" class="text-[9px] text-[var(--text-tertiary)] font-medium leading-tight mt-1">Knotengröße skaliert linear mit dem Zoom</Typography>
                    </div>
                    <Checkbox 
                        id="linearZoom"
                        checked={settings.linearZoom}
                        onchange={(checked) => onUpdate('linearZoom', checked)}
                    />
                </div>
            </div>

            <div class="space-y-4 px-2">
                <div class="flex justify-between items-center">
                    <Typography variant="label" class="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Knotengröße</Typography>
                    <span class="text-xs font-mono text-[hsl(var(--accent-pro-100))] font-bold">{settings.nodeSize}x</span>
                </div>
                <Slider 
                    value={settings.nodeSize}
                    onchange={(e) => onUpdate('nodeSize', parseFloat(e.target.value))}
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