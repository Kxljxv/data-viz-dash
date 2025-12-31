/**
 * AEA Radio Component Logic
 * Manages radio group states and dispatches custom events for system integration.
 */

export class RadioManager {
    constructor() {
        this.init();
    }

    /**
     * Initializes all radio inputs within the design system.
     */
    init() {
        const radios = document.querySelectorAll('.aea-radio-input');
        
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (radio.checked) {
                    this.handleRadioChange(radio);
                }
            });

            // Accessibility: Handle keyboard interactions for focus states
            radio.addEventListener('focus', () => {
                radio.parentElement.classList.add('aea-radio-focused');
            });

            radio.addEventListener('blur', () => {
                radio.parentElement.classList.remove('aea-radio-focused');
            });
        });
    }

    /**
     * Handles the change event for a radio input.
     * Dispatches a custom event for the group.
     */
    handleRadioChange(radio) {
        const groupName = radio.name;
        const value = radio.value;
        const label = radio.parentElement.querySelector('.aea-radio-label, .aea-radio-hud-title')?.textContent || value;

        // Find the group container if it exists
        const groupContainer = radio.closest('.aea-radio-group') || radio.parentElement.parentElement;

        const event = new CustomEvent('aea-radio-change', {
            detail: {
                group: groupName,
                value: value,
                label: label,
                element: radio
            }
        });

        radio.dispatchEvent(event);
        
        // Log technical feedback
        console.debug(`[AEA SYSTEM] Radio Group "${groupName}" updated. Selected: ${value} (${label})`);

        // Optional: Trigger haptic-like visual feedback on the group
        if (groupContainer) {
            this.triggerGroupFeedback(groupContainer);
        }
    }

    /**
     * Adds a subtle "ping" or "pulse" to the group when a selection changes.
     */
    triggerGroupFeedback(container) {
        container.classList.add('aea-radio-group-pulse');
        setTimeout(() => {
            container.classList.remove('aea-radio-group-pulse');
        }, 300);
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new RadioManager();
    });
}
