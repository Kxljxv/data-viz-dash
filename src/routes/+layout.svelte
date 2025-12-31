<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import '../assets/styles/style.css';
	import { TooltipProvider } from "$components/ui/tooltip";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<TooltipProvider delayDuration={400}>
	{@render children()}
</TooltipProvider>
