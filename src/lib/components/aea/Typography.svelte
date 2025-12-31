<script>
    /**
     * @typedef {Object} Props
     * @property {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'} [tag='p'] - The HTML tag to render.
     * @property {'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label' | 'meta'} [variant='body'] - The visual style variant.
     * @property {string} [class=""] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - The content to render.
     */

    /** @type {Props} */
    let {
        tag = 'p',
        variant = 'body',
        class: className = "",
        children,
        ...rest
    } = $props();

    const variantClasses = {
        display: 'font-serif text-4xl',
        h1: 'font-serif text-3xl',
        h2: 'font-serif text-2xl',
        h3: 'font-modern-dense text-xl',
        body: 'text-base leading-relaxed text-[hsl(var(--text-200))]',
        small: 'text-sm leading-relaxed text-[hsl(var(--text-200))]',
        label: 'text-xs font-bold text-[hsl(var(--text-500))] uppercase tracking-widest',
        meta: 'text-xs text-[hsl(var(--text-500))] italic'
    };
</script>

<svelte:element
    this={tag}
    class="{variantClasses[variant]} {className}"
    {...rest}
>
    {@render children?.()}
</svelte:element>
