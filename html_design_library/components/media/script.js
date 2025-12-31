/**
 * AEA Media Component Logic
 * Handles custom video player interactions and ambient technical effects.
 */

export class Media {
    constructor() {
        this.initVideoPlayers();
    }

    /**
     * Initializes all custom video players on the page.
     */
    initVideoPlayers() {
        const containers = document.querySelectorAll('.aea-media-container video');
        containers.forEach(video => {
            const container = video.parentElement;
            const playPauseBtn = container.querySelector('#play-pause');
            const progressContainer = container.querySelector('#progress-container');
            const progressFill = container.querySelector('#progress-fill');
            const timeDisplay = container.querySelector('#time-display');
            const playIcon = container.querySelector('#play-icon');
            const pauseIcon = container.querySelector('#pause-icon');

            if (!playPauseBtn || !progressContainer) return;

            // Play/Pause Toggle
            const togglePlay = () => {
                if (video.paused) {
                    video.play();
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                } else {
                    video.pause();
                    playIcon.classList.remove('hidden');
                    pauseIcon.classList.add('hidden');
                }
            };

            playPauseBtn.addEventListener('click', togglePlay);
            video.addEventListener('click', togglePlay);

            // Update Progress Bar
            video.addEventListener('timeupdate', () => {
                const percent = (video.currentTime / video.duration) * 100;
                progressFill.style.width = `${percent}%`;
                
                // Update Time Display
                const mins = Math.floor(video.currentTime / 60);
                const secs = Math.floor(video.currentTime % 60);
                timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            });

            // Scrubbing
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                video.currentTime = pos * video.duration;
            });

            // Reset icons on end
            video.addEventListener('ended', () => {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            });

            // Error Handling
            video.addEventListener('error', (e) => {
                console.error('AEA Media: Video playback error', e);
                container.classList.add('aea-media-error');
                const overlay = container.querySelector('.aea-media-overlay');
                if (overlay) {
                    const errorLabel = document.createElement('span');
                    errorLabel.className = 'aea-hud-label bg-red-900/40 text-red-200 border-red-500/30 mt-2';
                    errorLabel.textContent = 'FEED_LOST: CONNECTION_ERROR';
                    overlay.appendChild(errorLabel);
                }
            });
        });
    }
}

// Auto-initialize when used as a script tag
document.addEventListener('DOMContentLoaded', () => {
    new Media();
});
