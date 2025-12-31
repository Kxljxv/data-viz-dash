<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		id?: string;
		class?: string;
		variant?: 'base' | 'industrial';
		onchange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		label,
		disabled = false,
		id = `checkbox-${Math.random().toString(36).substring(2, 9)}`,
		class: className = '',
		variant = 'base',
		onchange
	}: Props = $props();

	function handleChange() {
		onchange?.(checked);
	}
</script>

<div class="aea-checkbox-root {className} {disabled ? 'is-disabled' : ''} variant-{variant}">
	<label class="aea-checkbox-container" for={id}>
		<div class="aea-checkbox-wrapper">
			<input
				type="checkbox"
				{id}
				bind:checked
				{disabled}
				onchange={handleChange}
				class="aea-checkbox-input"
			/>
			<span class="aea-checkbox-box">
				<svg class="aea-checkbox-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					{#if variant === 'base'}
						<polyline points="20 6 9 17 4 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
					{:else}
						<path d="M5 12l5 5L19 7" stroke-width="4" />
					{/if}
				</svg>
			</span>
		</div>
		{#if label}
			<span class="aea-checkbox-label">{label}</span>
		{/if}
	</label>
</div>

<style>
	.aea-checkbox-root {
		display: inline-flex;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-checkbox-container {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		user-select: none;
	}

	.aea-checkbox-wrapper {
		position: relative;
		width: 20px;
		height: 20px;
	}

	.aea-checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.aea-checkbox-box {
		position: absolute;
		inset: 0;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 4px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.variant-industrial .aea-checkbox-box {
		border-radius: 0;
	}

	.aea-checkbox-check {
		width: 14px;
		height: 14px;
		color: hsl(var(--accent-brand));
		opacity: 0;
		transform: scale(0.5);
		transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		filter: drop-shadow(0 0 5px hsla(var(--accent-brand) / 0.5));
	}

	/* Checked State */
	.aea-checkbox-input:checked + .aea-checkbox-box {
		background-color: hsla(var(--accent-brand) / 0.1);
		border-color: hsla(var(--accent-brand) / 0.4);
		box-shadow: 0 0 10px -2px hsla(var(--accent-brand) / 0.3);
	}

	.aea-checkbox-input:checked + .aea-checkbox-box .aea-checkbox-check {
		opacity: 1;
		transform: scale(1);
	}

	/* Focus State */
	.aea-checkbox-input:focus-visible + .aea-checkbox-box {
		outline: 2px solid hsl(var(--accent-brand));
		outline-offset: 2px;
	}

	/* Hover State */
	.aea-checkbox-container:hover .aea-checkbox-box {
		border-color: hsla(var(--border-300) / 0.3);
		background-color: hsla(var(--bg-300) / 0.6);
	}

	.aea-checkbox-label {
		font-size: 0.9375rem;
		color: hsl(var(--text-200));
		letter-spacing: 0.02em;
	}

	.is-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.is-disabled .aea-checkbox-container {
		cursor: not-allowed;
	}
</style>
