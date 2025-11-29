#!/bin/bash
# Standalone burn-in execution
ITERATIONS=${1:-10}

echo "🔥 Starting burn-in loop ($ITERATIONS iterations)"

for i in $(seq 1 $ITERATIONS); do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔥 Burn-in iteration $i/$ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npm run test:e2e || exit 1
done

echo "✅ Burn-in complete - no flaky tests detected"
