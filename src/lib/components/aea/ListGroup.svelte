<script lang="ts">
	import { setContext, onMount } from 'svelte';

	interface Props {
		variant?: 'standard' | 'flush';
		interactive?: boolean;
		multiSelect?: boolean;
		value?: string | string[] | undefined;
		class?: string;
		children?: import('svelte').Snippet;
		onchange?: (value: string | string[]) => void;
	}

	let {
		variant = 'standard',
		interactive = false,
		multiSelect = false,
		value = $bindable(),
		class: className = '',
		children,
		onchange
	}: Props = $props();

	// Store for child items to manage selection
	const items = new Map<string, (val: boolean) => void>();

	function registerItem(id: string, selectFn: (val: boolean) => void) {
		items.set(id, selectFn);
		// If item is already in value, mark as active
		if (multiSelect && Array.isArray(value)) {
			if (value.includes(id)) selectFn(true);
		} else if (!multiSelect && value === id) {
			selectFn(true);
		}

		return () => items.delete(id);
	}

	function toggleSelection(id: string) {
		if (!interactive) return;

		if (multiSelect) {
			let newValue = Array.isArray(value) ? [...value] : [];
			const index = newValue.indexOf(id);

			if (index > -1) {
				newValue.splice(index, 1);
				items.get(id)?.(false);
			} else {
				newValue.push(id);
				items.get(id)?.(true);
			}
			value = newValue;
		} else {
			// Single select: deactivate others
			if (value !== id) {
				if (typeof value === 'string' && items.has(value)) {
					items.get(value)?.(false);
				}
				value = id;
				items.get(id)?.(true);
			} else {
				// Toggle off if already selected? Usually single select stays selected
				// but let's allow deselecting for flexibility
				value = undefined;
				items.get(id)?.(false);
			}
		}

		onchange?.(value as any);
	}

	// Update items when value changes externally
	$effect(() => {
		if (!interactive) return;

		items.forEach((selectFn, id) => {
			const shouldBeActive = multiSelect
				? Array.isArray(value) && value.includes(id)
				: value === id;
			selectFn(shouldBeActive);
		});
	});

	setContext('list-group', {
		get interactive() { return interactive; },
		registerItem,
		toggleSelection
	});
</script>

<ul
	class="list-group {variant === 'flush' ? 'list-group-flush' : ''} {className}"
	role={interactive ? 'listbox' : 'list'}
	aria-multiselectable={interactive && multiSelect ? true : undefined}
>
	{@render children?.()}
</ul>

<style>
	.list-group {
		display: flex;
		flex-direction: column;
		border-radius: 1.25rem;
		background-color: hsla(var(--bg-100) / 0.3);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		overflow: hidden;
		list-style: none;
		padding: 0;
		margin: 0;
		box-shadow: 0 8px 32px 0 hsla(var(--bg-900) / 0.2);
	}

	.list-group-flush {
		background-color: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		border: none;
		border-radius: 0;
		box-shadow: none;
	}

	/* Optional: staggered entrance for items */
	:global(.list-group > .list-group-item) {
		animation: itemEntrance 0.4s ease-out forwards;
		opacity: 0;
		transform: translateY(10px);
	}

	@keyframes itemEntrance {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Add delay to children */
	:global(.list-group > .list-group-item:nth-child(1)) { animation-delay: 0.1s; }
	:global(.list-group > .list-group-item:nth-child(2)) { animation-delay: 0.15s; }
	:global(.list-group > .list-group-item:nth-child(3)) { animation-delay: 0.2s; }
	:global(.list-group > .list-group-item:nth-child(4)) { animation-delay: 0.25s; }
	:global(.list-group > .list-group-item:nth-child(5)) { animation-delay: 0.3s; }
</style>
