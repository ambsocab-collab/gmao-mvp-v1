# ATDD Checklist - Epic 1, Story 1.2: User Authentication (Login/Logout)

**Date:** 2025-11-30
**Author:** Bernardo
**Primary Test Level:** E2E

---

## Story Summary

Implement comprehensive user authentication and session management with industrial-grade UI/UX for the GMAO system, featuring secure Supabase Auth integration, persistent sessions for tablet usage, and robust error handling optimized for industrial operators.

**As a** user
**I want** to securely log in and out of the application using email and password
**So that** I can access my personalized features

---

## Acceptance Criteria

5 specific, testable acceptance criteria decomposed from original epic requirements:

1. **AC: Login Authentication** - Given I am on the login screen, When I enter valid email and password, Then I am authenticated via Supabase Auth and redirected to the dashboard. And a persistent session is established (FR4).
2. **AC: Logout Functionality** - When I click "Logout", Then my session is terminated, and I am redirected to the login screen. And error messages are displayed for invalid credentials.
3. **AC: Session Persistence** - Authentication sessions persist across browser restarts and maintain user state for industrial tablet usage (NFR7).
4. **AC: Error Handling** - Invalid credentials and network errors display clear, user-friendly messages for industrial operators.
5. **AC: Mobile Industrial UI** - Login interface uses industrial design patterns with large buttons (>44px) and high contrast for glove use (NFR7).

---

## Failing Tests Created (RED Phase)

### E2E Tests (15 tests)

**File:** `tests/e2e/story-1-2-user-auth.spec.ts` (578 lines)

**AC1 - Login Authentication with Supabase Integration:**
- ✅ **Test:** should authenticate via Supabase and redirect to dashboard
  - **Status:** RED - Missing /login route and Supabase Auth integration
  - **Verifies:** Supabase auth endpoint integration, successful redirect, session cookie establishment

**AC2 - Logout Functionality with Error Messages:**
- ✅ **Test:** should terminate session and redirect to login
  - **Status:** RED - Missing logout functionality and session management
  - **Verifies:** Session termination, redirect to login, removal of authenticated content
- ✅ **Test:** should display error messages for invalid credentials
  - **Status:** RED - Missing error message display and validation
  - **Verifies:** User-friendly error messages for various invalid credential scenarios

**AC3 - Session Persistence for Industrial Tablets:**
- ✅ **Test:** should persist session across browser restarts
  - **Status:** RED - Missing persistent session storage implementation
  - **Verifies:** Session persistence using cookies/localStorage, auto-login on return
- ✅ **Test:** should maintain user state for industrial tablet usage
  - **Status:** RED - Missing user preference storage and restoration
  - **Verifies:** User metadata persistence, theme/language preferences, last dashboard memory

**AC4 - Error Handling for Industrial Operators:**
- ✅ **Test:** should display clear user-friendly messages for network errors
  - **Status:** RED - Missing network error handling and user-friendly messaging
  - **Verifies:** Graceful network failure handling, Spanish/localized error messages
- ✅ **Test:** should handle timeout errors gracefully
  - **Status:** RED - Missing timeout handling and appropriate user feedback
  - **Verifies:** Authentication timeout detection, actionable timeout messages

**AC5 - Mobile Industrial UI with Large Buttons:**
- ✅ **Test:** should have large buttons (>44px) for glove use
  - **Status:** RED - Missing industrial-optimized UI components
  - **Verifies:** Minimum touch target compliance, glove-friendly button sizing
- ✅ **Test:** should have high contrast for industrial environments
  - **Status:** RED - Missing high contrast theme implementation
  - **Verifies:** WCAG contrast compliance, industrial environment visibility
- ✅ **Test:** should be optimized for tablet use
  - **Status:** RED - Missing tablet-specific responsive design
  - **Verifies:** Tablet viewport optimization, appropriate touch target sizing

**Form Validation with React Hook Form + Zod:**
- ✅ **Test:** should validate email format with Zod schema
  - **Status:** RED - Missing form validation implementation
  - **Verifies:** Email format validation, error display, form state management
