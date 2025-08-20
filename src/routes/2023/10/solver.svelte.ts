import type { Result } from 'neverthrow';

import type { MatrixCanvasHelper } from '$lib/utils';

import { err, ok } from 'neverthrow';
import { toast } from 'svelte-sonner';

import { DEFAULT_MAP } from '$lib/inputs/2023/input-10';
import {
  COLOR_MAP,
  getFontStyle,
  matrixCanvasHelper,
  sleep
} from '$lib/utils';

const INVALID_COORD = -1;
export const CONTAINER_ID = 'render-container';
export const CELL_SIZE = 16;

type Cell = '—' | '·' | '|' | '7' | 'F' | 'J' | 'L' | 'S';

type Data = {
  input: Cell[][];
  controllers: { exec?: AbortController; render?: AbortController };
  maxCols: number;
  maxRows: number;
  matrix?: MatrixCanvasHelper<Cell>;
};
const data: Data = {
  controllers: {},
  input: [],
  matrix: undefined,
  maxCols: 0,
  maxRows: 0
};

type State = {
  /**
   * Returns the amount of steps done, used for A solution
   */
  aStats: number;
  running: boolean;
  startPoint: Point;
  /**
   * Contains the values that are used to display information for the b
   * solution
   */
  bStats: {
    inside: number;
    surface: number;
    loopLen: number;
  } | undefined;
  variant?: ProblemVariant;
};
export const algorithmState: State = $state({
  aStats: 0,
  bStats: undefined,
  running: false,
  startPoint: [INVALID_COORD, INVALID_COORD],
  variant: undefined
});

const findNextSuitable = ([x, y]: Point): Result<Point, void> => {
  const mat = data.input;

  if (x + 1 < mat.length && y < mat[x + 1].length && !['—', '·', '7', 'F'].includes(mat[x + 1][y])) {
    return ok([x + 1, y]);
  } else if (y > 0 && y - 1 < mat[x].length && !['·', '|', '7', 'J'].includes(mat[x][y - 1])) {
    return ok([x, y - 1]);
  } else if (y + 1 < mat[x].length && !['·', '|', 'F', 'L'].includes(mat[x][y + 1])) {
    return ok([x, y + 1]);
  } else if (x > 0 && y < mat[x - 1].length && !['—', '·', 'J', 'L'].includes(mat[x - 1][y])) {
    return ok([x - 1, y]);
  }

  return err();
};

const findLoop = async (startX: number, startY: number, defaultDelay?: number): Promise<Result<Point[], string>> => {
  const nextSuitable = findNextSuitable(algorithmState.startPoint);
  if (nextSuitable.isErr()) {
    return err(`No suitable point found -> (x: ${startX}, y: ${startY})`);
  }

  const visited: Point[] = [[startX, startY], nextSuitable.value];
  let stop = false;

  do {
    const [cx, cy] = visited[visited.length - 1];
    const [px, py] = visited[visited.length - 2];
    const c = data.input[cx][cy];

    const next: Point = [INVALID_COORD, INVALID_COORD];
    switch (c) {
      case '—':
        next[0] = cx;
        next[1] = cy > py ? cy + 1 : cy - 1;
        break;
      case '|':
        next[0] = cx > px ? cx + 1 : cx - 1;
        next[1] = cy;
        break;
      case '7':
        if (cx < px) {
          next[0] = cx;
          next[1] = cy - 1;
        } else {
          next[0] = cx + 1;
          next[1] = cy;
        }
        break;
      case 'F':
        if (cx < px) {
          next[0] = cx;
          next[1] = cy + 1;
        } else {
          next[0] = cx + 1;
          next[1] = cy;
        }
        break;
      case 'J':
        if (cx > px) {
          next[0] = cx;
          next[1] = cy - 1;
        } else {
          next[0] = cx - 1;
          next[1] = cy;
        }
        break;
      case 'L':
        if (cy < py) {
          next[0] = cx - 1;
          next[1] = cy;
        } else {
          next[0] = cx;
          next[1] = cy + 1;
        }
        break;
      case 'S':
        stop = true;
        break;
      default:
        return err(`Unknown cell type: ${c} at (${cx}, ${cy})`);
    }

    if (c !== 'S') {
      algorithmState.aStats += 1;
      data.matrix!.fillRect({
        cell: c,
        drawOptions: { bgFillStyle: COLOR_MAP.blue },
        x: cx,
        y: cy
      });
      visited.push(next);

      const delay = defaultDelay ?? (data.input.length > 50 ? 10 : 50);
      await sleep(delay, { signal: data.controllers.exec!.signal });
    }
    // We also keep track of algorhthmState.running to allow stopping the execution
  } while (!stop && algorithmState.running);

  return ok(visited);
};

