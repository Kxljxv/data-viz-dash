<script>
    /**
     * @typedef {Object} Props
     * @property {'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'} [variant='neutral'] - The color variant of the badge.
     * @property {boolean} [pill=false] - If true, the badge will have fully rounded corners.
     * @property {boolean} [outline=false] - If true, the badge will have an outline style.
     * @property {boolean} [soft=false] - If true, the badge will have a glassmorphic/soft style.
     * @property {string} [class=''] - Additional CSS classes.
     * @property {import('svelte').Snippet} [children] - Badge content.
     */

    /** @type {Props} */
    let { 
        variant = 'neutral', 
        pill = false, 
        outline = false, 
        soft = false, 
        children,
        class: className = '',
        ...rest 
    } = $props();

    const variantClasses = {
        brand: 'badge-brand',
        info: 'badge-info',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        neutral: 'badge-neutral'
    };
</script>

<span 
    class="badge {variantClasses[variant]} {pill ? 'badge-pill' : ''} {outline ? 'badge-outline' : ''} {soft ? 'badge-soft' : ''} {className}"
    {...rest}
>
    {@render children?.()}
</span>

<style>
    /* These styles are based on the design library's badge implementation */
    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem 0.5rem;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-radius: 0.375rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
        border: 1px solid transparent;
    }

    .badge-pill {
        border-radius: 9999px;
    }

    /* Variant Colors - Solid */
    .badge-brand { background-color: hsl(var(--accent-brand)); color: white; }
    .badge-info { background-color: hsl(var(--accent-pro-100)); color: white; }
    .badge-success { background-color: hsl(var(--success-100)); color: white; }
    .badge-warning { background-color: hsl(var(--warning-100)); color: black; }
    .badge-danger { background-color: hsl(var(--danger-100)); color: white; }
    .badge-neutral { background-color: hsla(var(--bg-100) / 0.8); color: hsl(var(--text-200)); }

    /* Outline Styles */
    .badge-outline {
        background-color: transparent !important;
    }
    .badge-outline.badge-brand { border-color: hsla(var(--accent-brand) / 0.5); color: hsl(var(--accent-brand)); }
    .badge-outline.badge-info { border-color: hsla(var(--accent-pro-100) / 0.5); color: hsl(var(--accent-pro-100)); }
    .badge-outline.badge-success { border-color: hsla(var(--success-100) / 0.5); color: hsl(var(--success-100)); }
    .badge-outline.badge-danger { border-color: hsla(var(--danger-100) / 0.5); color: hsl(var(--danger-100)); }
    .badge-outline.badge-neutral { border-color: hsla(var(--border-300) / 0.3); color: hsl(var(--text-300)); }

    /* Soft / Glassmorphic Styles */
    .badge-soft {
        backdrop-filter: blur(4px);
    }
    .badge-soft.badge-brand { background-color: hsla(var(--accent-brand) / 0.15); color: hsl(var(--accent-brand)); border-color: hsla(var(--accent-brand) / 0.2); }
    .badge-soft.badge-info { background-color: hsla(var(--accent-pro-100) / 0.15); color: hsl(var(--accent-pro-100)); border-color: hsla(var(--accent-pro-100) / 0.2); }
    .badge-soft.badge-success { background-color: hsla(var(--success-100) / 0.15); color: hsl(var(--success-100)); border-color: hsla(var(--success-100) / 0.2); }
    .badge-soft.badge-danger { background-color: hsla(var(--danger-100) / 0.15); color: hsl(var(--danger-100)); border-color: hsla(var(--danger-100) / 0.2); }
    .badge-soft.badge-neutral { background-color: hsla(var(--bg-100) / 0.3); color: hsl(var(--text-300)); border-color: hsla(var(--border-300) / 0.2); }
</style>
