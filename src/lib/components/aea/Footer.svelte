<script>
    import { IconArrowUp } from '@tabler/icons-svelte';

    /**
     * @component Footer
     * A comprehensive, responsive site-wide bottom section.
     * 
     * @typedef {Object} Props
     * @property {string} [brandTitle='AEA Project'] - The main brand title.
     * @property {string} [brandDescription=''] - Secondary description text.
     * @property {string} [copyright='&copy; 2025 AEA DESIGN SYSTEM. PIXEL-PERFECT INTERFACE.'] - Copyright text.
     * @property {boolean} [showBackToTop=true] - Whether to show the back to top button.
     * @property {import('svelte').Snippet} [children] - Main footer columns content.
     * @property {import('svelte').Snippet} [social] - Social links content.
     * @property {import('svelte').Snippet} [bottomLinks] - Legal/bottom links content.
     * @property {string} [class=''] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        brandTitle = 'AEA Project',
        brandDescription = 'Advanced graph visualization for complex networks. Built for performance, accessibility, and high visual fidelity.',
        copyright = '&copy; 2025 AEA DESIGN SYSTEM. PIXEL-PERFECT INTERFACE.',
        showBackToTop = true,
        children,
        social,
        bottomLinks,
        class: className = ''
    } = $props();

    /**
     * Handles smooth scroll to top
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Entrance animation for the back-to-top button
     * @param {HTMLElement} node
     */
    function backToTopAction(node) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    node.style.opacity = '1';
                    node.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            }
        };
    }
</script>

<footer class="aea-footer relative {className}">
    {#if showBackToTop}
        <button 
            id="back-to-top" 
            class="aea-footer-back-to-top" 
            aria-label="Back to top"
            onclick={scrollToTop}
            use:backToTopAction
        >
            <IconArrowUp size={24} />
        </button>
    {/if}

    <div class="container mx-auto px-6 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <!-- Brand Section -->
            <div class="aea-footer-brand">
                <h2 class="aea-footer-brand-title">{brandTitle}</h2>
                {#if brandDescription}
                    <p class="text-sm text-[hsl(var(--text-400))] leading-relaxed mb-6 max-w-xs">
                        {brandDescription}
                    </p>
                {/if}
                
                {#if social}
                    <div class="flex space-x-3">
                        {@render social()}
                    </div>
                {/if}
            </div>

            <!-- Main Content Columns -->
            {#if children}
                {@render children()}
            {/if}
        </div>

        <!-- Footer Bottom -->
        <div class="aea-footer-bottom mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs tracking-wider">
            <div class="text-[hsl(var(--text-500))] mb-6 md:mb-0 uppercase font-bold">
                {@html copyright}
            </div>
            
            {#if bottomLinks}
                <div class="flex space-x-8 uppercase font-bold">
                    {@render bottomLinks()}
                </div>
            {/if}
        </div>
    </div>
</footer>

<style>
    /* Styles are integrated from design_library/style.css */
    .aea-footer {
        background-color: hsla(var(--bg-100) / 0.8);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid hsla(var(--border-300) / 0.1);
        color: hsl(var(--text-200));
        font-family: 'ModernDense', sans-serif;
    }

    :global(.aea-footer-brand-title) {
        font-family: 'Serif', serif;
        font-size: 1.5rem;
        color: hsl(var(--text-100));
        margin-bottom: 1.5rem;
        letter-spacing: 0.05em;
    }

    .aea-footer-back-to-top {
        position: absolute;
        right: 2rem;
        top: -1.25rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background-color: hsl(var(--accent-brand));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 15px hsla(var(--accent-brand) / 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        z-index: 10;
        opacity: 0;
        transform: translateY(10px);
    }

    .aea-footer-back-to-top:hover {
        transform: translateY(-4px) scale(1.1);
        box-shadow: 0 6px 20px hsla(var(--accent-brand) / 0.6);
        filter: brightness(1.1);
    }

    .aea-footer-back-to-top:active {
        transform: translateY(-2px) scale(0.95);
    }

    .aea-footer-bottom {
        border-top: 1px solid hsla(var(--border-300) / 0.1);
    }

    /* Column animations */
    :global(.aea-footer-column) {
        animation: footer-fade-in 0.5s ease-out forwards;
    }

    @keyframes footer-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
