<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		class?: string;
		[key: string]: any;
	}

	let { children, class: className = '', ...rest }: Props = $props();
</script>

<tr class={className} {...rest}>
	{@render children?.()}
</tr>

<style>
</style>
