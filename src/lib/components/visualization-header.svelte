<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = { children: Snippet };
    const { children }: Props = $props();
</script>

<header class="flex w-full flex-col justify-between gap-2 sm:flex-row sm:items-end sm:gap-0">
    <h2 class="mb-0 flex-1">Visualization</h2>
    <div class="flex items-stretch gap-1">
        {@render children()}
    </div>
</header>
