<script lang="ts">
	import { getContext } from 'svelte';

	interface Props {
		href: string;
		icon?: import('svelte').Snippet | import('svelte').Component<any>;
		label: string;
		active?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		href,
		icon: Icon,
		label,
		active = false,
		class: className = '',
		onclick
	}: Props = $props();

	const sidebar = getContext<{ isMini: { value: boolean } }>('sidebar-context');

	function handleClick(e: MouseEvent) {
		onclick?.(e);
	}
</script>

<a
	{href}
	class="aea-sidebar-item {active ? 'is-active' : ''} {className}"
	class:is-mini={sidebar?.isMini.value}
	data-tooltip={label}
	onclick={handleClick}
>
	{#if Icon}
		<div class="aea-sidebar-icon">
			{#if typeof Icon === 'function' && !Icon.prototype}
				{@render Icon()}
			{:else}
				<Icon size={20} />
			{/if}
		</div>
	{/if}
	<span class="aea-sidebar-label">{label}</span>
</a>

<style>
	.aea-sidebar-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		color: hsla(var(--text-400) / 0.8);
		text-decoration: none;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: 0.25rem;
		white-space: nowrap;
		position: relative;
		cursor: pointer;
	}

	.aea-sidebar-item:hover {
		background: hsla(var(--text-400) / 0.05);
		color: hsl(var(--text-100));
	}

	.aea-sidebar-item.is-active {
		background: hsla(var(--accent-brand) / 0.1);
		color: hsl(var(--accent-brand));
	}

	.aea-sidebar-item.is-active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 20%;
		bottom: 20%;
		width: 3px;
		background: hsl(var(--accent-brand));
		border-radius: 0 4px 4px 0;
		box-shadow: 2px 0 8px hsla(var(--accent-brand) / 0.4);
	}

	.aea-sidebar-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.aea-sidebar-label {
		font-size: 0.875rem;
		font-weight: 500;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	/* Mini Mode Styles */
	.aea-sidebar-item.is-mini {
		justify-content: center;
		padding: 0.75rem;
	}

	.aea-sidebar-item.is-mini .aea-sidebar-label {
		opacity: 0;
		transform: translateX(-10px);
		pointer-events: none;
		position: absolute;
	}

	/* Tooltips for Mini Mode */
	.aea-sidebar-item.is-mini::after {
		content: attr(data-tooltip);
		position: absolute;
		left: calc(100% + 1rem);
		top: 50%;
		transform: translateY(-50%) translateX(-10px);
		background: hsla(var(--bg-100) / 0.95);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		color: hsl(var(--text-100));
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transition: all 0.2s ease;
		z-index: 1100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}

	.aea-sidebar-item.is-mini:hover::after {
		opacity: 1;
		visibility: visible;
		transform: translateY(-50%) translateX(0);
	}
</style>
