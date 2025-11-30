# ATDD Implementation Checklist - Story 1.1: Project Setup & Initial Infrastructure

**Status**: Tests Created - **RED Phase Active** 🔴
**Story ID**: 1.1-project-setup-initial-infrastructure
**Primary Test Level**: Infrastructure Validation
**Date Generated**: 2025-11-29
**Author**: Murat (Test Architect) - BMad ATDD Workflow

---

## Story Overview

**As a** developer,
**I want** a working Next.js project with Supabase integration and basic UI components,
**so that** I can start building features immediately.

**Acceptance Criteria**: 5 total
- **AC1**: Setup Initialization (Next.js 15 + App Router + Supabase)
- **AC2**: Dependencies Installation (Tailwind + Shadcn/UI + Lucide + TanStack + Zustand)
- **AC3**: Code Quality Setup (ESLint + Prettier)
- **AC4**: PWA Configuration (next-pwa + manifest + service worker)
- **AC5**: Project Structure (proper directory layout)

---

## Test Strategy - Hybrid Approach

**Note**: This Story represents infrastructure setup rather than user-facing functionality. Traditional ATDD acceptance tests would be inappropriate. Instead, we've created **infrastructure validation tests** that must fail initially (RED phase) and pass only when proper infrastructure is implemented.

### Test Levels Applied

- **Infrastructure Validation**: Primary focus - validates technical setup
- **API Tests**: Validates dependency configurations and integration points
- **Future ATDD Preparation**: Foundation laid for upcoming user stories with actual functionality

---

## Failing Tests Created - RED Phase 🔴

### E2E Infrastructure Validation Tests
**File**: `tests/validation/project-setup-validation-p0.spec.ts`
**Tests**: 8 total

| Test | Validates | Expected Failure Reason |
|------|-----------|------------------------|
| `AC1: Next.js project initialization` | Next.js 15 + App Router + Supabase | App not running, Supabase not configured |
| `AC2: Core dependencies configuration` | Tailwind + Shadcn/UI + Icons | Dependencies not installed, components missing |
| `AC3: ESLint and Prettier configuration` | Code quality tools | Config files missing, linting errors |
| `AC4: PWA configuration` | PWA manifest + service worker | manifest.json missing, no service worker |
| `AC5: Project structure validation` | Directory layout | Required directories/files not created |
| `Build process validation` | `npm run build` success | Build failures due to missing configuration |
| `Environment variables validation` | Supabase env vars | `.env` file missing or incomplete |
| `TypeScript strict mode validation` | `npx tsc --noEmit --strict` | TypeScript errors, strict mode disabled |

### API Dependency Validation Tests
**File**: `tests/api/dependencies/dependency-check-p0.spec.ts`
**Tests**: 6 total

| Test | Validates | Expected Failure Reason |
|------|-----------|------------------------|
| Tailwind CSS 3.4+ configuration | Tailwind setup + theme | Tailwind not configured |
| Shadcn/UI components availability | Component library | Shadcn not installed |
| Lucide React icons | Icon system | Lucide not available |
| TanStack Query v5 setup | Server state management | Query client not configured |
| Zustand client state setup | Client state management | Store not created |
| Integration validation | All dependencies working together | Conflicts or missing integrations |

---

## Supporting Infrastructure Created

### Test Fixtures
**File**: `tests/support/fixtures/infrastructure.fixture.ts`
- `testEnvironment`: Environment configuration utilities
- `projectStructure`: Required directory/file validation
- `dependencyChecker`: Dependency validation utilities
- `buildValidator`: Build and TypeScript checking
- `mockData`: Future GMAO application data generators

### Data Factories
**File**: `tests/support/factories/infrastructure-factory.ts`
- `createEnvironmentConfig()`: Test environment configurations
- `createDependencyInfo()`: Dependency status factories
- `createBuildResult()`: Build result simulations
- `createProjectStructure()`: Structure validation objects
- **Future GMAO Prep**: `createGmaoAsset()`, `createGmaoUser()`, `createGmaoOrder()`

### API Validation Helper
**File**: `tests/support/helpers/api-validation-helper.ts`
- `APIValidationHelper`: Comprehensive endpoint validation
- `validateInfrastructureEndpoints()`: Batch endpoint testing
- `validateEnvironmentVariables()`: Environment validation
- `validateBuildProcess()`: Build process testing
- `runFullInfrastructureValidation()`: Complete validation suite

---

## Implementation Checklist for DEV Team

