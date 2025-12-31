/**
 * AEA Toggle Component Logic
 * Handles state change logging and provides a programmatic interface for toggle interactions.
 */

export class Toggle {
    constructor() {
        this.init();
    }

    /**
     * Initializes all toggle inputs on the page with standard event listeners.
     */
    init() {
        const toggleInputs = document.querySelectorAll('.aea-toggle-input');
        toggleInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleStateChange(e.target);
            });
        });
    }

    /**
     * Internal handler for toggle state changes.
     * Logs the state change to the console in a technical format.
     */
    handleStateChange(input) {
        const container = input.closest('.aea-toggle-container');
        const label = container.querySelector('.aea-toggle-label')?.textContent || 'Unnamed Toggle';
        const state = input.checked ? 'ACTIVE' : 'INACTIVE';
        
        // Dispatch custom event for external listeners
        const event = new CustomEvent('aea-toggle-change', {
            detail: {
                label: label,
                state: state,
                checked: input.checked,
                element: input
            }
        });
        input.dispatchEvent(event);

        console.debug(`[AEA SYSTEM] Toggle "${label}" state updated: ${state}`);
    }

    /**
     * Programmatically sets the state of a toggle.
     * @param {string|HTMLInputElement} selector - CSS selector or element reference.
     * @param {boolean} state - The desired checked state.
     */
    setState(selector, state) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element && element.classList.contains('aea-toggle-input')) {
            element.checked = state;
            element.dispatchEvent(new Event('change'));
        }
    }
}

// Auto-initialize if running in a browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new Toggle();
    });
}