- ✅ **Test:** should require both fields before enabling submit
  - **Status:** RED - Missing conditional form submission logic
  - **Verifies:** Required field validation, submit button state management

---

## Data Factories Created

### Auth Factory

**File:** `tests/support/factories/auth-factory.ts`

**Exports:**

- `createUser(overrides?)` - Create single user with industrial-appropriate defaults
- `createAdminUser(overrides?)` - Create admin user with elevated permissions
- `createTechnicianUser(overrides?)` - Create technician user for maintenance scenarios
- `createOperatorUser(overrides?)` - Create operator user for day-to-day operations
- `createTabletUser(overrides?)` - Create user optimized for tablet usage
- `createInvalidCredentials()` - Generate array of invalid credential scenarios
- `createFormData()` - Generate test data for form validation scenarios
- `createUsers(count)` - Create array of users with unique data

**Example Usage:**

```typescript
const user = createUser({ email: 'operator@company.com', role: 'operator' });
const admin = createAdminUser();
const invalidCreds = createInvalidCredentials();
const tabletUser = createTabletUser({ userMetadata: { theme: 'high-contrast' }});
```

---

## Fixtures Created

### Authentication Fixtures

**File:** `tests/support/fixtures/auth-fixture.ts`

**Fixtures:**

- `authFactory` - Provides AuthFactory instance with auto-cleanup
  - **Setup:** Creates new AuthFactory instance
  - **Provides:** Factory methods for creating test users
  - **Cleanup:** Calls factory.cleanup() to remove created users

- `setupValidUser` - Creates and tracks valid users for test isolation
  - **Setup:** Creates user via factory and tracks for cleanup
  - **Provides:** User object with industrial metadata
  - **Cleanup:** Deletes all created users via factory

- `loginAs` - Performs complete login flow with network-first pattern
  - **Setup:** Mocks Supabase auth endpoints, intercepts responses
  - **Provides:** User logged in and redirected to dashboard
  - **Cleanup:** None (session managed by browser context)

- `loginAsAdmin` - Quick admin login for setup scenarios
  - **Setup:** Creates admin user and performs login
  - **Provides:** Admin session ready for tests
  - **Cleanup:** User cleanup via factory

- `mockAuthSuccess` - Mocks successful authentication responses
  - **Setup:** Routes Supabase auth endpoints to success responses
  - **Provides:** Consistent auth success for development testing
  - **Cleanup:** Route handlers automatically cleaned up

- `mockAuthFailure` - Mocks various authentication failure scenarios
  - **Setup:** Routes auth endpoints to error responses (invalid, network, timeout)
  - **Provides:** Testable error conditions for edge case validation
  - **Cleanup:** Route handlers automatically cleaned up

**Example Usage:**

```typescript
import { test } from '../fixtures/auth-fixture';

test('admin functionality', async ({ loginAsAdmin }) => {
  await loginAsAdmin(); // Admin session ready
  // Test admin features
});

test('error handling', async ({ page, mockAuthFailure }) => {
  mockAuthFailure('network');
  // Test network error handling
});
```

---

## Mock Requirements

### Supabase Auth Service Mock

**Endpoint:** `POST /auth/v1/token`

**Success Response:**

```json
{
  "access_token": "mock_access_token",
  "refresh_token": "mock_refresh_token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "user_metadata": {
      "theme": "high-contrast",
      "language": "es",
      "department": "maintenance"
    }
  }
}
```

**Failure Response:**

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}
```

**Endpoint:** `POST /auth/v1/logout`

**Success Response:**

```json
{}
```

**Notes:** All auth requests should be intercepted in tests to avoid dependency on real Supabase during development.

### User Profile API Mock

**Endpoint:** `GET /api/user/profile`

**Success Response:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "operator",
  "userMetadata": {
    "theme": "high-contrast",
    "language": "es",
    "department": "maintenance",
    "shift": "morning"
  }
}
```

