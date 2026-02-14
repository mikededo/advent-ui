import * as v from 'valibot'

import { sleep } from '$lib/utils'

type Data = { controller?: AbortController }
const data: Data = { controller: undefined }

type State = {
  running: boolean
  stacks: string[][]
  movesQueue: MoveType[]
}
export const algorithmState = $state<State>({
  movesQueue: [],
  running: false,
  stacks: []
})

type MoveType = v.InferOutput<typeof MoveSchema>
const MoveSchema = v.pipe(
  v.string(),
  v.regex(/^move (\d+) from (\d+) to (\d+)$/, 'Invalid move format'),
  v.transform((str) => {
    const match = str.match(/^move (\d+) from (\d+) to (\d+)$/)
    if (!match) {
      throw new Error('Invalid format')
    }

    return {
      amount: Number.parseInt(match[1], 10),
      // Remove 1 to make them 0-based
      from: Number.parseInt(match[2], 10) - 1,
      to: Number.parseInt(match[3], 10) - 1
    }
  }),
  v.object({ amount: v.number(), from: v.number(), to: v.number() })
)

type ExecuteMovesArgs = {
  delay: number
  stacks: string[][]
  variant: ProblemVariant
  moves: MoveType[]
  movesQueue: MoveType[]
}
/**
 * This function is not pure, as it will modify the `stacks` and `movesQueue`
 * array. The idea is that it can either be used with `algorithmState` or any
 * other array. If the state is provided, any change will update the state.
 * Taking advantage of JS's reference system, even though non-pure functions
 * are not something to be used, unless known.
 */
const executeMoves = async ({
  delay,
  moves,
  movesQueue,
  stacks,
  variant
}: ExecuteMovesArgs) => {
  for (const { amount, from, to } of moves) {
    if (delay > 0 && variant === 'b') {
      await sleep(delay * 10, { signal: data.controller?.signal })
    }

    movesQueue.unshift({ amount, from, to })
    if (variant === 'b') {
      const rowLength = stacks[from].length
      stacks[to].push(
        ...stacks[from].splice(Math.max(1, rowLength - amount), amount + 1)
      )
      continue
    }

    // Execute the move <amount> times
    for (let i = 0; i < amount; i++) {
      if (delay > 0 && variant === 'a') {
        await sleep(delay * 10, { signal: data.controller?.signal })
      }

      if (stacks[from].length === 1) {
        break
      }

      stacks[to].push(stacks[from].pop()!)
    }
  }
}

type GenerateArgs = {
  delay: number
  stacks: string
  variant: ProblemVariant
  moves: string
}
export const start = async ({ delay, moves, stacks, variant }: GenerateArgs) => {
  data?.controller?.abort()

  algorithmState.movesQueue = []
  algorithmState.stacks = []
  algorithmState.running = true
  data.controller = new AbortController()

  // Parse the stacks
  const parsedStacks: string[][] = []
  const stackLines = stacks.split('\n')
  stackLines.forEach((line, i) => {
    for (let w = 0; w < line.length / 4; w++) {
      const start = w * 4
      const value = line.slice(start, start + 3)[1]

      if (i === 0) {
        parsedStacks.push([])
      }

      if (value.trim()) {
        // Unshift to add to the bottom of the stack
        parsedStacks[w].unshift(value)
      }
    }
  })

  algorithmState.stacks = parsedStacks

  // move <amout> from <stack-1> to <stack-2>
  const parsedMoves = moves.split('\n').map((line) => v.parse(MoveSchema, line.trim()))

  // If delay is 0, execute the moves and only update the state at the end
  if (delay === 0) {
    const movesQueue: MoveType[] = []
    await executeMoves({
      delay,
      moves: parsedMoves,
      movesQueue,
      stacks: parsedStacks,
      variant
    })

    algorithmState.movesQueue = movesQueue
    algorithmState.stacks = parsedStacks
    return
  }

  await executeMoves({
    delay,
    moves: parsedMoves,
    movesQueue: algorithmState.movesQueue,
    stacks: algorithmState.stacks,
    variant
  })
  algorithmState.running = false
}

export const cancel = () => {
  data.controller?.abort()
  algorithmState.running = false
  algorithmState.movesQueue = []
  algorithmState.stacks = []
}
