<script lang="ts">
    import type { SolvedVisualization } from '$lib/utils';

    type Props = {
        problem: SolvedVisualization;
    };
    const { problem }: Props = $props();
    const { description, href, tags, title } = problem;
</script>

<a
    class="bg-background flex flex-col gap-1 rounded-lg border px-3 py-2 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md hover:shadow-slate-100 md:px-3"
    {href}
>
    <p class="my-0! font-semibold">{title}</p>
    <div class="text-sm">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html description}
    </div>
    <div class="my-1 flex flex-wrap items-center gap-1">
        {#each tags as tag}
            <div class="flex items-center justify-center rounded-full border border-purple-100 bg-purple-100 px-2 py-1 font-medium text-purple-500">
                <div class="text-xs font-normal leading-none">{tag}</div>
            </div>
        {/each}
    </div>
</a>
