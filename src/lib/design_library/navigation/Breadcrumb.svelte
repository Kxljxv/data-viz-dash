<script lang="ts">
    interface Props {
        class?: string;
        children?: import('svelte').Snippet;
        [key: string]: any;
    }

    let { class: className = '', children, ...rest } = $props();
</script>

<nav aria-label="Breadcrumb" class={className} {...rest}>
    <ol class="breadcrumb">
        {@render children?.()}
    </ol>
</nav>
