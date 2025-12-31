<script>
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	} = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		"bg-muted/30 text-muted-foreground inline-flex h-12 w-full items-center justify-center rounded-xl p-1",
		className
	)}
	{...restProps}
/>