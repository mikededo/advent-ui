export const BENCHMARK_A = `» cargo build -p aoc-22 --release && hyperfine ./target/release/aoc-22 -N --warmup 5
Benchmark 1: ./target/release/aoc-22
Time (mean ± σ):       4.8 ms ±   1.7 ms    [User: 1.1 ms, System: 0.9 ms]
Range (min … max):     3.1 ms …  18.5 ms    511 runs`;

export const BENCHMARK_B = `» cargo build -p aoc-23 --release && hyperfine ./target/release/aoc-23 -N --warmup 5
Benchmark 1: ./target/release/aoc-22
Time (mean ± σ):       5.8 ms ±   4.0 ms    [User: 1.2 ms, System: 1.0 ms]
Range (min … max):     3.2 ms …  55.5 ms    421 runs`;
