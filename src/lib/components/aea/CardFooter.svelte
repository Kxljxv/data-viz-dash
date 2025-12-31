<script>
    let { class: className = "", children } = $props();
</script>

<div class="card-footer {className}">
    {@render children?.()}
</div>
