/**
 * AEA Speed Dial Component
 * 
 * Handles the expansion and collapse of the Speed Dial menu, 
 * including accessibility features and staggered animations.
 */

export class SpeedDial {
    constructor(element) {
        if (!element) return;
        this.sd = element;
        this.trigger = this.sd.querySelector('.aea-speed-dial-trigger');
        this.actions = this.sd.querySelectorAll('.aea-speed-dial-action');
        this.init();
    }

    init() {
        if (!this.trigger) return;

        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive()) {
                this.close();
                this.trigger.focus();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isActive() && !this.sd.contains(e.target)) {
                this.close();
            }
        });

        // Handle action clicks
        this.actions.forEach(action => {
            action.addEventListener('click', () => {
                this.close();
            });
        });
    }

    toggle() {
        const isActive = this.isActive();
        if (isActive) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.sd.classList.add('aea-active');
        this.trigger.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.sd.classList.remove('aea-active');
        this.trigger.setAttribute('aria-expanded', 'false');
    }

    isActive() {
        return this.sd.classList.contains('aea-active');
    }
}

// Auto-initialize if not using as a module
document.addEventListener('DOMContentLoaded', () => {
    const speedDials = document.querySelectorAll('.aea-speed-dial');
    speedDials.forEach(el => new SpeedDial(el));
});
