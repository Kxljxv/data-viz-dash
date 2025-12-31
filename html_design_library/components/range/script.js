/**
 * AEA Range Component Logic
 * Manages range input value updates, progress filling, and dynamic labels.
 */

export class Range {
    constructor() {
        this.init();
    }

    init() {
        const rangeInputs = document.querySelectorAll('.aea-range-input');
        rangeInputs.forEach(input => {
            this.updateProgress(input);
            
            input.addEventListener('input', (e) => {
                this.updateProgress(e.target);
                this.updateLabel(e.target);
            });
        });
    }

    /**
     * Updates the CSS variable --range-progress based on the current value.
     * This is used for the track fill effect in WebKit browsers.
     */
    updateProgress(input) {
        const min = input.min || 0;
        const max = input.max || 100;
        const value = input.value;
        const percent = ((value - min) / (max - min)) * 100;
        
        input.style.setProperty('--range-progress', `${percent}%`);
    }

    /**
     * Updates the associated value label if it exists.
     * Looks for an element with class .aea-range-value within the same container.
     */
    updateLabel(input) {
        const container = input.closest('.aea-range-container');
        if (container) {
            const valueDisplay = container.querySelector('.aea-range-value');
            if (valueDisplay) {
                valueDisplay.textContent = input.value;
            }
        }
    }
}

// Auto-initialize if not being imported as a module
document.addEventListener('DOMContentLoaded', () => {
    new Range();
});
