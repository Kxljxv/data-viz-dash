<script>
    /**
     * @typedef {Object} LegendItem
     * @property {string} label - Die Beschriftung des Elements
     * @property {string} color - Die Farbe des Elements
     * @property {string} [icon] - Der SVG-Pfad für das Icon
     * @property {boolean} [isLink] - Ob das Element eine Verbindung darstellt
     */

    /** @type {LegendItem[]} */
    const legendItems = [
        { label: 'Antrag', color: 'hsl(var(--accent-pro-100))', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { label: 'Person', color: 'var(--text-primary)', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { label: 'Verbindung', color: 'hsl(var(--border-300))', isLink: true }
    ];
</script>

<div class="fixed bottom-6 right-6 z-40 bg-[var(--bg-300)] border border-[hsl(var(--border-300))] rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500 pointer-events-auto max-w-[200px]">
    <h4 class="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Legende</h4>
    <div class="space-y-3">
        {#each legendItems as item}
            <div class="flex items-center space-x-3 group">
                <div class="relative flex items-center justify-center">
                    {#if item.isLink}
                        <div class="w-6 h-0.5 rounded-full" style="background: {item.color}"></div>
                    {:else}
                        <div 
                            class="w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 border" 
                            style="background-color: {item.color}; border-color: {item.color}; opacity: 0.8;"
                        >
                            <svg class="w-3.5 h-3.5" style="color: {item.color.includes('text') ? 'var(--bg-100)' : 'white'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d={item.icon} />
                            </svg>
                        </div>
                    {/if}
                </div>
                <span class="text-xs text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors">{item.label}</span>
            </div>
        {/each}
    </div>
</div>
