# Development Workflow Commands
# Custom slash commands for GMAO MVP development cycle

## Story-Level Commands

### /test-story
**Description:** Run tests for a specific story
**Usage:** `/test-story <story_number>`
**Examples:**
- `/test-story 1.1` → Run all Story 1.1 tests
- `/test-story 1.2` → Run all Story 1.2 tests
- `/test-story 1.3` → Run all Story 1.3 tests

**Implementation:**
```bash
# Extract story number and run specific tests
npm run test:e2e -- story-1-${story_number}-*.spec.ts
```

### /test-ac
**Description:** Run tests for specific acceptance criteria
**Usage:** `/test-ac <story_number> <ac_number>`
**Examples:**
- `/test-ac 1.3 1` → Run AC1 tests for Story 1.3
- `/test-ac 1.3 2` → Run AC2 tests for Story 1.3
- `/test-ac 1.3 all` → Run all AC tests for Story 1.3

**Implementation:**
```bash
npm run test:e2e -- story-1-${story_number}-*.spec.ts --grep "AC${ac_number}"
```

## Feature-Level Commands

### /test-auth
**Description:** Run all authentication-related tests
**Usage:** `/test-auth`
**Covers:** Login, logout, sessions, permissions, RBAC

**Implementation:**
```bash
npm run test:e2e -- --grep "auth|Auth|login|Login|logout|Logout|session|Session|permission|Permission|rbac|RBAC"
```

### /test-admin
**Description:** Run all admin panel and user management tests
**Usage:** `/test-admin`
**Covers:** Invitation, role assignment, user management

**Implementation:**
```bash
npm run test:e2e -- --grep "admin|Admin|invitation|Invitation|role|Role|manage|Manage"
```

### /test-ui
**Description:** Run industrial UI and design system tests
**Usage:** `/test-ui`
**Covers:** Touch targets, contrast, tablet optimization, accessibility

**Implementation:**
```bash
npm run test:e2e -- --grep "industrial|Industrial|touch|Touch|contrast|Contrast|tablet|Tablet|button|Button|target|Target"
```

## Priority-Based Commands

### /test-smoke
**Description:** Quick smoke test - critical path validation
**Usage:** `/test-smoke`
**Purpose:** Fast daily sanity check (under 1 minute)
**Covers:** Core functionality, basic authentication, critical flows

**Implementation:**
```bash
npm run test:e2e -- --grep "smoke|Smoke|p0|P0|critical|Critical|must-pass|must_pass"
```

### /test-critical
**Description:** All P0 and critical functionality tests
**Usage:** `/test-critical`
**Purpose:** Pre-deploy validation (2-3 minutes)
**Covers:** Authentication, core features, must-pass scenarios

**Implementation:**
```bash
npm run test:e2e -- --grep "p0|P0|critical|Critical|must|Must|essential|Essential"
```

### /test-priority
**Description:** Run tests by priority level
**Usage:** `/test-priority <level>`
**Examples:**
- `/test-priority p0` → Critical path tests
- `/test-priority p1` → Important features
- `/test-priority p2` -> Nice-to-have features

**Implementation:**
```bash
npm run test:e2e -- --grep "P${level}|p${level}"
```

## Workflow Integration Commands

### /dev-start
**Description:** Start development session with validation
**Usage:** `/dev-start <story_number>`
**Purpose:** Quick morning check that everything works before coding
**Example:** `/dev-start 1.3`

**Implementation:**
```bash
echo "🌅 Morning Dev Check - Story ${story_number}"
npm run test:smoke
npm run test:story-${story_number}
echo "✅ Ready to start development on Story ${story_number}"
```

### /dev-check
**Description:** Validate current work before committing
**Usage:** `/dev-check <story_number>`
**Purpose:** Ensure current implementation doesn't break anything

**Implementation:**
```bash
echo "🔍 Pre-commit Validation - Story ${story_number}"
npm run test:smoke
npm run test:story-${story_number}
npm run test:auth  # If story involves auth
npm run lint
echo "✅ Safe to commit Story ${story_number} changes"
```

### /pr-ready
**Description:** Full validation before creating PR
**Usage:** `/pr-ready <story_number>`
**Purpose:** Complete testing before pull request

**Implementation:**
```bash
echo "🚀 PR Ready Validation - Story ${story_number}"
npm run test:critical
npm run test:story-${story_number}
npm run test:auth
npm run build
npm run lint
echo "✅ Story ${story_number} ready for PR"
```

### /deploy-check
**Description:** Complete pre-deployment validation
**Usage:** `/deploy-check`
**Purpose:** Final validation before deploying to any environment

**Implementation:**
```bash
echo "🔒 Pre-deploy Full Validation"
npm run test:e2e
npm run build
npm run test:unit
echo "✅ Safe to deploy"
```

## Debug and Troubleshooting Commands

### /test-debug
**Description:** Run specific test in debug mode
**Usage:** `/test-debug <test_pattern>`
**Examples:**
- `/test-debug invitation email` → Debug invitation email tests
- `/test-debug admin login` → Debug admin login tests
- `/test-debug AC1` → Debug AC1 tests

**Implementation:**
```bash
npm run test:e2e -- --debug --grep "${test_pattern}"
```

### /test-headed
**Description:** Run tests with visible browser
**Usage:** `/test-headed <test_pattern>`
**Purpose:** Debug UI issues with visual feedback

