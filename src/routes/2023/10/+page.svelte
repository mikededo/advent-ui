<script lang="ts">
    import { onMount } from 'svelte';

    import {
        AnimatedNumber,
        Button,
        Header,
        ShikiCode,
        Slider,
        SMWarning,
        Textarea
    } from '$lib/components';
    import {
        BENCHMARK_A,
        BENCHMARK_B,
        DEFAULT_MAP
    } from '$lib/inputs/2023/input-10';
    import { COLOR_MAP } from '$lib/utils';

    import {
        algorithmState,
        CONTAINER_ID,
        generateInput,
        reset,
        start
    } from './solver.svelte';

    let shouldReset = false;

    let input = $state('');
    let delay = $state(30);

    const onSolve = (solution: 'a' | 'b') => () => {
        if (input.trim() === '' && !shouldReset) {
            start({ delay, solution });
            shouldReset = true;
            return;
        }

        // No need to set shouldReset to false, as from now on it will always
        // be necessary
        if (shouldReset) {
            reset(solution);
        }

        generateInput(input, {
            onComplete: () => {
                start({ delay, solution });

                shouldReset = true;
            }
        });
    };

    onMount(() => {
        generateInput(input);
    });
</script>

<svelte:head>
    <title>Visualization 10/2023</title>
    <meta content="Solution to 10th problem" name="description" />
</svelte:head>

<Header
    fileName="d10.rs"
    problemUrl="https://adventofcode.com/2023/day/10"
    title="Solution to the 10th problem"
    url="https://github.com/mikededo/advent/blob/main/aoc-23/src/solutions/day10.rs"
>
    {#snippet description()}
        <SMWarning
            class="md:block min-[1024px]:!hidden"
            notImplementedClass="mb-2"
            recommendedMinWidth={1024}
            notImplemented
        />
        <section>
            <h2>Problem A</h2>
            <p>
                The answer for Part A is the maximum distance (in steps) from
                <code>S</code> to any tile along the loop when traveling along the loop. Since
                every tile lies on a single cycle, that maximum distance is exactly half the
                loop length (the visualization shows <code>(count - 1) / 2</code> once the
                loop is known). Therefore, the algorithm traverses the loop until
                it ends in the starting position.
            </p>
            <p>
                Complexity: it's required to find the connectivity and
                traversing the loop, which are both linear in the number of
                grid cells <code>(O(R * C))</code>; memory use is likewise
                linear for storing visited tiles. Benchmark is for a
                <code>140x140</code> matrix.
            </p>
            <ShikiCode code={BENCHMARK_A} options={{ lang: 'shellscript' }} />
        </section>

        <section>
            <h2>Problem B</h2>
            <p>
                For part B, most of the code is the same, as traversin the loop
                is requied. When the loop is known, the egdes are found whic
                hare they used to know the loops area with the
                <a href="https://en.wikipedia.org/wiki/Shoelace_formula" target="_blank"> shoelace formula</a>.
                Knowing the surface, the
                <a href="https://en.wikipedia.org/wiki/Pick%27s_theorem" target="_blank">Pick's theorem</a>
                is applied, giving us the number of tiles inside the loop.
            </p>
            <p>
                In order to make the visualization more appealing, once the
                solution is found, the points inside the polygon are calculated
                by doing a <em>point in polygon test</em>, which basically
                implies an additional iteration to the entire grid
                (<code>O(m * n)</code>).
            </p>
            <p>
                Complexity: the same as for part A, but with an additional
                parameter when traversing the loop to calculate the edges. The
                memory use is also linear, as the edges are stored in a vector.
                Benchmark is for a <code>140x140</code> matrix.
            </p>
            <ShikiCode code={BENCHMARK_B} options={{ lang: 'shellscript' }} />
        </section>
    {/snippet}

    <section class="rounded-md bg-slate-100 px-4 py-2 text-sm">
        <h2 class="mt-1!">Additional implementation</h2>
        <p>
            In order to make the visualization more appealing, once the
            algorithm is found, the points inside the polygon are
            calculated by ray-casting. This is done by checking each
            point in the input, excluding the loop points, and checking
            if the point is inside the loop. The points that are inside
            are colored in
            <span style="background-color: {COLOR_MAP.green}">green</span>,
            marked with <code>I</code>.
        </p>
    </section>
</Header>

<section class="hidden px-4 md:block">
    <h2 class="mb-2 mt-4">Customize your input</h2>
    <div class="mb-2 flex w-full flex-col gap-2">
        <Textarea
            bind:value={input}
            placeholder={DEFAULT_MAP}
            rows={10}
            title="Map"
        />
    </div>
    <p>
        Once the map is rendered, the start point will be rendered in
        <span style="background-color: {COLOR_MAP.indigo}">blue</span>,
        and the rest of the pipes in
        <span style="background-color: {COLOR_MAP.gray}">gray</span>.
        To have a better visualization, the <code>-</code> are replaced with <code>—</code>, and the <code>.</code>
        are replaced with <code>&centerdot;</code>.
    </p>
</section>

<section>
    <header class="flex items-end justify-between">
        <h2 class="mb-0">Visualization</h2>
        <div class="flex items-center gap-1">
            <Button onclick={onSolve('a')}>
                {algorithmState.running ? 'Running' : 'Solve A'}
            </Button>
            <Button onclick={onSolve('b')}>
                {algorithmState.running ? 'Running' : 'Solve B'}
            </Button>
        </div>
    </header>

    <div class="mb-2 space-y-1">
        <p class="font-semibold">Configuration</p>
        <div class="grid grid-flow-row grid-cols-4">
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
        </div>
    </div>

    <div class="flex gap-2">
        <div class="flex items-center gap-1">
            {#if algorithmState.variant === 'b'}
                {@render b_state()}
            {:else}
                {@render a_state()}
            {/if}
        </div>
    </div>

    <div id={CONTAINER_ID}></div>
</section>

{#snippet a_state()}
    <p class="font-semibold">
        Further steps: <AnimatedNumber value={Math.max(0, (algorithmState.aStats - 1) / 2)} />
    </p>
    {#if algorithmState.aStats > 1}
        <span>=</span>
        <p class="italic text-slate-500">
            (<span title="Loop steps">{algorithmState.aStats}</span> - 1) / 2
        </p>
    {/if}
{/snippet}

{#snippet b_state()}
    {@const { inside, loopLen, surface } = algorithmState.bStats ?? {
        inside: 0,
        loopLen: 0,
        surface: 0
    }}
    <p class="font-semibold">Points inside: <AnimatedNumber value={inside} /></p>
    <span>=</span>
    <p class="italic text-slate-500" title="Pick's theorem">
        <span title="Surface">
            <AnimatedNumber class="font-normal" value={surface} />
        </span> - (<span title="Loop length"><AnimatedNumber class="font-normal" value={loopLen} /></span> / 2) + 1
    </p>
{/snippet}
