<script>
    /**
     * @typedef {Object} NavItem
     * @property {string} label - The label for the item
     * @property {string} href - The link for the item
     * @property {import('svelte').Snippet | import('svelte').Component<any>} [icon] - Optional snippet or component for the icon
     * @property {string} [id] - Optional ID for the item
     */

    /**
     * @typedef {Object} Props
     * @property {NavItem[]} [items] - Array of navigation items
     * @property {string} [activeId] - ID of the active item
     * @property {boolean} [forceShow] - Whether to show on desktop too
     * @property {string} [class] - Additional CSS classes
     */

    /** @type {Props} */
    let { 
        items = [], 
        activeId = '', 
        forceShow = false,
        class: className = '' 
    } = $props();
</script>

<nav 
    class="aea-bottom-nav {forceShow ? 'aea-bottom-nav-force' : ''} {className}" 
    aria-label="Mobile navigation"
>
    <div class="aea-bottom-nav-inner">
        {#each items as item}
            <a 
                href={item.href} 
                class="aea-bottom-nav-item {activeId === item.id ? 'aea-bottom-nav-active' : ''}" 
                id={item.id}
            >
                <span class="aea-bottom-nav-indicator"></span>
                {#if item.icon}
                    {@const ItemIcon = item.icon}
                    {#if typeof ItemIcon === 'function' && !ItemIcon.prototype}
                        {@render ItemIcon()}
                    {:else}
                        <ItemIcon size={24} />
                    {/if}
                {/if}
                <span class="aea-bottom-nav-label">{item.label}</span>
            </a>
        {/each}
    </div>
</nav>
