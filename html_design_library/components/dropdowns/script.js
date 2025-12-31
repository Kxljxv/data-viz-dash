/**
 * AEA Dropdown & Context Menu Controller
 * 
 * Manages the lifecycle, positioning, and accessibility of dropdown menus.
 * Implements a singleton pattern to ensure consistent behavior across the application.
 */

const AEADropdown = (() => {
    let activeMenu = null;
    let activeTrigger = null;

    /**
     * Initialize global event listeners for dropdown management.
     */
    const init = () => {
        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (activeMenu && !activeMenu.contains(e.target) && !activeTrigger?.contains(e.target)) {
                close();
            }
        });

        // Close menu on Escape key and handle arrow navigation
        document.addEventListener('keydown', (e) => {
            if (!activeMenu) return;

            if (e.key === 'Escape') {
                close();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                handleArrowNavigation(e);
            } else if (e.key === 'Tab') {
                close(); // Close on tab away
            }
        });

        // Prevent default context menu on elements with data-aea-context-menu
        document.addEventListener('contextmenu', (e) => {
            const trigger = e.target.closest('[data-aea-context-menu]');
            if (trigger) {
                e.preventDefault();
                const menuId = trigger.getAttribute('data-aea-context-menu');
                openContextMenu(e, menuId);
            }
        });
    };

    /**
     * Opens a dropdown menu relative to a trigger element.
     * @param {HTMLElement} trigger - The element that triggered the dropdown.
     * @param {string} menuId - ID of the menu element to display.
     * @param {Object} options - Positioning options { placement: 'bottom-start' | 'right-start' | etc }
     */
    const open = (trigger, menuId, options = {}) => {
        const menu = document.getElementById(menuId);
        if (!menu) {
            console.error(`AEADropdown: Menu with ID "${menuId}" not found.`);
            return;
        }

        if (activeMenu === menu) {
            close();
            return;
        }

        close(); // Close any existing menu

        activeMenu = menu;
        activeTrigger = trigger;

        // Position the menu
        positionMenu(trigger, menu, options.placement || 'bottom-start');

        // Show menu
        menu.classList.add('active');
        menu.setAttribute('aria-expanded', 'true');
        
        // Focus first item after a short delay for animation
        setTimeout(() => {
            const firstItem = menu.querySelector('.dropdown-item:not([disabled])');
            if (firstItem) firstItem.focus();
        }, 50);
    };

    /**
     * Opens a context menu at the mouse coordinates.
     * @param {MouseEvent} event - The context menu event.
     * @param {string} menuId - ID of the menu element.
     */
    const openContextMenu = (event, menuId) => {
        const menu = document.getElementById(menuId);
        if (!menu) return;

        close();

        activeMenu = menu;
        
        // Initial positioning at mouse coords
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.right = 'auto';
        menu.style.bottom = 'auto';

        menu.classList.add('active');

        // Adjust positioning if it overflows screen
        const rect = menu.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (rect.right > screenWidth) {
            menu.style.left = `${event.clientX - rect.width}px`;
        }
        if (rect.bottom > screenHeight) {
            menu.style.top = `${event.clientY - rect.height}px`;
        }

        setTimeout(() => {
            const firstItem = menu.querySelector('.dropdown-item:not([disabled])');
            if (firstItem) firstItem.focus();
        }, 50);
    };

    /**
     * Closes the currently active menu.
     */
    const close = () => {
        if (!activeMenu) return;

        activeMenu.classList.remove('active');
        activeMenu.setAttribute('aria-expanded', 'false');
        
        if (activeTrigger) {
            activeTrigger.focus();
        }

        activeMenu = null;
        activeTrigger = null;
    };

    /**
     * Logic for positioning the menu relative to an anchor.
     */
    const positionMenu = (anchor, menu, placement) => {
        const anchorRect = anchor.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const padding = 8;

        let top = 0;
        let left = 0;

        switch (placement) {
            case 'bottom-start':
                top = anchorRect.bottom + padding;
                left = anchorRect.left;
                break;
            case 'bottom-end':
                top = anchorRect.bottom + padding;
                left = anchorRect.right - menuRect.width;
                break;
            case 'right-start':
                top = anchorRect.top;
                left = anchorRect.right + padding;
                break;
        }

        // Screen boundary checks
        if (left + menuRect.width > window.innerWidth - padding) {
            left = window.innerWidth - menuRect.width - padding;
        }
        if (left < padding) left = padding;

        if (top + menuRect.height > window.innerHeight - padding) {
            top = anchorRect.top - menuRect.height - padding;
        }
        if (top < padding) top = padding;

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.right = 'auto';
        menu.style.bottom = 'auto';
    };

    /**
     * Handles keyboard navigation within the menu.
     */
    const handleArrowNavigation = (e) => {
        const items = Array.from(activeMenu.querySelectorAll('.dropdown-item:not([disabled])'));
        const currentIndex = items.indexOf(document.activeElement);
        
        if (e.key === 'ArrowDown') {
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex].focus();
            e.preventDefault();
        }
    };

    return {
        init,
        open,
        openContextMenu,
        close
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', AEADropdown.init);
window.AEADropdown = AEADropdown;
