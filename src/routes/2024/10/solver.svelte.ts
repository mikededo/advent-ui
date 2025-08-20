import type { MatrixCanvasHelper, PromiseFactory } from '$lib/utils';

import { toast } from 'svelte-sonner';

import { DEFAULT_MAP } from '$lib/inputs/2024/input-10';
import {
  COLOR_MAP,
  runParallelQueue as createParallelQueue,
  getColorList,
  matrixCanvasHelper,
  sleep
} from '$lib/utils';

export const CONTAINER_ID = 'render-container';
export const CELL_SIZE = 20;
export const DEFAULT_DELAY = 50;

type Cell = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type Data = {
  delay: number;
  input: Cell[][];
  map: number[][];
  /**
   * Whether the problem should track visited or not (part a vs b)
   */
  trackVisited: boolean;
  controllers: { exec?: () => void; render?: AbortController };
  startPoints: Point[];
  matrix?: MatrixCanvasHelper<Cell>;
};
const data: Data = {
  controllers: {},
  delay: DEFAULT_DELAY,
  input: [],
  map: [],
  startPoints: [],
  trackVisited: true
};

type State = {
  running: boolean;
  trails: number;
  activePoints: Point[];
};
export const algorithmState = $state<State>({
  activePoints: [],
  running: false,
  trails: 0
});

const COLOR_LIST = getColorList('gray', 'indigo', 'background');

const inRange = (x: number, y: number) => data.input[x] !== undefined && data.input[x][y] !== undefined;

const findTrails = async (
  visited: boolean[][],
  [x, y]: Point,
  depth: number,
  iteration: number,
  signal: AbortSignal
) => {
  if (visited[x][y] && data.trackVisited) {
    return 0;
  }

  visited[x][y] = true;
  if (depth > 0 && inRange(x, y)) {
    data.matrix!.fillRect({
      cell: data.input[x][y],
      drawOptions: {
        bgFillStyle: COLOR_LIST[iteration % COLOR_LIST.length]
      },
      x,
      y
    });
    await sleep(data.delay, { signal });
  }

  if (depth === 9) {
    return 1;
  }

  let count = 0;

  // Top
  if (x > 0 && data.map[x - 1][y] === depth + 1) {
    count += await findTrails(
      visited,
      [x - 1, y],
      depth + 1,
      iteration,
      signal
    );
  }

  // Bottom
  if (data.map[x + 1] !== undefined && data.map[x + 1][y] === depth + 1) {
    count += await findTrails(
      visited,
      [x + 1, y],
      depth + 1,
      iteration,
      signal
    );
  }

  // Left
  if (y > 0 && data.map[x][y - 1] === depth + 1) {
    count += await findTrails(
      visited,
      [x, y - 1],
      depth + 1,
      iteration,
      signal
    );
  }

  // Right
  if (data.map[x][y + 1] !== undefined && data.map[x][y + 1] === depth + 1) {
    count += await findTrails(
      visited,
      [x, y + 1],
      depth + 1,
      iteration,
      signal
    );
  }

  return count;
};

type StartArgs = {
  delay?: number;
  parallel?: number;
};
export const start = async (args: StartArgs = {}) => {
  data.delay = args.delay ?? data.delay;

  algorithmState.running = true;

  const trailPromises: PromiseFactory<number>[] = data.startPoints.map((point, i) =>
    (signal) => findTrails(
      Array.from(
        { length: data.map.length },
        () => Array.from<boolean>({ length: data.map[0].length }).fill(false)
      ),
      point,
      0,
      i,
      signal
    )
  );

  const queue = createParallelQueue(trailPromises, {
    onComplete: (pos) => {
      const active = data.startPoints[pos];
      if (!active) {
        return;
      }

      const [ax, ay] = active;
      const point = algorithmState.activePoints.findIndex(([px, py]) => px === ax && py === ay);
      if (point !== -1) {
        algorithmState.activePoints.splice(point, 1);
      }
    },
    onStart: (pos) => {
      const active = data.startPoints[pos];
      if (!active) {
        return;
      }

      algorithmState.activePoints.push(active);
    },
    parallel: args.parallel ?? 1
  });

  data.controllers.exec = () => {
    queue.cancel();
  };
  const result = await queue.run();

  algorithmState.trails = result.fulfilled.reduce((sum, trails) => sum + trails, 0);
  algorithmState.running = false;
};

type GenerateArgs = {
  onComplete?: () => void;
};
export const generateInput = (input: string, args: GenerateArgs = {}) => {
  // Always reset, avoid any issues
  reset();

  data.controllers.render = new AbortController();

  const container = document.getElementById(CONTAINER_ID);
  if (!container) {
    return;
  }

  const parsedInput = (input.trim() ? input : DEFAULT_MAP)
    .split('\n')
    .map((row, x) => {
      const splitRow = row.split('');
      const parsedRow = splitRow.map((v, y) => {
        const value = Number(v);
        if (value === 0) {
          data.startPoints.push([x, y]);
        }

        return value;
      });

      data.map.push(parsedRow);
      return splitRow as Cell[];
    });

  data.input = parsedInput;
  data.matrix = matrixCanvasHelper<Cell>({
    options: {
      cellColors: {
        0: COLOR_MAP.indigo,
        1: COLOR_MAP.gray,
        2: COLOR_MAP.gray,
        3: COLOR_MAP.gray,
        4: COLOR_MAP.gray,
        5: COLOR_MAP.gray,
        6: COLOR_MAP.gray,
        7: COLOR_MAP.gray,
        8: COLOR_MAP.gray,
        9: COLOR_MAP.gray
      },
      cellSize: CELL_SIZE,
      cellTextColors: COLOR_MAP.background,
      input: parsedInput
    },
    root: container
  });
  if (!data.matrix) {
    toast.error('Unable to render the matrix');
    return;
  }

  data.matrix?.renderMatrix({
    signal: data.controllers.render!.signal,
    ...args
  });
};

export const reset = () => {
  data.controllers.exec?.();
  data.controllers.render?.abort();

  data.controllers.exec = undefined;

  // Clear data
  data.input = [];
  data.matrix = undefined;
  data.map = [];
  data.startPoints = [];
  data.delay = DEFAULT_DELAY;
  data.matrix = undefined;

  // Clear state
  algorithmState.running = false;
  algorithmState.trails = 0;
  algorithmState.activePoints = [];
};
