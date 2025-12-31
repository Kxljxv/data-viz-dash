/**
 * AEA Modal Component Logic
 * 
 * Handles opening, closing, accessibility (focus trapping, ARIA),
 * and lifecycle events for modals.
 */

const AEAModal = (() => {
    let activeModal = null;
    let lastFocusedElement = null;

    /**
     * Trap focus within the modal for accessibility.
     * @param {KeyboardEvent} e 
     */
    const handleTabKey = (e) => {
        if (!activeModal) return;

        const focusableElements = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    /**
     * Handle global keyboard events (ESC, TAB).
     * @param {KeyboardEvent} e 
     */
    const handleKeydown = (e) => {
        if (!activeModal) return;

        if (e.key === 'Escape') {
            AEAModal.close();
        } else if (e.key === 'Tab') {
            handleTabKey(e);
        }
    };

    return {
        /**
         * Open a modal by ID.
         * @param {string} modalId - The ID of the modal container.
         * @param {Object} options - Configuration options.
         */
        open: (modalId, options = {}) => {
            const backdrop = document.getElementById('modalBackdrop');
            const modal = document.getElementById(modalId);

            if (!backdrop || !modal) {
                console.error(`[AEAModal] Modal with ID "${modalId}" or backdrop not found.`);
                return;
            }

            // Close existing modal if any
            if (activeModal) AEAModal.close();

            // Save reference to the element that triggered the modal
            lastFocusedElement = document.activeElement;

            // Activate
            backdrop.classList.add('active');
            modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            activeModal = modal;

            // Set initial focus
            const initialFocus = modal.querySelector('[data-autofocus]') || 
                                 modal.querySelector('.btn-primary') || 
                                 modal.querySelector('.btn-close');
            if (initialFocus) {
                setTimeout(() => initialFocus.focus(), 100); // Wait for transition
            }

            // Listen for global events
            document.addEventListener('keydown', handleKeydown);

            // Handle backdrop click
            backdrop.onclick = (e) => {
                if (e.target === backdrop && options.closeOnBackdrop !== false) {
                    AEAModal.close();
                }
            };
        },

        /**
         * Close the currently active modal.
         */
        close: () => {
            const backdrop = document.getElementById('modalBackdrop');
            if (!activeModal || !backdrop) return;

            // Deactivate
            backdrop.classList.remove('active');
            document.body.classList.remove('modal-open');
            
            // Wait for transition to finish before hiding
            setTimeout(() => {
                activeModal.classList.add('hidden');
                activeModal = null;
                
                // Return focus
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
                    lastFocusedElement = null;
                }
            }, 300);

            // Cleanup
            document.removeEventListener('keydown', handleKeydown);
            backdrop.onclick = null;
        }
    };
})();

// Export for use in other scripts
window.AEAModal = AEAModal;
