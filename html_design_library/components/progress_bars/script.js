/**
 * AEAProgress - Singleton controller for progress bar management
 * Handles programmatic updates to progress bar widths and states.
 */
const AEAProgress = (() => {
    /**
     * Updates the width and ARIA attributes of a determinate progress bar.
     * @param {string|HTMLElement} barOrId - The ID of the progress bar element or the element itself.
     * @param {number} percentage - The new progress percentage (0-100).
     */
    const update = (barOrId, percentage) => {
        const bar = typeof barOrId === 'string' ? document.getElementById(barOrId) : barOrId;
        if (!bar) {
            console.warn('AEAProgress: Progress bar element not found.');
            return;
        }

        // Clamp percentage between 0 and 100
        const value = Math.max(0, Math.min(100, percentage));
        
        // Update width
        bar.style.width = `${value}%`;
        
        // Update ARIA attributes
        bar.setAttribute('aria-valuenow', value);
    };

    /**
     * Toggles the indeterminate state of a progress bar.
     * @param {string|HTMLElement} containerOrId - The container (.aea-progress) of the bar.
     * @param {boolean} state - True to enable indeterminate state, false to disable.
     */
    const setIndeterminate = (containerOrId, state) => {
        const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
        if (!container) {
            console.warn('AEAProgress: Progress container element not found.');
            return;
        }

        if (state) {
            container.classList.add('aea-progress-indeterminate');
            const bar = container.querySelector('.aea-progress-bar');
            if (bar) bar.style.width = '100%';
        } else {
            container.classList.remove('aea-progress-indeterminate');
        }
    };

    /**
     * Toggles the animated stripes of a progress bar.
     * @param {string|HTMLElement} containerOrId - The container (.aea-progress) of the bar.
     * @param {boolean} state - True to enable animation, false to disable.
     */
    const setAnimated = (containerOrId, state) => {
        const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
        if (!container) return;

        if (state) {
            container.classList.add('aea-progress-animated', 'aea-progress-striped');
        } else {
            container.classList.remove('aea-progress-animated');
        }
    };

    return { update, setIndeterminate, setAnimated };
})();
