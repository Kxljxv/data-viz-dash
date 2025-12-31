<script>
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		delayDuration = 700,
		...restProps
	} = $props();
</script>

<TooltipPrimitive.Root bind:ref {delayDuration} {...restProps} />
