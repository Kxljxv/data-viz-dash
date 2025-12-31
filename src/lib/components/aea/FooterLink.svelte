<script>
    /**
     * @component FooterLink
     * A styled link for use within the Footer.
     * 
     * @typedef {Object} Props
     * @property {string} [href='#'] - The link destination.
     * @property {import('svelte').Snippet} [children] - The link text or content.
     * @property {string} [class=''] - Additional CSS classes.
     * @property {boolean} [external=false] - Whether the link is external.
     */

    /** @type {Props} */
    let { 
        href = '#', 
        children,
        class: className = '',
        external = false
    } = $props();
</script>

<li>
    <a 
        {href} 
        class="aea-footer-link {className}"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
    >
        {#if children}
            {@render children()}
        {/if}
    </a>
</li>

<style>
    .aea-footer-link {
        color: hsl(var(--text-400));
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-block;
        font-weight: 500;
        letter-spacing: 0.025em;
    }

    .aea-footer-link:hover {
        color: hsl(var(--accent-brand));
        transform: translateX(6px);
    }
</style>
