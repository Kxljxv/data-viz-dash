<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		value: string;
		label?: string;
		showLabel?: boolean;
		variant?: 'icon' | 'button' | 'input';
		timeout?: number;
		class?: string;
		oncopy?: (success: boolean) => void;
	}

	let {
		value,
		label = 'Copy to clipboard',
		showLabel = false,
		variant = 'icon',
		timeout = 2000,
		class: className = '',
		oncopy
	}: Props = $props();

	let state = $state<'idle' | 'success' | 'error'>('idle');
	let timer: any = null;

	async function copy() {
		if (!value) return;

		try {
			await navigator.clipboard.writeText(value);
			state = 'success';
			oncopy?.(true);
		} catch (err) {
			console.error('Failed to copy: ', err);
			state = 'error';
			oncopy?.(false);
		}

		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			state = 'idle';
		}, timeout);
	}

	onMount(() => {
		return () => {
			if (timer) clearTimeout(timer);
		};
	});
</script>

<div class="aea-clipboard {className} variant-{variant} state-{state}">
	{#if variant === 'input'}
		<div class="aea-clipboard-group">
			<input type="text" {value} readonly class="aea-clipboard-input" />
			<button type="button" class="aea-clipboard-btn" onclick={copy} aria-label={label}>
				{#if state === 'success'}
					<svg class="aea-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				{:else if state === 'error'}
					<svg class="aea-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="aea-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				{/if}
				<span class="aea-clipboard-feedback" class:is-visible={state !== 'idle'}>
					{state === 'success' ? 'Copied!' : 'Error'}
				</span>
			</button>
		</div>
	{:else}
		<button
			type="button"
			class="aea-clipboard-btn {variant === 'button' ? 'is-button' : ''}"
			onclick={copy}
			aria-label={label}
		>
			<div class="aea-clipboard-icons">
				{#if state === 'success'}
					<svg class="aea-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				{:else if state === 'error'}
					<svg class="aea-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="aea-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				{/if}
			</div>

			{#if showLabel || variant === 'button'}
				<span class="aea-clipboard-label">{state === 'success' ? 'Copied!' : state === 'error' ? 'Failed' : label}</span>
			{/if}

			{#if variant === 'icon' && state !== 'idle'}
				<span class="aea-clipboard-tooltip">{state === 'success' ? 'Copied!' : 'Error'}</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	.aea-clipboard {
		display: inline-flex;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-clipboard-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 0.5rem;
		color: hsl(var(--text-400));
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
	}

	.aea-clipboard-btn.is-button {
		padding: 0.5rem 1rem;
		min-width: 120px;
	}

	.aea-clipboard-btn:hover {
		background-color: hsla(var(--bg-300) / 0.6);
		color: hsl(var(--text-200));
		border-color: hsla(var(--border-300) / 0.3);
	}

	.aea-clipboard-btn:focus-visible {
		border-color: hsl(var(--accent-brand));
		box-shadow: 0 0 0 2px hsla(var(--accent-brand) / 0.2);
	}

	.aea-icon {
		width: 1.25rem;
		height: 1.25rem;
		transition: all 0.3s ease;
	}

	.state-success .aea-icon {
		color: hsl(var(--accent-success, 142, 71%, 45%));
		filter: drop-shadow(0 0 5px hsla(var(--accent-success, 142, 71%, 45%) / 0.5));
	}

	.state-error .aea-icon {
		color: hsl(var(--accent-danger, 0, 84%, 60%));
	}

	.aea-clipboard-label {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.state-success .aea-clipboard-label {
		color: hsl(var(--accent-success, 142, 71%, 45%));
	}

	.aea-clipboard-tooltip {
		position: absolute;
		bottom: calc(100% + 0.5rem);
		left: 50%;
		transform: translateX(-50%);
		background-color: hsla(var(--bg-100) / 0.9);
		backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		color: hsl(var(--accent-success, 142, 71%, 45%));
		white-space: nowrap;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		pointer-events: none;
		animation: tooltip-in 0.2s ease-out;
	}

	@keyframes tooltip-in {
		from { opacity: 0; transform: translate(-50%, 5px); }
		to { opacity: 1; transform: translate(-50%, 0); }
	}

	/* Input Group Variant */
	.aea-clipboard-group {
		display: flex;
		width: 100%;
		max-width: 400px;
	}

	.aea-clipboard-input {
		flex-grow: 1;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-right: none;
		border-radius: 0.5rem 0 0 0.5rem;
		padding: 0.5rem 0.75rem;
		color: hsl(var(--text-100));
		font-family: inherit;
		font-size: 0.875rem;
		outline: none;
	}

	.aea-clipboard-group .aea-clipboard-btn {
		border-radius: 0 0.5rem 0.5rem 0;
		min-width: 44px;
	}

	.aea-clipboard-feedback {
		position: absolute;
		top: -2rem;
		right: 0;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		color: hsl(var(--accent-success, 142, 71%, 45%));
		opacity: 0;
		transform: translateY(5px);
		transition: all 0.2s ease;
		pointer-events: none;
	}

	.aea-clipboard-feedback.is-visible {
		opacity: 1;
		transform: translateY(0);
	}
</style>
