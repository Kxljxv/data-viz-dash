<script module>
	import { tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wider transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none uppercase",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground border-transparent shadow-sm",
				secondary: "bg-secondary text-secondary-foreground border-transparent",
				destructive: "bg-destructive text-destructive-foreground border-transparent shadow-sm",
				outline: "text-foreground",
				brand: "bg-primary text-primary-foreground border-transparent shadow-sm",
				info: "bg-accent text-accent-foreground border-transparent shadow-sm",
				success: "bg-success text-white border-transparent shadow-sm",
				warning: "bg-yellow-500 text-black border-transparent shadow-sm",
				danger: "bg-destructive text-destructive-foreground border-transparent shadow-sm",
				neutral: "bg-muted text-muted-foreground border-transparent",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});
</script>

<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>