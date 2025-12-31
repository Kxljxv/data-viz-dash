<script lang="ts">
	interface Props {
		direction?: 'vertical' | 'horizontal' | 'both';
		glass?: boolean;
		height?: string;
		width?: string;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		direction = 'both',
		glass = false,
		height = '100%',
		width = '100%',
		class: className = '',
		children
	}: Props = $props();

	// Map direction to overflow classes
	const directionClass = $derived(
		direction === 'vertical'
			? 'aea-scroll-area-v'
			: direction === 'horizontal'
				? 'aea-scroll-area-h'
				: 'aea-scroll-area'
	);
</script>

<div
	class="{directionClass} {glass ? 'aea-scroll-area-glass' : ''} {className} custom-scrollbar"
	style:height
	style:width
>
	{@render children?.()}
</div>

<style>
	.aea-scroll-area {
		overflow: auto;
	}

	.aea-scroll-area-v {
		overflow-y: auto;
		overflow-x: hidden;
	}

	.aea-scroll-area-h {
		overflow-x: auto;
		overflow-y: hidden;
	}

	/* Ensure smooth scrolling if supported */
	div {
		scroll-behavior: smooth;
	}
</style>
