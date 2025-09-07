<script lang="ts">
    import { onMount } from 'svelte';
    import { scale } from 'svelte/transition';

    import { Button, Header, InputOptions, Slider, SplitInputs, VisualizationHeader } from '$lib/components';

    import { description } from './metadata';
    import { algorithmState, start } from './solver.svelte';

    const inputs = {
        large: { moves: '', stacks: '' },
        small: { moves: '', stacks: '' }
    };

    let loadingInputs = $state(true);
    let stacksInput: HTMLTextAreaElement | undefined = $state();
    let movesInput: HTMLTextAreaElement | undefined = $state();

    let delay = $state(30);

    const onSelectInput = (_: string, input: 'large' | 'small') => {
        if (input === 'large') {
            stacksInput!.value = inputs[input].stacks;
            movesInput!.value = inputs[input].moves;
        } else {
            stacksInput!.value = inputs[input].stacks;
            movesInput!.value = inputs[input].moves;
        }
    };

    const onSolve = (variant: ProblemVariant) => () => {
        start({
            delay,
            moves: movesInput?.value || inputs.small.moves,
            stacks: stacksInput?.value || inputs.small.stacks,
            variant
        });
    };

    onMount(() => {
        // Inputs are quite heavy and since we don't need them straigh away, we
        // can lazily import them
        import('$lib/inputs/2022/input-5').then((mod) => {
            loadingInputs = false;

            inputs.large.stacks = mod.LARGE_STACKS;
            inputs.large.moves = mod.LARGE_MOVES;
            inputs.small.stacks = mod.DEFAULT_STACKS;
            inputs.small.moves = mod.DEFAULT_MOVES;
        });
    });
</script>

<svelte:head>
    <title>Visualization 5/2022</title>
    <meta content={description} name="description" />
</svelte:head>

<Header problemUrl="https://adventofcode.com/2022/day/5" title="Solution to the 5th problem">
    {#snippet description()}
        <section>
            <h2>Problem A</h2>
            <p>
                The answer for part A is pretty straightforward, as it simply
                requires that we execute each movement, the amount of times
                defined in the amount field of each move. Each stack work as a
                stack data structure, therefore the last element added is the
                first one to be removed. This logic is executed until there are
                no movements left.
            </p>
            <p class="italic">
                Benchmark is still not calculated as I haven&apos;t implemented
                the solution in rust.
            </p>
            <!-- TODO: Solve problem & add benchmark <ShikiCode code={BENCHMARK_A} options={{ lang: 'shellscript' }} /> -->
        </section>

        <section>
            <h2>Problem B</h2>
            <p>
                Part B is really similar to the part A, yet in this case when
                we remove elements from a stack, we cannot do it using a FIFO
                approach, but rather we need to move the amount of items at the
                same time, keeping their order. The most simple solution is to
                <code>slice</code> method from the array, but starting from the
                end, and taking <code>amount</code> elements. This way, we keep
                the order of the elements without needing to reverse them.
            </p>
            <p>
                If you check the solver code, you'll see that we are using
                <code>splice</code> instead, so we can mutate the array from
                which we are extracting the elements, at the same time we are
                taking them. If we were to use <code>slice</code>, we would
                then have to manually mutate the array, removing the extracted
                elements.
            </p>
            <p class="italic">
                Benchmark is still not calculated as I haven&apos;t implemented
                the solution in rust.
            </p>
            <!-- TODO: Solve problem & add benchmark <ShikiCode code={BENCHMARK_B} options={{ lang: 'shellscript' }} /> -->
        </section>
    {/snippet}
</Header>

<section>
    <h2 class="mt-4">Customize your input</h2>
    <p class="mb-4 text-sm">
        Keep in mind that for this problem, proper spacing of this column is
        required, as otherwise the parsing won't work as expected.
    </p>
    <!-- TODO: Show parsing error -->
    <SplitInputs
        bind:leftRef={stacksInput}
        bind:rightRef={movesInput}
        leftOptions={left_options}
        leftPlaceholder="Enter the initial stacks here..."
        leftTitle="Initial stacks"
        rightOptions={right_options}
        rightPlaceholder="Enter the movements here..."
        rightTitle="Movements"
    />
</section>

<section>
    <VisualizationHeader>
        <Button class="w-full sm:w-auto" onclick={onSolve('a')}>
            {algorithmState.running ? 'Running' : 'Solve A'}
        </Button>
        <Button class="w-full sm:w-auto" onclick={onSolve('b')}>
            {algorithmState.running ? 'Running' : 'Solve B'}
        </Button>
    </VisualizationHeader>

    <div class="mt-2 space-y-1">
        <p class="font-semibold">Configuration</p>
        <div class="grid grid-cols-2 md:grid-cols-4">
            <div class="w-full max-w-xs space-y-1">
                <div class="flex items-center justify-between text-sm">
                    <label for="time">Move duration</label>
                    <span>{delay}ms</span>
                </div>
                <div class="w-full max-w-xs">
                    <Slider
                        bind:value={delay}
                        max={100}
                        min={0}
                        step={10}
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="flex w-full flex-col-reverse justify-between gap-2 sm:flex-row">
        <div class="flex flex-col">
            <p class="font-medium">Stacks</p>
            <div class="flex gap-2">
                {#each algorithmState.stacks as stack, j}
                    <div class="flex flex-col">
                        {#each stack as value, i (`${j}-${i}`)}
                            <div
                                class="box flex size-6 origin-top items-center justify-center border"
                                transition:scale={{ duration: 100 }}
                                data-running={algorithmState.running}
                            >
                                {value}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="my-0">No input defined yet!</p>
                {/each}
            </div>
        </div>
        <div class="flex flex-col sm:items-end" class:min-h-28={algorithmState.movesQueue.length}>
            {#if algorithmState.movesQueue.length}
                {@const { amount, from, to } = algorithmState.movesQueue[0]}
                <p class="font-medium">Now: moving {amount} from {from} to {to}</p>
                {#each algorithmState.movesQueue.slice(0, 4) as move, i (i)}
                    {#if i !== 0}
                        <p class="my-0">moved {move.amount} from {move.from} to {move.to}</p>
                    {/if}
                {/each}
                <p class="font-medium">Moves: {algorithmState.movesQueue.length}</p>
            {/if}
        </div>
    </div>
</section>

{#snippet left_options()}
    <InputOptions
        class="md:hidden"
        loading={loadingInputs}
        empty
        onSelect={onSelectInput}
    />
{/snippet}

{#snippet right_options()}
    <InputOptions
        class="hidden md:flex"
        loading={loadingInputs}
        empty
        onSelect={onSelectInput}
    />
{/snippet}

<style>
.box {
    background-color: var(--white);

    &:first-of-type {
        background-color: var(--gray);
    }

    &:last-of-type[data-running="false"] {
        background-color: var(--green);
        border-color: var(--green);
    }
}
</style>
