<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		name: string;
		value?: any;
		label?: string;
		direction?: 'horizontal' | 'vertical';
		class?: string;
		children?: Snippet;
		onchange?: (value: any) => void;
	}

	let {
		name,
		value = $bindable(),
		label,
		direction = 'vertical',
		class: className = '',
		children,
		onchange
	}: Props = $props();

	function handleValueChange(newValue: any) {
		value = newValue;
		onchange?.(newValue);
	}
</script>

<div class="aea-radio-group {className} direction-{direction}" role="radiogroup" aria-labelledby={label ? `${name}-label` : undefined}>
	{#if label}
		<span id="{name}-label" class="aea-radio-group-label">{label}</span>
	{/if}
	
	<div class="aea-radio-group-items">
		{@render children?.()}
	</div>
</div>

<style>
	.aea-radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-radio-group-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: hsl(var(--text-400));
		margin-bottom: 0.25rem;
	}

	.aea-radio-group-items {
		display: flex;
		gap: 0.75rem;
	}

	.direction-vertical .aea-radio-group-items {
		flex-direction: column;
	}

	.direction-horizontal .aea-radio-group-items {
		flex-direction: row;
		flex-wrap: wrap;
	}
</style>
