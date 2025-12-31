<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    /**
     * @component Jumbotron
     * A prominent showcase area for headings and calls to action.
     * 
     * @typedef {Object} Props
     * @property {'centered' | 'split' | 'minimal'} [variant='centered'] - Layout variant.
     * @property {boolean} [glass=false] - Apply glassmorphism.
     * @property {string} [title] - Main heading text.
     * @property {string} [subtitle] - Description text.
     * @property {string} [class=''] - Additional CSS classes.
     * @property {import('svelte').Snippet} [titleSnippet] - Custom title snippet.
     * @property {import('svelte').Snippet} [subtitleSnippet] - Custom subtitle snippet.
     * @property {import('svelte').Snippet} [actions] - Action buttons snippet.
     * @property {import('svelte').Snippet} [visual] - Visual element snippet (for split variant).
     */

    /** @type {Props} */
    let { 
        variant = 'centered',
        glass = false,
        title,
        subtitle,
        class: className = '',
        titleSnippet,
        subtitleSnippet,
        actions,
        visual
    } = $props();

    let visible = $state(false);
    let container = $state();

    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                visible = true;
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (container) observer.observe(container);
        return () => observer.disconnect();
    });

    const animationProps = {
        duration: 800,
        easing: cubicOut,
        y: 20
    };
</script>

<section 
    bind:this={container}
    class="aea-jumbotron {variant === 'split' ? 'aea-jumbotron-split' : ''} {glass ? 'aea-jumbotron-glass' : ''} {className}"
>
    <div class="container mx-auto px-6 aea-jumbotron-content {variant === 'centered' || variant === 'minimal' ? 'flex flex-col items-center text-center' : ''} {variant === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center' : ''}">
        
        <div class="flex flex-col {variant === 'split' ? 'items-start text-left' : 'items-center text-center'}">
            {#if visible}
                <!-- Title -->
                <div in:fly={animationProps}>
                    {#if titleSnippet}
                        {@render titleSnippet()}
                    {:else if title}
                        <h1 class="aea-jumbotron-title">{@html title}</h1>
                    {/if}
                </div>

                <!-- Subtitle -->
                <div in:fly={{...animationProps, delay: 200}}>
                    {#if subtitleSnippet}
                        {@render subtitleSnippet()}
                    {:else if subtitle}
                        <p class="aea-jumbotron-subtitle {variant === 'centered' || variant === 'minimal' ? 'mx-auto' : ''}">
                            {subtitle}
                        </p>
                    {/if}
                </div>

                <!-- Actions -->
                {#if actions}
                    <div class="aea-jumbotron-actions {variant === 'split' ? 'justify-start' : 'justify-center'}" in:fly={{...animationProps, delay: 400}}>
                        {@render actions()}
                    </div>
                {/if}
            {/if}
        </div>

        <!-- Visual element for split variant -->
        {#if variant === 'split' && (visual || visible)}
            <div class="aea-jumbotron-visual flex items-center justify-center" in:fly={{...animationProps, delay: 600}}>
                {#if visual}
                    {@render visual()}
                {/if}
            </div>
        {/if}
    </div>
</section>

<style>
    .aea-jumbotron {
        position: relative;
        padding-top: 5rem;
        padding-bottom: 5rem;
        overflow: hidden;
        background-color: transparent;
    }

    .aea-jumbotron-glass::before {
        content: '';
        position: absolute;
        inset: 0;
        background: hsla(var(--bg-100) / 0.4);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        z-index: 0;
    }

    .aea-jumbotron-content {
        position: relative;
        z-index: 1;
    }

    :global(.aea-jumbotron-title) {
        font-size: clamp(2.5rem, 8vw, 5rem);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: hsl(var(--text-100));
        margin-bottom: 1.5rem;
        text-transform: uppercase;
        font-family: 'ModernDense', sans-serif;
    }

    :global(.aea-jumbotron-subtitle) {
        font-size: clamp(1.125rem, 3vw, 1.5rem);
        color: hsl(var(--text-300));
        max-width: 42rem;
        margin-bottom: 2.5rem;
        line-height: 1.6;
        font-family: 'ModernDense', sans-serif;
    }

    .aea-jumbotron-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .aea-jumbotron-visual {
        position: relative;
        z-index: 1;
        width: 100%;
        min-height: 300px;
        border-radius: 1.5rem;
        overflow: hidden;
        border: 1px solid hsla(var(--border-300) / 0.1);
        background: hsla(var(--bg-200) / 0.3);
        backdrop-filter: blur(10px);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .aea-jumbotron {
            padding-top: 4rem;
            padding-bottom: 4rem;
        }
        
        .aea-jumbotron-actions {
            flex-direction: column;
            width: 100%;
        }
        
        :global(.aea-jumbotron-actions .aea-button) {
            width: 100%;
        }
    }
</style>