// Ray-casting algorithm
const isPointInsideLoop = (loop: Point[], [x, y]: Point): boolean => {
  let inside = false;

  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const [xi, yi] = loop[i];
    const [xj, yj] = loop[j];

    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

const paintPointsInside = (loop: Point[]) => {
  // TS check, if by any chance the matrix has been cleared
  if (!data.matrix) {
    return;
  }

  // All points that conform the loop should be skipped, using a Set for faster
  // lookup, and we are mapping to string as using the Point would always
  // return false
  const loopSet = new Set(loop.map(([x, y]) => `${x}-${y}`));
  data.input.forEach((row, x) => {
    row.forEach((_, y) => {
      const isLoopPoint = loopSet.has(`${x}-${y}`);
      if (isPointInsideLoop(loop, [x, y]) && !isLoopPoint) {
        data.matrix!.fillRect({
          cell: 'I' as any,
          drawOptions: {
            bgFillStyle: COLOR_MAP.green,
            fillStyle: COLOR_MAP.background
          },
          x,
          y
        });
      }
    });
  });
};

const calculatePointsInside = (loop: Point[]): Result<Required<State['bStats']>, string> => {
  const surface = Math.abs(
    loop.reduce((sum, [x1, y1], i) => {
      // Wrap if last item
      const [x2, y2] = loop[(i + 1) % loop.length];
      return sum + (x1 * y2 - x2 * y1);
    }, 0)
  ) / 2;

  return ok({
    inside: Math.ceil(surface - (loop.length / 2) + 1),
    loopLen: loop.length,
    surface
  });
};

type StartArgs = {
  delay?: number;
  solution?: ProblemVariant;
};
export const start = async (args: StartArgs = {}) => {
  data.controllers.exec = new AbortController();
  algorithmState.variant = args.solution ?? 'a';
  algorithmState.running = true;

  const [x, y] = algorithmState.startPoint;
  if (x === INVALID_COORD || y === INVALID_COORD) {
    toast.error('Start point not found');
    return;
  }

  const result = await findLoop(x, y, args.delay);
  if (result.isErr()) {
    toast.error(result.error);
    return;
  }

  if (algorithmState.variant === 'b') {
    const loop = result.value;
    const b = calculatePointsInside(loop);
    if (b.isErr()) {
      toast.error(b.error);
      algorithmState.running = false;
      return;
    }

    algorithmState.bStats = b.value;

    paintPointsInside(loop);
  }

  algorithmState.running = false;
};

type Args = {
  onComplete?: () => void;
};
export const generateInput = (input: string, args: Args = {}) => {
  data.controllers.render = new AbortController();

  const container = document.getElementById(CONTAINER_ID);
  if (!container) {
    return;
  }

  const parsedInput = (input.trim() ? input : DEFAULT_MAP).split('\n').map((row, x) => {
    const y = row.indexOf('S');
    if (y !== INVALID_COORD) {
      algorithmState.startPoint = [x, y];
    }

    return row
      .replaceAll('-', '—')
      .replaceAll('.', '·')
      .split('') as Cell[];
  });

  data.input = parsedInput;
  data.matrix = matrixCanvasHelper<Cell>({
    options: {
      cellColors: {
        '—': COLOR_MAP.gray,
        '·': COLOR_MAP.background,
        '|': COLOR_MAP.gray,
        7: COLOR_MAP.gray,
        F: COLOR_MAP.gray,
        J: COLOR_MAP.gray,
        L: COLOR_MAP.gray,
        S: COLOR_MAP.indigo
      },
      cellSize: CELL_SIZE,
      cellTextColors: {
        '—': COLOR_MAP.background,
        '·': COLOR_MAP.gray,
        '|': COLOR_MAP.background,
        7: COLOR_MAP.background,
        F: COLOR_MAP.background,
        J: COLOR_MAP.background,
        L: COLOR_MAP.background,
        S: COLOR_MAP.background
      },
      drawOptions: {
        font: getFontStyle(CELL_SIZE * 0.75)
      },
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

export const reset = (solution: ProblemVariant) => {
  data.controllers.exec?.abort();
  data.controllers.render?.abort();

  // Clear data
  data.input = [];
  data.maxCols = 0;
  data.maxRows = 0;
  data.matrix = undefined;
  data.controllers = {};

  // Clear state
  algorithmState.variant = solution;
  algorithmState.aStats = 0;
  algorithmState.bStats = undefined;
  algorithmState.running = false;
  algorithmState.startPoint = [INVALID_COORD, INVALID_COORD];
};
