/**
 * AEA Checkbox Component Logic
 * Manages state change events and provides a programmatic interface for checkbox interactions.
 */

export class Checkbox {
    constructor() {
        this.init();
    }

    /**
     * Initializes all checkbox inputs on the page with standard event listeners.
     */
    init() {
        const checkboxInputs = document.querySelectorAll('.aea-checkbox-input');
        checkboxInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleStateChange(e.target);
            });
        });
    }

    /**
     * Internal handler for checkbox state changes.
     * Logs the state change to the console in a technical format.
     */
    handleStateChange(input) {
        const container = input.closest('.aea-checkbox-container');
        const label = container.querySelector('.aea-checkbox-label')?.textContent || 'Unnamed Checkbox';
        const state = input.checked ? 'SELECTED' : 'DESELECTED';
        
        // Dispatch custom event for external listeners
        const event = new CustomEvent('aea-checkbox-change', {
            detail: {
                label: label,
                state: state,
                checked: input.checked,
                element: input
            }
        });
        input.dispatchEvent(event);

        console.debug(`[AEA SYSTEM] Checkbox "${label}" state updated: ${state}`);
    }

    /**
     * Programmatically sets the state of a checkbox.
     * @param {string|HTMLInputElement} selector - CSS selector or element reference.
     * @param {boolean} state - The desired checked state.
     */
    setState(selector, state) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element && element.classList.contains('aea-checkbox-input')) {
            element.checked = state;
            element.dispatchEvent(new Event('change'));
        }
    }
}

// Auto-initialize if running in a browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new Checkbox();
    });
}