### Phase 1: Core Infrastructure Setup
**RED → GREEN Transition**

#### Acceptance Criterion 1: Setup Initialization
- [ ] Initialize Next.js 15 project with App Router
  ```bash
  npx create-next-app@latest . --example with-supabase
  ```
- [ ] Verify Next.js 15 and App Router are working
- [ ] Configure Supabase client connection
- [ ] Test basic Supabase integration
- [ ] Add `data-testid="supabase-status"` indicator
- [ ] **Test**: `npm run test:e2e -- project-setup-validation-p0.spec.ts`

#### Acceptance Criterion 2: Dependencies Installation
- [ ] Install and configure Tailwind CSS 3.4+
  ```bash
  npm install tailwindcss@^3.4.1 postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Set up Shadcn/UI components library
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button input label
  ```
- [ ] Install Lucide React for icons
  ```bash
  npm install lucide-react
  ```
- [ ] Install TanStack Query v5
  ```bash
  npm install @tanstack/react-query@^5
  ```
- [ ] Install Zustand for client state
  ```bash
  npm install zustand
  ```
- [ ] Add `data-testid="shadcn-button"` and `data-testid="lucide-icon"`
- [ ] Configure TanStack Query devtools with `data-testid="react-query-devtools"`
- [ ] **Test**: `npm run test:e2e -- dependency-check-p0.spec.ts`

#### Acceptance Criterion 3: Code Quality Setup
- [ ] Configure ESLint for TypeScript
  ```bash
  npm install eslint @eslint/eslintrc eslint-config-next
  ```
- [ ] Configure Prettier formatting
  ```bash
  npm install prettier
  ```
- [ ] Create `.prettierrc` configuration file
- [ ] Add `data-testid="eslint-status"` and `data-testid="prettier-status"`
- [ ] **Test**: `npm run test:e2e -- project-setup-validation-p0.spec.ts`

#### Acceptance Criterion 4: PWA Configuration
- [ ] Install and configure next-pwa
  ```bash
  npm install next-pwa
  ```
- [ ] Generate PWA manifest.json configuration
- [ ] Configure service worker for static asset caching
- [ ] Add PWA indicators to home page
- [ ] **Test**: `npm run test:e2e -- project-setup-validation-p0.spec.ts`

#### Acceptance Criterion 5: Project Structure
- [ ] Create `app/(auth)` directory for authentication routes
- [ ] Create `app/(dashboard)` directory for protected routes
- [ ] Set up `components/` directory structure:
  - `components/ui/` (Shadcn components)
  - `components/assets/` (Asset management components)
  - `components/orders/` (Order management components)
  - `components/canvas/` (Canvas/drawing components)
  - `components/shared/` (Shared utilities)
- [ ] Create `lib/` directory for utilities and hooks
  - `lib/supabase.ts` (Supabase client)
- [ ] Set up `types/` directory for TypeScript definitions
  - `types/database.ts` (Database types from Supabase)
- [ ] **Test**: `npm run test:e2e -- project-setup-validation-p0.spec.ts`

### Phase 2: Validation API Endpoints
**Supporting Infrastructure for Tests**

These API endpoints should be created to support the validation tests:

- [ ] `GET /api/validate/tailwind` - Validate Tailwind configuration
- [ ] `GET /api/validate/shadcn` - Validate Shadcn/UI setup
- [ ] `GET /api/validate/lucide` - Validate Lucide React icons
- [ ] `GET /api/validate/tanstack-query` - Validate TanStack Query
- [ ] `GET /api/validate/zustand` - Validate Zustand setup
- [ ] `GET /api/validate/integration` - Validate all dependencies work together
- [ ] `GET /api/env-validation` - Validate environment variables
- [ ] `GET /api/architecture-validation` - Validate project structure
- [ ] `POST /api/type-check` - Run TypeScript validation
- [ ] `POST /api/build` - Run build process
- [ ] `GET /api/check-file?path=X` - Check if specific file exists

### Phase 3: Verification & Cleanup
**GREEN Phase Verification**

- [ ] Run all infrastructure tests: `npm run test:e2e`
- [ ] Verify all tests pass (GREEN phase achieved)
- [ ] Run build process: `npm run build` (should succeed)
- [ ] Run type checking: `npx tsc --noEmit --strict` (should pass)
- [ ] Verify PWA installation works on mobile/tablet
- [ ] Confirm all `data-testid` attributes are present

---

## Red-Green-Refactor Workflow

