<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		id?: string;
		active?: boolean;
		disabled?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
		icon?: import('svelte').Snippet;
		subtitle?: import('svelte').Snippet;
		extra?: import('svelte').Snippet;
		onclick?: (id: string) => void;
	}

	let {
		id = crypto.randomUUID(),
		active = $bindable(false),
		disabled = false,
		class: className = '',
		children,
		icon,
		subtitle,
		extra,
		onclick
	}: Props = $props();

	// Get context from parent ListGroup
	const listContext = getContext<{
		interactive: boolean;
		registerItem: (id: string, select: (val: boolean) => void) => void;
		toggleSelection: (id: string) => void;
	}>('list-group');

	let isVisible = $state(false);

	onMount(() => {
		isVisible = true;
		if (listContext) {
			listContext.registerItem(id, (val: boolean) => {
				active = val;
			});
		}
	});

	function handleClick() {
		if (disabled) return;
		if (listContext?.interactive) {
			listContext.toggleSelection(id);
		}
		onclick?.(id);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<li
	{id}
	class="list-group-item {listContext?.interactive ? 'list-group-item-interactive' : ''} {active
		? 'active'
		: ''} {className}"
	role={listContext?.interactive ? 'option' : 'listitem'}
	aria-selected={listContext?.interactive ? active : undefined}
	aria-disabled={disabled}
	tabindex={listContext?.interactive && !disabled ? 0 : -1}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if icon}
		<div class="list-group-icon">
			{@render icon()}
		</div>
	{/if}

	<div class="list-group-content">
		{#if children}
			<span class="list-group-title">
				{@render children()}
			</span>
		{/if}
		{#if subtitle}
			<span class="list-group-subtitle">
				{@render subtitle()}
			</span>
		{/if}
	</div>

	{#if extra}
		<div class="list-group-extra">
			{@render extra()}
		</div>
	{/if}
</li>

<style>
	.list-group-item {
		display: flex;
		align-items: center;
		padding: 1rem 1.25rem;
		gap: 1rem;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		border-bottom: 1px solid hsla(var(--border-300) / 0.1);
		position: relative;
		overflow: hidden;
	}

	.list-group-item:last-child {
		border-bottom: none;
	}

	.list-group-item-interactive {
		cursor: pointer;
		user-select: none;
	}

	.list-group-item-interactive:hover:not(.active) {
		background-color: hsla(var(--bg-200) / 0.4);
		transform: translateX(4px);
	}

	.list-group-item.active {
		background-color: hsla(var(--accent-brand) / 0.15);
		border-left: 3px solid hsl(var(--accent-brand));
		padding-left: calc(1.25rem - 3px);
	}

	.list-group-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: hsl(var(--accent-brand));
		flex-shrink: 0;
	}

	.list-group-content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		min-width: 0;
	}

	.list-group-title {
		font-weight: 500;
		color: hsl(var(--text-100));
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-group-subtitle {
		font-size: 0.8125rem;
		color: hsl(var(--text-400));
		margin-top: 0.125rem;
	}

	.list-group-extra {
		margin-left: auto;
		flex-shrink: 0;
	}

	/* Accessibility Focus */
	.list-group-item-interactive:focus-visible {
		outline: 2px solid hsl(var(--accent-brand));
		outline-offset: -2px;
		background-color: hsla(var(--bg-200) / 0.6);
	}

	/* Disabled State */
	.list-group-item[aria-disabled='true'] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
