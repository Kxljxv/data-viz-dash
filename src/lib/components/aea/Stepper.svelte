<script lang="ts">
	import { IconCheck } from '@tabler/icons-svelte';

	interface Step {
		title: string;
		description?: string;
		id?: string | number;
	}

	interface Props {
		steps: Step[];
		currentStep?: number;
		orientation?: 'horizontal' | 'vertical';
		variant?: 'standard' | 'technical';
		class?: string;
		onstepclick?: (index: number) => void;
	}

	let {
		steps = [],
		currentStep = $bindable(0),
		orientation = 'horizontal',
		variant = 'standard',
		class: className = '',
		onstepclick
	}: Props = $props();

	function handleStepClick(index: number) {
		if (index < currentStep) {
			currentStep = index;
			onstepclick?.(index);
		}
	}
</script>

<div
	class="aea-stepper {className} orientation-{orientation} variant-{variant}"
	role="list"
	aria-label="Progress Stepper"
>
	{#each steps as step, i}
		<div
			class="aea-step"
			class:is-active={currentStep === i}
			class:is-completed={currentStep > i}
			role="listitem"
			aria-current={currentStep === i ? 'step' : undefined}
		>
			<button
				type="button"
				class="aea-step-trigger"
				onclick={() => handleStepClick(i)}
				disabled={i > currentStep}
				aria-label="Step {i + 1}: {step.title} {currentStep > i ? '(Completed)' : ''}"
			>
				<div class="aea-step-marker">
					{#if currentStep > i}
						<IconCheck size={16} stroke={3} class="aea-icon-check" />
					{:else}
						{variant === 'technical' ? '+' : i + 1}
					{/if}
				</div>
				
				<div class="aea-step-content">
					<h3 class="aea-step-title">{step.title}</h3>
					{#if step.description}
						<p class="aea-step-desc">{step.description}</p>
					{/if}
				</div>
			</button>

			{#if i < steps.length - 1}
				<div class="aea-step-line" class:is-filled={currentStep > i}></div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.aea-stepper {
		display: flex;
		font-family: 'ModernDense', sans-serif;
		width: 100%;
	}

	.orientation-horizontal {
		flex-direction: row;
		align-items: flex-start;
		gap: 0;
	}

	.orientation-vertical {
		flex-direction: column;
		gap: 1rem;
	}

	.aea-step {
		position: relative;
		display: flex;
		flex: 1;
	}

	.orientation-vertical .aea-step {
		flex-direction: column;
		flex: none;
	}

	.aea-step-trigger {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
		transition: all 0.3s ease;
		width: 100%;
		outline: none;
	}

	.orientation-horizontal .aea-step-trigger {
		flex-direction: column;
		text-align: center;
		padding: 0 1rem;
		z-index: 2;
	}

	.aea-step-trigger:disabled {
		cursor: default;
	}

	/* Marker Styling */
	.aea-step-marker {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.2);
		color: hsl(var(--text-400));
		font-weight: 700;
		font-size: 1.125rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		flex-shrink: 0;
	}

	.is-active .aea-step-marker {
		border-color: hsl(var(--accent-brand));
		color: hsl(var(--accent-brand));
		background-color: hsla(var(--accent-brand) / 0.1);
		box-shadow: 0 0 15px hsla(var(--accent-brand) / 0.3);
		transform: scale(1.1);
	}

	.is-completed .aea-step-marker {
		background-color: hsla(var(--accent-brand) / 0.2);
		border-color: hsla(var(--accent-brand) / 0.5);
		color: hsl(var(--accent-brand));
	}

	.aea-icon-check {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Content Styling */
	.aea-step-content {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.aea-step-title {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: hsl(var(--text-400));
		transition: color 0.3s ease;
	}

	.is-active .aea-step-title,
	.is-completed .aea-step-title {
		color: hsl(var(--text-100));
	}

	.aea-step-desc {
		font-size: 0.75rem;
		color: hsl(var(--text-500));
		line-height: 1.4;
	}

	/* Line Styling */
	.aea-step-line {
		position: absolute;
		background-color: hsla(var(--border-300) / 0.2);
		transition: all 0.4s ease;
	}

	.orientation-horizontal .aea-step-line {
		top: 1.25rem;
		left: calc(50% + 1.25rem + 1rem);
		right: calc(-50% + 1.25rem + 1rem);
		height: 2px;
	}

	.orientation-vertical .aea-step-line {
		left: 1.25rem;
		top: 2.5rem;
		bottom: -1rem;
		width: 2px;
	}

	.aea-step-line.is-filled {
		background-color: hsla(var(--accent-brand) / 0.5);
		box-shadow: 0 0 8px hsla(var(--accent-brand) / 0.3);
	}

	/* Technical Variant */
	.variant-technical .aea-step-marker {
		border-radius: 0.25rem;
		font-family: monospace;
	}

	.variant-technical .aea-step-line {
		border-style: dashed;
		background-color: transparent;
		border-width: 0;
	}

	.orientation-horizontal.variant-technical .aea-step-line {
		border-top-width: 2px;
	}

	.orientation-vertical.variant-technical .aea-step-line {
		border-left-width: 2px;
	}

	/* Focus Styles */
	.aea-step-trigger:focus-visible .aea-step-marker {
		outline: 2px solid hsl(var(--accent-brand));
		outline-offset: 4px;
	}

	@media (max-width: 640px) {
		.orientation-horizontal {
			flex-direction: column;
			gap: 1.5rem;
		}

		.orientation-horizontal .aea-step-trigger {
			flex-direction: row;
			text-align: left;
			padding: 0;
		}

		.orientation-horizontal .aea-step-line {
			left: 1.25rem;
			top: 2.5rem;
			bottom: -1.5rem;
			width: 2px;
			height: auto;
			right: auto;
		}
	}
</style>
