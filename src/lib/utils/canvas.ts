import { hexToRgb } from './colors';

/** Method arguments */
type RenderMatrixArgs = {
  signal?: AbortSignal;
  onComplete?: () => void;
};
type DrawOptions = Partial<
  { bgFillStyle: CanvasRenderingContext2D['fillStyle'] } &
  Pick<CanvasRenderingContext2D, 'fillStyle' | 'font' | 'textAlign' | 'textBaseline'>
>;

type FillTextPos<Cell extends string> = {
  cell: Cell;
  x: number;
  y: number;
  drawOptions?: DrawOptions;
  progress?: number;
};

type MatrixCanvasHelperArgs<Cell extends string> = {
  options: {
    cellSize: number;
    input: Cell[][];
    cellColors: Record<Cell, string> | string;
    cellTextColors: Record<Cell, string> | string;
    drawOptions?: DrawOptions;
  };
  root: HTMLElement;
};
export type MatrixCanvasHelper<Cell extends string = string> = NonNullable<ReturnType<typeof matrixCanvasHelper<Cell>>>;

export const getFontStyle = (size: number) => `${size}px "Geist Mono", monospace`;

export const matrixCanvasHelper = <Cell extends string>(
  { options, root }: MatrixCanvasHelperArgs<Cell>
) => {
  const { cellSize, drawOptions: rootDrawOptions = {}, input } = options;

  // Create and render the canvas
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Unable to get canvas context');
    return;
  }

  canvas.classList.add('mx-auto');
  root.replaceChildren(canvas);

  const rows = input.length;
  const cols = input[0].length;

  const logicalWidth = cols * cellSize;
  const logicalHeight = rows * cellSize;

  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  ctx.scale(dpr, dpr);

  const fillRect = (
    ctx: CanvasRenderingContext2D,
    {
      cell,
      drawOptions = rootDrawOptions,
      progress = 100,
      x,
      y
    }: FillTextPos<Cell>
  ) => {
    const { cellColors, cellTextColors } = options;
    const rectX = y * cellSize;
    const rectY = x * cellSize;

    const fillColor = typeof cellColors === 'string' ? cellColors : cellColors[cell];
    const textColor = typeof cellTextColors === 'string' ? cellTextColors : cellTextColors[cell];

    ctx.fillStyle = drawOptions.bgFillStyle ?? `rgba(${hexToRgb(fillColor)}, ${(progress / 100)})`;
    ctx.fillRect(rectX, rectY, cellSize, cellSize);
    ctx.font = drawOptions.font ?? getFontStyle(cellSize * 0.75);
    ctx.textAlign = drawOptions.textAlign ?? 'center';
    ctx.textBaseline = drawOptions.textBaseline ?? 'middle';
    ctx.fillStyle = drawOptions.fillStyle ?? textColor;
    ctx.fillText(cell, rectX + cellSize / 2, rectY + cellSize / 2);
  };

  const renderMatrix = (options: RenderMatrixArgs = {}) => {
    const renderingState: {
      delay: number;
      x: number;
      y: number;
      progress: number;
    }[] = [];

    input.forEach((row, x) => {
      row.forEach((_, y) => {
        // Delay the start time based on cell position
        renderingState.push({ delay: (x + y) * 15, progress: -1, x, y });
      });
    });

    const startTime = Date.now();
    const animateCells = () => {
      if (options.signal?.aborted) {
        return;
      }

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      renderingState.forEach((state) => {
        const { delay, progress, x, y } = state;

        if (state.progress >= 0) {
          fillRect(ctx, { cell: input[x][y], progress, x, y });
        }

        if (progress < 100) {
          state.progress = Math.min(
            100,
            state.progress < 0
              ? (Date.now() - startTime > delay ? 0 : -1)
              : state.progress + 5
          );
        }
      });

      // Keep running until all completed
      if (renderingState.some((state) => state.progress < 100)) {
        requestAnimationFrame(() => {
          animateCells();
        });
      } else {
        options.onComplete?.();
      }
    };

    animateCells();
  };

  return {
    ctx,
    fillRect: (args: FillTextPos<Cell>) => {
      fillRect(ctx, args);
    },
    renderMatrix
  };
};
