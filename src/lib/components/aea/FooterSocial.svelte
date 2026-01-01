<script>
    import { IconBrandGithub, IconBrandTwitter, IconBrandDiscord } from '@tabler/icons-svelte';

    /**
     * @component FooterSocial
     * A styled social media icon link for the Footer.
     * 
     * @typedef {Object} Props
     * @property {string} [href='#'] - The social media link destination.
     * @property {string} [ariaLabel] - Accessibility label for the link.
     * @property {'github' | 'twitter' | 'discord' | 'custom'} [icon='custom'] - Predefined icon name or 'custom'.
     * @property {import('svelte').Snippet} [children] - Custom icon content (if icon is 'custom').
     * @property {string} [class=''] - Additional CSS classes.
     */

    /** @type {Props} */
    let { 
        href = '#', 
        ariaLabel,
        icon = 'custom',
        children,
        class: className = ''
    } = $props();

    const icons = {
        github: IconBrandGithub,
        twitter: IconBrandTwitter,
        discord: IconBrandDiscord
    };

    const finalAriaLabel = $derived(ariaLabel || (icon !== 'custom' ? `Visit us on ${icon}` : 'Social link'));
</script>

<a 
    {href} 
    class="aea-footer-social-link {className}" 
    aria-label={finalAriaLabel}
    target="_blank"
    rel="noopener noreferrer"
>
    {#if icon !== 'custom' && icons[icon]}
        {@const Icon = icons[icon]}
        <Icon size={20} />
    {:else if children}
        {@render children()}
    {/if}
</a>

<style>
    .aea-footer-social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background-color: hsla(var(--bg-200) / 0.5);
        color: hsl(var(--text-300));
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid hsla(var(--border-300) / 0.1);
    }

    .aea-footer-social-link:hover {
        background-color: hsl(var(--accent-brand));
        color: white;
        transform: translateY(-4px) scale(1.1);
        box-shadow: 0 5px 15px hsla(var(--accent-brand) / 0.4);
        border-color: transparent;
    }

    .aea-footer-social-link:active {
        transform: translateY(-2px) scale(0.95);
    }
</style>
