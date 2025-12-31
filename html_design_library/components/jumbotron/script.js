/**
 * AEA Jumbotron Component Logic
 * 
 * Handles entrance animations and interactive elements for the Jumbotron.
 */

document.addEventListener('DOMContentLoaded', () => {
    initJumbotronAnimations();
});

/**
 * Initializes entrance animations for jumbotron elements
 */
function initJumbotronAnimations() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateElement(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const titles = document.querySelectorAll('.aea-jumbotron-title');
    const subtitles = document.querySelectorAll('.aea-jumbotron-subtitle');
    const actions = document.querySelectorAll('.aea-jumbotron-actions');
    const visuals = document.querySelectorAll('.aea-jumbotron-visual');

    // Set initial states and start observing
    [...titles, ...subtitles, ...actions, ...visuals].forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });
}

/**
 * Applies the animation to a single element
 * @param {HTMLElement} el 
 */
function animateElement(el) {
    // Add a slight delay based on element type for a staggered effect
    let delay = 0;
    if (el.classList.contains('aea-jumbotron-subtitle')) delay = 200;
    if (el.classList.contains('aea-jumbotron-actions')) delay = 400;
    if (el.classList.contains('aea-jumbotron-visual')) delay = 600;

    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, delay);
}
