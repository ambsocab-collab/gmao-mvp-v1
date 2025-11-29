#!/bin/bash
# Mirror CI execution locally for debugging

echo "🔍 Running CI pipeline locally..."

# Lint
echo "Running lint..."
npm run lint || exit 1

# Tests
echo "Running tests..."
npm run test:e2e || exit 1

# Burn-in (reduced iterations)
echo "Running burn-in (3 iterations)..."
for i in {1..3}; do
  echo "🔥 Burn-in $i/3"
  npm run test:e2e || exit 1
done

echo "✅ Local CI pipeline passed"
