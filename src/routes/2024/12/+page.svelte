<script lang="ts">
    import { onMount } from 'svelte';

    import { AnimatedNumber, Button, Header } from '$lib/components';

    import {
      algorithmState,
      CONTAINER_ID,
      generateInput,
      start
    } from './utils.svelte';

    const onClick = () => {
      start();
    };

    onMount(() => {
      generateInput();
    });
</script>

<svelte:head>
    <title>Visualization 12/2024 v2</title>
    <meta content="Solution to 12th problem (Canvas version)" name="description" />
</svelte:head>

<Header
    fileName="d12.rs"
    problemUrl="https://adventofcode.com/2024/day/12"
    title="Solution to the 12th problem"
    url="https://github.com/mikededo/advent/blob/main/aoc-24/src/solutions/d12.rs"
>
    {#snippet description()}
        <p>
            This problem is solved using a flood fill algorithm. The algorithm
            works by starting at a given point and then checking all the points
            around it and checking if they are part of the same group. If they
            are, then they are added to the group and the algorithm continues.
            If they are not, then they are added to a new group and the
            algorithm continues. This process continues until all the points
            are checked and added to a group.
        </p>
        <p class="mt-2 text-sm text-gray-600">
            <strong>Canvas Version:</strong> This version uses the Canvas API
            for improved rendering performance compared to the DOM-based
            approach.
        </p>
    {/snippet}
</Header>

<section>
    <h2 class="mb-0 mt-4">Visualization</h2>
    <div class="mb-2 flex w-full items-center justify-between gap-8 font-semibold">
        <p class="my-0!">Cost: <AnimatedNumber value={algorithmState.cost} /></p>
        <Button
            disabled={algorithmState.running}
            onclick={onClick}
        >
            {algorithmState.running ? 'Running' : 'Solve'}
        </Button>
    </div>

    <div id={CONTAINER_ID}></div>
</section>
