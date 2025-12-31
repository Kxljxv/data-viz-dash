<script>
    /**
     * @typedef {Object} Props
     * @property {string} [href] - Optional link destination.
     * @property {boolean} [active=false] - Whether this is the current page.
     * @property {string} [class] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Item content.
     */

    /** @type {Props} */
    let { 
        href, 
        active = false, 
        class: className = '', 
        children,
        ...rest 
    } = $props();
</script>

<li 
    class="aea-breadcrumb-item {active ? 'active' : ''} {className}" 
    aria-current={active ? 'page' : undefined}
    {...rest}
>
    {#if active || !href}
        <span class="aea-breadcrumb-content">
            {@render children?.()}
        </span>
    {:else}
        <a {href} class="aea-breadcrumb-link">
            {@render children?.()}
        </a>
    {/if}
</li>

<style>
    .aea-breadcrumb-item {
        display: flex;
        align-items: center;
        color: hsl(var(--text-400));
    }

    .aea-breadcrumb-link {
        color: hsl(var(--text-400));
        transition: color 0.2s;
        text-decoration: none;
        display: flex;
        align-items: center;
    }

    .aea-breadcrumb-link:hover {
        color: hsl(var(--accent-brand));
    }

    .aea-breadcrumb-item.active {
        color: hsl(var(--text-000));
        font-weight: 500;
    }

    .aea-breadcrumb-content {
        display: flex;
        align-items: center;
    }
</style>
