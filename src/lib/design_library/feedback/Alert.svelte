<script lang="ts">
	interface Props {
		variant?: 'info' | 'success' | 'warning' | 'danger';
		title?: string;
		description?: string;
		dismissible?: boolean;
		icon?: import('svelte').Snippet;
		class?: string;
		onclose?: () => void;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'info',
		title,
		description,
		dismissible = false,
		icon,
		class: className = '',
		onclose,
		children
	}: Props = $props();

	let visible = $state(true);

	function handleClose() {
		visible = false;
		if (onclose) onclose();
	}
</script>

{#if visible}
	<div class="alert alert-{variant} {className}" role="alert">
		{#if icon}
			<div class="alert-icon">
				{@render icon()}
			</div>
		{:else}
			<div class="alert-icon">
				{#if variant === 'info'}
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if variant === 'success'}
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if variant === 'warning'}
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				{:else if variant === 'danger'}
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{/if}
			</div>
		{/if}

		<div class="alert-content">
			{#if title}
				<span class="alert-title">{title}</span>
			{/if}
			{#if description}
				<p class="alert-description">{description}</p>
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if dismissible}
			<button class="alert-close" aria-label="Dismiss" onclick={handleClose}>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
{/if}
