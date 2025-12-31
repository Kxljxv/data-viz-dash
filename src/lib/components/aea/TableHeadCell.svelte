<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		class?: string;
		align?: 'left' | 'center' | 'right';
		[key: string]: any;
	}

	let { children, class: className = '', align = 'left', ...rest }: Props = $props();
</script>

<th class="{className} text-{align}" {...rest}>
	{@render children?.()}
</th>

<style>
	th {
		background-color: hsla(var(--bg-200) / 0.5);
		color: hsl(var(--text-000));
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.75rem;
		padding: 1rem;
		border-bottom: 1px solid hsla(var(--border-300) / 0.2);
		position: sticky;
		top: 0;
		z-index: 10;
		white-space: nowrap;
		transition: background-color 0.2s ease;
	}

	:global(.aea-table-compact) th {
		padding: 0.625rem 0.75rem;
	}

	:global(.aea-table-glass) th {
		background-color: hsla(var(--bg-200) / 0.6);
	}

	.text-left {
		text-align: left;
	}
	.text-center {
		text-align: center;
	}
	.text-right {
		text-align: right;
	}
</style>
