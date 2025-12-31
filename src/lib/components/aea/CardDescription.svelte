<script>
    let { class: className = "", children } = $props();
</script>

<p class="card-subtitle {className}">
    {@render children?.()}
</p>
