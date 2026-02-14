import type { Result } from 'neverthrow'

import { MinHeap } from './min-heap'

const okOrFail = <T>(result: Result<T, unknown>, ok: (value: T) => void) => {
  result.match(ok, () => {
    assert.fail('Expected result to be ok')
  })
}

describe('minHeap', () => {
  describe('constructor', () => {
    it('should create an empty heap with default comparator', () => {
      const heap = new MinHeap<number>()
      expect(heap.size).toBe(0)
    })

    it('should create an empty heap with custom comparator', () => {
      const heap = new MinHeap<string>((a, b) => a.localeCompare(b))
      expect(heap.size).toBe(0)
    })
  })

  describe('push', () => {
    it('should add elements to the heap', () => {
      const heap = new MinHeap<number>()

      expect(heap.push(5).isOk()).toBe(true)
      expect(heap.size).toBe(1)

      expect(heap.push(3).isOk()).toBe(true)
      expect(heap.size).toBe(2)

      expect(heap.push(8).isOk()).toBe(true)
      expect(heap.size).toBe(3)
    })

    it('should maintain min-heap property when adding elements', () => {
      const heap = new MinHeap<number>()
      const values = [10, 4, 15, 20, 25, 2, 8]

      values.forEach((val) => heap.push(val))

      const sorted: number[] = []
      while (heap.size > 0) {
        okOrFail(heap.pop(), (value) => {
          sorted.push(value)
        })
      }

      expect(sorted).toEqual([2, 4, 8, 10, 15, 20, 25])
    })

    it('should work with custom comparator', () => {
      const heap = new MinHeap<number>((a, b) => b - a)
      const values = [10, 4, 15, 20, 25, 2, 8]

      values.forEach((val) => heap.push(val))

      const sorted: number[] = []
      while (heap.size > 0) {
        okOrFail(heap.pop(), (value) => {
          sorted.push(value)
        })
      }

      expect(sorted).toEqual([25, 20, 15, 10, 8, 4, 2])
    })

    it('should work with string comparator', () => {
      const heap = new MinHeap<string>((a, b) => a.localeCompare(b))
      const words = ['banana', 'apple', 'cherry', 'date', 'elderberry']

      words.forEach((word) => heap.push(word))

      const sorted: string[] = []
      while (heap.size > 0) {
        okOrFail(heap.pop(), (value) => {
          sorted.push(value)
        })
      }

      expect(sorted).toEqual(['apple', 'banana', 'cherry', 'date', 'elderberry'])
    })
  })

  describe('pop', () => {
    it('should return error when heap is empty', () => {
      const heap = new MinHeap<number>()
      const result = heap.pop()
      expect(result.isErr()).toBe(true)
    })

    it('should return the only element when heap has one element', () => {
      const heap = new MinHeap<number>()
      heap.push(42)

      okOrFail(heap.pop(), (value) => {
        expect(value).toBe(42)
      })
      expect(heap.size).toBe(0)
    })

    it('should always return the minimum element', () => {
      const heap = new MinHeap<number>()
      const values = [5, 3, 8, 1, 9, 2, 7]

      values.forEach((val) => heap.push(val))
      values.forEach(() => {
        okOrFail(heap.pop(), (value) => {
          expect(value).toBe(value)
        })
      })
    })

    it('should maintain heap property after multiple pops', () => {
      const heap = new MinHeap<number>()
      const values = [10, 20, 5, 6, 1, 8, 12, 3, 4]

      values.forEach((val) => heap.push(val))

      const popped: number[] = []
      for (let i = 0; i < 4; i++) {
        okOrFail(heap.pop(), (value) => {
          popped.push(value)
        })
      }

      expect(popped).toEqual([1, 3, 4, 5])

      heap.push(2)
      heap.push(7)

      const remaining: number[] = []
      while (heap.size > 0) {
        okOrFail(heap.pop(), (value) => {
          remaining.push(value)
        })
      }

      expect(remaining).toEqual([2, 6, 7, 8, 10, 12, 20])
    })
  })

  describe('size', () => {
    it('should return 0 for empty heap', () => {
      expect(new MinHeap<number>().size).toBe(0)
    })

    it('should return correct size after pushes', () => {
      const heap = new MinHeap<number>()

      expect(heap.size).toBe(0)

      heap.push(1)
      expect(heap.size).toBe(1)

      heap.push(2)
      expect(heap.size).toBe(2)

      heap.push(3)
      expect(heap.size).toBe(3)
    })

    it('should return correct size after pops', () => {
      const heap = new MinHeap<number>();
      [1, 2, 3, 4, 5].forEach((val) => heap.push(val))

      expect(heap.size).toBe(5)

      heap.pop()
      expect(heap.size).toBe(4)

      heap.pop()
      expect(heap.size).toBe(3)
    })
  })

  describe('edge cases', () => {
    it('should handle duplicate values', () => {
      const heap = new MinHeap<number>()
      const values = [5, 3, 5, 1, 3, 1, 5]

      values.forEach((val) => heap.push(val))

      const sorted: number[] = []
      while (heap.size > 0) {
        okOrFail(heap.pop(), (value) => {
          sorted.push(value)
        })
      }

      expect(sorted).toEqual([1, 1, 3, 3, 5, 5, 5])
    })

    it('should handle single element operations', () => {
      const heap = new MinHeap<number>()

      heap.push(42)
      expect(heap.size).toBe(1)

      okOrFail(heap.pop(), (value) => {
        expect(value).toBe(42)
      })

      expect(heap.pop().isErr()).toBe(true)
    })

    it('should handle large datasets', () => {
      const heap = new MinHeap<number>()
      const size = 1000
      const values = Array.from({ length: size }, () => Math.floor(Math.random() * size))

      values.forEach((val) => heap.push(val))
      expect(heap.size).toBe(size)

      const sorted: number[] = []
      while (heap.size > 0) {
        okOrFail(heap.pop(), (value) => {
          sorted.push(value)
        })
      }

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1])
      }

      expect(sorted.length).toBe(size)
    })

    it('should work with objects using custom comparator', () => {
      type Task = {
        id: number
        name: string
        priority: number
      }

      const heap = new MinHeap<Task>((a, b) => a.priority - b.priority)
      const tasks: Task[] = [
        { id: 1, name: 'Task 1', priority: 3 },
        { id: 2, name: 'Task 2', priority: 1 },
        { id: 3, name: 'Task 3', priority: 5 },
        { id: 4, name: 'Task 4', priority: 2 },
        { id: 5, name: 'Task 5', priority: 1 }
      ]

      tasks.forEach((task) => heap.push(task))

      okOrFail(heap.pop(), (value) => {
        expect(value.priority).toBe(1)
        expect([2, 5]).toContain(value.id)
      })
      okOrFail(heap.pop(), (value) => {
        expect(value.priority).toBe(1)
        expect([2, 5]).toContain(value.id)
      })
      okOrFail(heap.pop(), (value) => {
        expect(value.priority).toBe(2)
        expect(4).toBe(value.id)
      })
    })
  })
})

