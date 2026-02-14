export const BENCHMARK_A = `» cargo build -p aoc-23 --release && hyperfine ./target/release/aoc-23 -N --warmup 5
Benchmark 1: ./target/release/aoc-23
Time (mean ± σ):       6.3 ms ±   2.9 ms    [User: 1.3 ms, System: 1.0 ms]
Range (min … max):     3.1 ms …  37.9 ms    599 runs
`

export const BENCHMARK_B = `» cargo build -p aoc-23 --release && hyperfine ./target/release/aoc-23 -N --warmup 5
Benchmark 1: ./target/release/aoc-23
Time (mean ± σ):       5.4 ms ±   2.6 ms    [User: 1.3 ms, System: 1.0 ms]
Range (min … max):     3.4 ms …  30.9 ms    337 runs
`

export const DEFAULT_MAP = `.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`

