<script lang="ts">
	import { cn } from "$lib/utils.js";
	interface Props {
		ref?: any;
		class?: string;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}
	let {
		ref = $bindable(null),
		class: className = undefined,
		children,
		...restProps
	}: Props = $props();
</script>

<div bind:this={ref} data-slot="card-content" class={cn("px-6", className)} {...restProps}>
	{@render children?.()}
</div>
