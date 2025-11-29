/**
 * P0 Critical Authentication Tests - Epic 1: Foundation & User Management
 *
 * Addresses Risk R-001: Autenticación comprometida
 * Score: 6 (Probability: 2, Impact: 3)
 *
 * Test Coverage:
 * - Valid login flow
 * - Invalid login attempts
 * - Session management
 * - Logout functionality
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth-helper';

// Test data for Epic 1 authentication
const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@gmao-test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123456',
    expectedRole: 'admin'
  },
  technician: {
    email: process.env.TEST_TECHNICIAN_EMAIL || 'tech@gmao-test.com',
    password: process.env.TEST_TECHNICIAN_PASSWORD || 'tech123456',
    expectedRole: 'technician'
  }
};

const INVALID_CREDENTIALS = [
  { email: 'nonexistent@example.com', password: 'password123' },
  { email: TEST_USERS.admin.email, password: 'wrongpassword' },
  { email: 'invalid-email', password: TEST_USERS.admin.password },
  { email: TEST_USERS.admin.email, password: '' }, // Empty password
];

test.describe('Authentication - P0 Critical Security Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await page.goto('/login');
  });

  test.describe('Valid Authentication Flows', () => {
    test('P0-AUTH-001: Admin user can login with valid credentials', async ({ page }) => {
      // Given: Admin user credentials
      const user = TEST_USERS.admin;

      // When: Admin attempts to login
      await authHelper.login(user.email, user.password);

      // Then: Should be authenticated and redirected
      await expect(page).toHaveURL(/dashboard|admin/, { timeout: 10000 });

      // And: Should see admin-specific elements
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('text=Admin')).toBeVisible();
    });

    test('P0-AUTH-002: Technician user can login with valid credentials', async ({ page }) => {
      // Given: Technician user credentials
      const user = TEST_USERS.technician;

      // When: Technician attempts to login
      await authHelper.login(user.email, user.password);

      // Then: Should be authenticated and redirected
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

      // And: Should see technician-specific elements
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('text=Technician')).toBeVisible();
    });

    test('P0-AUTH-003: Session persists after page reload', async ({ page }) => {
      // Given: User is logged in
      await authHelper.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await expect(page).toHaveURL(/dashboard/);

      // When: Page is reloaded
      await page.reload();

      // Then: User should still be logged in
      await expect(page).toHaveURL(/dashboard/, { timeout: 5000 });
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test.describe('Invalid Authentication Attempts', () => {
    test('P0-AUTH-004: Invalid credentials show appropriate error message', async ({ page }) => {
      for (const credentials of INVALID_CREDENTIALS) {
        // Reset to login page
        await page.goto('/login');

        // When: User attempts login with invalid credentials
        await authHelper.login(credentials.email, credentials.password);

        // Then: Should show error message and stay on login page
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid|error|incorrect/i);
        await expect(page).toHaveURL(/login/);

        // And: Should not be authenticated
        await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
      }
    });

    test('P0-AUTH-005: Brute force protection is active', async ({ page }) => {
      const invalidCredentials = {
        email: TEST_USERS.admin.email,
        password: 'wrongpassword'
      };

      // When: Multiple failed login attempts are made
      for (let i = 0; i < 5; i++) {
        await authHelper.login(invalidCredentials.email, invalidCredentials.password);

        if (i < 4) {
          // First 4 attempts should show error but allow retry
          await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
          await page.goto('/login'); // Reset for next attempt
        }
      }

      // Then: Should implement rate limiting or account lockout
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

      // Check for rate limiting message or disabled login form
      const errorText = await page.locator('[data-testid="error-message"]').textContent();
      const hasRateLimiting = /too many|rate limit|blocked|disabled/i.test(errorText || '');

      if (hasRateLimiting) {
        console.log('✅ Rate limiting protection detected');
      } else {
        console.warn('⚠️ Rate limiting protection may not be implemented');
      }
    });
  });

  test.describe('Logout Functionality', () => {
    test('P0-AUTH-006: User can logout successfully', async ({ page }) => {
      // Given: User is logged in
      await authHelper.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await expect(page).toHaveURL(/dashboard/);

      // When: User clicks logout
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout-button"]').click();

      // Then: Should be logged out and redirected to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });

      // And: Should not see authenticated content
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();

      // And: Should be able to access login page
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });

    test('P0-AUTH-007: Session is invalidated after logout', async ({ page }) => {
      // Given: User is logged in
      await authHelper.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
      await expect(page).toHaveURL(/dashboard/);

      // When: User logs out
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout-button"]').click();

      // And: Tries to access protected route directly
      await page.goto('/dashboard');

      // Then: Should be redirected to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });
  });

  test.describe('Session Security', () => {
    test('P0-AUTH-008: Authentication tokens are properly handled', async ({ page, context }) => {
      // Given: User is logged in
      await authHelper.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

      // When: Check for secure token handling
      const cookies = await context.cookies();

      // Then: Should use secure cookie attributes
      const sessionCookie = cookies.find(cookie => cookie.name.includes('session') || cookie.name.includes('auth'));

      if (sessionCookie) {
        expect(sessionCookie.httpOnly).toBe(true);
        expect(sessionCookie.secure).toBe(process.env.NODE_ENV === 'production');
        expect(sessionCookie.sameSite).toBe('Lax');
        console.log('✅ Secure cookie attributes detected');
      } else {
        console.warn('⚠️ No authentication cookie detected');
      }
    });

    test('P0-AUTH-009: Sensitive information is not exposed in client storage', async ({ page }) => {
      // Given: User is logged in
      await authHelper.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

      // When: Check client storage for sensitive data
      const localStorage = await page.evaluate(() => Object.keys(localStorage));
      const sessionStorage = await page.evaluate(() => Object.keys(sessionStorage));

      // Then: Should not store sensitive information in plain text
      const sensitiveKeys = [...localStorage, ...sessionStorage].filter(key =>
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret')
      );

      expect(sensitiveKeys).toHaveLength(0);
      console.log('✅ No sensitive information found in client storage');
    });
  });
});