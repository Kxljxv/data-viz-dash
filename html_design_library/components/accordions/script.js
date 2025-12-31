/**
 * AEA Accordion Component Logic
 * 
 * Manages toggling of accordion sections, height transitions, 
 * and accessibility attributes.
 */

const AEAAccordion = (() => {
    
    /**
     * Initialize accordions within a container.
     * @param {string} containerId - ID of the container element.
     * @param {Object} options - { allowMultiple: boolean, onToggle: function }
     */
    const init = (containerId, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const items = container.querySelectorAll('.accordion-item');
        const allowMultiple = options.allowMultiple || false;

        items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content-wrapper');
            
            if (!header || !content) return;

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                if (!allowMultiple && !isActive) {
                    // Close other items if multiple not allowed
                    items.forEach(otherItem => {
                        if (otherItem !== item) {
                            closeItem(otherItem);
                        }
                    });
                }

                if (isActive) {
                    closeItem(item);
                } else {
                    openItem(item);
                }

                if (options.onToggle) {
                    options.onToggle(item, !isActive);
                }
            });

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });
    };

    /**
     * Helper to open an item
     */
    const openItem = (item) => {
        const header = item.querySelector('.accordion-header');
        item.classList.add('active');
        if (header) {
            header.setAttribute('aria-expanded', 'true');
        }
    };

    /**
     * Helper to close an item
     */
    const closeItem = (item) => {
        const header = item.querySelector('.accordion-header');
        item.classList.remove('active');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
        }
    };

    return {
        init,
        /**
         * Programmatically toggle an accordion item.
         * @param {string} itemId - ID of the accordion item.
         */
        toggle: (itemId) => {
            const item = document.getElementById(itemId);
            if (item) {
                const header = item.querySelector('.accordion-header');
                if (header) header.click();
            }
        }
    };
})();

window.AEAAccordion = AEAAccordion;
