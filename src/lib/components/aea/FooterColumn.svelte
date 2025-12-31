<script>
    /**
     * @component FooterColumn
     * A container for grouped links within the Footer.
     * 
     * @typedef {Object} Props
     * @property {string} title - The heading for the column.
     * @property {import('svelte').Snippet} [children] - The links or content within the column.
     * @property {string} [class=''] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        title, 
        children,
        class: className = ''
    } = $props();
</script>

<div class="aea-footer-column {className}">
    <h3 class="aea-footer-heading">{title}</h3>
    {#if children}
        <ul class="flex flex-col space-y-3">
            {@render children()}
        </ul>
    {/if}
</div>

<style>
    .aea-footer-heading {
        color: hsl(var(--text-100));
        font-size: 1.125rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        margin-bottom: 1.5rem;
        position: relative;
        display: inline-block;
    }

    .aea-footer-heading::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -0.5rem;
        width: 2rem;
        height: 2px;
        background-color: hsl(var(--accent-brand));
    }
</style>
