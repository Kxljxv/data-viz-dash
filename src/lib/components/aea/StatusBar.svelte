<script>
    /**
     * @typedef {Object} Props
     * @property {number} nodeCount - Die Anzahl der Knoten im Graphen
     * @property {number} linkCount - Die Anzahl der Verbindungen im Graphen
     * @property {number} activeFilters - Die Anzahl der aktiven Filter
     * @property {string} project - Der aktuelle Projektname
     */

    let { nodeCount = 0, linkCount = 0, activeFilters = 0, project = 'bdk' } = $props();

    /**
     * Formatiert eine Zahl nach deutschen Standards
     * @param {number} num - Die zu formatierende Zahl
     * @returns {string} Die formatierte Zahl
     */
    function formatNumber(num) {
        return new Intl.NumberFormat('de-DE').format(num);
    }
</script>

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2  rounded-2xl px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto, border-width:0 overall-container border-transparent shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/3.5%),0_0_0_0.5px_hsla(var(--border-300)/0.15)] hover:shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/3.5%),0_0_0_0.5px_hsla(var(--border-200)/0.3)] focus-within:shadow-[0_0.25rem_1.25rem_hsl(var(--always-black)/7.5%),0_0_0_0.5px_hsla(var(--border-200)/0.3)]">
    <div class="flex items-center space-x-4 border-r border-[hsl(var(--border-300))/0.5] pr-4 mr-2">
        <div class="flex items-center space-x-1.5">
            <span class="text-[10px] font-mono text-[hsl(var(--text-300))] uppercase tracking-widest">Projekt: {project}</span>
        </div>
        <div class="flex items-center space-x-1.5">
            <IconDatabase size={12} class="text-[hsl(var(--text-300))]" />
            <span class="text-[10px] font-mono text-[var(--text-300)] uppercase">{formatNumber(nodeCount)} Nodes</span>
        </div>
        <div class="flex items-center space-x-1.5">
            <IconLink size={12} class="text-[hsl(var(--text-300))]" />
            <span class="text-[10px] font-mono text-[var(--text-300)] uppercase">{formatNumber(linkCount)} Links</span>
        </div>
    </div>
    
    <div class="flex items-center space-x-3">

        <div class="flex items-center space-x-2">
            <div class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success-000))] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--success-000))]"></span>
            </div>
            <span class="text-[10px] font-mono text-[var(--text-300)] uppercase">Live</span>
        </div>
    </div>
</div>
