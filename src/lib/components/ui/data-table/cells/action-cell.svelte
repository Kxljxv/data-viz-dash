<script>
    import { IconExternalLink } from '@tabler/icons-svelte';
    let { project, id, onclick } = $props();
</script>

<button 
    class="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-brand"
    onclick={() => onclick(project, id)}
>
    <IconExternalLink size={16} />
</button>
