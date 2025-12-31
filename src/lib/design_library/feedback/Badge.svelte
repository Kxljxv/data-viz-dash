<script lang="ts">
	interface Props {
		variant?: 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
		type?: 'solid' | 'outline' | 'soft';
		pill?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'neutral',
		type = 'solid',
		pill = false,
		class: className = '',
		children
	}: Props = $props();

	const variantClass = $derived(`badge-${variant}`);
	const typeClass = $derived(type !== 'solid' ? `badge-${type}` : '');
	const pillClass = $derived(pill ? 'badge-pill' : '');
</script>

<span class="badge {variantClass} {typeClass} {pillClass} {className}">
	{@render children?.()}
</span>
