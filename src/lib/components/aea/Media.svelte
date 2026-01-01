<script>
    import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-svelte';
    /**
     * @typedef {Object} Props
     * @property {string} src - Source URL for the image or video.
     * @property {'image' | 'video'} [type='image'] - The type of media.
     * @property {string} [alt=""] - Alt text for images.
     * @property {string} [poster=""] - Poster image for video.
     * @property {'default' | 'frame' | 'glitch' | 'hud'} [variant='default'] - Visual variant.
     * @property {string} [aspect='aspect-video'] - Aspect ratio class (Tailwind).
     * @property {string} [class=""] - Additional container classes.
     * @property {import('svelte').Snippet} [overlay] - HUD overlay content.
     */

    /** @type {Props} */
    let {
        src,
        type = 'image',
        alt = "",
        poster = "",
        variant = 'default',
        aspect = 'aspect-video',
        class: className = "",
        overlay,
        ...rest
    } = $props();

    let videoRef = $state(null);
    let isPlaying = $state(false);
    let progress = $state(0);
    let currentTime = $state("0:00");

    function togglePlay() {
        if (!videoRef) return;
        if (videoRef.paused) {
            videoRef.play();
            isPlaying = true;
        } else {
            videoRef.pause();
            isPlaying = false;
        }
    }

    function handleTimeUpdate() {
        if (!videoRef) return;
        const percent = (videoRef.currentTime / videoRef.duration) * 100;
        progress = percent;
        
        const mins = Math.floor(videoRef.currentTime / 60);
        const secs = Math.floor(videoRef.currentTime % 60);
        currentTime = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function handleProgressClick(e) {
        if (!videoRef) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedPos = x / rect.width;
        videoRef.currentTime = clickedPos * videoRef.duration;
    }

    const variantClasses = {
        default: '',
        frame: 'aea-media-frame',
        glitch: 'aea-media-glitch',
        hud: 'aea-media-hud'
    };
</script>

<div class="aea-media-container {variantClasses[variant]} {aspect} group {className}" {...rest}>
    {#if type === 'image'}
        <img {src} {alt} class="aea-media-content" />
    {:else}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            bind:this={videoRef}
            {src}
            {poster}
            class="aea-media-content"
            ontimeupdate={handleTimeUpdate}
            onclick={togglePlay}
        ></video>

        <div class="aea-video-controls group-hover:opacity-100">
            <button class="aea-video-btn" onclick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {#if isPlaying}
                    <IconPlayerPause size={24} fill="currentColor" />
                {:else}
                    <IconPlayerPlay size={24} fill="currentColor" />
                {/if}
            </button>
            
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="aea-video-progress" onclick={handleProgressClick}>
                <div class="aea-video-progress-fill" style="width: {progress}%"></div>
            </div>
            
            <span class="text-[10px] font-mono opacity-60 w-12 text-center">{currentTime}</span>
        </div>
    {/if}

    {#if overlay}
        <div class="aea-media-overlay">
            {@render overlay()}
        </div>
    {/if}
</div>
