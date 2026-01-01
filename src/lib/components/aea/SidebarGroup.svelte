<script lang="ts">
	import { getContext } from 'svelte';
	import { IconChevronDown } from '@tabler/icons-svelte';

	interface Props {
		title: string;
		collapsible?: boolean;
		collapsed?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		title,
		collapsible = true,
		collapsed = $bindable(false),
		children
	}: Props = $props();

	const sidebar = getContext<{ isMini: { value: boolean } }>('sidebar-context');

	function toggleCollapse() {
		if (collapsible && !sidebar?.isMini.value) {
			collapsed = !collapsed;
		}
	}
</script>

<div class="aea-sidebar-group" class:is-collapsed={collapsed} class:is-mini={sidebar?.isMini.value}>
	<button
		class="aea-sidebar-group-header"
		onclick={toggleCollapse}
		type="button"
		disabled={!collapsible}
		aria-expanded={collapsible ? !collapsed : undefined}
	>
		<span class="aea-sidebar-group-title">{title}</span>
		{#if collapsible && !sidebar?.isMini.value}
			<span class="aea-sidebar-group-chevron">
				<IconChevronDown size={12} aria-hidden="true" />
			</span>
		{/if}
	</button>

	<div class="aea-sidebar-group-content">
		{@render children?.()}
	</div>
</div>

<style>
	.aea-sidebar-group {
		margin-bottom: 2rem;
	}

	.aea-sidebar-group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		padding-right: 1rem;
		outline: none;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		padding-left: 0;
	}

    .aea-sidebar-group-header:disabled {
        cursor: default;
    }

	.aea-sidebar-group-title {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: hsla(var(--text-400) / 0.5);
		padding: 0 1rem;
		margin-bottom: 0.75rem;
		white-space: nowrap;
		transition: opacity 0.2s ease;
	}

	.aea-sidebar-group-chevron {
		display: flex;
		align-items: center;
		justify-content: center;
		color: hsla(var(--text-400) / 0.3);
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: 0.75rem;
	}

	.aea-sidebar-group.is-collapsed .aea-sidebar-group-chevron {
		transform: rotate(-90deg);
	}

	.aea-sidebar-group-content {
		max-height: 1000px;
		overflow: hidden;
		transition:
			max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.3s ease;
	}

	.aea-sidebar-group.is-collapsed .aea-sidebar-group-content {
		max-height: 0;
		opacity: 0;
	}

	/* Mini Mode Styles */
	.aea-sidebar-group.is-mini .aea-sidebar-group-title {
		opacity: 0;
		pointer-events: none;
	}

	.aea-sidebar-group.is-mini .aea-sidebar-group-chevron {
		display: none;
	}

	.aea-sidebar-group.is-mini .aea-sidebar-group-content {
		max-height: none;
		opacity: 1;
	}
</style>
