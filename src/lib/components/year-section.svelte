<script lang="ts">
    import type { Year } from '$lib/utils';

    import ProblemCard from './problem-card.svelte';

    type Props = {
        days: Year;
        year: number;
        position: number;
    };
    const { days, position, year }: Props = $props();

    const entries = Object.entries(days);
</script>

<section
    class="h-grid-line relative pt-4"
    style="--grid-animation-delay: calc({position} * 0.15s)"
>
    <div
        class="absolute left-0 top-0 z-0 font-mono text-[124px] font-bold leading-none opacity-5 lg:-translate-y-8 lg:text-[240px]"
        aria-hidden={true}
    >
        {year}
    </div>
    <h2 class="mt-0!">{year}</h2>
    <div class="relative mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {#each entries as [day, problem](day)}
            <ProblemCard {problem} />
        {/each}
    </div>
</section>

