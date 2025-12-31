<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		class?: string;
		date?: string;
		title?: string;
		variant?: 'brand' | 'info' | 'success' | 'danger';
	}

	let {
		children,
		class: className = '',
		date,
		title,
		variant = 'brand'
	}: Props = $props();
</script>

<div class="aea-timeline-item {className}">
	<div class="aea-timeline-marker aea-timeline-marker-{variant}"></div>
	<div class="aea-timeline-content">
		{#if date}
			<time class="aea-timeline-date">{date}</time>
		{/if}
		{#if title}
			<h3 class="text-lg font-bold text-[hsl(var(--text-100))]">{title}</h3>
		{/if}
		<div class="text-[hsl(var(--text-300))]">
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.aea-timeline-item {
		position: relative;
		padding-left: 2.5rem;
		margin-bottom: 2rem;
	}

	.aea-timeline-item:last-child {
		margin-bottom: 0;
	}

	.aea-timeline-marker {
		position: absolute;
		left: 0.375rem;
		top: 0.25rem;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background-color: hsl(var(--bg-300));
		border: 2px solid hsla(var(--border-300) / 0.2);
		z-index: 1;
		transition: all 0.2s ease;
	}

	.aea-timeline-item:hover .aea-timeline-marker {
		transform: scale(1.2);
		box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.4);
	}

	.aea-timeline-content {
		background-color: hsla(var(--bg-200) / 0.3);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 1rem;
		padding: 1rem 1.25rem;
		transition: all 0.2s ease;
	}

	.aea-timeline-item:hover .aea-timeline-content {
		background-color: hsla(var(--bg-200) / 0.5);
		border-color: hsla(var(--border-300) / 0.3);
	}

	.aea-timeline-date {
		display: block;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsla(var(--text-400) / 0.8);
		margin-bottom: 0.5rem;
	}

	.aea-timeline-marker-brand {
		background-color: hsl(var(--accent-brand));
		border-color: hsla(var(--accent-brand) / 0.3);
	}
	.aea-timeline-marker-success {
		background-color: hsl(var(--success-100));
		border-color: hsla(var(--success-100) / 0.3);
	}
	.aea-timeline-marker-info {
		background-color: hsl(var(--accent-secondary-100));
		border-color: hsla(var(--accent-secondary-100) / 0.3);
	}
	.aea-timeline-marker-danger {
		background-color: hsl(var(--danger-100));
		border-color: hsla(var(--danger-100) / 0.3);
	}

	/* Alternating Variant (Desktop) */
	@media (min-width: 1024px) {
		:global(.aea-timeline-alternating) .aea-timeline-item {
			width: 50%;
			padding-left: 0;
			padding-right: 2.5rem;
			text-align: right;
		}

		:global(.aea-timeline-alternating) .aea-timeline-item:nth-child(even) {
			margin-left: 50%;
			padding-right: 0;
			padding-left: 2.5rem;
			text-align: left;
		}

		:global(.aea-timeline-alternating) .aea-timeline-marker {
			left: auto;
			right: -0.375rem;
		}

		:global(.aea-timeline-alternating)
			.aea-timeline-item:nth-child(even)
			.aea-timeline-marker {
			right: auto;
			left: -0.375rem;
		}
	}
</style>
