/**
 * Drawer Component Interactivity
 * 
 * Provides a simple API to open and close drawers.
 */

const AEADrawer = {
    /**
     * Open a specific drawer
     * @param {string} drawerId - The ID of the drawer element
     */
    open: (drawerId) => {
        const drawer = document.getElementById(drawerId);
        const backdrop = document.getElementById('drawerBackdrop');
        
        if (drawer && backdrop) {
            backdrop.classList.add('active');
            drawer.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus trap or initial focus could be added here
            const closeBtn = drawer.querySelector('.btn-close');
            if (closeBtn) closeBtn.focus();
        }
    },

    /**
     * Close all active drawers
     */
    closeAll: () => {
        const backdrop = document.getElementById('drawerBackdrop');
        const activeDrawers = document.querySelectorAll('.drawer.active');
        
        if (backdrop) backdrop.classList.remove('active');
        activeDrawers.forEach(drawer => drawer.classList.remove('active'));
        document.body.style.overflow = '';
    }
};

// Initialize event listeners for backdrop and escape key
document.addEventListener('DOMContentLoaded', () => {
    const backdrop = document.getElementById('drawerBackdrop');
    if (backdrop) {
        backdrop.addEventListener('click', AEADrawer.closeAll);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') AEADrawer.closeAll();
    });
});
