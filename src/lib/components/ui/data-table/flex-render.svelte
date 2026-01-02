<script>
    let { content, context } = $props();
</script>

{#if typeof content === "string"}
    {content}
{:else if typeof content === "function"}
    {@const result = content(context)}
    {#if result?.component}
        <result.component {...result.props} />
    {:else if result?.snippet}
        {@render result.snippet(result.props)}
    {:else}
        {result}
    {/if}
{:else if content?.component}
    <content.component {...content.props} />
{:else if content?.snippet}
    {@render content.snippet(content.props)}
{/if}
