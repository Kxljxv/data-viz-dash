<script lang="ts">
	import { IconCheck } from "@tabler/icons-svelte";

	interface Step {
		title: string;
		description?: string;
		marker?: string | import('svelte').Snippet;
	}

	interface Props {
		steps: Step[];
		currentStep: number; // 1-based index
		orientation?: 'horizontal' | 'vertical';
		variant?: 'default' | 'tech';
		class?: string;
	}

	let {
		steps = [],
		currentStep = 1,
		orientation = 'horizontal',
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const stepperClass = $derived(`aea-stepper-${orientation}`);
	const techClass = $derived(variant === 'tech' ? 'aea-stepper-tech' : '');
</script>

<div class="aea-stepper {stepperClass} {techClass} {className}">
	{#each steps as step, i}
		{@const stepNum = i + 1}
		{@const isCompleted = stepNum < currentStep}
		{@const isActive = stepNum === currentStep}

		<div class="aea-step {isCompleted ? 'aea-step-completed' : ''} {isActive ? 'aea-step-active' : ''}">
			<div class="aea-step-marker">
				{#if isCompleted}
					<IconCheck size={20} stroke={3} />
				{:else if step.marker}
					{#if typeof step.marker === 'string'}
						{step.marker}
					{:else}
						{@render step.marker()}
					{/if}
				{:else}
					{variant === 'tech' ? stepNum.toString().padStart(2, '0') : stepNum}
				{/if}
			</div>

			{#if orientation === 'vertical' && i < steps.length - 1}
				<div class="aea-step-line"></div>
			{/if}

			<div class="aea-step-content">
				<h3 class="aea-step-title">{step.title}</h3>
				{#if step.description}
					<p class="aea-step-desc">{step.description}</p>
				{/if}
			</div>
		</div>

		{#if orientation === 'horizontal' && i < steps.length - 1}
			<div class="aea-step-line {isCompleted ? 'bg-[hsl(var(--accent-brand))]' : ''}"></div>
		{/if}
	{/each}
</div>
