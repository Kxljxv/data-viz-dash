<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		variant?: 'base' | 'industrial' | 'hud';
		disabled?: boolean;
		id?: string;
		class?: string;
		offLabel?: string;
		onLabel?: string;
		onchange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		label,
		variant = 'base',
		disabled = false,
		id = `toggle-${Math.random().toString(36).substring(2, 9)}`,
		class: className = '',
		offLabel = 'Off',
		onLabel = 'On',
		onchange
	}: Props = $props();

	function handleChange() {
		onchange?.(checked);
	}
</script>

<div class="aea-toggle-root {className} {disabled ? 'is-disabled' : ''} variant-{variant}">
	<label class="aea-toggle-container" for={id}>
		{#if variant === 'hud'}
			<span class="aea-toggle-status aea-toggle-status-off">{offLabel}</span>
		{/if}

		<div class="aea-toggle-wrapper">
			<input
				type="checkbox"
				{id}
				bind:checked
				{disabled}
				onchange={handleChange}
				class="aea-toggle-input"
			/>
			<span class="aea-toggle-track">
				<span class="aea-toggle-thumb"></span>
			</span>
		</div>

		{#if variant === 'hud'}
			<span class="aea-toggle-status aea-toggle-status-on">{onLabel}</span>
		{/if}

		{#if label && variant !== 'hud'}
			<span class="aea-toggle-label">{label}</span>
		{/if}
	</label>
	{#if label && variant === 'hud'}
		<span class="aea-toggle-sublabel">{label}</span>
	{/if}
</div>

<style>
	.aea-toggle-root {
		display: inline-flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-toggle-container {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		user-select: none;
	}

	.aea-toggle-wrapper {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 22px;
	}

	.aea-toggle-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.aea-toggle-track {
		position: absolute;
		inset: 0;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 100px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.variant-industrial .aea-toggle-track {
		border-radius: 4px;
	}

	.aea-toggle-thumb {
		position: absolute;
		left: 3px;
		top: 3px;
		width: 14px;
		height: 14px;
		background-color: hsl(var(--text-200));
		border-radius: 50%;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.variant-industrial .aea-toggle-thumb {
		border-radius: 2px;
	}

	/* Checked State */
	.aea-toggle-input:checked + .aea-toggle-track {
		background-color: hsla(var(--accent-brand) / 0.2);
		border-color: hsla(var(--accent-brand) / 0.4);
		box-shadow: 0 0 15px -5px hsla(var(--accent-brand) / 0.5);
	}

	.aea-toggle-input:checked + .aea-toggle-track .aea-toggle-thumb {
		left: calc(100% - 17px);
		background-color: hsl(var(--accent-brand));
		box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.6);
	}

	/* Focus State */
	.aea-toggle-input:focus-visible + .aea-toggle-track {
		outline: 2px solid hsl(var(--accent-brand));
		outline-offset: 2px;
	}

	/* Hover State */
	.aea-toggle-container:hover .aea-toggle-track {
		border-color: hsla(var(--border-300) / 0.3);
		background-color: hsla(var(--bg-300) / 0.6);
	}

	.aea-toggle-label {
		font-size: 0.875rem;
		color: hsl(var(--text-200));
		letter-spacing: 0.05em;
	}

	.aea-toggle-status {
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: opacity 0.2s ease;
		width: 40px;
	}

	.aea-toggle-status-off {
		text-align: right;
		color: hsl(var(--text-500));
	}

	.aea-toggle-status-on {
		text-align: left;
		color: hsl(var(--text-500));
	}

	.aea-toggle-input:not(:checked) ~ .aea-toggle-status-off {
		color: hsl(var(--text-200));
		opacity: 1;
	}

	.aea-toggle-input:checked ~ .aea-toggle-status-on {
		color: hsl(var(--accent-brand));
		opacity: 1;
	}

	.aea-toggle-input:not(:checked) ~ .aea-toggle-status-on,
	.aea-toggle-input:checked ~ .aea-toggle-status-off {
		opacity: 0.3;
	}

	.aea-toggle-sublabel {
		font-size: 0.55rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: hsla(var(--text-500) / 0.5);
		margin-left: 48px; /* Align with track in HUD mode */
	}

	.is-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.is-disabled .aea-toggle-container {
		cursor: not-allowed;
	}
</style>
