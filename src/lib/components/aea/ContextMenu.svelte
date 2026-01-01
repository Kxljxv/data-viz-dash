<script>
    import { onMount } from 'svelte';
    import { 
        IconInfoCircle, 
        IconTarget, 
        IconSparkles, 
        IconPlus, 
        IconFileText 
    } from '@tabler/icons-svelte';

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
            <IconInfoCircle size={14} />
            Details
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <button type="button" class="aea-button-group-item" onclick={centerNode}>
            <IconTarget size={14} />
            Fokus
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <button type="button" class="aea-button-group-item" onclick={highlightNode}>
            <IconSparkles size={14} />
            Hervorheben
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <div class="aea-button-group-divider"></div>
        
        <button type="button" class="aea-button-group-item" onclick={addToGroup}>
            <IconPlus size={14} />
            Zu Gruppe hinzufügen
            <div class="aea-button-group-indicator"></div>
        </button>
        
        {#if node?.type === 'antrag'}
            <button type="button" class="aea-button-group-item" onclick={openLink}>
                <IconFileText size={14} />
                Öffnen
                <div class="aea-button-group-indicator"></div>
            </button>
        {/if}
    </div>
{/if}
