import type { MatrixCanvasHelper } from '$lib/utils';

import { toast } from 'svelte-sonner';

import { getColorList, matrixCanvasHelper, sleep } from '$lib/utils';

const INPUT = `NNNNNNNOOOAJJJJJJJJZZMMMMMMMMUMMUCCCSSS
NNNNNNNOOOJJJJJJJJJZZMMMMMMMMMMMUCCCSSS
NNNNNNNNOJJJJJJJJMMMMMMMMMMMMMMMMCOOSSS
NNNNNNNJJJJJJJJJJJJMMMMMMMMMMMMMOOOOSSS
NNNNNNNNIJJJJJJJJJMMMMMMMMMMMMMMMMSSSSS
NNNNNNNIIJJJJJJJJJJMMMKMMMMMMMMMMMSSSSS
NNNNNNNIIJJJJJJJJJJMMMMMMMMMMMMMMMSSSSS
NNNNNNIIIIJLJJJJJJMMMMMMMMMMMMMMMMSSSSS
NNNNHHUIULLLJJJJJJMMMMMMMMMMMMMMMSSSSSS
NNNUUUUUULLLLJJJJJMMMMMMMMMMMMMMMMSSSSS
LLLUUUUULLLLJJJJMMMMMMMMMZZZZMMMZMSSSSS
LLJUUUUULLLLLLJJJJMMMMMMMMZZZZZZZZSSSSS
LLLLULUULLLLLLLZZZMMMEMMMOZZZZZZZZSSSSS
LLLLULLLLLLLLLLLZEEMMEEMOOZZZZZZZZSSSSS
LLLLLLLLLLLLLLLLZEEEEEEMOOZZZZZZZZZSSSS
LLLLLLLLLLLLLLLLEEEEEEEMOZZZZZZZZZZZZZZ
LLLLLLLLLDLLLLMMEOOOEEEOOOZZZZZZZZZZZZL
LLLLLLLLLLLLMMMMVOVOEOOOOOZZZZZZZZZZZZL
LLLLLLLLLLLLMMMMVVVOEOOOOOOZZZZZZZZZZWL
LLLLLLLLLLLMMMVVVOOOOOGGGGGGZZZZZZZZZZL
LLLLLLLLLLLMMVVVVVOGGGGGGGGGZZZZZZZOOUL
RRTTLLLLKKLVVVVVVVVWGGGGGGGGZZZZZZZZZUU
RTTTALLLKKLVVVVVVVVVGGGGGGGZZZZZZZZUQUU
TTTTTLLLKKVVVVVVVVVGGGGGGGGGEEEZZZLUUUU
TTKTTTTTKKKVVVVVVVVGGGGGGGGEEEEEEZEEUUU
TTTTTTTTNNKVVVVVVVVGGGGGGGGGEEEEEEEEUUU
TTTTTTTNNNKSVVVVVVVGGGGGGGGHHHHHHHEEUUU
TTTTTTTTNNKSSVVSSVGGGGGGGGGHHHHHHHEECCC
TTTTTTTTRRSSSBVSVVGGGGGGGGGHHHHHHHEUCCC
TTTTTTTTRTSSSSSSVGGGGGGGGHHHHHHHHHEVCCC
TTTTTTTTRTSSSSSSSLLLGGGGGHHHHHHHHHEVCCC
TTTTTTTTTTSSSSSSPLLLLGGGLHHHHHHHHHAVVVV
TTTTTTTTTTSSSSSSSLLLLLLLLHHHHHHHHHAVVVV
TTTTTTTTTTSSSSSSLLLLLLLLLHHHHHHHHHVVVVV
LLLLTTTTCCCCSSSSLLLLLLLLLHHHHHHHHHDVVVV
LLLLLTTTTTSSSSSSLJLLLLLLLHHHHHHHHHDVVVV
LLLLLTTTTLSSSSRJJJJLLLLLLHHHHHHHHHDVXVV
LLLLLLLLLLLLSJJJJRLLLLLZZHHHHHHHHHFFVVV
LLLLLLLLLLKKKJJJJRLLHHHHHHHHHHHHHHFFDMV
MLLLLLLLLLKKKJJJJJRLHHHHHHEDDDDDDDDDDMM`
  .split('\n')
  .map((line) => line.split(''));

const COLOR_LIST = getColorList('background');
const CELL_SIZE = 20;

export const CONTAINER_ID = 'container';

