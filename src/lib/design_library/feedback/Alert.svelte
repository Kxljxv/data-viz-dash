<script lang="ts">
	import { 
		IconInfoCircle, 
		IconCircleCheck, 
		IconAlertTriangle, 
		IconCircleX, 
		IconX 
	} from "@tabler/icons-svelte";

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
					<IconInfoCircle size={20} />
				{:else if variant === 'success'}
					<IconCircleCheck size={20} />
				{:else if variant === 'warning'}
					<IconAlertTriangle size={20} />
				{:else if variant === 'danger'}
					<IconCircleX size={20} />
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
				<IconX size={16} />
			</button>
		{/if}
	</div>
{/if}
