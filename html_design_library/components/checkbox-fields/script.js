/**
 * AEA Checkbox Fields Logic
 * Manages the state of button-style multi-select fields and their glowing indicators.
 */

export class CheckboxFields {
    constructor() {
        this.init();
    }

    /**
     * Initializes all checkbox field buttons on the page.
     */
    init() {
        const fields = document.querySelectorAll('.aea-checkbox-field');
        fields.forEach(field => {
            field.addEventListener('click', (e) => {
                this.toggleField(field);
            });

            // Accessibility: Allow Space and Enter keys
            field.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleField(field);
                }
            });
        });
    }

    /**
     * Toggles the active state of a field.
     * Updates aria-pressed and dispatches a custom event.
     */
    toggleField(field) {
        const isPressed = field.getAttribute('aria-pressed') === 'true';
        const newState = !isPressed;
        
        field.setAttribute('aria-pressed', newState.toString());
        
        this.handleStateChange(field, newState);
    }

    /**
     * Internal handler for state changes.
     * Logs the update and dispatches a custom event for external integration.
     */
    handleStateChange(field, isActive) {
        const label = field.querySelector('.aea-checkbox-field-label')?.textContent || 'Unnamed Field';
        const indicator = field.getAttribute('data-aea-indicator') || 'default';
        
        // Dispatch custom event
        const event = new CustomEvent('aea-checkbox-field-change', {
            detail: {
                label: label,
                isActive: isActive,
                indicator: indicator,
                element: field
            }
        });
        field.dispatchEvent(event);

        console.debug(`[AEA SYSTEM] Checkbox Field "${label}" updated. State: ${isActive ? 'ACTIVE' : 'INACTIVE'} (Indicator: ${indicator})`);
    }

    /**
     * Programmatically sets the state of a checkbox field.
     * @param {string|HTMLElement} selector - CSS selector or element reference.
     * @param {boolean} state - The desired active state.
     */
    setState(selector, state) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element && element.classList.contains('aea-checkbox-field')) {
            element.setAttribute('aria-pressed', state.toString());
            this.handleStateChange(element, state);
        }
    }
}

// Auto-initialize if running in a browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new CheckboxFields();
    });
}
