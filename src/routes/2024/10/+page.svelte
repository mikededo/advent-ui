<script lang="ts">
    import { useDebounce, watch } from 'runed';

    import {
        AnimatedNumber,
        Button,
        Header,
        ShikiCode,
        Slider,
        SMWarning,
        Textarea
    } from '$lib/components';
    import { BENCHMARK_A, DEFAULT_MAP, LARGE_INPUT } from '$lib/inputs/2024/input-10';
    import { COLOR_MAP } from '$lib/utils';

    import {
        algorithmState,
        CONTAINER_ID,
        DEFAULT_DELAY,
        generateInput,
        reset,
        start
    } from './solver.svelte';

    let input = $state('');
    let delay = $state(DEFAULT_DELAY);
    let parallel = $state(1);
    let debounceDelay = $state(500);

    const onSolve = () => {
        start({ delay, parallel });
    };

    const onSetInput = (value: string) => () => {
        debounceDelay = 0;
        input = value;
    };

    const generate = useDebounce(() => {
        generateInput(input);
        debounceDelay = 500;
    }, () => debounceDelay);

    watch(() => input, () => {
        generate();
    }, { lazy: true });

    $effect(() => {
        generateInput(DEFAULT_MAP);

        return () => {
            reset();
        };
    });
</script>

<svelte:head>
    <title>Visualization 12/2024</title>
    <meta content="Solution to 12th problem" name="description" />
</svelte:head>

<Header
    fileName="d10.rs"
    problemUrl="https://adventofcode.com/2024/day/10"
    title="Solution to the 10th problem"
    url="https://github.com/mikededo/advent/blob/main/aoc-24/src/solutions/d10.rs"
>
    {#snippet description()}
        <SMWarning
            class="md:block min-[1024px]:!hidden"
            notImplementedClass="mb-2"
            recommendedMinWidth={1024}
            notImplemented
        />

        <p>
            The problem is solved by performing a recursive depth-first search
            (DFS) from each trailhead (height 0) across the topographic map. A
            valid hiking trail always moves orthogonally to neighboring
            positions with a height exactly 1 higher than the current position.
        </p>

        <section>
            <h2>Problem A</h2>
            <p>
                For part A, the DFS keeps track of visited positions to avoid
                counting the same path multiple times. Whenever a trail reaches
                a height of 9, it contributes to the trailhead’s score. By
                summing these scores over all trailheads, the solution for the
                first part is obtained.
            </p>
            <ShikiCode code={BENCHMARK_A} options={{ lang: 'shellscript' }} />
        </section>

        <!-- <section> -->
        <!--     <h2>Problem B</h2> -->
        <!--     <p> -->
        <!--         For part B, the visited tracking is disabled so that all -->
        <!--         distinct hiking trails are counted, even if they overlap at -->
        <!--         intermediate positions. The recursive DFS explores every valid -->
        <!--         path from each trailhead, incrementing the count whenever a -->
        <!--         trail reaches height 9. Summing these counts across all -->
        <!--         trailheads gives the total rating. -->
        <!--     </p> -->
        <!-- </section> -->

        <p>
            This approach efficiently handles both parts of the problem by
            simply toggling whether visited positions are tracked, avoiding the
            need for more complex state management or memoization while
            remaining fast even for larger maps.
        </p>
    {/snippet}
</Header>

<section class="hidden px-4 md:block">
    <h2 class="mb-2 mt-4">Customize your input</h2>
    <div class="mb-2 flex w-full flex-col gap-2">
        <Textarea
            bind:value={input}
            options={textarea_options}
            placeholder={DEFAULT_MAP}
            rows={10}
            title="Map"
        />
    </div>
    <p>
        Once the map is rendered, the start points will be rendered in
        <span style="background-color: {COLOR_MAP.indigo}">blue</span>.
        The paths will be rendered with different colors, most of them
        overlapping.
    </p>
</section>

<section>
    <header class="flex items-end justify-between">
        <h2 class="mb-0">Visualization</h2>
        <div class="flex items-center gap-1">
            <Button onclick={onSolve}>
                {algorithmState.running ? 'Running' : 'Solve A'}
            </Button>
        </div>
    </header>

    <div class="mb-2 space-y-1">
        <p class="font-semibold">Configuration</p>
        <div class="grid grid-flow-row grid-cols-2 gap-8 md:grid-cols-4">
            <div class="w-full max-w-xs space-y-1">
                <div class="flex items-center justify-between text-sm">
                    <label for="time">Duration</label>
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

            <div class="w-full max-w-xs space-y-1">
                <div class="flex items-center justify-between text-sm">
                    <label for="time">Parallel items</label>
                    <span>{parallel === 1 ? 'Iterative' : parallel}</span>
                </div>
                <div class="w-full max-w-xs">
                    <Slider
                        bind:value={parallel}
                        max={10}
                        min={1}
                        step={1}
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-8 font-semibold md:grid-cols-4">
        <p>
            Trails found: <AnimatedNumber value={algorithmState.trails} />
        </p>

        <p class="col-span-2 line-clamp-1">
            Checking points ({algorithmState.activePoints.length}):
            <span class="font-normal">
                {#each algorithmState.activePoints as [x, y], i (`${x}-${y}`)}
                    <span>
                        ({x},{y})
                    </span>
                    {#if i < algorithmState.activePoints.length - 1}
                        ,&nbsp;
                    {/if}
                {/each}
            </span>
        </p>
    </div>

    <div id={CONTAINER_ID}></div>
</section>

{#snippet textarea_options()}
    <div class="flex items-center gap-4 text-sm font-medium">
        <button
            class="cursor-pointer hover:underline"
            onclick={onSetInput(DEFAULT_MAP)}
        >
            Small input
        </button>
        <button
            class="cursor-pointer hover:underline"
            onclick={onSetInput(LARGE_INPUT)}
        >
            Large input
        </button>
    </div>
{/snippet}
