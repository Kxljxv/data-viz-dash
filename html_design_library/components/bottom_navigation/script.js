/**
 * AEA Bottom Navigation Interactive Logic
 * Handles active state switching for the demo.
 */

document.addEventListener('DOMContentLoaded', () => {
    initBottomNav();
});

function initBottomNav() {
    const navItems = document.querySelectorAll('.aea-bottom-nav-item');
    
    if (!navItems.length) return;

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(i => {
                i.classList.remove('aea-bottom-nav-active');
                i.removeAttribute('aria-current');
            });

            // Add active class to clicked item
            item.classList.add('aea-bottom-nav-active');
            item.setAttribute('aria-current', 'page');

            // Log for demo purposes
            console.log(`Navigation switched to: ${item.querySelector('.aea-bottom-nav-label').textContent}`);
        });
    });
}
