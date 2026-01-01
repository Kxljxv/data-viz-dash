<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';

	interface Props {
		items?: any[];
		autoplay?: boolean;
		autoplaySpeed?: number;
		showArrows?: boolean;
		showDots?: boolean;
		loop?: boolean;
		class?: string;
		children?: Snippet<[any, number]>;
	}

	let {
		items = [],
		autoplay = false,
		autoplaySpeed = 5000,
		showArrows = true,
		showDots = true,
		loop = true,
		class: className = '',
		children
	}: Props = $props();

	let currentIndex = $state(0);
	let interval: any;

	function next() {
		if (currentIndex < items.length - 1) {
			currentIndex++;
		} else if (loop) {
			currentIndex = 0;
		}
	}

	function prev() {
		if (currentIndex > 0) {
			currentIndex--;
		} else if (loop) {
			currentIndex = items.length - 1;
		}
	}

	function goTo(index: number) {
		currentIndex = index;
	}

	function startAutoplay() {
		if (autoplay) {
			interval = setInterval(next, autoplaySpeed);
		}
	}

	function stopAutoplay() {
		if (interval) clearInterval(interval);
	}

	onMount(() => {
		startAutoplay();
	});

	onDestroy(() => {
		stopAutoplay();
	});
</script>

<div
	class="aea-carousel {className}"
	role="region"
	aria-roledescription="carousel"
	onmouseenter={stopAutoplay}
	onmouseleave={startAutoplay}
>
	<div class="aea-carousel-viewport">
		<div
			class="aea-carousel-track"
			style="transform: translateX(-{currentIndex * 100}%);"
		>
			{#each items as item, i}
				<div
					class="aea-carousel-slide"
					class:is-active={currentIndex === i}
					role="group"
					aria-roledescription="slide"
					aria-label="{i + 1} of {items.length}"
				>
					{@render children?.(item, i)}
				</div>
			{/each}
		</div>
	</div>

	{#if showArrows && items.length > 1}
		<button
			type="button"
			class="aea-carousel-arrow arrow-prev"
			onclick={prev}
			aria-label="Previous slide"
		>
			<IconChevronLeft size={24} />
		</button>
		<button
			type="button"
			class="aea-carousel-arrow arrow-next"
			onclick={next}
			aria-label="Next slide"
		>
			<IconChevronRight size={24} />
		</button>
	{/if}

	{#if showDots && items.length > 1}
		<div class="aea-carousel-indicators">
			{#each items as _, i}
				<button
					type="button"
					class="aea-carousel-dot"
					class:is-active={currentIndex === i}
					onclick={() => goTo(i)}
					aria-label="Go to slide {i + 1}"
					aria-current={currentIndex === i ? 'true' : 'false'}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.aea-carousel {
		position: relative;
		width: 100%;
		overflow: hidden;
		font-family: 'ModernDense', sans-serif;
		border-radius: 1.5rem;
		background-color: hsla(var(--bg-300) / 0.2);
		backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.1);
	}

	.aea-carousel-viewport {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.aea-carousel-track {
		display: flex;
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		height: 100%;
	}

	.aea-carousel-slide {
		flex: 0 0 100%;
		width: 100%;
		min-width: 0;
		position: relative;
		opacity: 0.4;
		transition: opacity 0.6s ease;
	}

	.aea-carousel-slide.is-active {
		opacity: 1;
	}

	/* Arrows */
	.aea-carousel-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: hsla(var(--bg-100) / 0.4);
		backdrop-filter: blur(12px);
		border: 1px solid hsla(var(--border-300) / 0.2);
		border-radius: 50%;
		color: hsl(var(--text-100));
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 10;
		opacity: 0;
	}

	.aea-carousel:hover .aea-carousel-arrow {
		opacity: 1;
	}

	.aea-carousel-arrow:hover {
		background-color: hsla(var(--accent-brand) / 0.2);
		border-color: hsl(var(--accent-brand));
		box-shadow: 0 0 15px hsla(var(--accent-brand) / 0.4);
	}

	.arrow-prev { left: 1rem; }
	.arrow-next { right: 1rem; }

	/* Indicators */
	.aea-carousel-indicators {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.75rem;
		z-index: 10;
		padding: 0.5rem 1rem;
		background-color: hsla(var(--bg-100) / 0.4);
		backdrop-filter: blur(8px);
		border-radius: 1rem;
		border: 1px solid hsla(var(--border-300) / 0.1);
	}

	.aea-carousel-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: hsla(var(--text-500) / 0.3);
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0;
	}

	.aea-carousel-dot.is-active {
		background-color: hsl(var(--accent-brand));
		box-shadow: 0 0 8px hsla(var(--accent-brand) / 0.6);
		transform: scale(1.2);
	}

	.aea-carousel-dot:hover:not(.is-active) {
		background-color: hsla(var(--text-500) / 0.6);
	}
</style>
