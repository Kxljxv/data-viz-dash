<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	} = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"selection:bg-primary dark:bg-input/10 selection:text-primary-foreground border-border/50 ring-offset-background placeholder:text-muted-foreground flex h-10 w-full min-w-0 rounded-xl border bg-background/50 px-3 pt-1.5 text-sm font-modern font-medium tracking-wide shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-[3px]",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"border-border/50 bg-background/50 selection:bg-primary dark:bg-input/10 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-10 w-full min-w-0 rounded-xl border px-3 py-1 text-sm font-modern font-medium tracking-wide shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-[3px]",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}