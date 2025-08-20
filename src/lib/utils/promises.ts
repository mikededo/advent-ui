type Effects = {
  onCancel?: (position: number) => void;
  onComplete?: (position: number) => void;
  onStart?: (position: number) => void;
};

export type PromiseFactory<T> = (signal: AbortSignal) => Promise<T>;

export type QueueResult<T> = {
  cancelled: boolean;
  fulfilled: T[];
  rejected: Error[];
  results: (Error | T)[];
};

/**
 * Run a queue of promises in parallel, with cancellation support.
 */
export class ParallelPromiseQueue<T> {
  private controller = new AbortController(); // <-- cancellation controller
  private effects: Effects;
  private maxParallel: number;
  private queue: { index: number; factory: PromiseFactory<T> }[];
  private results: (Error | T)[] = [];
  private running = new Set<Promise<T>>();
  private started = 0;

  constructor(
    maxParallel: number,
    queue: PromiseFactory<T>[],
    effects: Effects = {}
  ) {
    this.maxParallel = maxParallel;
    this.queue = queue.map((factory, index) => ({ factory, index }));
    this.effects = effects;
  }

  /** External API to cancel all remaining/ongoing promises */
  cancel(): void {
    this.controller.abort();
  }

  async execute(): Promise<QueueResult<T>> {
    while (this.running.size < this.maxParallel && this.queue.length > 0) {
      this.startNext();
    }

    while (this.running.size > 0) {
      await Promise.race(this.running);
    }

    return this.getResults();
  }

  private getResults(): QueueResult<T> {
    const fulfilled: T[] = [];
    const rejected: Error[] = [];

    this.results.forEach((result) => {
      if (result instanceof Error) {
        rejected.push(result);
      } else {
        fulfilled.push(result);
      }
    });

    return {
      cancelled: this.controller.signal.aborted,
      fulfilled,
      rejected,
      results: this.results
    };
  }

  private startNext(): void {
    if (this.queue.length === 0 || this.controller.signal.aborted) {
      return;
    }

    const { factory, index } = this.queue.shift()!;
    const position = this.started++;
    this.effects.onStart?.(position);

    const promise = factory(this.controller.signal)
      .then((result) => {
        if (this.controller.signal.aborted) {
          const err = new Error('Cancelled');
          this.results[index] = err;
          this.effects.onCancel?.(position);
          return Promise.reject(err);
        }
        this.results[index] = result;
        return result;
      })
      .catch((error) => {
        const err = error instanceof Error ? error : new Error(String(error));
        this.results[index] = err;
        return Promise.reject(err);
      })
      .finally(() => {
        this.running.delete(promise);
        if (!this.controller.signal.aborted) {
          this.startNext();
          this.effects.onComplete?.(position);
        }
      });

    this.running.add(promise);
  }
}

type Options = { parallel?: number } & Partial<Effects>;

export const runParallelQueue = <T>(
  promiseFactories: PromiseFactory<T>[],
  args: Options = {}
) => {
  const { parallel, ...cbs } = args;
  const queue = new ParallelPromiseQueue(
    parallel ?? 3,
    promiseFactories,
    cbs
  );

  return {
    cancel: () => queue.cancel(),
    run: () => queue.execute()
  };
};
