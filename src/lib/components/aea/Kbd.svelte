<script lang="ts">
	interface Props {
		key?: string;
		label?: string;
		variant?: 'default' | 'accent';
		size?: 'sm' | 'md';
		class?: string;
	}

	let {
		key,
		label,
		variant = 'default',
		size = 'md',
		class: className = ''
	}: Props = $props();

	const displayValue = $derived(label || key || '');
</script>

<kbd
	class="aea-kbd {className} variant-{variant} size-{size}"
	aria-label={displayValue}
>
	{displayValue}
</kbd>

<style>
	.aea-kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: 'ModernDense', sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		border-radius: 0.375rem;
		background-color: hsla(var(--bg-200) / 0.8);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.4);
		color: hsl(var(--text-200));
		box-shadow: 0 2px 0 0 hsla(0, 0%, 0%, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.2);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		user-select: none;
		cursor: default;
		line-height: 1;
	}

	/* Sizes */
	.size-sm {
		padding: 0.2rem 0.4rem;
		font-size: 0.625rem;
		min-width: 1.25rem;
	}

	.size-md {
		padding: 0.3rem 0.6rem;
		font-size: 0.75rem;
		min-width: 1.75rem;
	}

	/* Variants */
	.variant-accent {
		border-color: hsla(var(--accent-brand) / 0.6);
		color: hsl(var(--accent-brand));
		background-color: hsla(var(--accent-brand) / 0.1);
	}

	/* Interactions */
	.aea-kbd:hover {
		border-color: hsla(var(--accent-brand) / 0.6);
		box-shadow: 0 2px 0 0 hsla(0, 0%, 0%, 0.4), 0 0 10px hsla(var(--accent-brand) / 0.3);
		transform: translateY(-1px);
	}

	.aea-kbd:active {
		transform: translateY(1px);
		box-shadow: 0 0 0 0 transparent;
	}
</style>
