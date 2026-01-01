<script module>
	import { cn } from "$lib/utils.js";
	import { tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-modern font-medium tracking-wider whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:translate-y-[1px]",
				destructive:
					"bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-sm active:translate-y-[1px]",
				outline:
					"bg-transparent border-border/50 hover:bg-accent hover:text-accent-foreground border shadow-sm active:translate-y-[1px]",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm active:translate-y-[1px]",
				ghost: "hover:bg-accent/10 hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-5 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-12 px-8 text-base",
				icon: "size-10",
				"icon-sm": "size-8",
				"icon-lg": "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

</script>

<script>
	import { IconLoader2 } from "@tabler/icons-svelte";
	let {
		class: className = undefined,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled = undefined,
		loading = false,
		children,
		...restProps
	} = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled || loading ? undefined : href}
		aria-disabled={disabled || loading}
		role={disabled || loading ? "link" : undefined}
		tabindex={disabled || loading ? -1 : undefined}
		{...restProps}
	>
		{#if loading}
			<IconLoader2 class="animate-spin -ml-1 mr-2 size-4 text-current" />
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		disabled={disabled || loading}
		{...restProps}
	>
		{#if loading}
			<IconLoader2 class="animate-spin -ml-1 mr-2 size-4 text-current" />
		{/if}
		{@render children?.()}
	</button>
{/if}