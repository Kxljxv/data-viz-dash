<script lang="ts">
	import { onMount, tick } from 'svelte';

	interface Props {
		value?: string; // Format "HH:mm"
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		id?: string;
		error?: string;
		helperText?: string;
		class?: string;
		onchange?: (time: string) => void;
	}

	let {
		value = $bindable(''),
		label,
		placeholder = 'Select time...',
		disabled = false,
		id = `timepicker-${Math.random().toString(36).substring(2, 9)}`,
		error,
		helperText,
		class: className = '',
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let containerEl: HTMLDivElement;
	let hoursColEl: HTMLDivElement;
	let minutesColEl: HTMLDivElement;

	const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
	const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

	let selectedHour = $derived(value ? value.split(':')[0] : null);
	let selectedMinute = $derived(value ? value.split(':')[1] : null);

	function toggle() {
		if (disabled) return;
		isOpen = !isOpen;
		if (isOpen) {
			scrollToSelected();
		}
	}

	async function scrollToSelected() {
		await tick();
		if (hoursColEl && selectedHour) {
			const activeHourEl = hoursColEl.querySelector('.is-selected') as HTMLElement;
			if (activeHourEl) {
				hoursColEl.scrollTop =
					activeHourEl.offsetTop - hoursColEl.offsetTop - hoursColEl.clientHeight / 2 + activeHourEl.clientHeight / 2;
			}
		}
		if (minutesColEl && selectedMinute) {
			const activeMinuteEl = minutesColEl.querySelector('.is-selected') as HTMLElement;
			if (activeMinuteEl) {
				minutesColEl.scrollTop =
					activeMinuteEl.offsetTop -
					minutesColEl.offsetTop -
					minutesColEl.clientHeight / 2 +
					activeMinuteEl.clientHeight / 2;
			}
		}
	}

	function selectHour(h: string) {
		const m = selectedMinute || '00';
		value = `${h}:${m}`;
		onchange?.(value);
	}

	function selectMinute(m: string) {
		const h = selectedHour || '00';
		value = `${h}:${m}`;
		onchange?.(value);
	}

	onMount(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerEl && !containerEl.contains(e.target as Node)) {
				isOpen = false;
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div
	bind:this={containerEl}
	class="aea-timepicker {className} {disabled ? 'is-disabled' : ''} {isOpen ? 'is-open' : ''}"
	class:has-error={!!error}
>
	{#if label}
		<label for={id} class="aea-timepicker-label">
			{label}
		</label>
	{/if}

	<div class="aea-timepicker-wrapper">
		<button
			{id}
			type="button"
			class="aea-timepicker-trigger"
			{disabled}
			onclick={toggle}
			aria-haspopup="listbox"
			aria-expanded={isOpen}
		>
			<span class="aea-timepicker-value" class:is-placeholder={!value}>
				{value || placeholder}
			</span>
			<span class="aea-timepicker-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</span>
		</button>

		<div class="aea-timepicker-popover" role="listbox">
			<div class="aea-timepicker-columns">
				<div class="aea-timepicker-column custom-scrollbar" bind:this={hoursColEl}>
					<div class="aea-timepicker-column-header">Hour</div>
					{#each hours as h}
						<button
							type="button"
							class="aea-timepicker-option"
							class:is-selected={selectedHour === h}
							onclick={() => selectHour(h)}
						>
							{h}
						</button>
					{/each}
					<div class="aea-timepicker-column-spacer"></div>
				</div>
				<div class="aea-timepicker-column custom-scrollbar" bind:this={minutesColEl}>
					<div class="aea-timepicker-column-header">Min</div>
					{#each minutes as m}
						<button
							type="button"
							class="aea-timepicker-option"
							class:is-selected={selectedMinute === m}
							onclick={() => selectMinute(m)}
						>
							{m}
						</button>
					{/each}
					<div class="aea-timepicker-column-spacer"></div>
				</div>
			</div>
		</div>
	</div>

	{#if error}
		<span class="aea-timepicker-helper-text is-error">{error}</span>
	{:else if helperText}
		<span class="aea-timepicker-helper-text">{helperText}</span>
	{/if}
</div>

<style>
	.aea-timepicker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-timepicker-label {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsl(var(--text-400));
		margin-left: 0.25rem;
	}

	.aea-timepicker-wrapper {
		position: relative;
	}

	.aea-timepicker-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 1rem;
		background-color: hsla(var(--bg-200) / 0.3);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 0.75rem;
		color: hsl(var(--text-100));
		font-family: inherit;
		font-size: 0.9375rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
	}

	.aea-timepicker-trigger:hover:not(:disabled) {
		border-color: hsla(var(--border-300) / 0.3);
		background-color: hsla(var(--bg-200) / 0.4);
	}

	.aea-timepicker-trigger:focus:not(:disabled) {
		border-color: hsl(var(--accent-brand));
		background-color: hsla(var(--bg-100) / 0.5);
		box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1);
	}

	.aea-timepicker-value.is-placeholder {
		color: hsl(var(--text-500));
		opacity: 0.6;
	}

	.aea-timepicker-icon {
		color: hsl(var(--text-400));
		margin-left: 0.5rem;
	}

	.aea-timepicker-popover {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		background-color: hsla(var(--bg-100) / 0.9);
		backdrop-filter: blur(32px);
		-webkit-backdrop-filter: blur(32px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 1.25rem;
		padding: 0.5rem;
		z-index: 100;
		opacity: 0;
		visibility: hidden;
		transform: translateY(10px) scale(0.98);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 
			0 10px 30px -5px rgba(0, 0, 0, 0.5),
			0 0 20px -5px hsla(var(--accent-brand) / 0.1);
		width: 180px;
	}

	.aea-timepicker.is-open .aea-timepicker-popover {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(1);
	}

	.aea-timepicker-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 200px;
		gap: 0.25rem;
	}

	.aea-timepicker-column {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		scroll-behavior: smooth;
	}

	.aea-timepicker-column-header {
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: hsla(var(--text-400) / 0.6);
		text-align: center;
		padding: 0.5rem 0;
		position: sticky;
		top: 0;
		background-color: hsla(var(--bg-100) / 0.9);
		backdrop-filter: blur(8px);
		z-index: 1;
	}

	.aea-timepicker-option {
		width: 100%;
		padding: 0.5rem 0;
		border: none;
		background: transparent;
		color: hsl(var(--text-200));
		font-family: inherit;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
		border-radius: 0.375rem;
		text-align: center;
		outline: none;
	}

	.aea-timepicker-option:hover:not(.is-selected) {
		background-color: hsla(var(--bg-300) / 0.5);
		color: hsl(var(--text-100));
	}

	.aea-timepicker-option.is-selected {
		background-color: hsla(var(--accent-brand) / 0.2);
		color: hsl(var(--accent-brand));
		font-weight: 700;
	}

	.aea-timepicker-column-spacer {
		height: 140px; /* To allow scrolling the last items to the center if needed, but here we just scroll to top of col */
		flex-shrink: 0;
	}

	.aea-timepicker-helper-text {
		font-size: 0.75rem;
		color: hsl(var(--text-400));
		margin-left: 0.25rem;
	}

	.aea-timepicker-helper-text.is-error {
		color: hsl(var(--accent-danger, 0, 84%, 60%));
	}

	.aea-timepicker.has-error .aea-timepicker-trigger {
		border-color: hsla(var(--accent-danger, 0, 84%, 60%), 0.4);
	}

	.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
