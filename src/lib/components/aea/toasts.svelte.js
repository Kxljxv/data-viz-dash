/**
 * Global reactive state for managing toast notifications.
 * Uses Svelte 5 runes for high-performance reactivity.
 */

let queue = $state([]);

export const toastState = {
    /** @returns {Array} Current list of active toasts. */
    get queue() { return queue; },

    /**
     * Adds a new toast to the queue.
     * @param {Object} toast - Toast configuration.
     * @param {string} [toast.title] - Bold title text.
     * @param {string} toast.message - Secondary message text.
     * @param {'success' | 'error' | 'info' | 'warning'} [toast.type='info'] - Visual variant.
     * @param {number} [toast.duration=5000] - Auto-dismiss duration in ms (0 for persistent).
     */
    add(toast) {
        const id = crypto.randomUUID();
        const newToast = {
            id,
            title: toast.title,
            message: toast.message || '',
            type: toast.type || 'info',
            duration: toast.duration ?? 5000
        };
        
        queue.push(newToast);

        // Auto-dismiss logic
        if (newToast.duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, newToast.duration);
        }

        return id;
    },

    /**
     * Removes a specific toast from the queue.
     * @param {string} id - Unique identifier of the toast.
     */
    remove(id) {
        const index = queue.findIndex(t => t.id === id);
        if (index !== -1) {
            queue.splice(index, 1);
        }
    },

    /**
     * Clears all active toasts from the queue.
     */
    clearAll() {
        queue = [];
    }
};
