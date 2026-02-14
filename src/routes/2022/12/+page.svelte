<script lang="ts">
    import { description } from './metadata'
    import { algorithmState, CONTAINER_ID, generateInput, start } from './solver.svelte'

    import {
        AnimatedNumber,
        Button,
        Header,
        InputOptions,
        ShikiCode,
        Slider,
        Textarea,
        VisualizationHeader
    } from '$lib/components'
    import {
        BENCHMARK_A,
        BENCHMARK_B,
        DEFAULT_MAP,
        LARGE_INPUT
    } from '$lib/inputs/2022/input-12'
    import { COLOR_MAP } from '$lib/utils'

    let delay = $state(30)
    let input = $state('')

    const onSelectInput = (value: string) => {
        input = value
    }

    const onSolve = (variant: ProblemVariant) => () => {
        generateInput({
            input,
            onComplete: () => {
                start({ delay, variant })
            },
            variant
        })
    }

    $effect(() => {
        generateInput()
        return () => {
        // cancel();
        }
    })
</script>

<svelte:head>
    <title>Visualization 5/2022</title>
    <meta content={description} name="description" />
</svelte:head>

<Header
    fileName="d12.rs"
    problemUrl="https://adventofcode.com/2022/day/10"
    title="Solution to the 5th problem"
    url="https://github.com/mikededo/advent/blob/main/aoc-22/src/solutions/d12.rs"
>
    {#snippet description()}
        <section>
            <h2>Problem A</h2>
            <p>
                I approached this problem using
                <a class="link" href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" target="_blank">
                    Dijkstra&apos;s algorithm
                </a>
                , which is a graph algorithm that helps finding the shortest
                path. The problem defines a matrix, with a start (S) and end
                point (E). The shortest path has to be found, but the algorithm
                can only go to:
            </p>
            <ul>
                <li>Up, down, left and right</li>
                <li>The value of the next cell can only be one more, equal, or simply lower</li>
            </ul>
            <p>
                Each cell is a <code>char</code> and, based on their position
                in the alphabet, it&apos;s either higher or lower (i.e.
                <code>b</code> is lower than <code>c</code>, but higher than
                <code>a</code>).
            </p>
            <p>
                Therefore, we build a graph, to determine which nodes can be
                acessed from which, and we run Dijkstra&apos;s algorithm from
                <code>S</code> to <code>E</code>.
            </p>
            <ShikiCode code={BENCHMARK_A} options={{ lang: 'shellscript' }} />
        </section>

        <section>
            <h2>Problem B</h2>
            <p>
                The initial implementation was executing the algorithm for each
                <code>a</code> char. While this requires minimum changes to the
                initial algorithm, while developing this visualization I
                realised that it&apos;s really no the most eficient way. Since the
                part B implies finding the closest <code>E</code> from any
                <code>a</code>, we can simply reverse the graph (i.e. invert
                all edges) and run Dijkstra&apos;s algorithm from <code>E</code>.
                The first time we reach an <code>a</code> we can stop the
                algorithm, since it&apos;s guaranteed to be the closest one. This
                solution implies other changes, for example, in which nodes can
                be the next ones.
            </p>
            <ShikiCode code={BENCHMARK_B} options={{ lang: 'shellscript' }} />
        </section>
    {/snippet}
</Header>

<section class="hidden md:block">
    <h2 class="mb-2 mt-4">Customize your input</h2>
    <div class="mb-2 flex w-full flex-col gap-2">
        <Textarea
            bind:value={input}
            placeholder={DEFAULT_MAP}
            rows={10}
            title="Map"
        >
            {#snippet options()}
                <InputOptions large={LARGE_INPUT} small={DEFAULT_MAP} onSelect={onSelectInput} />
            {/snippet}
        </Textarea>
    </div>
    <p>
        Once the map is rendered, the start point will be rendered in
        <span style="background-color: {COLOR_MAP.indigo}">blue</span>,
        and the end in
        <span style="background-color: {COLOR_MAP.green}">green</span>.
        The paths will be rendered with different colors, most of them
        overlapping.
    </p>
</section>

<section>
    <VisualizationHeader>
        <Button disabled={algorithmState.running} onclick={onSolve('a')}>
            {algorithmState.running ? 'Running' : 'Solve A'}
        </Button>
        <Button disabled={algorithmState.running} onclick={onSolve('b')}>
            {algorithmState.running ? 'Running' : 'Solve B'}
        </Button>
    </VisualizationHeader>

    <div class="mb-2 space-y-1">
        <p class="font-semibold">Configuration</p>
        <div class="grid grid-flow-row grid-cols-4">
            <div class="w-full max-w-xs space-y-1">
                <div class="flex items-center justify-between text-sm">
                    <label for="time">Step duration</label>
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

    <div class="mb-2 flex items-center gap-4 font-semibold">
        <p class="font-semibold">
            Minimum distance: <AnimatedNumber value={algorithmState.data.minDist} />
        </p>
        <p class="font-semibold">
            Visited nodes: <AnimatedNumber value={algorithmState.data.visited} />
        </p>
    </div>

    <div class="overflow-auto" id={CONTAINER_ID}></div>
</section>