### RED Phase ✅ COMPLETE
- **Infrastructure validation tests created and failing**
- **API dependency tests created and failing**
- **Supporting infrastructure (fixtures, factories, helpers) created**
- **Implementation checklist provided**

### GREEN Phase (DEV TEAM)
1. **Pick one failing test**
2. **Implement minimal code to make it pass**
3. **Run test to verify GREEN**
4. **Move to next test**
5. **Repeat until all tests pass**

**Execution Order Recommendation**:
1. Start with basic project structure (AC5)
2. Install dependencies (AC2)
3. Configure code quality tools (AC3)
4. Set up PWA (AC4)
5. Initialize Supabase integration (AC1)

### REFACTOR Phase (DEV TEAM)
1. **All tests passing (GREEN)**
2. **Improve code quality and organization**
3. **Optimize build performance**
4. **Enhance developer experience**
5. **Ensure tests still pass**

---

## Running Tests

### All Infrastructure Tests
```bash
npm run test:e2e
```

### Specific Test Files
```bash
# Infrastructure validation tests
npm run test:e2e -- project-setup-validation-p0.spec.ts

# Dependency validation tests
npm run test:e2e -- dependency-check-p0.spec.ts
```

### Debug Mode (see browser)
```bash
npm run test:e2e -- --headed
```

### Single Test Debug
```bash
npm run test:e2e -- project-setup-validation-p0.spec.ts --debug
```

### Parallel Execution
```bash
npm run test:e2e -- --workers=4
```

---

## Required data-testid Attributes

### Home Page Indicators
- `supabase-status` - Supabase connection status indicator
- `eslint-status` - ESLint configuration status
- `prettier-status` - Prettier configuration status

### Component Testing
- `shadcn-button` - Sample Shadcn/UI button component
- `lucide-icon` - Sample Lucide React icon
- `react-query-devtools` - TanStack Query devtools indicator

---

## Mock Requirements for DEV Team

### API Validation Endpoints
These endpoints should return structured JSON responses:

**Tailwind Validation Response**:
```json
{
  "installed": true,
  "version": "3.4.1",
  "configured": true,
  "postcss_configured": true,
  "theme_industrial": true
}
```

**Build Response**:
```json
{
  "success": true,
  "output": "Build completed successfully",
  "duration": 45000,
  "errors": [],
  "warnings": []
}
```

**Environment Validation Response**:
```json
{
  "required_vars": ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  "present_vars": ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  "all_present": true
}
```

---

## Future ATDD Preparation

### Foundation Ready for User Stories
This infrastructure setup creates the foundation for proper ATDD on future user stories:

**Next Stories Will Use**:
- **E2E Tests**: For user workflows (login, dashboard navigation)
- **API Tests**: For business logic and data operations
- **Component Tests**: For UI interaction validation
- **Data Factories**: For generating realistic test data
- **Fixtures**: For reusable test setup/teardown

**GMAO-Specific Factories Already Prepared**:
- `createGmaoAsset()` - Asset management test data
- `createGmaoUser()` - User/technician test data
- `createGmaoOrder()` - Work order test data

---

## Knowledge Base Applied

**BMad Test Architecture Knowledge Fragments Used**:
- `test-quality.md` - Deterministic, isolated test design principles
- `data-factories.md` - Factory patterns with faker and overrides
- `network-first.md` - Route interception patterns (future use)
- `fixture-architecture.md` - Composable fixture patterns
- `component-tdd.md` - Component test strategies (future use)

---

## Completion Criteria

### Infrastructure Is Ready When:
- [ ] All validation tests pass (GREEN phase)
- [ ] Build process succeeds without errors
- [ ] TypeScript compilation passes with strict mode
- [ ] All required dependencies are installed and configured
- [ ] Project structure matches architecture specification
- [ ] PWA capabilities are working on mobile/tablet
- [ ] Environment variables are properly configured
- [ ] Code quality tools are configured and working

### Success Metrics:
- **Test Pass Rate**: 100% (all validation tests passing)
- **Build Time**: Under 2 minutes
- **Type Check Time**: Under 30 seconds
- **PWA Score**: 90+ on Lighthouse PWA audit
- **Bundle Size**: Under 5MB for initial load

---

**Generated by**: Murat (Test Architect) - BMad ATDD Workflow
**Output File**: `docs/atdd-checklist-1-1-project-setup.md`
**Next Steps for DEV Team**: Start with Phase 1 implementation checklist above