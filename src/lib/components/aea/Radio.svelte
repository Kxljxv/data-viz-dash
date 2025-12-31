<script lang="ts">
	interface Props {
		name: string;
		value: any;
		checked?: boolean;
		label?: string;
		description?: string;
		disabled?: boolean;
		variant?: 'standard' | 'button' | 'hud';
		id?: string;
		class?: string;
		onchange?: (value: any) => void;
	}

	let {
		name,
		value,
		checked = $bindable(false),
		label,
		description,
		disabled = false,
		variant = 'standard',
		id = `radio-${Math.random().toString(36).substring(2, 9)}`,
		class: className = '',
		onchange
	}: Props = $props();

	function handleChange() {
		if (disabled) return;
		onchange?.(value);
	}
</script>

<div
	class="aea-radio-root {className} {disabled ? 'is-disabled' : ''} variant-{variant}"
	class:is-checked={checked}
>
	<label class="aea-radio-container" for={id}>
		<input
			type="radio"
			{id}
			{name}
			{value}
			bind:group={checked}
			{disabled}
			onchange={handleChange}
			class="aea-radio-input"
		/>

		{#if variant === 'standard'}
			<span class="aea-radio-circle"></span>
			{#if label}
				<span class="aea-radio-label">{label}</span>
			{/if}
		{:else if variant === 'button'}
			<div class="aea-radio-button">
				{#if label}
					<span class="aea-radio-label">{label}</span>
				{/if}
				<div class="aea-radio-indicator"></div>
			</div>
		{:else if variant === 'hud'}
			<div class="aea-radio-hud">
				<div class="aea-radio-hud-content">
					{#if label}
						<span class="aea-radio-hud-title">{label}</span>
					{/if}
					{#if description}
						<span class="aea-radio-hud-desc">{description}</span>
					{/if}
				</div>
				<div class="aea-radio-indicator"></div>
			</div>
		{/if}
	</label>
</div>

<style>
	.aea-radio-root {
		display: inline-flex;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-radio-container {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		user-select: none;
		width: 100%;
	}

	.aea-radio-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* Standard Variant */
	.aea-radio-circle {
		position: relative;
		width: 20px;
		height: 20px;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 50%;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		flex-shrink: 0;
	}

	.aea-radio-circle::after {
		content: '';
		position: absolute;
		inset: 6px;
		background-color: hsl(var(--accent-brand));
		border-radius: 50%;
		opacity: 0;
		transform: scale(0.5);
		transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.8);
	}

	.aea-radio-input:checked + .aea-radio-circle {
		border-color: hsla(var(--accent-brand) / 0.4);
		background-color: hsla(var(--accent-brand) / 0.1);
	}

	.aea-radio-input:checked + .aea-radio-circle::after {
		opacity: 1;
		transform: scale(1);
	}

	.aea-radio-label {
		font-size: 0.9375rem;
		color: hsl(var(--text-200));
		letter-spacing: 0.02em;
	}

	/* Button Variant */
	.aea-radio-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 0.75rem;
		width: 100%;
		transition: all 0.2s ease;
	}

	.aea-radio-input:checked ~ .aea-radio-button {
		background-color: hsla(var(--bg-100) / 0.5);
		border-color: hsla(var(--accent-brand) / 0.4);
		box-shadow: 0 0 20px -5px hsla(var(--accent-brand) / 0.2);
	}

	.aea-radio-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: hsla(var(--text-500) / 0.3);
		transition: all 0.3s ease;
	}

	.aea-radio-input:checked ~ .aea-radio-button .aea-radio-indicator,
	.aea-radio-input:checked ~ .aea-radio-hud .aea-radio-indicator {
		background-color: hsl(var(--accent-brand));
		box-shadow: 0 0 10px 2px hsla(var(--accent-brand) / 0.6);
	}

	/* HUD Variant */
	.aea-radio-hud {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background-color: hsla(var(--bg-300) / 0.2);
		border-left: 3px solid transparent;
		width: 100%;
		transition: all 0.2s ease;
	}

	.aea-radio-hud-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.aea-radio-hud-title {
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: hsl(var(--text-100));
	}

	.aea-radio-hud-desc {
		font-size: 0.75rem;
		color: hsl(var(--text-400));
		line-height: 1.4;
	}

	.aea-radio-input:checked ~ .aea-radio-hud {
		background-color: hsla(var(--bg-100) / 0.3);
		border-left-color: hsl(var(--accent-brand));
	}

	/* Common */
	.aea-radio-input:focus-visible + .aea-radio-circle,
	.aea-radio-input:focus-visible ~ .aea-radio-button,
	.aea-radio-input:focus-visible ~ .aea-radio-hud {
		outline: 2px solid hsl(var(--accent-brand));
		outline-offset: 2px;
	}

	.aea-radio-container:hover:not(.is-disabled) .aea-radio-circle,
	.aea-radio-container:hover:not(.is-disabled) .aea-radio-button,
	.aea-radio-container:hover:not(.is-disabled) .aea-radio-hud {
		border-color: hsla(var(--border-300) / 0.3);
		background-color: hsla(var(--bg-300) / 0.6);
	}

	.is-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.is-disabled .aea-radio-container {
		cursor: not-allowed;
	}
</style>
