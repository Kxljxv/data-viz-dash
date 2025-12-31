<script lang="ts">
    interface Props {
        href?: string;
        active?: boolean;
        class?: string;
        children?: import('svelte').Snippet;
        icon?: import('svelte').Snippet;
        [key: string]: any;
    }

    let { 
        href, 
        active = false, 
        class: className = '', 
        children, 
        icon,
        ...rest 
    } = $props();
</script>

<li 
    class="breadcrumb-item {active ? 'active' : ''} {className}" 
    aria-current={active ? 'page' : undefined}
    {...rest}
>
    {#if active}
        <span class="flex items-center">
            {#if icon}
                {@render icon()}
            {/if}
            {@render children?.()}
        </span>
    {:else}
        <a {href} class="flex items-center">
            {#if icon}
                {@render icon()}
            {/if}
            {@render children?.()}
        </a>
    {/if}
</li>
