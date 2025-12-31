/**
 * AEA Input Component Logic
 * 
 * Handles interactive features for input fields such as:
 * - Clear button functionality
 * - Password visibility toggling
 */

const AEAInput = (() => {

    /**
     * Initialize all input-related features.
     */
    const init = () => {
        initClearButtons();
        initPasswordToggles();
    };

    /**
     * Set up "Clear" buttons for search/text inputs.
     */
    const initClearButtons = () => {
        const clearButtons = document.querySelectorAll('[data-aea-input-clear]');
        
        clearButtons.forEach(btn => {
            const targetId = btn.getAttribute('data-aea-input-clear');
            const input = document.getElementById(targetId);
            
            if (!input) return;

            // Show/hide clear button based on input value
            const toggleBtn = () => {
                btn.style.display = input.value.length > 0 ? 'flex' : 'none';
            };

            input.addEventListener('input', toggleBtn);
            
            btn.addEventListener('click', () => {
                input.value = '';
                input.focus();
                toggleBtn();
                
                // Trigger input event manually so other listeners know it changed
                input.dispatchEvent(new Event('input'));
            });

            // Initial state
            toggleBtn();
        });
    };

    /**
     * Set up visibility toggles for password inputs.
     */
    const initPasswordToggles = () => {
        const toggles = document.querySelectorAll('[data-aea-password-toggle]');
        
        toggles.forEach(toggle => {
            const targetId = toggle.getAttribute('data-aea-password-toggle');
            const input = document.getElementById(targetId);
            
            if (!input) return;

            toggle.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                
                // Update icon if it's an SVG or contains one
                const svg = toggle.querySelector('svg');
                if (svg) {
                    if (isPassword) {
                        // Switch to "eye-off" icon (simplified)
                        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />';
                    } else {
                        // Switch to "eye" icon (simplified)
                        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
                    }
                }
            });

            // Support keyboard activation
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
        });
    };

    return {
        init
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', AEAInput.init);
window.AEAInput = AEAInput;
