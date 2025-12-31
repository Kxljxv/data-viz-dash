<script lang="ts">
	import { onMount } from 'svelte';

	interface Option {
		label: string;
		value: any;
		disabled?: boolean;
		group?: string;
	}

	interface Props {
		value?: any;
		options?: Option[];
		placeholder?: string;
		label?: string;
		disabled?: boolean;
		searchable?: boolean;
		id?: string;
		error?: string;
		helperText?: string;
		class?: string;
		onchange?: (value: any) => void;
	}

	let {
		value = $bindable(),
		options = [],
		placeholder = 'Select an option...',
		label,
		disabled = false,
		searchable = false,
		id = `select-${Math.random().toString(36).substring(2, 9)}`,
		error,
		helperText,
		class: className = '',
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let activeIndex = $state(-1);
	let searchQuery = $state('');
	let containerEl: HTMLDivElement | undefined = $state();
	let searchInputEl: HTMLInputElement | undefined = $state();

	const filteredOptions = $derived.by(() => {
		if (!searchable || !searchQuery) return options;
		const query = searchQuery.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(query));
	});

	const selectedOption = $derived(options.find((opt) => opt.value === value));

	// Reset active index when filtered options change
	$effect(() => {
		if (filteredOptions) {
			activeIndex = -1;
		}
	});

	// Focus search input when opening if searchable
	$effect(() => {
		if (isOpen && searchable && searchInputEl) {
			setTimeout(() => searchInputEl?.focus(), 50);
		}
	});

	function toggle() {
		if (disabled) return;
		isOpen = !isOpen;
		if (isOpen) {
			searchQuery = '';
			// Set active index to selected option if it exists in filtered options
			if (selectedOption) {
				activeIndex = filteredOptions.indexOf(selectedOption);
			}
		}
	}

	function selectOption(option: Option) {
		if (option.disabled) return;
		value = option.value;
		isOpen = false;
		searchQuery = '';
		onchange?.(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;

		if (!isOpen) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				isOpen = true;
				return;
			}
		}

		const count = filteredOptions.length;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = (activeIndex + 1) % count;
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = (activeIndex - 1 + count) % count;
				break;
			case 'Enter':
				e.preventDefault();
				if (activeIndex >= 0 && activeIndex < count) {
					selectOption(filteredOptions[activeIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				break;
			case 'Tab':
				isOpen = false;
				break;
		}
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
	class="aea-select {className} {disabled ? 'is-disabled' : ''} {isOpen ? 'is-open' : ''}"
	class:has-error={!!error}
>
	{#if label}
		<label for={id} class="aea-select-label">
			{label}
		</label>
	{/if}

	<div class="aea-select-wrapper">
		<button
			{id}
			type="button"
			class="aea-select-trigger"
			{disabled}
			onclick={toggle}
			onkeydown={handleKeydown}
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			aria-labelledby={label ? `${id}-label` : undefined}
		>
			<span class="aea-select-value" class:is-placeholder={!selectedOption}>
				{selectedOption ? selectedOption.label : placeholder}
			</span>
			<span class="aea-select-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-4 h-4 transition-transform duration-300"
					class:rotate-180={isOpen}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</span>
		</button>

		<div class="aea-select-dropdown" role="listbox" tabindex="-1">
			{#if searchable}
				<div class="aea-select-search">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="aea-select-search-icon"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						bind:this={searchInputEl}
						type="text"
						bind:value={searchQuery}
						placeholder="Search..."
						class="aea-select-search-input"
						onkeydown={handleKeydown}
						spellcheck="false"
						autocomplete="off"
					/>
				</div>
			{/if}

			<div class="aea-select-options custom-scrollbar">
				{#if filteredOptions.length === 0}
					<div class="aea-select-no-results">No options found</div>
				{:else}
					{#each filteredOptions as option, i}
						<button
							type="button"
							class="aea-select-option"
							class:is-active={activeIndex === i}
							class:is-selected={value === option.value}
							class:is-disabled={option.disabled}
							disabled={option.disabled}
							role="option"
							aria-selected={value === option.value}
							onclick={() => selectOption(option)}
						>
							{option.label}
							{#if value === option.value}
								<span class="aea-select-check">
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
											d="M5 13l4 4L19 7"
										/>
									</svg>
								</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	{#if error}
		<span class="aea-select-helper-text is-error">{error}</span>
	{:else if helperText}
		<span class="aea-select-helper-text">{helperText}</span>
	{/if}
</div>

<style>
	.aea-select {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-select-label {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsl(var(--text-400));
		margin-left: 0.25rem;
	}

	.aea-select-wrapper {
		position: relative;
	}

	.aea-select-trigger {
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

	.aea-select-trigger:hover:not(:disabled) {
		border-color: hsla(var(--border-300) / 0.3);
		background-color: hsla(var(--bg-200) / 0.4);
	}

	.aea-select-trigger:focus:not(:disabled) {
		border-color: hsl(var(--accent-brand));
		background-color: hsla(var(--bg-100) / 0.5);
		box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1);
	}

	.aea-select.is-open .aea-select-trigger {
		border-color: hsl(var(--accent-brand));
		background-color: hsla(var(--bg-100) / 0.5);
	}

	.aea-select-value {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.aea-select-value.is-placeholder {
		color: hsl(var(--text-500));
		opacity: 0.6;
	}

	.aea-select-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: hsl(var(--text-400));
		margin-left: 0.5rem;
	}

	.aea-select-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		background-color: hsla(var(--bg-100) / 0.85);
		backdrop-filter: blur(32px);
		-webkit-backdrop-filter: blur(32px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 1rem;
		padding: 0.5rem;
		z-index: 100;
		opacity: 0;
		visibility: hidden;
		transform: translateY(10px) scale(0.98);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 
			0 10px 30px -5px rgba(0, 0, 0, 0.5),
			0 0 20px -5px hsla(var(--accent-brand) / 0.1);
	}

	.aea-select.is-open .aea-select-dropdown {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(1);
	}

	.aea-select-search {
		position: relative;
		padding: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.aea-select-search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		width: 0.875rem;
		height: 0.875rem;
		color: hsl(var(--text-400));
		pointer-events: none;
	}

	.aea-select-search-input {
		width: 100%;
		padding: 0.5rem 0.5rem 0.5rem 2rem;
		background-color: hsla(var(--bg-200) / 0.5);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 0.5rem;
		color: hsl(var(--text-100));
		font-family: inherit;
		font-size: 0.875rem;
		outline: none;
		transition: all 0.2s ease;
	}

	.aea-select-search-input:focus {
		border-color: hsla(var(--accent-brand) / 0.5);
		background-color: hsla(var(--bg-200) / 0.8);
	}

	.aea-select-options {
		max-height: 250px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.aea-select-option {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		color: hsl(var(--text-200));
		font-family: inherit;
		font-size: 0.875rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		background: transparent;
		border: none;
		outline: none;
	}

	.aea-select-option:hover:not(.is-disabled) {
		background-color: hsla(var(--accent-brand) / 0.1);
		color: hsl(var(--text-000));
	}

	.aea-select-option.is-active:not(.is-disabled) {
		background-color: hsla(var(--accent-brand) / 0.15);
		color: hsl(var(--accent-brand));
	}

	.aea-select-option.is-selected:not(.is-disabled) {
		background-color: hsla(var(--accent-brand) / 0.2);
		color: hsl(var(--accent-brand));
		font-weight: 600;
	}

	.aea-select-option.is-disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.aea-select-check {
		color: hsl(var(--accent-brand));
		display: flex;
		align-items: center;
	}

	.aea-select-no-results {
		padding: 1.5rem;
		text-align: center;
		color: hsl(var(--text-500));
		font-size: 0.875rem;
	}

	.aea-select-helper-text {
		font-size: 0.75rem;
		color: hsl(var(--text-400));
		margin-left: 0.25rem;
	}

	.aea-select-helper-text.is-error {
		color: hsl(var(--accent-danger, 0, 84%, 60%));
	}

	.aea-select.has-error .aea-select-trigger {
		border-color: hsla(var(--accent-danger, 0, 84%, 60%), 0.4);
	}

	.aea-select.has-error .aea-select-trigger:focus {
		border-color: hsl(var(--accent-danger, 0, 84%, 60%));
		box-shadow: 0 0 0 4px hsla(var(--accent-danger, 0, 84%, 60%), 0.1);
	}

	.rotate-180 {
		transform: rotate(180deg);
	}

	.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
