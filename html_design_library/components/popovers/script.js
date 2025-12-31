/**
 * AEAPopover - Singleton controller for popover overlays
 * Manages positioning, display, and dismissal of popover elements.
 */
const AEAPopover = (() => {
    let activePopover = null;
    let currentTrigger = null;

    /**
     * Shows a popover attached to a trigger element.
     * @param {HTMLElement} trigger - The element that triggered the popover.
     * @param {Object} options - Configuration options.
     * @param {string} options.title - Header title.
     * @param {string|HTMLElement} options.content - Main body content.
     * @param {string|HTMLElement} options.footer - Optional footer content.
     * @param {string} options.position - Preferred position (top, bottom, left, right).
     * @param {boolean} options.showClose - Whether to show the close button.
     */
    const show = (trigger, options = {}) => {
        // If the same trigger is clicked again, hide the popover
        if (currentTrigger === trigger) {
            hide();
            return;
        }

        hide(); // Close any existing popover

        const {
            title = '',
            content = '',
            footer = '',
            position = 'top',
            showClose = true
        } = options;

        const popover = document.createElement('div');
        popover.className = 'aea-popover';
        popover.setAttribute('role', 'dialog');
        
        // Structure
        let headerHtml = '';
        if (title || showClose) {
            headerHtml = `
                <div class="aea-popover-header">
                    <span class="aea-popover-title">${title}</span>
                    ${showClose ? `
                        <button class="aea-popover-close" aria-label="Close">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ` : ''}
                </div>
            `;
        }

        const bodyHtml = `<div class="aea-popover-body">${content}</div>`;
        const footerHtml = footer ? `<div class="aea-popover-footer">${footer}</div>` : '';
        const arrowHtml = `<div class="aea-popover-arrow"></div>`;

        popover.innerHTML = `${headerHtml}${bodyHtml}${footerHtml}${arrowHtml}`;
        document.body.appendChild(popover);

        activePopover = popover;
        currentTrigger = trigger;

        // Positioning
        updatePosition(trigger, popover, position);

        // Visibility
        requestAnimationFrame(() => {
            popover.classList.add('aea-popover-visible');
        });

        // Listeners
        if (showClose) {
            const closeBtn = popover.querySelector('.aea-popover-close');
            closeBtn?.addEventListener('click', hide);
        }

        // Global listeners for dismissal
        window.addEventListener('scroll', hide, { passive: true });
        window.addEventListener('resize', hide);
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
    };

    const hide = () => {
        if (!activePopover) return;

        const popover = activePopover;
        popover.classList.remove('aea-popover-visible');

        // Cleanup
        window.removeEventListener('scroll', hide);
        window.removeEventListener('resize', hide);
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);

        // Remove from DOM after transition
        popover.addEventListener('transitionend', () => {
            popover.remove();
        }, { once: true });

        activePopover = null;
        currentTrigger = null;
    };

    const updatePosition = (trigger, popover, preferredPos) => {
        const triggerRect = trigger.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const margin = 12; // Gap between trigger and popover

        let top, left;
        let finalPos = preferredPos;

        // Initial calculation based on preferred position
        const calculate = (pos) => {
            switch (pos) {
                case 'top':
                    return {
                        top: triggerRect.top - popoverRect.height - margin,
                        left: triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2)
                    };
                case 'bottom':
                    return {
                        top: triggerRect.bottom + margin,
                        left: triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2)
                    };
                case 'left':
                    return {
                        top: triggerRect.top + (triggerRect.height / 2) - (popoverRect.height / 2),
                        left: triggerRect.left - popoverRect.width - margin
                    };
                case 'right':
                    return {
                        top: triggerRect.top + (triggerRect.height / 2) - (popoverRect.height / 2),
                        left: triggerRect.right + margin
                    };
            }
        };

        let coords = calculate(preferredPos);

        // Boundary checks & Auto-flip
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        if (preferredPos === 'top' && coords.top < 0) {
            coords = calculate('bottom');
            finalPos = 'bottom';
        } else if (preferredPos === 'bottom' && coords.top + popoverRect.height > viewport.height) {
            coords = calculate('top');
            finalPos = 'top';
        } else if (preferredPos === 'left' && coords.left < 0) {
            coords = calculate('right');
            finalPos = 'right';
        } else if (preferredPos === 'right' && coords.left + popoverRect.width > viewport.width) {
            coords = calculate('left');
            finalPos = 'left';
        }

        // Horizontal overflow check for top/bottom
        if (finalPos === 'top' || finalPos === 'bottom') {
            if (coords.left < 10) coords.left = 10;
            if (coords.left + popoverRect.width > viewport.width - 10) {
                coords.left = viewport.width - popoverRect.width - 10;
            }
        }

        popover.style.top = `${coords.top}px`;
        popover.style.left = `${coords.left}px`;
        popover.setAttribute('data-popper-placement', finalPos);

        // Adjust arrow position
        const arrow = popover.querySelector('.aea-popover-arrow');
        if (finalPos === 'top' || finalPos === 'bottom') {
            const arrowLeft = triggerRect.left + (triggerRect.width / 2) - coords.left - 6;
            arrow.style.left = `${arrowLeft}px`;
        } else {
            const arrowTop = triggerRect.top + (triggerRect.height / 2) - coords.top - 6;
            arrow.style.top = `${arrowTop}px`;
        }
    };

    const handleOutsideClick = (e) => {
        if (activePopover && !activePopover.contains(e.target) && !currentTrigger.contains(e.target)) {
            hide();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') hide();
    };

    return { show, hide };
})();
