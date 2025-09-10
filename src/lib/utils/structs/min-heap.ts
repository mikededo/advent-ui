import type { Result } from 'neverthrow';

import { err, ok } from 'neverthrow';

export class MinHeap<T> {
  get size() {
    return this.heap.length;
  }

  private heap: T[] = [];

  constructor(private compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)) {}

  pop(): Result<T, void> {
    if (this.heap.length === 0) {
      return err();
    }

    if (this.heap.length === 1) {
      return ok(this.heap.pop() as T);
    }

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);

    return ok(root);
  }

  push(value: T): Result<null, never> {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);

    return ok(null);
  }

  private bubbleDown(index: number) {
    const n = this.heap.length;

    while (true) {
      let smallest = index;
      const left = this.left(index);
      const right = this.right(index);

      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = this.parent(index);
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) {
        break;
      }

      this.swap(index, parent);
      index = parent;
    }
  }

  private left(i: number) {
    return 2 * i + 1;
  }

  private parent(i: number) {
    return Math.floor((i - 1) / 2);
  }

  private right(i: number) {
    return 2 * i + 2;
  }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
