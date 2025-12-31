<script>
    let { class: className = "", children, tag = "h3" } = $props();
</script>

<svelte:element this={tag} class="card-title {className}">
    {@render children?.()}
</svelte:element>
