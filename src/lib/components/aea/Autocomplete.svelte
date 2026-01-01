<script lang="ts">
	import { onMount } from 'svelte';
	import { IconSearch, IconX } from "@tabler/icons-svelte";

	interface Item {
		label: string;
		value: any;
		group?: string;
		meta?: string;
		icon?: import('svelte').Snippet | import('svelte').Component<any>;
	}

	interface Props {
		value?: string;
		placeholder?: string;
		items?: Item[];
		loading?: boolean;
		debounceMs?: number;
		class?: string;
		id?: string;
		onSearch?: (query: string) => void;
		onSelect?: (item: Item) => void;
		onClear?: () => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		items = [],
		loading = false,
		debounceMs = 300,
		class: className = '',
		id = `autocomplete-${Math.random().toString(36).substring(2, 9)}`,
		onSearch,
		onSelect,
		onClear
	}: Props = $props();

	let isOpen = $state(false);
	let activeIndex = $state(-1);
	let debounceTimer: number | undefined;
	let containerEl: HTMLDivElement;

	const groups = $derived.by(() => {
		const g: Record<string, Item[]> = {};
		items.forEach((item) => {
			const groupName = item.group || 'Results';
			if (!g[groupName]) g[groupName] = [];
			g[groupName].push(item);
		});
		return g;
	});

	// Flat items for keyboard navigation
	const flatItems = $derived(items);

	// Reset active index when items change
	$effect(() => {
		if (items) {
			activeIndex = -1;
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;

		if (debounceTimer) clearTimeout(debounceTimer);

		if (value.trim().length === 0) {
			isOpen = false;
			return;
		}

		debounceTimer = setTimeout(() => {
			isOpen = true;
			onSearch?.(value);
		}, debounceMs) as unknown as number;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) {
			if (e.key === 'ArrowDown' && value.length > 0) {
				isOpen = true;
				onSearch?.(value);
			}
			return;
		}

		const count = flatItems.length;
		if (count === 0) return;

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
					selectItem(flatItems[activeIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				activeIndex = -1;
				break;
			case 'Tab':
				isOpen = false;
				break;
		}
	}

	function selectItem(item: Item) {
		value = item.label;
		isOpen = false;
		activeIndex = -1;
		onSelect?.(item);
	}

	function clearSearch() {
		value = '';
		isOpen = false;
		activeIndex = -1;
		onClear?.();
	}

	function highlightText(text: string, query: string) {
		if (!query) return text;
		// Escape special regex characters to prevent crashes
		const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(${escapedQuery})`, 'gi');
		return text.replace(regex, '<span class="aea-autocomplete-highlight">$1</span>');
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
	class="aea-autocomplete {className}"
	class:is-open={isOpen}
	class:has-value={value.length > 0}
>
	<div class="aea-autocomplete-wrapper">
		<span class="aea-autocomplete-search-icon">
			<IconSearch size={16} aria-hidden="true" />
		</span>
		<input
			type="text"
			class="aea-autocomplete-input"
			{placeholder}
			{value}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={() => value.length > 0 && (isOpen = true)}
			aria-autocomplete="list"
			aria-expanded={isOpen}
			aria-haspopup="listbox"
			aria-controls="{id}-results"
			role="combobox"
			spellcheck="false"
			autocomplete="off"
		/>
		<button class="aea-autocomplete-clear" aria-label="Clear search" onclick={clearSearch} type="button">
			<IconX size={12} />
		</button>
	</div>

	<div id="{id}-results" class="aea-autocomplete-results custom-scrollbar" role="listbox" aria-label="Search results">
		{#if loading}
			<div class="aea-autocomplete-loading" aria-live="polite">
				<div class="aea-autocomplete-spinner"></div>
				Searching...
			</div>
		{:else if items.length === 0 && value.length > 0}
			<div class="aea-autocomplete-no-results" aria-live="polite">No results found for "{value}"</div>
		{:else}
			{#each Object.entries(groups) as [groupName, groupItems]}
				<div class="aea-autocomplete-group" role="presentation">{groupName}</div>
				{#each groupItems as item}
					{@const itemIndex = flatItems.indexOf(item)}
					<button
						class="aea-autocomplete-item"
						class:is-active={activeIndex === itemIndex}
						role="option"
						aria-selected={activeIndex === itemIndex}
						onclick={() => selectItem(item)}
						type="button"
					>
						{#if item.icon}
							<div class="aea-autocomplete-item-icon">
								{#if typeof item.icon === 'function' && !item.icon.prototype}
									{@render item.icon()}
								{:else}
									<item.icon size={16} />
								{/if}
							</div>
						{/if}
						<div class="aea-autocomplete-item-label">
							{@html highlightText(item.label, value)}
						</div>
						{#if item.meta}
							<div class="aea-autocomplete-item-meta">{item.meta}</div>
						{/if}
					</button>
				{/each}
			{/each}
		{/if}
	</div>
</div>

<style>
	.aea-autocomplete {
		position: relative;
		width: 100%;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-autocomplete-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.aea-autocomplete-input {
		width: 100%;
		padding: 0.75rem 2.75rem;
		background-color: hsla(var(--bg-200) / 0.3);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 0.875rem;
		color: hsl(var(--text-100));
		font-size: 0.875rem;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.aea-autocomplete-input:focus {
		outline: none;
		border-color: hsla(var(--accent-brand) / 0.5);
		background-color: hsla(var(--bg-200) / 0.5);
		box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1);
	}

	.aea-autocomplete-search-icon {
		position: absolute;
		left: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: hsla(var(--text-400) / 0.5);
		pointer-events: none;
	}

	.aea-autocomplete-clear {
		position: absolute;
		right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background-color: hsla(var(--text-400) / 0.1);
		border-radius: 50%;
		color: hsl(var(--text-400));
		font-size: 1rem;
		cursor: pointer;
		opacity: 0;
		transform: scale(0.8);
		transition: all 0.2s ease;
		border: none;
	}

	.aea-autocomplete.has-value .aea-autocomplete-clear {
		opacity: 1;
		transform: scale(1);
	}

	.aea-autocomplete-clear:hover {
		background-color: hsla(var(--accent-danger) / 0.2);
		color: hsl(var(--accent-danger));
	}

	.aea-autocomplete-results {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		max-height: 400px;
		overflow-y: auto;
		background-color: hsla(var(--bg-100) / 0.8);
		backdrop-filter: blur(32px);
		-webkit-backdrop-filter: blur(32px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 1rem;
		padding: 0.5rem;
		z-index: 50;
		opacity: 0;
		visibility: hidden;
		transform: translateY(10px) scale(0.98);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 
			0 10px 25px -5px rgba(0, 0, 0, 0.3),
			0 8px 10px -6px rgba(0, 0, 0, 0.3);
	}

	.aea-autocomplete.is-open .aea-autocomplete-results {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(1);
	}

	.aea-autocomplete-group {
		padding: 0.75rem 0.75rem 0.25rem;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: hsla(var(--text-400) / 0.6);
		text-align: left;
	}

	.aea-autocomplete-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.625rem;
		color: hsl(var(--text-100));
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
		scroll-margin: 0.5rem;
		background: transparent;
		border: none;
		text-align: left;
	}

	.aea-autocomplete-item:hover,
	.aea-autocomplete-item.is-active {
		background-color: hsla(var(--accent-brand) / 0.1);
		color: hsl(var(--text-000));
	}

	.aea-autocomplete-item-icon {
		width: 1.25rem;
		height: 1.25rem;
		opacity: 0.7;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.aea-autocomplete-item-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.aea-autocomplete-item-meta {
		font-size: 0.75rem;
		color: hsla(var(--text-400) / 0.5);
	}

	:global(.aea-autocomplete-highlight) {
		color: hsl(var(--accent-brand));
		font-weight: 600;
		background-color: hsla(var(--accent-brand) / 0.1);
		border-radius: 0.25rem;
		padding: 0 0.125rem;
	}

	.aea-autocomplete-no-results,
	.aea-autocomplete-loading {
		padding: 2rem 1rem;
		text-align: center;
		color: hsla(var(--text-400) / 0.6);
		font-size: 0.875rem;
	}

	.aea-autocomplete-spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid hsla(var(--accent-brand) / 0.2);
		border-top-color: hsl(var(--accent-brand));
		border-radius: 50%;
		margin: 0 auto 0.75rem;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
