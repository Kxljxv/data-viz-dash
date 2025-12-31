/**
 * AEA Stepper Component Logic
 * 
 * Manages multi-step processes, active states, and navigation.
 */

export class Stepper {
    /**
     * Initializes a stepper instance.
     * @param {HTMLElement|string} element - The stepper container element or selector.
     * @param {Object} options - Configuration options.
     * @param {number} [options.initialStep=1] - The starting step index (1-based).
     * @param {Function} [options.onStepChange] - Callback fired when step changes.
     * @param {boolean} [options.linear=true] - If true, steps must be completed in order.
     */
    constructor(element, options = {}) {
        this.container = typeof element === 'string' ? document.querySelector(element) : element;
        if (!this.container) return;

        this.options = {
            initialStep: 1,
            linear: true,
            onStepChange: null,
            ...options
        };

        this.steps = Array.from(this.container.querySelectorAll('.aea-step'));
        this.lines = Array.from(this.container.querySelectorAll('.aea-step-line'));
        this.currentStep = this.options.initialStep;

        this.init();
    }

    init() {
        this.updateUI();
        this.bindEvents();
    }

    bindEvents() {
        // Allow clicking on previous steps if not strictly linear or if step is already completed
        this.steps.forEach((step, index) => {
            step.addEventListener('click', () => {
                const stepNum = index + 1;
                if (!this.options.linear || stepNum < this.currentStep || step.classList.contains('aea-step-completed')) {
                    this.goToStep(stepNum);
                }
            });

            // Accessibility
            step.setAttribute('role', 'listitem');
            step.setAttribute('tabindex', '0');
            step.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    step.click();
                }
            });
        });

        this.container.setAttribute('role', 'list');
    }

    /**
     * Navigates to a specific step.
     * @param {number} stepNum - The target step index (1-based).
     */
    goToStep(stepNum) {
        if (stepNum < 1 || stepNum > this.steps.length) return;
        
        const prevStep = this.currentStep;
        this.currentStep = stepNum;
        
        this.updateUI();

        if (this.options.onStepChange) {
            this.options.onStepChange({
                currentStep: this.currentStep,
                previousStep: prevStep,
                totalSteps: this.steps.length
            });
        }
    }

    /**
     * Advances to the next step.
     */
    next() {
        if (this.currentStep < this.steps.length) {
            this.goToStep(this.currentStep + 1);
        }
    }

    /**
     * Goes back to the previous step.
     */
    prev() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    /**
     * Updates the visual state of all steps and connecting lines.
     */
    updateUI() {
        this.steps.forEach((step, index) => {
            const stepNum = index + 1;
            const marker = step.querySelector('.aea-step-marker');
            
            // Clear classes
            step.classList.remove('aea-step-active', 'aea-step-completed');
            step.removeAttribute('aria-current');

            if (stepNum === this.currentStep) {
                step.classList.add('aea-step-active');
                step.setAttribute('aria-current', 'step');
                
                // Restore number if it was a checkmark
                if (marker && !marker.querySelector('svg')) {
                    marker.textContent = stepNum;
                }
            } else if (stepNum < this.currentStep) {
                step.classList.add('aea-step-completed');
                
                // Show checkmark for completed steps
                if (marker) {
                    marker.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                    `;
                }
            } else {
                // Future steps: restore number
                if (marker) {
                    marker.textContent = stepNum;
                }
            }
        });

        // Lines are handled by CSS sibling selectors usually, 
        // but for complex logic we could toggle classes here too.
    }

    /**
     * Resets the stepper to the initial step.
     */
    reset() {
        this.goToStep(this.options.initialStep);
    }
}

// Auto-initialize if elements with data-aea-stepper exist
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const autoSteppers = document.querySelectorAll('[data-aea-stepper]');
        autoSteppers.forEach(el => new Stepper(el));
    });
}