### Dashboard API Mock

**Endpoint:** `GET /api/dashboard`

**Success Response:**

```json
{
  "user": {
    "name": "John Doe"
  },
  "lastDashboard": "maintenance",
  "notifications": []
}
```

---

## Required data-testid Attributes

### Login Page (/login)

- `login-form` - Main login form container
- `email-input` - Email address input field
- `password-input` - Password input field
- `login-button` - Login form submit button
- `error-message` - Authentication error message container
- `email-error` - Email validation error message
- `loading-spinner` - Loading indicator during authentication

### Dashboard Page (/dashboard)

- `dashboard-container` - Main dashboard content container
- `user-menu` - User profile/access menu
- `logout-button` - Logout action button
- `theme-indicator` - Current theme indicator (for testing persistence)
- `last-dashboard` - Last visited dashboard section indicator

### General UI Elements

- `user-name` - Display of current user's name
- `high-contrast-toggle` - Theme toggle for accessibility testing
- `language-selector` - Language preference selector

**Implementation Example:**

```tsx
<form data-testid="login-form">
  <input
    data-testid="email-input"
    type="email"
    placeholder="Correo electrónico"
  />
  <input
    data-testid="password-input"
    type="password"
    placeholder="Contraseña"
  />
  <button data-testid="login-button" type="submit">
    Iniciar Sesión
  </button>
  {error && (
    <div data-testid="error-message" role="alert">
      {error}
    </div>
  )}
</form>
```

---

## Implementation Checklist

### Test: should authenticate via Supabase and redirect to dashboard

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Create `/app/(auth)/login/page.tsx` with login form
- [ ] Implement Supabase Auth client integration in `lib/supabase/auth.ts`
- [ ] Add React Hook Form + Zod validation for login form
- [ ] Connect form submission to Supabase `signInWithPassword`
- [ ] Implement successful authentication redirect to dashboard
- [ ] Add session cookie/storage persistence logic
- [ ] Add required data-testid attributes: `login-form`, `email-input`, `password-input`, `login-button`, `dashboard-container`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: should terminate session and redirect to login

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement logout functionality using Supabase `signOut`
- [ ] Add logout button to dashboard with `data-testid="logout-button"`
- [ ] Create logout handler that clears session storage
- [ ] Implement redirect to login page after logout
- [ ] Remove authenticated content visibility after logout
- [ ] Add required data-testid attributes: `logout-button`, `user-menu`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should display error messages for invalid credentials

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Add error state management for authentication failures
- [ ] Create error message display component with `data-testid="error-message"`
- [ ] Implement user-friendly error message translation (Spanish)
- [ ] Handle different error types: invalid credentials, network errors, timeouts
- [ ] Add error message accessibility attributes (role="alert", aria-live)
- [ ] Add required data-testid attributes: `error-message`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: should persist session across browser restarts

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Configure Supabase Auth with persistent session storage
- [ ] Implement session restoration on app initialization
- [ ] Add middleware for protected route checking
- [ ] Ensure session persistence across browser contexts
- [ ] Test session validity and automatic redirect
- [ ] Add session management utilities in `lib/supabase/session.ts`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: should display clear user-friendly messages for network errors

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Add network error detection for Supabase requests
- [ ] Implement Spanish-language error messages for network failures
- [ ] Add retry mechanisms or actionable guidance for network issues
- [ ] Create network status indicators if applicable
- [ ] Handle edge cases: timeouts, CORS errors, server unavailable
- [ ] Add required data-testid attributes: `error-message`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should have large buttons (>44px) for glove use

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement industrial design system with large touch targets
- [ ] Configure Tailwind CSS classes for button sizing (min-h-[44px], min-w-[44px])
- [ ] Update login button styles to meet accessibility requirements
- [ ] Ensure touch targets work with gloves (larger if needed)
- [ ] Add visual feedback for touch interactions
- [ ] Add required data-testid attributes: `login-button`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: should validate email format with Zod schema

