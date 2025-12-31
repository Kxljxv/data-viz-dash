<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		shape?: 'circle' | 'hexagon' | 'octagon' | 'shield' | 'clipped';
		style?: 'glass' | 'neon' | 'hologram' | 'outline';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		color?: string;
		class?: string;
		children?: Snippet;
	}

	let {
		shape = 'circle',
		style = 'glass',
		size = 'md',
		color,
		class: className = '',
		children
	}: Props = $props();

	const customColor = $derived(color ? `--shape-accent: ${color};` : '');
</script>

<div
	class="aea-icon-shape {className} shape-{shape} style-{style} size-{size}"
	style={customColor}
>
	{#if style === 'hologram'}
		<div class="hologram-overlay"></div>
	{/if}
	
	<div class="aea-icon-shape-content">
		{@render children?.()}
	</div>
</div>

<style>
	.aea-icon-shape {
		--shape-accent: hsl(var(--accent-brand));
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid hsla(var(--border-300) / 0.15);
	}

	.aea-icon-shape-content {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	/* Sizes */
	.size-xs { width: 1.5rem; height: 1.5rem; }
	.size-sm { width: 2rem; height: 2rem; }
	.size-md { width: 3rem; height: 3rem; }
	.size-lg { width: 4rem; height: 4rem; }
	.size-xl { width: 5rem; height: 5rem; }

	/* Shapes */
	.shape-circle { border-radius: 50%; }
	
	.shape-hexagon {
		clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
	}

	.shape-octagon {
		clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
	}

	.shape-shield {
		clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
	}

	.shape-clipped {
		clip-path: polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%);
	}

	/* Styles */
	.style-neon {
		border-color: var(--shape-accent);
		box-shadow: 0 0 15px -2px var(--shape-accent), inset 0 0 10px -2px var(--shape-accent);
		background-color: hsla(var(--bg-300) / 0.2);
	}

	.style-outline {
		background-color: transparent;
		backdrop-filter: none;
		border-color: hsla(var(--border-300) / 0.4);
	}

	.style-hologram {
		background-color: hsla(var(--accent-brand) / 0.05);
		border-color: hsla(var(--accent-brand) / 0.3);
		animation: hologram-pulse 4s ease-in-out infinite;
	}

	.hologram-overlay {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			hsla(var(--accent-brand) / 0.05) 2px,
			hsla(var(--accent-brand) / 0.05) 4px
		);
		pointer-events: none;
		z-index: 1;
	}

	@keyframes hologram-pulse {
		0%, 100% { opacity: 0.8; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.02); }
	}

	.aea-icon-shape:hover {
		transform: translateY(-2px);
		border-color: hsla(var(--border-300) / 0.4);
	}

	.style-neon:hover {
		box-shadow: 0 0 20px -2px var(--shape-accent), inset 0 0 15px -2px var(--shape-accent);
	}
</style>
