import type { MatrixCanvasHelper } from '$lib/utils'
import type { Result } from 'neverthrow'

import { toast } from 'svelte-sonner'

import { DEFAULT_MAP } from '$lib/inputs/2022/input-12'
import { COLOR_MAP, getFontStyle, matrixCanvasHelper, sleep } from '$lib/utils'
import { MinHeap } from '$lib/utils/structs'

type Letters = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
type Cell = '—' | '|' | '┌' | '┐' | '└' | '┘' | 'E' | 'S' | Letters
type Direction = 'Down' | 'Left' | 'Right' | 'Up'

export const CONTAINER_ID = 'container'
const CELL_SIZE = 20

const LETTER_COLORS = Array.from(
  { length: 26 },
  (_, i) => String.fromCharCode(97 + i) as Letters
).reduce((acc, c) => ({ ...acc, [c]: COLOR_MAP.gray }), {} as Record<Letters, string>)
const REST_COLORS: Record<Exclude<Cell, Letters>, string> = {
  '—': COLOR_MAP.gray,
  '|': COLOR_MAP.gray,
  '┌': COLOR_MAP.gray,
  '┐': COLOR_MAP.gray,
  '└': COLOR_MAP.gray,
  '┘': COLOR_MAP.gray,
  E: COLOR_MAP.green,
  S: COLOR_MAP.indigo
}

const CORNER_MAP: Record<string, Cell> = {
  'Down-Left': '┘',
  'Down-Right': '└',
  'Left-Down': '┌',
  'Left-Up': '└',
  'Right-Down': '┐',
  'Right-Up': '┘',
  'Up-Left': '┐',
  'Up-Right': '┌'
}

type Data = {
  input?: Cell[][]
  matrix?: MatrixCanvasHelper<Cell>
  graph?: {
    end: Point
    graph: Map<string, Point[]>
    start: Point
  }
}
const data: Data = {}

type State = {
  running: boolean
  data: {
    minDist: number
    visited: number
  }
}
export const algorithmState = $state<State>({
  data: { minDist: 0, visited: 0 },
  running: false
})

const getGraphNode = ([x, y]: Point) => `${x},${y}`

const canBeEdgeA = (curr: Cell, next: Cell) => {
  const _curr = curr === 'S' ? 'a' : curr
  const _next = next === 'E' ? 'z' : next

  return _next.charCodeAt(0) - _curr.charCodeAt(0) <= 1
}

const canBeEdgeB = (curr: Cell, next: Cell) => {
  const _curr = curr === 'S' ? 'a' : curr
  const _next = next === 'E' ? 'z' : next

  return _curr.charCodeAt(0) - _next.charCodeAt(0) <= 1
}

type CreateGraphArgs = {
  canBeEdge: (a: Cell, b: Cell) => boolean
  isEnd: (cell: Cell) => boolean
  isStart: (cell: Cell) => boolean
  map: Cell[][]
}
const createGraph = ({ canBeEdge, isEnd, isStart, map }: CreateGraphArgs) => {
  const start: Point = [-1, -1]
  const end: Point = [-1, -1]
  const graph = new Map<string, Point[]>()

  map.forEach((row, x) => {
    row.forEach((cell, y) => {
      const edges: Point[] = []

      if (isStart(cell)) {
        start[0] = x
        start[1] = y
      }
      if (isEnd(cell)) {
        end[0] = x
        end[1] = y
      }

      if (x > 0 && canBeEdge(cell, map[x - 1][y])) {
        edges.push([x - 1, y])
      }
      if (x < map.length - 1 && canBeEdge(cell, map[x + 1][y])) {
        edges.push([x + 1, y])
      }
      if (y > 0 && canBeEdge(cell, map[x][y - 1])) {
        edges.push([x, y - 1])
      }
      if (y < row.length - 1 && canBeEdge(cell, map[x][y + 1])) {
        edges.push([x, y + 1])
      }

      graph.set(getGraphNode([x, y]), edges)
    })
  })

  return { end, graph, start }
}

const getCurrentMove = (dx: number, dy: number): [Cell, Direction] => {
  if (dx > 0) {
    return ['|', 'Down']
  }
  if (dx < 0) {
    return ['|', 'Up']
  }
  if (dy > 0) {
    return ['—', 'Right']
  }

  return ['—', 'Left']
}

const getDirection = (
  current: Point,
  next: null | Point,
  direction: Direction | null
): [Cell, Direction | null] => {
  if (!next) {
    return ['E', null]
  }

  const [cx, cy] = current
  const [nx, ny] = next

  const [char, currDir] = getCurrentMove(nx - cx, ny - cy)
  if (direction && direction !== currDir) {
    const cornerChar = CORNER_MAP[`${direction}-${currDir}`]

    if (cornerChar) {
      return [cornerChar, currDir]
    }
  }

  return [char, currDir]
}

