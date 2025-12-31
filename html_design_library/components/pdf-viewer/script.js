/**
 * AEA PDF Viewer Logic
 * Manages document loading states, toolbar interactions, and error handling.
 */

export class PDFViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            onClose: null,
            onDownload: null,
            ...options
        };

        this.iframe = this.container.querySelector('.aea-pdf-iframe');
        this.overlay = this.container.querySelector('.aea-pdf-overlay');
        this.titleElement = this.container.querySelector('.aea-pdf-title');
        
        this.init();
    }

    init() {
        // Initialize toolbar actions
        const closeBtn = this.container.querySelector('.aea-pdf-btn.aea-pdf-danger');
        const downloadBtn = this.container.querySelector('.aea-pdf-btn.aea-pdf-accent');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.download());
        }

        // Handle iframe loading
        if (this.iframe) {
            this.iframe.addEventListener('load', () => {
                clearTimeout(this.loadTimeout);
                this.handleLoadSuccess();
            });
            this.iframe.addEventListener('error', () => {
                clearTimeout(this.loadTimeout);
                this.handleLoadError('missing');
            });
        }

        // Accessibility: Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container.classList.contains('aea-pdf-modal')) {
                this.close();
            }
        });
    }

    /**
     * Loads a PDF file into the viewer.
     * @param {string} url - The URL of the PDF document.
     * @param {string} title - The title to display in the toolbar.
     */
    load(url, title = 'Document.pdf') {
        if (!this.iframe) return;

        clearTimeout(this.loadTimeout);
        this.showLoading();
        this.titleElement.textContent = title;
        this.iframe.src = url;

        // Detection for ERR_BLOCKED_BY_RESPONSE or hanging loads
        // Browsers often don't fire error events for cross-origin iframe blocks
        this.loadTimeout = setTimeout(() => {
            if (this.overlay && this.overlay.style.display !== 'none') {
                this.handleLoadError('denied');
            }
        }, 5000); // 5 second timeout for technical/security blocks
    }

    showLoading() {
        if (!this.overlay) return;
        this.overlay.innerHTML = `
            <div class="aea-pdf-loader"></div>
            <div class="text-xs uppercase tracking-widest text-[hsl(var(--text-500))]">Initialisiere Dokumenten-Stream...</div>
        `;
        this.overlay.style.display = 'flex';
    }

    handleLoadSuccess() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        console.debug('[AEA SYSTEM] PDF geladen.');
    }

    handleLoadError(reason = 'denied') {
        if (!this.overlay) return;

        const errorMessages = {
            denied: 'Der Zugriff auf das Dokument wurde vom Server verweigert (Cross-Origin Block).',
            missing: 'Die angeforderte PDF-Datei wurde nicht gefunden.',
            generic: 'Ein unbekannter Systemfehler ist beim Laden aufgetreten.'
        };

        this.overlay.innerHTML = `
            <div class="aea-pdf-error-icon">⚠️</div>
            <div class="text-sm font-bold text-[hsl(var(--accent-danger))] mb-2 uppercase">Sicherheits-Blockade oder Ladefehler</div>
            <div class="text-xs text-[hsl(var(--text-500))] max-w-[280px] mb-6">
                ${errorMessages[reason] || errorMessages.generic} 
                Einige Server untersagen das Einbetten von Dokumenten in externe Interfaces.
            </div>
            
            <div class="flex flex-col gap-3 w-full max-w-[240px]">
                <button class="aea-pdf-retry-btn px-4 py-3 bg-[hsl(var(--accent-brand))] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-lg">
                    Erneut versuchen
                </button>
                <a href="${this.iframe.src}" target="_blank" class="px-4 py-3 bg-[hsla(var(--bg-300)/0.4)] border border-[hsla(var(--border-300)/0.2)] text-[hsl(var(--text-200))] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[hsla(var(--bg-300)/0.6)] transition-all text-center">
                    In neuem Tab öffnen ↗
                </a>
            </div>
        `;
        
        const retryBtn = this.overlay.querySelector('.aea-pdf-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.load(this.iframe.src, this.titleElement.textContent));
        }

        this.overlay.style.display = 'flex';
        console.error(`[AEA SYSTEM] PDF Ladefehler: ${reason}`);
    }

    download() {
        if (this.options.onDownload) {
            this.options.onDownload(this.iframe.src);
        } else {
            const link = document.createElement('a');
            link.href = this.iframe.src;
            link.download = this.titleElement.textContent;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    close() {
        if (this.container.classList.contains('aea-pdf-modal')) {
            this.container.style.display = 'none';
        }
        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    show() {
        this.container.style.display = 'flex';
    }
}

// Auto-init for demo purposes
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new PDFViewer('system-pdf-viewer');
    window.aeaPdfViewer = viewer; // Expose for demo
});
