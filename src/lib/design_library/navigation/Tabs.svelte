<script>
    /**
     * @typedef {Object} Tab
     * @property {string} id - Unique identifier for the tab
     * @property {string} label - Display label for the tab
     * @property {string} [icon] - Optional icon (HTML string or icon name)
     */

    /**
     * @typedef {Object} Props
     * @property {Tab[]} tabs - List of tabs
     * @property {string} activeTab - Currently active tab ID
     * @property {boolean} [vertical=false] - Whether tabs are displayed vertically
     * @property {boolean} [pills=false] - Whether to use pill-style tabs
     * @property {string} [class=''] - Additional CSS classes for the container
     * @property {(id: string) => void} [onchange] - Callback when active tab changes
     * @property {import('svelte').Snippet<[string]>} [children] - Content for the active tab, receives the active tab ID
     */

    let {
        tabs = [],
        activeTab = $bindable(),
        vertical = false,
        pills = false,
        class: className = '',
        onchange,
        children
    } = $props();

    function handleTabClick(id) {
        activeTab = id;
        if (onchange) onchange(id);
    }
</script>

<div class="flex {vertical ? 'flex-row' : 'flex-col'} {className}">
    <div 
        class="tabs-container {vertical ? 'tabs-vertical' : ''} {pills ? 'tabs-pills' : ''}"
        role="tablist"
    >
        {#each tabs as tab}
            <button
                type="button"
                class="tab-trigger {activeTab === tab.id ? 'active' : ''}"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="{tab.id}-panel"
                id="{tab.id}-tab"
                onclick={() => handleTabClick(tab.id)}
            >
                {#if tab.icon}
                    <span class="tab-icon">{@html tab.icon}</span>
                {/if}
                {tab.label}
            </button>
        {/each}
    </div>

    <div class="flex-1">
        {#each tabs as tab}
            <div
                class="tab-panel {activeTab === tab.id ? 'active' : ''}"
                id="{tab.id}-panel"
                role="tabpanel"
                aria-labelledby="{tab.id}-tab"
                hidden={activeTab !== tab.id}
            >
                {#if activeTab === tab.id && children}
                    {@render children(tab.id)}
                {/if}
            </div>
        {/each}
    </div>
</div>
