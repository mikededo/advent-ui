<script lang="ts">
    import { onMount } from 'svelte';

    import { Header } from '$lib/components';

    import { CONTAINER_ID, generateInput } from './solver.svelte';

    onMount(() => {
        generateInput();
    });
</script>

<svelte:head>
    <title>Visualization 5/2022</title>
    <meta content="Solution to 15th problem" name="description" />
</svelte:head>

<Header
    fileName="d5.rs"
    problemUrl="https://adventofcode.com/2022/day/5"
    title="Solution to the 5th problem"
    url="https://github.com/mikededo/advent"
>
    {#snippet description()}
        <p>
            Still implementing this solution!
        </p>
    {/snippet}
</Header>

<section>
    <h2 class="mb-0 mt-4">Visualization</h2>

    <div id={CONTAINER_ID}></div>
</section>
