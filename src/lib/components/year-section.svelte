<script lang="ts">
    import type { Year } from '$lib/data';

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
        class="absolute -top-2 left-0 z-0 font-mono text-[124px] font-bold leading-none opacity-5 lg:-top-4 lg:text-[240px]"
        aria-hidden={true}
    >
        {year}
    </div>
    <h2 class="mt-0!">{year}</h2>
    <div class="relative mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {#each entries as [day, problem](day)}
            <ProblemCard {problem} />
        {/each}
    </div>
</section>

