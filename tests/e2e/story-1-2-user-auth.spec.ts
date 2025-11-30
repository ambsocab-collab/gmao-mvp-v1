/**
 * Story 1.2 - User Authentication (Login/Logout)
 * ATDD Failing Tests - RED PHASE
 *
 * These tests MUST FAIL initially because the implementation doesn't exist yet.
 * They define the expected behavior for the 5 acceptance criteria in Story 1.2.
 */

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Story 1.2 - User Authentication Login/Logout', () => {
  // Test data following factory patterns with faker for uniqueness
  const VALID_USER = {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, memorable: true }),
  };

  const INVALID_CREDENTIALS = [
    { email: 'nonexistent@example.com', password: 'wrongpassword', description: 'Non-existent email' },
    { email: VALID_USER.email, password: 'wrongpassword', description: 'Wrong password' },
    { email: 'invalid-email-format', password: 'password123', description: 'Invalid email format' },
    { email: '', password: 'password123', description: 'Empty email' },
    { email: VALID_USER.email, password: '', description: 'Empty password' },
  ];

  test.describe('AC1: Login Authentication with Supabase Integration', () => {
    test('should authenticate via Supabase and redirect to dashboard', async ({ page }) => {
      // GIVEN: User is on login screen with valid credentials
      await page.goto('/login');

      // Network-first: Intercept Supabase auth call BEFORE action
      const authPromise = page.waitForResponse((resp) =>
        resp.url().includes('supabase') &&
        resp.url().includes('/auth/v1/token') &&
        resp.status() === 200
      );

      // WHEN: User enters valid email and password
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);
      await page.click('[data-testid="login-button"]');

      // THEN: Wait for Supabase authentication response
      const authResponse = await authPromise;
      expect(authResponse.status()).toBe(200);

      // AND: Should be redirected to dashboard
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

      // AND: Should see dashboard content
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();

      // AND: Persistent session should be established (check for auth cookies)
      const cookies = await page.context().cookies();
      const hasSessionCookie = cookies.some(cookie =>
        cookie.name.includes('session') ||
        cookie.name.includes('auth') ||
        cookie.name.includes('supabase')
      );
      expect(hasSessionCookie).toBe(true);
    });
  });

  test.describe('AC2: Logout Functionality with Error Messages', () => {
    test('should terminate session and redirect to login', async ({ page }) => {
      // GIVEN: User is logged in (mock successful login for test isolation)
      await page.goto('/login');

      // Mock successful authentication first
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            user: { id: faker.string.uuid(), email: VALID_USER.email }
          }),
        })
      );

      // Mock dashboard data
      await page.route('**/dashboard', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: { name: 'Test User' } }),
        })
      );

      // Perform login
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/dashboard/);

      // WHEN: User clicks logout
      await page.click('[data-testid="logout-button"]');

      // THEN: Session is terminated and redirected to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });

      // AND: Should not see authenticated content
      await expect(page.locator('[data-testid="dashboard-container"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });

    test('should display error messages for invalid credentials', async ({ page }) => {
      // GIVEN: User is on login screen
      await page.goto('/login');

      // Mock failed authentication response
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Invalid login credentials'
          }),
        })
      );

      // WHEN: User submits invalid credentials
      for (const credentials of INVALID_CREDENTIALS) {
        // Reset to login page
        await page.goto('/login');

        await page.fill('[data-testid="email-input"]', credentials.email);
        await page.fill('[data-testid="password-input"]', credentials.password);
        await page.click('[data-testid="login-button"]');

        // THEN: Error message is displayed
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

        // AND: Error message should be user-friendly for industrial operators
        const errorText = await page.locator('[data-testid="error-message"]').textContent();
        expect(errorText?.toLowerCase()).toMatch(/invalid|incorrect|error|required/i);

        // AND: Should remain on login page
        await expect(page).toHaveURL(/login/);

        console.log(`✅ Error displayed for: ${credentials.description}`);
      }
    });
  });

  test.describe('AC3: Session Persistence for Industrial Tablets', () => {
    test('should persist session across browser restarts', async ({ context, page }) => {
      // GIVEN: User is logged in
      await page.goto('/login');

      // Mock successful authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'persistent_access_token',
            refresh_token: 'persistent_refresh_token',
            user: { id: faker.string.uuid(), email: VALID_USER.email }
          }),
        })
      );

      // Perform login
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/dashboard/);

      // WHEN: Browser is restarted (simulate by creating new page with same context)
      const newPage = await context.newPage();

      // THEN: User should still be logged in
      await newPage.goto('/dashboard');
      await expect(newPage.locator('[data-testid="dashboard-container"]')).toBeVisible();

      // AND: User menu should be visible
      await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();

      await newPage.close();
    });

    test('should maintain user state for industrial tablet usage', async ({ page }) => {
      // GIVEN: User is logged in with specific settings
      await page.goto('/login');

      // Mock authentication with user preferences
      const userPreferences = {
        theme: 'high-contrast',
        language: 'es',
        lastDashboard: 'maintenance'
      };

      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'stateful_access_token',
            refresh_token: 'stateful_refresh_token',
            user: {
              id: faker.string.uuid(),
              email: VALID_USER.email,
              user_metadata: userPreferences
            }
          }),
        })
      );

      // Mock user preferences API
      await page.route('**/api/user/preferences', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(userPreferences),
        })
      );

      // Perform login
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/dashboard/);

      // WHEN: Navigate to different pages and return
      await page.goto('/maintenance');
      await page.goto('/dashboard');

      // THEN: User preferences should be maintained
      const themeElement = page.locator('[data-testid="theme-indicator"]');
      if (await themeElement.isVisible()) {
        await expect(themeElement).toHaveText(/high-contrast/i);
      }

      // AND: Last visited dashboard should be remembered
      const lastDashboard = page.locator('[data-testid="last-dashboard"]');
      if (await lastDashboard.isVisible()) {
        await expect(lastDashboard).toHaveText(/maintenance/i);
      }
    });
  });

  test.describe('AC4: Error Handling for Industrial Operators', () => {
    test('should display clear user-friendly messages for network errors', async ({ page }) => {
      // GIVEN: User is on login screen and network is unavailable
      await page.goto('/login');

      // Mock network failure
      await page.route('**/auth/v1/token', (route) =>
        route.abort('failed')
      );

      // WHEN: User tries to login
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);
      await page.click('[data-testid="login-button"]');

      // THEN: Clear network error message should be displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

      const errorText = await page.locator('[data-testid="error-message"]').textContent();

      // Should be user-friendly for industrial operators
      expect(errorText).toMatch(/conexión|network|connection|internet|servidor|server/i);

      // Should provide actionable guidance
      expect(errorText).toMatch(/verifique|check|intente|try|espere|wait/i);

      console.log('✅ Network error message:', errorText);
    });

    test('should handle timeout errors gracefully', async ({ page }) => {
      // GIVEN: User is on login screen and server is slow
      await page.goto('/login');

      // Mock timeout (never responds)
      await page.route('**/auth/v1/token', (route) => {
        // Never respond to simulate timeout
        return new Promise(() => {});
      });

      // WHEN: User tries to login
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);
      await page.click('[data-testid="login-button"]');

      // THEN: Timeout error message should be displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 15000 });

      const errorText = await page.locator('[data-testid="error-message"]').textContent();
      expect(errorText).toMatch(/tiempo|timeout|lento|slow|espere|wait/i);

      console.log('✅ Timeout error message:', errorText);
    });
  });

  test.describe('AC5: Mobile Industrial UI with Large Buttons', () => {
    test('should have large buttons (>44px) for glove use', async ({ page }) => {
      // GIVEN: User is on login screen
      await page.goto('/login');

      // WHEN: Check button dimensions
      const loginButton = page.locator('[data-testid="login-button"]');

      // THEN: Button should be visible and have sufficient size
      await expect(loginButton).toBeVisible();

      // Check minimum touch target size (44px x 44px as per NFR7)
      const boundingBox = await loginButton.boundingBox();
      expect(boundingBox).toBeTruthy();

      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        console.log(`✅ Button size: ${boundingBox.width}x${boundingBox.height}px`);
      }
    });

    test('should have high contrast for industrial environments', async ({ page }) => {
      // GIVEN: User is on login screen
      await page.goto('/login');

      // WHEN: Check contrast of important elements
      const loginButton = page.locator('[data-testid="login-button"]');
      const emailInput = page.locator('[data-testid="email-input"]');

      // THEN: Elements should be visible with high contrast
      await expect(loginButton).toBeVisible();
      await expect(emailInput).toBeVisible();

      // Check for high contrast classes or styles
      const buttonClasses = await loginButton.getAttribute('class');
      expect(buttonClasses).toMatch(/contrast|high|btn-primary|btn-/i);

      // Form inputs should have proper contrast
      await expect(emailInput).toHaveAttribute('type', 'email');

      console.log('✅ High contrast elements detected');
    });

    test('should be optimized for tablet use', async ({ page }) => {
      // GIVEN: User accesses login page on tablet
      await page.goto('/login');

      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // WHEN: Check responsive design
      const loginForm = page.locator('[data-testid="login-form"]');

      // THEN: Form should be properly sized for tablet
      await expect(loginForm).toBeVisible();

      const formBox = await loginForm.boundingBox();
      expect(formBox).toBeTruthy();

      if (formBox) {
        // Form should use appropriate width on tablet (not too narrow, not too wide)
        expect(formBox.width).toBeGreaterThanOrEqual(400);
        expect(formBox.width).toBeLessThanOrEqual(600);
      }

      // Touch targets should be appropriate for tablets
      const loginButton = page.locator('[data-testid="login-button"]');
      const buttonBox = await loginButton.boundingBox();

      if (buttonBox) {
        // Larger touch targets for tablets
        expect(buttonBox.height).toBeGreaterThanOrEqual(48);
      }

      console.log('✅ Tablet optimization verified');
    });
  });

  test.describe('Form Validation with React Hook Form + Zod', () => {
    test('should validate email format with Zod schema', async ({ page }) => {
      // GIVEN: User is on login screen
      await page.goto('/login');

      // WHEN: User enters invalid email formats
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user..user@domain.com',
        'user@domain',
      ];

      for (const email of invalidEmails) {
        await page.goto('/login'); // Reset form
        await page.fill('[data-testid="email-input"]', email);
        await page.click('[data-testid="password-input"]'); // Trigger blur

        // THEN: Email validation error should be shown
        const emailError = page.locator('[data-testid="email-error"]');
        if (await emailError.isVisible()) {
          await expect(emailError).toContainText(/email|válido|valid/i);
        }

        // AND: Login button should be disabled
        const loginButton = page.locator('[data-testid="login-button"]');
        const isDisabled = await loginButton.isDisabled();
        expect(isDisabled).toBe(true);

        console.log(`✅ Email validation for: ${email}`);
      }
    });

    test('should require both fields before enabling submit', async ({ page }) => {
      // GIVEN: User is on login screen
      await page.goto('/login');

      const loginButton = page.locator('[data-testid="login-button"]');

      // THEN: Button should be disabled initially
      await expect(loginButton).toBeDisabled();

      // WHEN: Only email is filled
      await page.fill('[data-testid="email-input"]', VALID_USER.email);

      // THEN: Button should still be disabled
      await expect(loginButton).toBeDisabled();

      // WHEN: Email is cleared and password is filled
      await page.fill('[data-testid="email-input"]', '');
      await page.fill('[data-testid="password-input"]', VALID_USER.password);

      // THEN: Button should still be disabled
      await expect(loginButton).toBeDisabled();

      // WHEN: Both fields are filled with valid data
      await page.fill('[data-testid="email-input"]', VALID_USER.email);
      await page.fill('[data-testid="password-input"]', VALID_USER.password);

      // THEN: Button should be enabled
      await expect(loginButton).toBeEnabled();

      console.log('✅ Form validation working correctly');
    });
  });
});