**File:** `tests/e2e/story-1-2-user-auth.spec.ts`

**Tasks to make this test pass:**

- [ ] Create Zod schema for email validation in `schemas/auth.ts`
- [ ] Integrate Zod validation with React Hook Form
- [ ] Add real-time email format validation
- [ ] Display validation errors with `data-testid="email-error"`
- [ ] Prevent form submission with invalid data
- [ ] Add required data-testid attributes: `email-error`
- [ ] Run test: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test:e2e -- story-1-2-user-auth.spec.ts

# Run specific test file
npm run test:e2e -- --grep "should authenticate via Supabase"

# Run tests in headed mode (see browser)
npm run test:e2e -- story-1-2-user-auth.spec.ts --headed

# Debug specific test
npm run test:e2e -- story-1-2-user-auth.spec.ts --debug

# Run tests with coverage
npm run test:e2e -- story-1-2-user-auth.spec.ts --coverage

# Run tests with specific viewport for tablet testing
npm run test:e2e -- story-1-2-user-auth.spec.ts --project=chromium
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing
- ✅ Fixtures and factories created with auto-cleanup
- ✅ Mock requirements documented
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with highest priority)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `bmm-workflow-status.md`

**Recommended Implementation Order:**

1. **Core Authentication** (4 hours) - `should authenticate via Supabase`
2. **Error Handling** (3 hours) - `should display error messages`
3. **Form Validation** (2 hours) - `should validate email format`
4. **Session Management** (3 hours) - `should persist session across browser restarts`
5. **Logout** (2 hours) - `should terminate session`
6. **Network Errors** (2 hours) - `should handle network errors`
7. **Industrial UI** (2 hours) - `should have large buttons`

**Total Estimated Effort:** 18 hours

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `npm run test:e2e -- story-1-2-user-auth.spec.ts`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, run `bmad sm story-done` to move story to DONE

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **component-tdd.md** - Component test strategies using Playwright Component Testing
- **network-first.md** - Route interception patterns (intercept BEFORE navigation to prevent race conditions)
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (E2E vs API vs Component vs Unit)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test:e2e -- story-1-2-user-auth.spec.ts`

**Results:**

```
Running 15 tests using 1 worker
  [chromium] › story-1-2-user-auth.spec.ts:15:1 › Story 1.2 - User Authentication Login/Logout › AC1: Login Authentication with Supabase Integration › should authenticate via Supabase and redirect to dashboard
    Test timeout of 60000ms exceeded.
    Error: page.goto: Timeout 60000ms exceeded.
    =========================== logs ===========================
    Navigating to /login, waiting for "page"

  [chromium] › story-1-2-user-auth.spec.ts:75:1 › Story 1.2 - User Authentication Login/Logout › AC2: Logout Functionality with Error Messages › should terminate session and redirect to login
    Test timeout of 60000ms exceeded.
    Error: page.goto: Timeout 60000ms exceeded.

  ... (all 15 tests failing with timeout or element not found errors)
```

**Summary:**

- Total tests: 15
- Passing: 0 (expected)
- Failing: 15 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- `page.goto: Timeout 60000ms exceeded` - Missing /login route
- `Error: locator.click: Target closed` - Missing login button with data-testid
- `Error: locator.waitFor: Timeout` - Missing error message container
- All tests fail due to missing implementation, not test bugs

---

## Notes

- **Existing P0 Tests:** This story builds on existing authentication tests in `tests/e2e/auth/authentication-p0.spec.ts`. The new tests focus on industrial-specific requirements not covered by P0 tests.
- **Industrial Context:** Tests specifically validate industrial environment requirements (glove use, high contrast, tablet optimization, Spanish error messages).
- **Session Persistence:** Special attention to industrial tablet usage scenarios where users expect seamless session continuation across device reboots.
- **Error Handling:** Emphasis on clear, actionable error messages for operators in potentially noisy/stressful industrial environments.

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Murat in Slack/Discord
- Refer to `./.bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `./.bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2025-11-30