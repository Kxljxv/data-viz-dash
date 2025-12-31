<script lang="ts">
	interface Props {
		shape?: 'circle' | 'rect' | 'text';
		animation?: 'pulse' | 'shimmer' | 'none';
		width?: string;
		height?: string;
		class?: string;
	}

	let {
		shape = 'rect',
		animation = 'pulse',
		width,
		height,
		class: className = ''
	}: Props = $props();

	const style = $derived.by(() => {
		let s = '';
		if (width) s += `width: ${width};`;
		if (height) s += `height: ${height};`;
		return s;
	});
</script>

<div
	class="aea-skeleton {className} shape-{shape} animation-{animation}"
	{style}
	aria-hidden="true"
></div>

<style>
	.aea-skeleton {
		display: block;
		background-color: hsla(var(--bg-300) / 0.3);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		border-radius: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	/* Shapes */
	.shape-circle {
		border-radius: 50%;
		aspect-ratio: 1 / 1;
	}

	.shape-rect {
		border-radius: 0.75rem;
	}

	.shape-text {
		height: 0.75em;
		margin: 0.5em 0;
		border-radius: 0.25rem;
	}

	/* Animations */
	.animation-pulse {
		animation: aea-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.animation-shimmer::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background-image: linear-gradient(
			90deg,
			transparent,
			hsla(var(--text-100) / 0.05),
			transparent
		);
		animation: aea-skeleton-shimmer 2s infinite;
	}

	@keyframes aea-skeleton-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	@keyframes aea-skeleton-shimmer {
		100% { transform: translateX(100%); }
	}
</style>
