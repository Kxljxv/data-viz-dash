<script>
    import { onMount } from 'svelte';

    /**
     * @typedef {Object} Props
     * @property {any} graph - The D3 graph instance for interaction.
     */

    /** @type {Props} */
    let { graph } = $props();

    /** @type {boolean} - Whether the context menu is currently visible. */
    let visible = $state(false);
    /** @type {number} - X position of the menu in pixels. */
    let x = $state(0);
    /** @type {number} - Y position of the menu in pixels. */
    let y = $state(0);
    /** @type {any|null} - The node the menu was triggered for. */
    let node = $state(null);

    onMount(() => {
        const handleContextMenu = (event) => {
            node = event.detail.node;
            x = event.detail.x;
            y = event.detail.y;
            visible = true;
        };

        const handleClick = () => {
            visible = false;
        };

        window.addEventListener('aea-context-menu', handleContextMenu);
        window.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleClick);

        return () => {
            window.removeEventListener('aea-context-menu', handleContextMenu);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('scroll', handleClick);
        };
    });

    /**
     * Centers the view on the current node.
     */
    function centerNode() {
        if (!node) return;
        window.dispatchEvent(new CustomEvent('aea-view-action', {
            detail: { action: 'center', nodeId: node.id }
        }));
        visible = false;
    }

    /**
     * Highlights the current node in the graph.
     */
    function highlightNode() {
        if (!node) return;
        window.dispatchEvent(new CustomEvent('aea-view-action', {
            detail: { action: 'highlight', nodeId: node.id }
        }));
        visible = false;
    }

    /**
     * Selects the current node and shows its details.
     */
    function showDetails() {
        if (!node) return;
        window.dispatchEvent(new CustomEvent('aea-node-selected', {
            detail: { node, openPanel: true }
        }));
        visible = false;
    }

    /**
     * Triggers the 'add to group' action for the current node.
     */
    function addToGroup() {
        if (!node) return;
        window.dispatchEvent(new CustomEvent('aea-node-selected', {
            detail: { node, action: 'add_group' }
        }));
        visible = false;
    }

    /**
     * Opens the associated PDF in the internal viewer.
     */
    function openLink() {
        if (!node || !node.id) return;
        window.dispatchEvent(new CustomEvent('aea-node-selected', {
            detail: { node, openPanel: true, openPdf: true }
        }));
        visible = false;
    }
</script>

{#if visible}
    <div 
        class="fixed z-[6000] aea-button-group aea-button-group-vertical" 
        style="left: {x}px; top: {y}px;"
        role="menu"
    >
        <button type="button" class="aea-button-group-item" onclick={showDetails}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            Details
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <button type="button" class="aea-button-group-item" onclick={centerNode}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Fokus
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <button type="button" class="aea-button-group-item" onclick={highlightNode}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Hervorheben
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <div class="aea-button-group-divider"></div>
        
        <button type="button" class="aea-button-group-item" onclick={addToGroup}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Zu Gruppe hinzufügen
            <div class="aea-button-group-indicator"></div>
        </button>
        
        {#if node?.type === 'antrag'}
            <button type="button" class="aea-button-group-item" onclick={openLink}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Öffnen
                <div class="aea-button-group-indicator"></div>
            </button>
        {/if}
    </div>
{/if}
