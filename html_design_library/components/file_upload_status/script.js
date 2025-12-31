/**
 * AEA File Upload Status
 * A Cyberpunk-Lite progress visualization for file uploads.
 */
export class FileUploadStatus {
    constructor(container) {
        if (!container) return;
        
        this.container = container;
        this.dropZone = container.querySelector('#aea-drop-zone');
        this.fileInput = container.querySelector('#aea-file-input');
        this.fileList = container.querySelector('#aea-file-list');
        
        this.files = new Map(); // Store file state by ID
        
        this.init();
    }

    init() {
        // Drag and Drop Events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('aea-dragging');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('aea-dragging');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('aea-dragging');
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });

        // Click to browse
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Keyboard support for drop zone
        this.dropZone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.fileInput.click();
            }
        });

        this.fileInput.addEventListener('change', () => {
            const files = Array.from(this.fileInput.files);
            this.handleFiles(files);
            this.fileInput.value = ''; // Reset for same file re-selection
        });

        // Clear initial static examples after a delay for demo purposes
        // In a real app, this container would be empty initially
        setTimeout(() => {
            this.fileList.innerHTML = '';
        }, 2000);
    }

    handleFiles(files) {
        files.forEach(file => {
            this.addFile(file);
        });
    }

    addFile(file) {
        const id = 'aea-file-' + Math.random().toString(36).substr(2, 9);
        const fileState = {
            id,
            file,
            progress: 0,
            status: 'uploading',
            errorMessage: null
        };

        this.files.set(id, fileState);
        this.renderFile(fileState);
        this.simulateUpload(id);
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderFile(fileState) {
        const item = document.createElement('div');
        item.className = 'aea-file-item';
        item.id = fileState.id;
        
        item.innerHTML = `
            <div class="aea-file-header">
                <div class="aea-file-info">
                    <span class="aea-file-name">${fileState.file.name}</span>
                    <span class="aea-file-meta">${this.formatSize(fileState.file.size)} • <span class="aea-progress-text">0%</span></span>
                </div>
                <div class="aea-file-actions">
                    <button class="aea-file-btn aea-cancel-btn" title="Cancel">✕</button>
                </div>
            </div>
            <div class="aea-progress-container">
                <div class="aea-progress-bar" style="width: 0%;"></div>
            </div>
            <div class="aea-file-status-text">Preparing...</div>
        `;

        // Add event listeners
        const cancelBtn = item.querySelector('.aea-cancel-btn');
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFile(fileState.id);
        });

        this.fileList.prepend(item);
    }

    updateFileUI(id) {
        const fileState = this.files.get(id);
        const item = document.getElementById(id);
        if (!item) return;

        const progressBar = item.querySelector('.aea-progress-bar');
        const progressText = item.querySelector('.aea-progress-text');
        const statusText = item.querySelector('.aea-file-status-text');
        const metaText = item.querySelector('.aea-file-meta');

        progressBar.style.width = `${fileState.progress}%`;
        progressText.textContent = `${Math.round(fileState.progress)}%`;

        if (fileState.status === 'uploading') {
            statusText.textContent = 'Uploading...';
        } else if (fileState.status === 'success') {
            item.classList.add('aea-success');
            statusText.textContent = 'Success';
            metaText.innerHTML = `${this.formatSize(fileState.file.size)} • Complete`;
            
            // Replace cancel with remove
            const actions = item.querySelector('.aea-file-actions');
            actions.innerHTML = `
                <button class="aea-file-btn aea-danger aea-remove-btn" title="Remove">🗑️</button>
            `;
            actions.querySelector('.aea-remove-btn').addEventListener('click', () => this.removeFile(id));
        } else if (fileState.status === 'error') {
            item.classList.add('aea-error');
            statusText.textContent = 'Failed';
            metaText.innerHTML = `Error: ${fileState.errorMessage || 'Unknown error'}`;
            
            // Replace cancel with retry/remove
            const actions = item.querySelector('.aea-file-actions');
            actions.innerHTML = `
                <button class="aea-file-btn aea-retry-btn" title="Retry">🔄</button>
                <button class="aea-file-btn aea-danger aea-remove-btn" title="Remove">🗑️</button>
            `;
            actions.querySelector('.aea-retry-btn').addEventListener('click', () => this.retryFile(id));
            actions.querySelector('.aea-remove-btn').addEventListener('click', () => this.removeFile(id));
        }
    }

    simulateUpload(id) {
        const fileState = this.files.get(id);
        if (!fileState) return;

        // Randomly decide if this upload will fail (10% chance)
        const willFail = Math.random() < 0.1;
        const failurePoint = willFail ? Math.random() * 80 : 100;

        const step = () => {
            const currentFile = this.files.get(id);
            if (!currentFile || currentFile.status !== 'uploading') return;

            const increment = Math.random() * 5 + 2;
            currentFile.progress += increment;

            if (willFail && currentFile.progress >= failurePoint) {
                currentFile.status = 'error';
                currentFile.errorMessage = 'Network connection lost';
                this.updateFileUI(id);
                return;
            }

            if (currentFile.progress >= 100) {
                currentFile.progress = 100;
                currentFile.status = 'success';
                this.updateFileUI(id);
                return;
            }

            this.updateFileUI(id);
            setTimeout(step, 100 + Math.random() * 200);
        };

        setTimeout(step, 500);
    }

    retryFile(id) {
        const fileState = this.files.get(id);
        if (!fileState) return;

        fileState.progress = 0;
        fileState.status = 'uploading';
        fileState.errorMessage = null;

        const item = document.getElementById(id);
        item.classList.remove('aea-error', 'aea-success');
        
        // Reset actions to cancel
        const actions = item.querySelector('.aea-file-actions');
        actions.innerHTML = `
            <button class="aea-file-btn aea-cancel-btn" title="Cancel">✕</button>
        `;
        actions.querySelector('.aea-cancel-btn').addEventListener('click', () => this.removeFile(id));

        this.updateFileUI(id);
        this.simulateUpload(id);
    }

    removeFile(id) {
        const item = document.getElementById(id);
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            item.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                item.remove();
                this.files.delete(id);
            }, 300);
        }
    }
}

// Initialize for the demo
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('upload-demo-root');
    if (root) {
        new FileUploadStatus(root);
    }
});
