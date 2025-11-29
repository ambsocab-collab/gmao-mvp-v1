# CI/CD Pipeline Guide

## Overview
This project uses GitHub Actions for Continuous Integration and Continuous Delivery. The pipeline is designed to ensure high code quality and reliable test execution through parallel sharding and flaky test detection.

## Pipeline Stages

1. **Lint**: Runs `npm run lint` to check for code style and potential errors.
2. **Test**: Executes E2E tests using Playwright in parallel shards (4 shards by default). This significantly reduces execution time.
3. **Burn-in**: Runs on Pull Requests and Weekly Schedules. Executes the test suite 10 times in a loop to detect flaky tests. If any iteration fails, the job fails.
4. **Report**: Aggregates results and provides a summary.

## Local Execution
You can mirror the CI pipeline locally using the helper script:

```bash
./scripts/ci-local.sh
```

This will run linting, tests, and a reduced burn-in loop (3 iterations).

## Flaky Test Detection (Burn-in)
To run the burn-in loop locally:

```bash
./scripts/burn-in.sh [iterations]
# Example: ./scripts/burn-in.sh 5
```

## Debugging Failures
- **Artifacts**: If tests fail in CI, download the artifacts (traces, videos, screenshots) from the GitHub Actions summary page.
- **Sharding**: Identify which shard failed and run only those tests locally if possible.

## Secrets
Refer to `docs/ci-secrets-checklist.md` for required secrets configuration.
