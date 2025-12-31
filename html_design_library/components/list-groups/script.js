/**
 * AEA List Group Component Logic
 * 
 * Handles item selection, multi-selection, and accessibility
 * for list groups.
 */

const AEAListGroup = (() => {
    
    /**
     * Initialize selection behavior for a list group.
     * @param {string} listId - ID of the <ul> container.
     * @param {Object} options - { multiSelect: boolean, onSelect: function }
     */
    const init = (listId, options = {}) => {
        const list = document.getElementById(listId);
        if (!list) return;

        list.addEventListener('click', (e) => {
            const item = e.target.closest('.list-group-item-interactive');
            if (!item) return;

            if (!options.multiSelect) {
                // Single selection
                list.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            } else {
                // Multi selection
                item.classList.toggle('active');
            }

            if (options.onSelect) {
                options.onSelect(item, list);
            }
        });

        // Add keyboard navigation
        list.addEventListener('keydown', (e) => {
            const currentItem = document.activeElement.closest('.list-group-item-interactive');
            if (!currentItem) return;

            if (e.key === 'ArrowDown') {
                const next = currentItem.nextElementSibling;
                if (next) next.focus();
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                const prev = currentItem.previousElementSibling;
                if (prev) prev.focus();
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
                currentItem.click();
                e.preventDefault();
            }
        });
    };

    return {
        init,
        /**
         * Get all selected items in a list group.
         * @param {string} listId 
         */
        getSelected: (listId) => {
            const list = document.getElementById(listId);
            return list ? Array.from(list.querySelectorAll('.list-group-item.active')) : [];
        }
    };
})();

window.AEAListGroup = AEAListGroup;
