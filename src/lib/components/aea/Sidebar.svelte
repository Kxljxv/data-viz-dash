<script lang="ts">
	import { setContext, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { IconChevronsLeft } from "@tabler/icons-svelte";

	interface Props {
		brandTitle?: string;
		isMini?: boolean;
		isOpen?: boolean;
		logo?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		class?: string;
	}

	let {
		brandTitle = 'AEA Design',
		isMini = $bindable(false),
		isOpen = $bindable(false),
		logo,
		children,
		footer,
		class: className = ''
	}: Props = $props();

	// Use a wrapper object for context so it stays reactive
	const sidebarContext = {
		get isMini() {
			return { value: isMini };
		}
	};

	setContext('sidebar-context', sidebarContext);

	onMount(() => {
		if (browser) {
			const saved = localStorage.getItem('aea-sidebar-mini');
			if (saved !== null) {
				isMini = saved === 'true';
			}
		}
	});

	function toggleMini() {
		if (window.innerWidth <= 768) {
			isOpen = !isOpen;
		} else {
			isMini = !isMini;
			if (browser) {
				localStorage.setItem('aea-sidebar-mini', String(isMini));
			}
		}
	}

	function closeMobile() {
		isOpen = false;
	}

	// Dispatch resize event when isMini changes
	$effect(() => {
		if (browser) {
			window.dispatchEvent(
				new CustomEvent('aea-sidebar-resize', {
					detail: { isMini, width: isMini ? 80 : 280 }
				})
			);
		}
	});

	// Handle mobile overflow
	$effect(() => {
		if (browser) {
			document.body.style.overflow = isOpen ? 'hidden' : '';
		}
	});
</script>

<!-- Backdrop for mobile -->
<button 
	class="aea-sidebar-backdrop" 
	class:is-visible={isOpen} 
	onclick={closeMobile}
	onkeydown={(e) => e.key === 'Escape' && closeMobile()}
	aria-label="Close sidebar"
	tabindex="-1"
></button>

<aside class="aea-sidebar {isMini ? 'is-mini' : ''} {isOpen ? 'is-open' : ''} {className}">
	<div class="aea-sidebar-header">
		<div class="header-brand">
			{#if logo}
				<div class="brand-logo">
					{@render logo()}
				</div>
			{/if}
			{#if brandTitle && !isMini}
				<span class="brand-title">{brandTitle}</span>
			{/if}
		</div>

		<button class="aea-sidebar-toggle" onclick={toggleMini} aria-label="Toggle Sidebar">
			<span class="aea-sidebar-toggle-icon">
				<IconChevronsLeft size={20} />
			</span>
		</button>
	</div>

	<nav class="aea-sidebar-inner custom-scrollbar">
		{@render children?.()}
	</nav>

	{#if footer}
		{@render footer()}
	{/if}
</aside>

<style>
	:root {
		--sidebar-width-full: 280px;
		--sidebar-width-mini: 80px;
		--sidebar-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.aea-sidebar {
		position: relative;
		height: 100vh;
		width: var(--sidebar-width-full);
		background-color: hsla(var(--bg-100) / 0.8);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border-right: 1px solid hsla(var(--border-300) / 0.1);
		display: flex;
		flex-direction: column;
		z-index: 1000;
		transition:
			width var(--sidebar-transition),
			transform var(--sidebar-transition);
	}

	@media (max-width: 1024px) {
		.aea-sidebar {
			position: fixed;
			top: 0;
			left: 0;
			transform: translateX(-100%);
		}

		.aea-sidebar.is-open {
			transform: translateX(0);
		}
	}

	.aea-sidebar.is-mini {
		width: var(--sidebar-width-mini);
	}

	.aea-sidebar-inner {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem;
	}

	/* Header */
	.aea-sidebar-header {
		height: 4.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1.5rem;
		border-bottom: 1px solid hsla(var(--border-300) / 0.05);
	}

	.aea-sidebar.is-mini .aea-sidebar-header {
		justify-content: center;
		padding: 0;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: opacity 0.2s ease;
	}

	.aea-sidebar.is-mini .header-brand {
		display: none;
	}

	.brand-logo {
		height: 2rem;
		width: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.brand-title {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		font-weight: 500;
		color: hsl(var(--text-100));
		letter-spacing: -0.02em;
	}

	.aea-sidebar-toggle {
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsla(var(--text-400) / 0.05);
		border: none;
		border-radius: 0.75rem;
		color: hsla(var(--text-400) / 0.8);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.aea-sidebar-toggle:hover {
		background: hsla(var(--accent-brand) / 0.1);
		color: hsl(var(--accent-brand));
	}

	.aea-sidebar-toggle-icon {
		display: flex;
		transition: transform var(--sidebar-transition);
	}

	.aea-sidebar.is-mini .aea-sidebar-toggle-icon {
		transform: rotate(180deg);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.aea-sidebar {
			transform: translateX(-100%);
			width: 280px !important;
		}

		.aea-sidebar.is-open {
			transform: translateX(0);
		}

		.aea-sidebar-backdrop {
			position: fixed;
			inset: 0;
			background-color: rgba(0, 0, 0, 0.5);
			backdrop-filter: blur(4px);
			z-index: 999;
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.3s ease;
			border: none;
			padding: 0;
			margin: 0;
			width: 100%;
			height: 100%;
		}

		.aea-sidebar-backdrop.is-visible {
			opacity: 1;
			pointer-events: auto;
		}
	}
</style>