type FindShortestArgs = {
  delay: number
  graph: Map<string, Point[]>
  start: Point
  isEndFound: (point: Point) => boolean
}
const findShortest = async ({
  delay,
  graph,
  isEndFound,
  start
}: FindShortestArgs) => {
  // Basically a copy from the rust solution
  const queue = new MinHeap<[dist: number, point: Point]>(
    ([aDist], [bDist]) => aDist - bDist
  )
  const track = new Map<string, number>()
  const parent = new Map<string, null | Point>()

  track.set(getGraphNode(start), 0)
  queue.push([0, start])
  parent.set(getGraphNode(start), null)

  let result: Result<[number, Point], void> = queue.pop()
  let minDist = Infinity
  let end: null | Point = null
  while (result.isOk()) {
    const [dist, point] = result.value
    const prevDist = track.get(getGraphNode(point))

    algorithmState.data.visited += 1

    if (delay > 0) {
      await sleep(delay)
    }

    data.matrix?.fillRect({
      cell: data.input![point[0]][point[1]],
      drawOptions: { bgFillStyle: COLOR_MAP.orange },
      x: point[0],
      y: point[1]
    })

    if (prevDist) {
      if (dist > prevDist) {
        continue
      }
    }

    if (isEndFound(point)) {
      minDist = Math.min(minDist, dist)
      algorithmState.data.minDist = minDist
      end = point
      break
    }

    for (const next of graph.get(getGraphNode(point)) || []) {
      const cost = dist + 1
      const nextCost = track.get(getGraphNode(next)) ?? Infinity
      if (cost < nextCost) {
        queue.push([cost, next])
        track.set(getGraphNode(next), cost)
        parent.set(getGraphNode(next), point)
      }
    }

    result = queue.pop()
  };

  return { end: end!, minDist, parent }
}

type StartArgs = {
  delay?: number
  variant?: ProblemVariant
}
export const start = async ({
  delay = 30,
  variant = 'a'
}: StartArgs = {}) => {
  if (!data.graph) {
    toast.error('Graph not generated')
    return
  }

  const { end, graph, start } = data.graph
  const { end: endFound, minDist, parent } = await findShortest({
    delay,
    graph,
    isEndFound: (point) => {
      if (variant === 'a') {
        return point[0] === end[0] && point[1] === end[1]
      }

      return data.input?.[point[0]][point[1]] === 'a'
    },
    start
  })

  const path: Point[] = []
  let current: null | Point = endFound
  while (current !== null) {
    path.unshift(current)
    current = parent.get(getGraphNode(current)) || null
  }

  let prevDirection: Direction | null = null
  for (let i = 0; i < path.length; i++) {
    const [x, y] = path[i]
    let [cell, dir]: [Cell, Direction | null] = getDirection(path[i], path[i + 1], prevDirection)

    if (i === path.length - 1) {
      cell = variant === 'a' ? 'E' : 'a'
    }

    data.matrix?.fillRect({
      cell: i === 0 ? variant === 'a' ? 'S' : 'E' : cell,
      drawOptions: { bgFillStyle: COLOR_MAP.red },
      x,
      y
    })

    prevDirection = dir
    await sleep(10)
  }

  return { distance: minDist, path }
}

type GenerateArgs = {
  input?: string
  variant?: ProblemVariant
  onComplete?: () => void
}
export const generateInput = ({
  onComplete,
  variant = 'a',
  ...args
}: GenerateArgs = {}) => {
  data.input = undefined
  data.matrix = undefined
  data.graph = undefined

  algorithmState.data.minDist = 0
  algorithmState.data.visited = 0

  const container = document.getElementById(CONTAINER_ID)
  if (!container) {
    return
  }

  const input = args.input ? args.input : DEFAULT_MAP.trim()
  data.input = input.split('\n').map((row) => row.split('')) as Cell[][]
  data.graph = createGraph({
    canBeEdge: variant === 'a' ? canBeEdgeA : canBeEdgeB,
    isEnd: (cell) => variant === 'a' && cell === 'E',
    isStart: (cell) => variant === 'a' ? cell === 'S' : cell === 'E',
    map: data.input
  })
  data.matrix = matrixCanvasHelper<Cell>({
    options: {
      cellColors: {
        ...LETTER_COLORS,
        ...REST_COLORS
      },
      cellSize: CELL_SIZE,
      cellTextColors: COLOR_MAP.background,
      drawOptions: {
        font: getFontStyle(CELL_SIZE * 0.75)
      },
      input: data.input
    },
    root: container
  })

  if (!data.matrix) {
    toast.error('Unable to render the matrix')
    return
  }

  data.matrix.renderMatrix({ onComplete })
}

