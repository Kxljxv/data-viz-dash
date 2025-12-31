<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		class?: string;
		alternating?: boolean;
	}

	let { children, class: className = '', alternating = false }: Props = $props();
</script>

<div class="aea-timeline {className}" class:aea-timeline-alternating={alternating}>
	{@render children?.()}
</div>

<style>
	.aea-timeline {
		position: relative;
		padding: 1rem 0;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-timeline::before {
		content: '';
		position: absolute;
		left: 0.75rem;
		top: 0;
		bottom: 0;
		width: 2px;
		background-color: hsla(var(--border-300) / 0.1);
	}

	/* Alternating Variant (Desktop) */
	@media (min-width: 1024px) {
		.aea-timeline-alternating::before {
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
