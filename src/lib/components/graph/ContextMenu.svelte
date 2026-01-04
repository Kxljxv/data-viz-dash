<script>
    import { onMount } from 'svelte';
    import { 
        IconInfoCircle, 
        IconTarget, 
        IconFocus2, 
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
            const menuWidth = 200; // estimated
            const menuHeight = 250; // estimated
            
            let posX = event.detail.x;
            let posY = event.detail.y;
            
            // Boundary checks
            if (posX + menuWidth > window.innerWidth) {
                posX = window.innerWidth - menuWidth - 10;
            }
            if (posY + menuHeight > window.innerHeight) {
                posY = window.innerHeight - menuHeight - 10;
            }
            
            node = event.detail.node;
            x = Math.max(10, posX);
            y = Math.max(10, posY);
            visible = true;
        };

        const handleClick = () => {
            visible = false;
        };

        const handleHide = () => {
            visible = false;
        };

        window.addEventListener('aea-context-menu', handleContextMenu);
        window.addEventListener('aea-context-menu-hide', handleHide);
        window.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleClick);

        return () => {
            window.removeEventListener('aea-context-menu', handleContextMenu);
            window.removeEventListener('aea-context-menu-hide', handleHide);
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
            <IconFocus2 size={14} />
            Fokus
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <button type="button" class="aea-button-group-item" onclick={highlightNode}>
            <IconTarget size={14} />
            Hervorheben
            <div class="aea-button-group-indicator"></div>
        </button>
        
        <div class="aea-button-group-divider"></div>
        
        <button type="button" class="aea-button-group-item" onclick={addToGroup}>
            <IconPlus size={14} />
            Zu Gruppe hinzufügen
            <div class="aea-button-group-indicator"></div>
        </button>
        
        {#if node?.type === 'antrag' || node?.type === 'amendment'}
            <button type="button" class="aea-button-group-item" onclick={openLink}>
                <IconFileText size={14} />
                Öffnen
                <div class="aea-button-group-indicator"></div>
            </button>
        {/if}
    </div>
{/if}
