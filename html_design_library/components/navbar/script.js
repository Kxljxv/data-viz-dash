/**
 * AEA Navbar Component Logic
 * Handles mobile menu toggling and scroll effects.
 */

const AEANavbar = (() => {
    let navbarEl = null;
    let mobileMenuEl = null;
    let toggleBtn = null;
    let isOpen = false;

    /**
     * Initializes the navbar component.
     */
    const init = () => {
        navbarEl = document.querySelector('.aea-navbar');
        mobileMenuEl = document.querySelector('.aea-navbar-mobile');
        toggleBtn = document.querySelector('.aea-navbar-toggle');

        if (!navbarEl || !toggleBtn || !mobileMenuEl) {
            console.warn('AEANavbar: Required elements not found. Initialization skipped.');
            return;
        }

        setupEventListeners();
    };

    /**
     * Sets up event listeners for the navbar.
     */
    const setupEventListeners = () => {
        toggleBtn.addEventListener('click', toggleMobileMenu);

        // Close mobile menu on window resize if it's open and we cross the breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && isOpen) {
                closeMobileMenu();
            }
        });

        // Close mobile menu when a link is clicked
        const mobileLinks = mobileMenuEl.querySelectorAll('.aea-navbar-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Scroll effect: add shadow or change opacity on scroll
        window.addEventListener('scroll', handleScroll);
    };

    /**
     * Toggles the mobile menu open/closed.
     */
    const toggleMobileMenu = () => {
        isOpen = !isOpen;
        mobileMenuEl.classList.toggle('is-open', isOpen);
        
        // Update ARIA state
        toggleBtn.setAttribute('aria-expanded', isOpen);
        
        // Change icon (simple rotation for now, could be swapped)
        const icon = toggleBtn.querySelector('svg');
        if (icon) {
            icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        }

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    /**
     * Closes the mobile menu.
     */
    const closeMobileMenu = () => {
        if (!isOpen) return;
        isOpen = false;
        mobileMenuEl.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        
        const icon = toggleBtn.querySelector('svg');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
        
        document.body.style.overflow = '';
    };

    /**
     * Handles navbar appearance on scroll.
     */
    const handleScroll = () => {
        if (window.scrollY > 20) {
            navbarEl.classList.add('is-scrolled');
            navbarEl.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.3)';
        } else {
            navbarEl.classList.remove('is-scrolled');
            navbarEl.style.boxShadow = 'none';
        }
    };

    return {
        init,
        toggleMobileMenu,
        closeMobileMenu
    };
})();

// Initialize on DOM load if not manually initialized
document.addEventListener('DOMContentLoaded', () => {
    AEANavbar.init();
});
