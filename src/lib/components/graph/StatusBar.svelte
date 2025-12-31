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

<div class="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2 rounded-2xl px-3 md:px-4 py-1.5 md:py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto border border-white/5 bg-background/80 backdrop-blur-xl shadow-lg w-auto max-w-[90vw] overflow-x-auto no-scrollbar">
    <div class="flex items-center space-x-3 md:space-x-4 border-r border-white/10 pr-3 md:pr-4 mr-1 md:mr-2 shrink-0">
        <div class="flex items-center space-x-1.5">
            <span class="text-[9px] md:text-[10px] font-mono text-white/50 uppercase tracking-widest truncate max-w-[60px] md:max-w-none">PROJ: {project}</span>
        </div>
        <div class="flex items-center space-x-1.5 shrink-0">
            <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]"></span>
            <span class="text-[9px] md:text-[10px] font-mono text-white/60 uppercase">{formatNumber(nodeCount)} N</span>
        </div>
        <div class="flex items-center space-x-1.5 shrink-0">
            <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]"></span>
            <span class="text-[9px] md:text-[10px] font-mono text-white/60 uppercase">{formatNumber(linkCount)} L</span>
        </div>
    </div>
    
    <div class="flex items-center space-x-2 md:space-x-3 shrink-0">
        <div class="flex items-center space-x-2">
            <div class="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
            </div>
            <span class="text-[9px] md:text-[10px] font-mono text-white/60 uppercase">Live</span>
        </div>
    </div>
</div>
