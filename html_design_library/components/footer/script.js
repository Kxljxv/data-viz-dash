/**
 * AEA Footer Component Logic
 * 
 * Handles interactivity for the Footer component, including:
 * - Back to Top functionality
 * - Responsive adjustments (if needed)
 */

document.addEventListener('DOMContentLoaded', () => {
    initFooter();
});

/**
 * Initializes footer-specific behaviors
 */
function initFooter() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        // Show/hide button based on scroll position if desired, 
        // but currently it's absolute at the top of the footer.
        // For now, let's just implement the smooth scroll.
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Add a subtle entrance animation if it's near the viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.transform = 'translateY(0)';
                } else {
                    // We don't necessarily want to hide it, but we could
                }
            });
        }, { threshold: 0.1 });

        observer.observe(backToTopBtn);
    }
}
