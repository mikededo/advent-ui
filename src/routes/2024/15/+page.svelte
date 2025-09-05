<script lang="ts">
    import type { Cell } from './solver.svelte';

    import { toast } from 'svelte-sonner';

    import { beforeNavigate } from '$app/navigation';
    import { Button, Header, ShikiCode, SMWarning, SplitInputs, Timer } from '$lib/components';
    import { BENCHMARK, DEFAULT_MAP, DEFAULT_MOVEMENTS } from '$lib/inputs/2024/input-15';
    import { matrixCanvasHelper } from '$lib/utils';

    import {
        algorithmState,
        CELL_COLORS,
        CELL_SIZE,
        CELL_TEXT_COLORS,
        runSolver
    } from './solver.svelte';

    const MOVEMENT_PLACEHOLDER = `Default movements are trimmed since the actual input is really long!
Movements consist of: <^v>...
You can also generate a set of random movements with the button below.`;
    const CONTAINER_ID = 'render-container';

    let running: boolean = $state(false);
    let startTimer = $state(false);

    let mapInput: HTMLTextAreaElement | undefined = $state();

    let movementsInput: HTMLTextAreaElement | undefined = $state();

    const generateInput = () => {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
            return;
        }

        running = true;
        let start: Point = [0, 0];
        const input = (mapInput?.value ? mapInput.value : DEFAULT_MAP)
            .trim()
            .split('\n')
            .map((line, i) => {
                const res = line.split('');
                const found = res.findIndex((c) => c === '@');
                if (found > -1) {
                    start = [i, found];
                }

                return res;
            }) as Cell[][];
        const matrix = matrixCanvasHelper<Cell>({
            options: {
                cellColors: CELL_COLORS,
                cellSize: CELL_SIZE,
                cellTextColors: CELL_TEXT_COLORS,
                input
            },
            root: container
        });
        if (!matrix) {
            toast.error('Unable to render the matrix');
            return;
        }

        const movements = (movementsInput?.value ? movementsInput.value : DEFAULT_MOVEMENTS)
            .trim()
            .split('\n')
            .map((s) => s.split(''))
            .flat();
        matrix.renderMatrix({
            onComplete: () => {
                algorithmState.map = input;
                algorithmState.movements = { executed: 0, left: movements.length };

                startTimer = true;
                runSolver(matrix, start, movements);
            }
        });
    };

    beforeNavigate(() => {
        running = false;
        algorithmState.cancel = true;
        algorithmState.movements = { executed: 0, left: 0 };
    });
</script>

<Header
    fileName="d15.rs"
    problemUrl="https://adventofcode.com/2024/day/15"
    title="Solution to the 15th problem"
    url="https://github.com/mikededo/advent/blob/main/aoc-24/src/solutions/d15.rs"
>
    {#snippet description()}
        <SMWarning
            class="md:block min-[864px]:!hidden"
            notImplementedClass="mb-2"
            recommendedMinWidth={864}
            notImplemented
        />
        <p>
            The problem basically requires to execute a sequence of movements into a map. The map contains empty cells, boxes and walls. The movements are executed with following these rules:
        </p>
        <ul>
            <li>The player can freely move into any empty space.</li>
            <li>If the player has to move into a box, the box will be shifted into the same direction if there's an empty space after that position. However, if multiple boxes are aligned, the player would move as many boxes as required. If there's a wall after all the boxes, the boxes cannot be shifter and the player won't move.</li>
            <li>If there's a wall, the player won't be able to move.</li>
        </ul>
        <p>
            Parsing the map and executing the movements taking into account the rules is enough to get over the first problem. The second part is a bit more tricky as the initial map is extended. All parsed positions from the map are duplicated, meaning that boxes take up two spaces. This makes vertical movements more tricky, as a box may partially be in contact with another box. In order to solve this, instead of finding the first empty vertical space, we will find them with a triangular approach. The way I opted to solve it was to check if all boxes that were in contact could be moved. Unless they were all able, no movement would be made. The drawback about this approach is that you iterate twice (once for the search and a second time for the movement). Despite having a big map, the solution is really fast.
        </p>
        <ShikiCode code={BENCHMARK} options={{ lang: 'shellscript' }} />
    {/snippet}
</Header>

<section class="hidden md:block">
    <h2 class="mb-2 mt-4">Customize your input</h2>
    <SplitInputs
        bind:leftRef={mapInput}
        bind:rightRef={movementsInput}
        leftPlaceholder={DEFAULT_MAP}
        leftTitle="Map"
        rightPlaceholder={MOVEMENT_PLACEHOLDER}
        rightTitle="Movements"
    />
    <p>
        Once the map is rendered, know that: walls will be rendered with a darker color, empty spaces with a gray-ish tone, and boxes with a brown color. The robot will be rendered in blue!
        <br />
        The animation is really long, and in order to have a decent visualization with the total input, 2000 movements take 10 seconds, so the total animation lasts for 100 seconds (1 minute and 40 seconds).
    </p>
</section>

<section class="hidden md:block">
    <header class="flex items-end justify-between">
        <h2 class="mb-0">Visualization</h2>
        <div class="flex items-center gap-1">
            <Button onclick={generateInput}>{running ? 'Running' : 'Solve'}</Button>
        </div>
    </header>

    <div class="mb-2 flex items-center gap-4 font-semibold">
        <p>Movements to go: {algorithmState.movements.left}</p>
        <p>Movements executed: {algorithmState.movements.executed}</p>
        <div class="ml-auto">
            <Timer label="Time elapsed" running={startTimer} />
        </div>
    </div>

    <div id={CONTAINER_ID}></div>
</section>

