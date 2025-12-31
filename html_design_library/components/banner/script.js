/**
 * AEA Banner Component Logic
 * 
 * Manages the dismissal and initialization of banners.
 */

const AEABanner = (() => {
    
    /**
     * Initialize all banners with close buttons.
     */
    const init = () => {
        const dismissButtons = document.querySelectorAll('[data-banner-dismiss]');
        dismissButtons.forEach(button => {
            if (button.dataset.aeaInitialized) return;
            
            button.addEventListener('click', () => {
                const banner = button.closest('.banner');
                if (banner) {
                    dismiss(banner);
                }
            });
            
            button.dataset.aeaInitialized = "true";
        });
    };

    /**
     * Programmatically dismiss a banner.
     * @param {HTMLElement|string} bannerOrId - The banner element or its ID.
     */
    const dismiss = (bannerOrId) => {
        const banner = typeof bannerOrId === 'string' 
            ? document.getElementById(bannerOrId) 
            : bannerOrId;

        if (!banner) {
            console.warn('AEABanner: Banner element not found for dismissal.');
            return;
        }

        // Apply dismissal class
        banner.classList.add('banner-dismissing');

        // Remove from DOM after transition
        banner.addEventListener('transitionend', () => {
            banner.remove();
            
            // Dispatch custom event for layout adjustments if needed
            window.dispatchEvent(new CustomEvent('aea-banner-dismissed', { 
                detail: { bannerId: banner.id } 
            }));
        }, { once: true });

        // Fallback for transition failure
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 400);
    };

    /**
     * Show a banner programmatically.
     * @param {Object} options - { type, content, actions, id, position }
     */
    const show = (options = {}) => {
        const {
            type = 'info',
            content = '',
            id = `banner-${Date.now()}`,
            position = 'top', // 'top', 'bottom', or 'inline'
            sticky = true,
            containerId = null
        } = options;

        const bannerHtml = `
            <div id="${id}" class="banner banner-${type} ${sticky ? `banner-fixed-${position}` : ''} animate-in fade-in" role="status">
                <div class="banner-content">
                    <svg class="banner-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        ${getIconForType(type)}
                    </svg>
                    <div class="banner-text">${content}</div>
                </div>
                <div class="banner-actions">
                    <button class="btn-close" data-banner-dismiss aria-label="Dismiss">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) container.insertAdjacentHTML('afterbegin', bannerHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', bannerHtml);
        }

        init();
        return document.getElementById(id);
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'success':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
            case 'warning':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
            case 'danger':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />';
            default:
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />';
        }
    };

    return { init, dismiss, show };
})();

// Expose to global scope
window.AEABanner = AEABanner;
