<script>
    let { class: className = "", children } = $props();
</script>

<div class="card-header {className}">
    {@render children?.()}
</div>