type Data = {
  input: string[][];
  maxCols: number;
  maxRows: number;
  matrix?: MatrixCanvasHelper;
};
const data: Data = {
  input: [],
  matrix: undefined,
  maxCols: 0,
  maxRows: 0
};

type State = { running: boolean; cost: number };
export const algorithmState: State = $state({
  cost: 0,
  running: false
});

const neighbours = (x: number, y: number) =>
  [([x - 1, y]), ([x + 1, y]), ([x, y - 1]), ([x, y + 1])];

const inRange = (x: number, y: number) =>
  y >= 0 && y < data.maxCols && x >= 0 && x < data.maxRows;

type Borders = [top: boolean, right: boolean, bottom: boolean, left: boolean];
const findBorders = (x: number, y: number): Borders => {
  const cell = data.input[x][y];
  return [
    !inRange(x - 1, y) || cell !== data.input[x - 1][y],
    !inRange(x, y + 1) || cell !== data.input[x][y + 1],
    !inRange(x + 1, y) || cell !== data.input[x + 1][y],
    !inRange(x, y - 1) || cell !== data.input[x][y - 1]
  ];
};

const drawCell = (x: number, y: number, colorIndex: number, withBorders = false) => {
  const pixelX = y * CELL_SIZE;
  const pixelY = x * CELL_SIZE;

  const ctx = data.matrix!.ctx;
  data.matrix!.fillRect({
    cell: data.input[x][y],
    drawOptions: {
      bgFillStyle: COLOR_LIST[colorIndex % COLOR_LIST.length]
    },
    x,
    y
  });

  if (!withBorders) {
    return;
  }

  const borders = findBorders(x, y);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (borders[0]) {
    ctx.moveTo(pixelX, pixelY);
    ctx.lineTo(pixelX + CELL_SIZE, pixelY);
  }
  if (borders[1]) {
    ctx.moveTo(pixelX + CELL_SIZE, pixelY);
    ctx.lineTo(pixelX + CELL_SIZE, pixelY + CELL_SIZE);
  }
  if (borders[2]) {
    ctx.moveTo(pixelX + CELL_SIZE, pixelY + CELL_SIZE);
    ctx.lineTo(pixelX, pixelY + CELL_SIZE);
  }
  if (borders[3]) {
    ctx.moveTo(pixelX, pixelY + CELL_SIZE);
    ctx.lineTo(pixelX, pixelY);
  }
  ctx.stroke();
};

export const start = async () => {
  algorithmState.cost = 0;
  algorithmState.running = true;

  const visited: Set<string> = new Set();

  const cellCount = { count: -1, prev: '' };
  for (let x = 0; x < data.maxRows; x++) {
    for (let y = 0; y < data.maxCols; y++) {
      const cell = data.input[x][y];
      if (cell !== cellCount.prev) {
        cellCount.prev = cell;
        cellCount.count += 1;
      }

      const id = `${x}-${y}`;
      if (visited.has(id)) {
        continue;
      }

      visited.add(id);
      drawCell(x, y, cellCount.count, true);

      const queue: [number, number][] = [[x, y]];

      let edges = 0;
      let area = 0;

      await sleep(10);

      let end = queue.shift();
      while (end) {
        area += 1;

        for (const [nx, ny] of neighbours(...end)) {
          if (!inRange(nx, ny)) {
            edges += 1;
            continue;
          }

          const id = `${nx}-${ny}`;
          const value = data.input[nx][ny];
          if (value === cell && !visited.has(id)) {
            queue.push([nx, ny]);
            visited.add(id);
            drawCell(nx, ny, cellCount.count, true);

            await sleep(10);
          } else if (value !== cell) {
            edges += 1;
          }
        }

        end = queue.shift();
      }
      algorithmState.cost += area * edges;
    }
  }

  algorithmState.running = false;
};

export const generateInput = () => {
  const container = document.getElementById('container');
  if (!container) {
    return;
  }

  data.maxRows = INPUT.length;
  data.maxCols = INPUT[0].length;
  data.input = INPUT.slice(0, data.maxRows).map((row) => row.slice(0, data.maxCols));
  data.matrix = matrixCanvasHelper({
    options: {
      cellColors: '#f3f3f3',
      cellSize: CELL_SIZE,
      cellTextColors: '#333',
      input: data.input
    },
    root: container
  });
  if (!data.matrix) {
    toast.error('Unable to render the matrix');
    return;
  }

  data.matrix.renderMatrix();
};

