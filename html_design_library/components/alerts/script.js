/**
 * AEA Alerts Component Logic
 * 
 * Manages the dismissal and lifecycle of alert components.
 */

const AEAAlerts = (() => {
    
    /**
     * Initialize all alerts with close buttons.
     */
    const init = () => {
        const closeButtons = document.querySelectorAll('.alert-close');
        closeButtons.forEach(button => {
            // Avoid duplicate listeners
            if (button.dataset.aeaInitialized) return;
            
            button.addEventListener('click', () => {
                const alert = button.closest('.alert');
                if (alert) {
                    dismiss(alert);
                }
            });
            
            button.dataset.aeaInitialized = "true";
        });
    };

    /**
     * Programmatically dismiss an alert.
     * @param {HTMLElement|string} alertOrId - The alert element or its ID.
     */
    const dismiss = (alertOrId) => {
        const alert = typeof alertOrId === 'string' 
            ? document.getElementById(alertOrId) 
            : alertOrId;

        if (!alert) {
            console.warn('AEAAlerts: Alert element not found for dismissal.');
            return;
        }

        // Apply dismissing animation
        alert.classList.add('alert-dismissing');

        // Remove from DOM after animation completes
        alert.addEventListener('transitionend', () => {
            alert.remove();
        }, { once: true });
        
        // Fallback for browsers that might not fire transitionend if element is hidden
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 300);
    };

    /**
     * Create and show an alert programmatically.
     * @param {string} containerId - ID of the container to append to.
     * @param {Object} options - { type, title, description, autoHideMs }
     */
    const show = (containerId, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const { 
            type = 'info', 
            title = '', 
            description = '', 
            autoHideMs = 0 
        } = options;

        const alertId = `alert-${Date.now()}`;
        const icon = getIconForType(type);

        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} animate-in fade-in slide-in-from-bottom-2" role="alert">
                <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    ${icon}
                </svg>
                <div class="alert-content">
                    ${title ? `<span class="alert-title">${title}</span>` : ''}
                    <p class="alert-description">${description}</p>
                </div>
                <button class="alert-close" aria-label="Dismiss">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', alertHtml);
        const alertElement = document.getElementById(alertId);
        
        // Re-init to attach close button listener
        init();

        if (autoHideMs > 0) {
            setTimeout(() => {
                if (alertElement.parentNode) {
                    dismiss(alertElement);
                }
            }, autoHideMs);
        }

        return alertElement;
    };

    /**
     * Helper to get SVG paths for alert types.
     */
    const getIconForType = (type) => {
        switch (type) {
            case 'success':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
            case 'warning':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
            case 'danger':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />';
            case 'info':
            default:
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
        }
    };

    return {
        init,
        dismiss,
        show
    };
})();

// Expose to global scope
window.AEAAlerts = AEAAlerts;
