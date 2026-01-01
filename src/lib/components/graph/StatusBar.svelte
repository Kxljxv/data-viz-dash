<script>
    import { IconDatabase, IconLink, IconActivity } from '@tabler/icons-svelte';
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

<div class="fixed bottom-4 md:bottom-6 overflow-hidden left-1/2 -translate-x-1/2 self-center z-40 flex items-center space-x-2 rounded-2xl px-3 md:px-4 py-1.5 md:py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto border border-white/5 bg-[hsl(var(--bg-100))] backdrop-blur-xl shadow-lg w-fit max-w-[90vw] no-scrollbar">
    <div class="flex items-center space-x-3 md:space-x-4 border-r border-white/10 pr-3 md:pr-4 mr-1 md:mr-2 shrink-0">
        <div class="flex items-center space-x-1.5">
            <span class="text-[9px] md:text-[10px] font-mono text-white/50 tracking-widest truncate max-w-[60px] md:max-w-none">Projekt: {project.toUpperCase()}</span>
        </div>
        <div class="flex items-center space-x-1.5 shrink-0">
            <IconDatabase size={12} class="text-white/40" />
            <span class="text-[9px] md:text-[10px] font-mono text-white/60 ">{formatNumber(nodeCount)} Nodes</span>
        </div>
        <div class="flex items-center space-x-1.5 shrink-0">
            <IconLink size={12} class="text-white/40" />
            <span class="text-[9px] md:text-[10px] font-mono text-white/60 ">{formatNumber(linkCount)} Links</span>
        </div>
    </div>
    
    <div class="flex items-center space-x-2 md:space-x-3 shrink-0">
        <div class="flex items-center space-x-2">
            <div class="relative flex h-3 w-3 items-center justify-center">
                <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <IconActivity size={12} class="relative text-emerald-500" />
            </div>
            <span class="text-[9px] md:text-[10px] font-mono text-white/60">Live</span>
        </div>
    </div>
</div>
