/**
 * AEATooltip - Singleton controller for tooltip management
 * Handles declarative (data-tooltip) and programmatic tooltips.
 */
const AEATooltip = (() => {
    let tooltipEl = null;
    let activeTrigger = null;
    let showTimeout = null;
    const SHOW_DELAY = 200; // ms

    const init = () => {
        // Create tooltip element if it doesn't exist
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'aea-tooltip';
            tooltipEl.setAttribute('role', 'tooltip');
            tooltipEl.id = 'aea-global-tooltip';
            document.body.appendChild(tooltipEl);
        }

        // Delegate events for declarative tooltips
        document.addEventListener('mouseover', handleTriggerEnter);
        document.addEventListener('mouseout', handleTriggerLeave);
        document.addEventListener('focusin', handleTriggerEnter);
        document.addEventListener('focusout', handleTriggerLeave);

        // Hide on scroll/resize
        window.addEventListener('scroll', hide, { passive: true });
        window.addEventListener('resize', hide, { passive: true });
    };

    const handleTriggerEnter = (e) => {
        const trigger = e.target.closest('[data-tooltip]');
        if (!trigger) return;

        activeTrigger = trigger;
        const content = trigger.getAttribute('data-tooltip');
        const position = trigger.getAttribute('data-tooltip-position') || 'top';

        clearTimeout(showTimeout);
        showTimeout = setTimeout(() => {
            show(trigger, content, position);
        }, SHOW_DELAY);
    };

    const handleTriggerLeave = (e) => {
        const trigger = e.target.closest('[data-tooltip]');
        if (!trigger || trigger !== activeTrigger) return;
        
        hide();
    };

    const show = (target, content, position = 'top') => {
        if (!tooltipEl || !content) return;

        // Set content
        tooltipEl.innerHTML = content;
        
        // Reset classes
        tooltipEl.className = 'aea-tooltip';
        tooltipEl.classList.add(`aea-tooltip-${position}`);

        // Calculate position
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect(); // Note: may be 0/0 if not visible yet, but we need height/width
        
        // Temporarily show to get dimensions
        tooltipEl.style.visibility = 'hidden';
        tooltipEl.style.display = 'block';
        const actualWidth = tooltipEl.offsetWidth;
        const actualHeight = tooltipEl.offsetHeight;
        tooltipEl.style.display = '';
        tooltipEl.style.visibility = '';

        let top, left;

        switch (position) {
            case 'top':
                top = targetRect.top - actualHeight - 12; // 12px gap for arrow
                left = targetRect.left + (targetRect.width / 2) - (actualWidth / 2);
                break;
            case 'bottom':
                top = targetRect.bottom + 12;
                left = targetRect.left + (targetRect.width / 2) - (actualWidth / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (actualHeight / 2);
                left = targetRect.left - actualWidth - 12;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (actualHeight / 2);
                left = targetRect.right + 12;
                break;
        }

        // Screen boundary checks
        const PADDING = 10;
        if (left < PADDING) left = PADDING;
        if (left + actualWidth > window.innerWidth - PADDING) left = window.innerWidth - actualWidth - PADDING;
        if (top < PADDING) top = PADDING;
        if (top + actualHeight > window.innerHeight - PADDING) top = window.innerHeight - actualHeight - PADDING;

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
        
        // Make visible
        requestAnimationFrame(() => {
            tooltipEl.classList.add('aea-tooltip-visible');
        });

        // Accessibility association
        target.setAttribute('aria-describedby', tooltipEl.id);
    };

    const hide = () => {
        clearTimeout(showTimeout);
        if (tooltipEl) {
            tooltipEl.classList.remove('aea-tooltip-visible');
            if (activeTrigger) {
                activeTrigger.removeAttribute('aria-describedby');
            }
        }
        activeTrigger = null;
    };

    return { init, show, hide };
})();

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AEATooltip.init);
} else {
    AEATooltip.init();
}
