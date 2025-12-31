<script>
    let { class: className = "", children } = $props();
</script>

<div class="card-body {className}">
    {@render children?.()}
</div>
