/**
 * AEA Avatar Component Logic
 * 
 * Handles image loading errors and provides utility functions for 
 * initials generation and status management.
 */

export class Avatar {
    /**
     * Initializes all avatars on the page or within a container.
     * @param {HTMLElement|string} container - The container to search for avatars.
     */
    static init(container = document) {
        const root = typeof container === 'string' ? document.querySelector(container) : container;
        if (!root) return;

        const avatars = root.querySelectorAll('.aea-avatar');
        avatars.forEach(avatar => {
            const img = avatar.querySelector('.aea-avatar-img');
            const fallback = avatar.querySelector('.aea-avatar-fallback');

            if (img && fallback) {
                // If image is already broken or fails to load
                if (img.complete && img.naturalHeight === 0) {
                    this.handleError(img, fallback);
                }

                img.addEventListener('error', () => {
                    this.handleError(img, fallback);
                });

                // If image loads successfully, ensure fallback is hidden
                img.addEventListener('load', () => {
                    img.classList.remove('hidden');
                    fallback.classList.add('hidden');
                });
            }
        });
    }

    /**
     * Handles image loading error by hiding the image and showing fallback.
     * @param {HTMLImageElement} img 
     * @param {HTMLElement} fallback 
     */
    static handleError(img, fallback) {
        img.classList.add('hidden');
        fallback.classList.remove('hidden');
        
        // Optional: Log technical error in debug mode
        // console.warn(`[AEA-Avatar] Failed to load image: ${img.src}`);
    }

    /**
     * Generates initials from a full name.
     * @param {string} name - The full name (e.g., "John Doe").
     * @returns {string} - The initials (e.g., "JD").
     */
    static getInitials(name) {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    /**
     * Creates a new avatar element dynamically.
     * @param {Object} options - Configuration options.
     * @param {string} [options.src] - Image source URL.
     * @param {string} [options.name] - User name for fallback/alt.
     * @param {string} [options.size='md'] - Size (xs, sm, md, lg, xl).
     * @param {string} [options.shape='full'] - Shape (full, 2xl, xl, lg).
     * @param {string} [options.status] - Status (online, offline, busy, away).
     * @returns {HTMLElement} - The avatar element.
     */
    static create(options = {}) {
        const {
            src,
            name = 'User',
            size = 'md',
            shape = 'full',
            status
        } = options;

        const avatar = document.createElement('div');
        avatar.className = `aea-avatar aea-avatar-${size} rounded-${shape}`;
        avatar.setAttribute('aria-label', name);

        let content = '';
        if (src) {
            content += `<img src="${src}" alt="${name}" class="aea-avatar-img">`;
        }

        const initials = this.getInitials(name);
        content += `<div class="aea-avatar-fallback ${src ? 'hidden' : ''}">${initials}</div>`;

        if (status) {
            content += `<span class="aea-avatar-status aea-status-${status}" title="${status}"></span>`;
        }

        avatar.innerHTML = content;

        // Initialize error handling for the new image
        if (src) {
            const img = avatar.querySelector('.aea-avatar-img');
            const fallback = avatar.querySelector('.aea-avatar-fallback');
            img.addEventListener('error', () => this.handleError(img, fallback));
        }

        return avatar;
    }
}

// Auto-initialize if not imported as a module
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        Avatar.init();
    });
}
