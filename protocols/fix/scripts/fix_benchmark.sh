#!/bin/bash

THREADS=16
RATE=1000000
DURATION=300

FIX_ENGINE="./bin/quickfix_benchmark"
CONFIG_FILE="./config/benchmark.cfg"

for EXCHANGE in binance cme nyse; do
  echo "Benchmarking $EXCHANGE connection..."
  
  $FIX_ENGINE \
    --config $CONFIG_FILE \
    --threads $THREADS \
    --rate $RATE \
    --duration $DURATION \
    --exchange $EXCHANGE \
    --output "results/${EXCHANGE}_perf.log" &
done

wait

echo "Processing results..."
python ./scripts/analyze_results.py --input-dir ./results