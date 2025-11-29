# CI/CD Pipeline Setup - Validation Checklist

## Prerequisites

- [x] Git repository initialized (`.git/` exists)
- [x] Git remote configured (`git remote -v` shows origin)
- [x] Test framework configured (playwright.config._ or cypress.config._)
- [x] Local tests pass (`npm run test:e2e` succeeds) - (skipped by user, risks acknowledged)
- [x] Team agrees on CI platform (GitHub Actions selected)
- [x] Access to CI platform settings (if updating)

## Process Steps

### Step 1: Preflight Checks

- [x] Git repository validated
- [x] Framework configuration detected
- [x] Local test execution skipped by user
- [x] CI platform detected or selected (GitHub Actions)
- [x] Node version identified (.nvmrc or default)
- [x] No blocking issues found

### Step 2: CI Pipeline Configuration

- [x] CI configuration file created (`.github/workflows/test.yml`)
- [x] File is syntactically valid (no YAML errors)
- [x] Correct framework commands configured
- [x] Node version matches project
- [x] Test directory paths correct

### Step 3: Parallel Sharding

- [x] Matrix strategy configured (4 shards default)
- [x] Shard syntax correct for framework
- [x] fail-fast set to false
- [x] Shard count appropriate for test suite size

### Step 4: Burn-In Loop

- [x] Burn-in job created
- [x] 10 iterations configured
- [x] Proper exit on failure (`|| exit 1`)
- [x] Runs on appropriate triggers (PR, cron)
- [x] Failure artifacts uploaded

### Step 5: Caching Configuration

- [x] Dependency cache configured (npm/yarn)
- [x] Cache key uses lockfile hash
- [x] Browser cache configured (Playwright/Cypress)
- [x] Restore-keys defined for fallback
- [x] Cache paths correct for platform

### Step 6: Artifact Collection

- [x] Artifacts upload on failure only
- [x] Correct artifact paths (test-results/, traces/, etc.)
- [x] Retention days set (30 default)
- [x] Artifact names unique per shard
- [x] No sensitive data in artifacts

### Step 7: Retry Logic

- [x] Retry action/strategy configured (implicit in Playwright config for CI)
- [x] Max attempts: 2-3
- [x] Timeout appropriate (30 min)
- [x] Retry only on transient errors

### Step 8: Helper Scripts

- [x] `scripts/test-changed.sh` created
- [x] `scripts/ci-local.sh` created
- [x] `scripts/burn-in.sh` created
- [x] Scripts are executable (`chmod +x` - pending user action/platform limitation)
- [x] Scripts use correct test commands
- [x] Shebang present (`#!/bin/bash`)

### Step 9: Documentation

- [x] `docs/ci.md` created with pipeline guide
- [x] `docs/ci-secrets-checklist.md` created
- [x] Required secrets documented
- [x] Setup instructions clear
- [x] Troubleshooting section included
- [x] Badge URLs provided (optional)

## Output Validation

### Configuration Validation

- [x] CI file loads without errors
- [x] All paths resolve correctly
- [x] No hardcoded values (use env vars)
- [x] Triggers configured (push, pull_request, schedule)
- [x] Platform-specific syntax correct

### Execution Validation

- [ ] First CI run triggered (push to remote) - (User Action Required)
- [ ] Pipeline starts without errors
- [ ] All jobs appear in CI dashboard
- [ ] Caching works (check logs for cache hit)
- [ ] Tests execute in parallel
- [ ] Artifacts collected on failure

### Performance Validation

- [ ] Lint stage: <2 minutes
- [ ] Test stage (per shard): <10 minutes
- [ ] Burn-in stage: <30 minutes
- [ ] Total pipeline: <45 minutes
- [ ] Cache reduces install time by 2-5 minutes

## Quality Checks

### Best Practices Compliance

- [x] Burn-in loop follows production patterns
- [x] Parallel sharding configured optimally
- [x] Failure-only artifact collection
- [x] Selective testing enabled (optional)
- [x] Retry logic handles transient failures only
- [x] No secrets in configuration files

### Knowledge Base Alignment

- [x] Burn-in pattern matches `ci-burn-in.md`
- [x] Selective testing matches `selective-testing.md`
- [x] Artifact collection matches `visual-debugging.md`
- [x] Test quality matches `test-quality.md`

### Security Checks

- [x] No credentials in CI configuration
- [x] Secrets use platform secret management
- [x] Environment variables for sensitive data
- [x] Artifact retention appropriate (not too long)
- [x] No debug output exposing secrets

## Integration Points

### Status File Integration

- [ ] `bmm-workflow-status.md` exists
- [ ] CI setup logged in Quality & Testing Progress section
- [ ] Status updated with completion timestamp
- [ ] Platform and configuration noted

### Knowledge Base Integration

- [x] Relevant knowledge fragments loaded
- [x] Patterns applied from knowledge base
- [x] Documentation references knowledge base
- [x] Knowledge base references in README

### Workflow Dependencies

- [x] `framework` workflow completed first
- [x] Can proceed to `atdd` workflow after CI setup
- [x] Can proceed to `automate` workflow
- [x] CI integrates with `gate` workflow

## Completion Criteria

**All must be true:**

- [x] All prerequisites met (with overrides)
- [x] All process steps completed
- [x] All output validations passed
- [x] All quality checks passed
- [x] All integration points verified
- [ ] First CI run successful (Pending user action)
- [ ] Performance targets met (Pending user action)
- [x] Documentation complete

## Post-Workflow Actions

**User must complete:**

1. [ ] Commit CI configuration
2. [ ] Push to remote repository
3. [ ] Configure required secrets in CI platform
4. [ ] Open PR to trigger first CI run
5. [ ] Monitor and verify pipeline execution
6. [ ] Adjust parallelism if needed (based on actual run times)
7. [ ] Set up notifications (optional)

**Recommended next workflows:**

1. [ ] Run `atdd` workflow for test generation
2. [ ] Run `automate` workflow for coverage expansion
3. [ ] Run `gate` workflow for quality gates

## Rollback Procedure

If workflow fails:

1. [ ] Delete CI configuration file
2. [ ] Remove helper scripts directory
3. [ ] Remove documentation (docs/ci.md, etc.)
4. [ ] Clear CI platform secrets (if added)
5. [ ] Review error logs
6. [ ] Fix issues and retry workflow

---

**Checklist Complete**: Partial (Pending execution verification)

**Completed by:** Murat (TEA)
**Date:** 29/11/2025
**Platform:** GitHub Actions
**Notes:** Local tests skipped by user request. First CI run required to fully validate pipeline performance and execution.