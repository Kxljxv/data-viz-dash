<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		class?: string;
		align?: 'left' | 'center' | 'right';
		[key: string]: any;
	}

	let { children, class: className = '', align = 'left', ...rest }: Props = $props();
</script>

<td class="{className} text-{align}" {...rest}>
	{@render children?.()}
</td>

<style>
	td {
		padding: 1rem;
		border-bottom: 1px solid hsla(var(--border-300) / 0.1);
		font-size: 0.875rem;
		transition: all 0.2s ease;
		color: inherit;
	}

	:global(.aea-table-compact) td {
		padding: 0.625rem 0.75rem;
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
