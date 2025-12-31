/**
 * AEASidebar - Singleton controller for the primary navigation sidebar.
 * Handles mini/full states, mobile visibility, and state persistence.
 */
const AEASidebar = (() => {
    let sidebarEl = null;
    let backdropEl = null;
    let isMini = false;
    let isOpen = false;

    /**
     * Initializes the sidebar component.
     */
    const init = () => {
        sidebarEl = document.querySelector('.aea-sidebar');
        if (!sidebarEl) return;

        // Load saved state from localStorage
        const savedState = localStorage.getItem('aea-sidebar-mini');
        if (savedState !== null) {
            isMini = savedState === 'true';
            sidebarEl.classList.toggle('is-mini', isMini);
        }

        setupEventListeners();
        createBackdrop();
    };

    /**
     * Sets up event listeners for toggle buttons and mobile backdrop.
     */
    const setupEventListeners = () => {
        const toggleBtns = document.querySelectorAll('.aea-sidebar-toggle');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMobile();
                } else {
                    toggleMini();
                }
            });
        });

        // Handle collapsible groups
        const groupHeaders = sidebarEl.querySelectorAll('.aea-sidebar-group-header');
        groupHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const group = header.closest('.aea-sidebar-group');
                group.classList.toggle('is-collapsed');
            });
        });

        // Close on mobile when clicking a link
        const navLinks = sidebarEl.querySelectorAll('.aea-sidebar-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMobile();
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isOpen) {
                closeMobile();
            }
        });
    };

    /**
     * Creates the mobile backdrop overlay.
     */
    const createBackdrop = () => {
        backdropEl = document.createElement('div');
        backdropEl.className = 'aea-sidebar-backdrop';
        document.body.appendChild(backdropEl);

        backdropEl.addEventListener('click', closeMobile);
    };

    /**
     * Toggles the "mini" (collapsed) state on desktop.
     */
    const toggleMini = () => {
        isMini = !isMini;
        sidebarEl.classList.toggle('is-mini', isMini);
        localStorage.setItem('aea-sidebar-mini', isMini);

        // Dispatch event for other components to react (e.g. resize graph)
        window.dispatchEvent(new CustomEvent('aea-sidebar-resize', {
            detail: { isMini, width: isMini ? 80 : 280 }
        }));
    };

    /**
     * Toggles the sidebar visibility on mobile.
     */
    const toggleMobile = () => {
        isOpen = !isOpen;
        sidebarEl.classList.toggle('is-open', isOpen);
        backdropEl.classList.toggle('is-visible', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    /**
     * Explicitly closes the mobile sidebar.
     */
    const closeMobile = () => {
        isOpen = false;
        sidebarEl.classList.remove('is-open');
        backdropEl.classList.remove('is-visible');
        document.body.style.overflow = '';
    };

    /**
     * Programmatically set the active item.
     * @param {string} href - The href of the item to activate.
     */
    const setActive = (href) => {
        const items = sidebarEl.querySelectorAll('.aea-sidebar-item');
        items.forEach(item => {
            const active = item.getAttribute('href') === href;
            item.classList.toggle('is-active', active);
        });
    };

    return { init, toggleMini, toggleMobile, closeMobile, setActive };
})();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AEASidebar.init);
} else {
    AEASidebar.init();
}
