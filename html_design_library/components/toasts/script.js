/**
 * AEAToasts - Singleton controller for toast notifications
 * Manages spawning, queuing, and dismissal of toast elements.
 */
const AEAToasts = (() => {
    let container = null;
    const DEFAULT_DURATION = 5000;

    const init = () => {
        if (container) return;
        container = document.createElement('div');
        container.className = 'aea-toast-container';
        document.body.appendChild(container);
    };

    /**
     * Spawns a new toast notification.
     * @param {Object} options - Configuration for the toast.
     * @param {string} options.title - Bold title text.
     * @param {string} options.message - Secondary message text.
     * @param {string} options.type - success, error, info, warning.
     * @param {number} options.duration - Auto-dismiss duration in ms (default 5000).
     */
    const show = ({ title = '', message = '', type = 'info', duration = DEFAULT_DURATION }) => {
        if (!container) init();

        const toast = document.createElement('div');
        toast.className = `aea-toast aea-toast-${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        const icons = {
            success: `<svg class="aea-toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
            error: `<svg class="aea-toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
            info: `<svg class="aea-toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
            warning: `<svg class="aea-toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div class="aea-toast-content">
                ${title ? `<strong class="aea-toast-title">${title}</strong>` : ''}
                <p class="aea-toast-message">${message}</p>
            </div>
            <button class="aea-toast-close" aria-label="Dismiss">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;

        // Close button listener
        const closeBtn = toast.querySelector('.aea-toast-close');
        closeBtn.addEventListener('click', () => dismiss(toast));

        container.appendChild(toast);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) dismiss(toast);
            }, duration);
        }
    };

    const dismiss = (toast) => {
        if (toast.classList.contains('aea-toast-dismissing')) return;
        
        toast.classList.add('aea-toast-dismissing');
        
        // Remove after animation
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });

        // Fallback for safety
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 500);
    };

    const clearAll = () => {
        if (!container) return;
        const toasts = container.querySelectorAll('.aea-toast');
        toasts.forEach(toast => dismiss(toast));
    };

    return { show, dismiss, clearAll };
})();
