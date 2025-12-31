/**
 * AEA Clipboard Component
 * 
 * Provides a robust way to copy text to the clipboard with visual feedback.
 * Handles fallbacks for older browsers and insecure contexts.
 */

export class Clipboard {
    constructor(element) {
        if (!element) return;
        this.btn = element;
        this.feedback = this.btn.querySelector('.aea-clipboard-feedback');
        this.timeout = parseInt(this.btn.dataset.aeaClipboardTimeout) || 2000;
        this.timer = null;
        
        // Determine the text to copy
        this.value = this.btn.dataset.aeaClipboardValue || null;
        this.targetId = this.btn.dataset.aeaClipboardTarget || null;

        this.init();
    }

    init() {
        this.btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.copy();
        });
    }

    /**
     * Resolves the text to be copied
     */
    getText() {
        if (this.value) return this.value;
        if (this.targetId) {
            const target = document.getElementById(this.targetId);
            if (target) {
                return target.value || target.textContent || '';
            }
        }
        // Fallback: if it's part of a group, look for an input
        const group = this.btn.closest('.aea-clipboard-group');
        if (group) {
            const input = group.querySelector('.aea-clipboard-input');
            if (input) return input.value;
        }
        return '';
    }

    /**
     * Main copy operation
     */
    async copy() {
        const text = this.getText();
        if (!text) {
            console.warn('AEA Clipboard: Nothing to copy');
            return;
        }

        try {
            // 1. Try modern Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                this.showSuccess();
            } else {
                // 2. Fallback to execCommand('copy')
                this.fallbackCopy(text);
            }
        } catch (err) {
            console.error('AEA Clipboard: Copy failed', err);
            this.showError();
        }
    }

    /**
     * Fallback for non-secure contexts or older browsers
     */
    fallbackCopy(text) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            
            // Ensure the textarea is not visible but still part of the DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showSuccess();
            } else {
                this.showError();
            }
        } catch (err) {
            this.showError();
        }
    }

    showSuccess() {
        if (this.timer) clearTimeout(this.timer);
        
        this.btn.classList.add('aea-success');
        this.btn.classList.remove('aea-error');
        
        this.timer = setTimeout(() => {
            this.btn.classList.remove('aea-success');
            this.timer = null;
        }, this.timeout);
    }

    showError() {
        if (this.timer) clearTimeout(this.timer);
        
        this.btn.classList.add('aea-error');
        this.btn.classList.remove('aea-success');
        
        // Optional: change feedback text if possible
        if (this.feedback) {
            const originalText = this.feedback.textContent;
            this.feedback.textContent = 'Error!';
            setTimeout(() => {
                this.feedback.textContent = originalText;
            }, this.timeout);
        }

        this.timer = setTimeout(() => {
            this.btn.classList.remove('aea-error');
            this.timer = null;
        }, this.timeout);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.aea-clipboard-btn');
    triggers.forEach(el => new Clipboard(el));
});
