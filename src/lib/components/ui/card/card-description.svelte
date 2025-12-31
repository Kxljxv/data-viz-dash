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

<p
	bind:this={ref}
	data-slot="card-description"
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</p>
