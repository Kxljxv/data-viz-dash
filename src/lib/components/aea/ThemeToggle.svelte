<script lang="ts">
	import Toggle from './Toggle.svelte';
	import { theme } from '$lib/theme.svelte';
	import { IconSun, IconMoon } from '@tabler/icons-svelte';

	interface Props {
		class?: string;
		showLabel?: boolean;
	}

	let { class: className = '', showLabel = true }: Props = $props();

	let isDark = $derived(theme.mode === 'dark');

	function handleToggle() {
		theme.toggle();
	}
</script>

<div class="theme-toggle-container {className}">
	<div class="theme-toggle-icons">
		<IconSun size={14} class="theme-icon sun {theme.mode === 'light' ? 'is-active' : ''}" />
		<Toggle 
			checked={isDark} 
			onchange={handleToggle}
			variant="base"
			aria-label="Toggle theme"
		/>
		<IconMoon size={14} class="theme-icon moon {theme.mode === 'dark' ? 'is-active' : ''}" />
	</div>
	{#if showLabel}
		<span class="theme-label">
			{theme.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
		</span>
	{/if}
</div>

<style>
	.theme-toggle-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.theme-toggle-icons {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.theme-icon {
		color: hsl(var(--text-500));
		opacity: 0.3;
		transition: all 0.2s ease;
	}

	.theme-icon.is-active {
		opacity: 1;
		color: hsl(var(--accent-brand));
	}

	.theme-label {
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: hsl(var(--text-400));
	}
</style>
