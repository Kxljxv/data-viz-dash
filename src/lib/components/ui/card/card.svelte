<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className = undefined,
		variant = "default",
		interactive = false,
		children,
		...restProps
	} = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		"bg-card text-card-foreground flex flex-col rounded-2xl border border-border/10 shadow-sm transition-all duration-300 pb-6 pt-6",
		variant === "glass" && "bg-background/40 backdrop-blur-md border-white/10",
		interactive && "hover:shadow-md hover:border-border/20 cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/20 outline-none",
		className
	)}
	role={interactive ? "button" : undefined}
	tabindex={interactive ? 0 : undefined}
	{...restProps}
>
	{@render children?.()}
</div>