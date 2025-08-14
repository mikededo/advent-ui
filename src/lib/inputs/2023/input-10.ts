export const BENCHMARK_A = `# a solution
» cargo build -p aoc-23 --release && hyperfine ./target/release/aoc-23 -N --warmup 5
Finished \`release\` profile [optimized] target(s) in 0.03s
Benchmark 1: ./target/release/aoc-23
Time (mean ± σ):       6.3 ms ±   2.9 ms    [User: 1.3 ms, System: 1.0 ms]
Range (min … max):     3.1 ms …  37.9 ms    599 runs
`;

export const DEFAULT_MAP = `FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
`;

