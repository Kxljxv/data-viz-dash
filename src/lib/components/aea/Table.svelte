<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		head?: import('svelte').Snippet;
		class?: string;
		hoverable?: boolean;
		striped?: boolean;
		compact?: boolean;
		glass?: boolean;
		height?: string;
	}

	let {
		children,
		head,
		class: className = '',
		hoverable = false,
		striped = false,
		compact = false,
		glass = false,
		height
	}: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="aea-table-container custom-scrollbar {className}"
	class:has-height={height !== undefined}
	style:height
	role="region"
	aria-label="Tabellen-Container"
	tabindex="0"
>
	<table
		class="aea-table"
		class:aea-table-hover={hoverable}
		class:aea-table-striped={striped}
		class:aea-table-compact={compact}
		class:aea-table-glass={glass}
	>
		{#if head}
			<thead>
				<tr>
					{@render head()}
				</tr>
			</thead>
		{/if}
		{@render children?.()}
	</table>
</div>

<style>
	.aea-table-container {
		width: 100%;
		overflow-x: auto;
		border-radius: 1.5rem;
		border: 1px solid hsla(var(--border-300) / 0.1);
		background-color: hsla(var(--bg-100) / 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		scrollbar-width: thin;
		scrollbar-color: hsla(var(--text-400) / 0.2) transparent;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.aea-table-container.has-height {
		overflow-y: auto;
	}

	.aea-table-container:focus-within {
		border-color: hsla(var(--accent-brand) / 0.3);
		box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.aea-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-family: 'ModernDense', sans-serif;
		color: hsl(var(--text-200));
	}

	/* Head styles */
	:global(.aea-table thead tr) {
		background-color: hsla(var(--bg-200) / 0.5);
		backdrop-filter: blur(8px);
	}

	:global(.aea-table thead th) {
		padding: 1rem 1.5rem;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsl(var(--text-300));
		border-bottom: 1px solid hsla(var(--border-300) / 0.1);
	}

	/* Body styles */
	:global(.aea-table tbody td) {
		padding: 1rem 1.5rem;
		font-size: 0.875rem;
		border-bottom: 1px solid hsla(var(--border-300) / 0.05);
		transition: background-color 0.2s ease;
	}

	:global(.aea-table tbody tr:last-child td) {
		border-bottom: none;
	}

	/* Hover effect */
	.aea-table-hover :global(tbody tr:hover td) {
		background-color: hsla(var(--always-white) / 0.03);
		color: hsl(var(--text-100));
	}

	/* Striped effect */
	.aea-table-striped :global(tbody tr:nth-child(even) td) {
		background-color: hsla(var(--always-white) / 0.015);
	}

	/* Compact style */
	.aea-table-compact :global(th),
	.aea-table-compact :global(td) {
		padding: 0.625rem 1rem;
	}

	/* Glass Table Specifics */
	.aea-table-glass {
		background-color: transparent;
	}
</style>
