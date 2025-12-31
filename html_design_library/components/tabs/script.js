/**
 * AEA Tabs Component Logic
 * 
 * Handles tab switching, panel visibility, and accessibility attributes.
 */

const AEATabs = (() => {
    
    /**
     * Initialize tab behavior for a container.
     * @param {string} containerId - ID of the element containing tab triggers.
     * @param {Object} options - { onTabChange: function }
     */
    const init = (containerId, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const triggers = container.querySelectorAll('[role="tab"]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const targetPanelId = trigger.getAttribute('aria-controls');
                const targetPanel = document.getElementById(targetPanelId);
                
                if (!targetPanel) return;

                // Deactivate all triggers in this tablist
                triggers.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                    t.setAttribute('tabindex', '-1');
                });

                // Deactivate all panels related to these triggers
                triggers.forEach(t => {
                    const panelId = t.getAttribute('aria-controls');
                    const panel = document.getElementById(panelId);
                    if (panel) panel.classList.remove('active');
                });

                // Activate selected trigger
                trigger.classList.add('active');
                trigger.setAttribute('aria-selected', 'true');
                trigger.setAttribute('tabindex', '0');

                // Activate selected panel
                targetPanel.classList.add('active');

                if (options.onTabChange) {
                    options.onTabChange(trigger, targetPanel);
                }
            });

            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                let nextTrigger;
                const triggerArray = Array.from(triggers);
                const currentIndex = triggerArray.indexOf(trigger);

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    nextTrigger = triggerArray[currentIndex + 1] || triggerArray[0];
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    nextTrigger = triggerArray[currentIndex - 1] || triggerArray[triggerArray.length - 1];
                } else if (e.key === 'Home') {
                    nextTrigger = triggerArray[0];
                } else if (e.key === 'End') {
                    nextTrigger = triggerArray[triggerArray.length - 1];
                }

                if (nextTrigger) {
                    nextTrigger.focus();
                    nextTrigger.click(); // Automatic activation on focus
                    e.preventDefault();
                }
            });
        });
    };

    return {
        init,
        /**
         * Programmatically switch to a tab.
         * @param {string} tabId - ID of the tab trigger.
         */
        setActive: (tabId) => {
            const trigger = document.getElementById(tabId);
            if (trigger) trigger.click();
        }
    };
})();

window.AEATabs = AEATabs;