**Implementation:**
```bash
npm run test:e2e -- --headed --grep "${test_pattern}"
```

### /test-failed
**Description:** Re-run only failed tests from last run
**Usage:** `/test-failed`

**Implementation:**
```bash
npm run test:e2e -- --repeat-each --only-failures
```

## Status and Reporting Commands

### /test-status
**Description:** Show current test status and coverage
**Usage:** `/test-status`

**Implementation:**
```bash
echo "📊 Current Test Status"
echo "======================"
npm run test:e2e -- --reporter=list --pass-with-no-tests
echo ""
echo "📈 Coverage Report (if available)"
npm run test:coverage 2>/dev/null || echo "Coverage not configured"
```

### /test-health
**Description:** Overall test suite health check
**Usage:** `/test-health`

**Implementation:**
```bash
echo "🏥 Test Suite Health Check"
echo "========================"
npm run test:smoke && echo "✅ Smoke tests: PASSING" || echo "❌ Smoke tests: FAILING"
npm run test:critical && echo "✅ Critical tests: PASSING" || echo "❌ Critical tests: FAILING"
npm run lint && echo "✅ Linting: PASSING" || echo "❌ Linting: FAILING"
npm run build && echo "✅ Build: PASSING" || echo "❌ Build: FAILING"
```

## ATDD Integration Commands

### /atdd-run
**Description:** Run ATDD for a specific story
**Usage:** `/atdd-run <story_number>`
**Purpose:** Execute complete ATDD workflow for story validation

**Implementation:**
```bash
echo "🧪 ATDD Workflow - Story ${story_number}"
/bmad:bmm:agents:tea
*atdd story ${story_number}
```

### /atdd-validate
**Description:** Validate story implementation against ATDD checklist
**Usage:** `/atdd-validate <story_number>`

**Implementation:**
```bash
echo "✅ ATDD Validation - Story ${story_number}"
npm run test:story-${story_number}
echo "📋 Check ATDD checklist: docs/atdd-checklist-${story_number}.md"
```

## Package.json Scripts Addition

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test:smoke": "npm run test:e2e -- --grep 'smoke|Smoke|p0|P0|critical|Critical|must-pass|must_pass'",
    "test:critical": "npm run test:e2e -- --grep 'p0|P0|critical|Critical|must|Must|essential|Essential'",
    "test:story-1-1": "npm run test:e2e -- story-1-1-*.spec.ts",
    "test:story-1-2": "npm run test:e2e -- story-1-2-*.spec.ts",
    "test:story-1-3": "npm run test:e2e -- story-1-3-*.spec.ts",
    "test:auth": "npm run test:e2e -- --grep 'auth|Auth|login|Login|logout|Logout|session|Session|permission|Permission|rbac|RBAC'",
    "test:admin": "npm run test:e2e -- --grep 'admin|Admin|invitation|Invitation|role|Role|manage|Manage'",
    "test:ui": "npm run test:e2e -- --grep 'industrial|Industrial|touch|Touch|contrast|Contrast|tablet|Tablet|button|Button|target|Target'",
    "test:priority": "npm run test:e2e -- --grep 'P%1|p%1'",
    "dev:validate": "npm run test:smoke && npm run lint",
    "pr:validate": "npm run test:critical && npm run build && npm run lint"
  }
}
```

## Usage Examples for Daily Workflow

### Morning Routine:
```bash
/dev-start 1.3      # Quick validation + story tests ready
```

### During Development:
```bash
/test-ac 1.3 2      # Test specific AC during implementation
/test-debug "invitation form"  # Debug specific feature
/test-smoke         # Quick sanity check
```

### Before Commit:
```bash
/dev-check 1.3      # Validate current work
```

### Before PR:
```bash
/pr-ready 1.3       # Full validation for PR
```

### Before Deploy:
```bash
/deploy-check       # Complete pre-deploy validation
```

## Integration with Existing BMAD Commands

These commands work seamlessly with your existing BMAD workflow:

```bash
# Development workflow integration
/bmad:bmm:agents:tea     # For testing expertise
*atdd story 1.4          # Create new tests
*test-review              # Review existing tests
/pr-ready 1.3             # Validate before PR
*party-mode               # When stuck on complex issues
```

## Customization Options

### Environment-Specific Execution:
```bash
/test-story 1.3 --env=dev     # Development environment
/test-story 1.3 --env=staging  # Staging environment
/test-story 1.3 --env=prod     # Production environment
```

### Browser-Specific Testing:
```bash
/test-story 1.3 --browser=chrome     # Chrome only
/test-story 1.3 --browser=firefox    # Firefox only
/test-story 1.3 --browser=all        # All browsers
```

### Parallel Execution:
```bash
/test-story 1.3 --parallel     # Run tests in parallel
/test-story 1.3 --workers=4    # Specify number of workers
```

## Troubleshooting Guide

### Common Issues:
1. **Tests timing out:** Use `/test-debug` to identify slow tests
2. **Flaky tests:** Use `/test-failed` to retry only failures
3. **UI issues:** Use `/test-headed` for visual debugging
4. **Environment issues:** Check `/test-health` for overall status

### Performance Tips:
- Use `/test-smoke` for frequent validation (fast)
- Use `/test-critical` before commits (medium)
- Use full test suite only in CI/CD (comprehensive)