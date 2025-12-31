/**
 * Cards Component Interactivity
 * 
 * This script demonstrates common interactive patterns for cards,
 * such as handling clicks on interactive cards and providing
 * programmatic access to card states.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Cards Ripple/Click Effect
    const interactiveCards = document.querySelectorAll('.card-interactive');
    
    interactiveCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Log interaction for demo purposes
            const title = card.querySelector('.card-title')?.textContent || 'Unknown Card';
            console.log(`[Card Interaction] Clicked: ${title}`);
            
            // Add a temporary "active" state for visual feedback
            card.classList.add('ring-2', 'ring-[hsl(var(--accent-brand)/0.5)]');
            setTimeout(() => {
                card.classList.remove('ring-2', 'ring-[hsl(var(--accent-brand)/0.5)]');
            }, 300);
        });
    });

    // 2. Expandable Card Logic (Example)
    // Note: This can be extended for actual accordion-style cards
    const cardHeaders = document.querySelectorAll('.card-header');
    cardHeaders.forEach(header => {
        header.style.cursor = header.parentElement.classList.contains('card-interactive') ? 'pointer' : 'default';
    });
});
