/**
 * Authentication Fixture for Story 1.2 ATDD Tests
 *
 * Provides composable authentication capabilities following fixture architecture patterns:
 * - Pure function → fixture → mergeTests composition
 * - Auto-cleanup with resource tracking
 * - Network-first authentication setup
 * - Industrial-specific auth scenarios
 */

import { test as base, mergeTests, expect } from '@playwright/test';
import { AuthFactory, AuthUser, InvalidCredentials } from '../factories/auth-factory';

type AuthFixture = {
  authFactory: AuthFactory;
  setupValidUser: (overrides?: Partial<AuthUser>) => Promise<AuthUser>;
  setupAdminUser: (overrides?: Partial<AuthUser>) => Promise<AuthUser>;
  setupTabletUser: (overrides?: Partial<AuthUser>) => Promise<AuthUser>;
  loginAs: (user: AuthUser) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAsTechnician: () => Promise<void>;
  logout: () => Promise<void>;
  getInvalidCredentials: () => InvalidCredentials[];
  mockAuthSuccess: (user?: AuthUser) => void;
  mockAuthFailure: (errorType?: 'invalid' | 'network' | 'timeout') => void;
  verifySessionPersistence: () => Promise<boolean>;
};

export const test = base.extend<AuthFixture>({
  authFactory: async ({}, use) => {
    const factory = new AuthFactory();
    await use(factory);
    await factory.cleanup(); // Auto-cleanup
  },

  setupValidUser: async ({ page, authFactory }, use) => {
    const createdUsers: AuthUser[] = [];

    const setupUser = async (overrides?: Partial<AuthUser>) => {
      const user = authFactory.createUser(overrides);
      createdUsers.push(user);

      // In real implementation, create user in Supabase
      // const { data, error } = await supabaseAdmin.auth.admin.createUser({...});

      return user;
    };

    await use(setupUser);

    // Cleanup created users
    for (const user of createdUsers) {
      console.log(`Cleaning up user: ${user.email}`);
      // await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
  },

  setupAdminUser: async ({ page, authFactory }, use) => {
    const createdUsers: AuthUser[] = [];

    const setupUser = async (overrides?: Partial<AuthUser>) => {
      const user = authFactory.createAdminUser(overrides);
      createdUsers.push(user);
      return user;
    };

    await use(setupUser);

    for (const user of createdUsers) {
      console.log(`Cleaning up admin user: ${user.email}`);
    }
  },

  setupTabletUser: async ({ page, authFactory }, use) => {
    const createdUsers: AuthUser[] = [];

    const setupUser = async (overrides?: Partial<AuthUser>) => {
      const user = authFactory.createTabletUser(overrides);
      createdUsers.push(user);
      return user;
    };

    await use(setupUser);

    for (const user of createdUsers) {
      console.log(`Cleaning up tablet user: ${user.email}`);
    }
  },

  loginAs: async ({ page, authFactory }, use) => {
    const loginAs = async (user: AuthUser) => {
      // Network-first: Setup auth interception BEFORE navigation
      const authPromise = page.waitForResponse((resp) =>
        resp.url().includes('/auth/v1/token') && resp.status() === 200
      );

      // Navigate to login page
      await page.goto('/login');

      // Mock successful authentication response
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: `mock_token_${user.id}`,
            refresh_token: `mock_refresh_${user.id}`,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.userMetadata
            }
          }),
        })
      );

      // Mock user profile data
      await page.route('**/api/user/profile', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(user),
        })
      );

      // Fill and submit login form
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', user.password);
      await page.click('[data-testid="login-button"]');

      // Wait for authentication response
      await authPromise;

      // Wait for redirect to dashboard
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    };

    await use(loginAs);
  },

  loginAsAdmin: async ({ loginAs, setupAdminUser }, use) => {
    const loginAdmin = async () => {
      const admin = await setupAdminUser();
      await loginAs(admin);
    };

    await use(loginAdmin);
  },

  loginAsTechnician: async ({ loginAs, authFactory }, use) => {
    const loginTechnician = async () => {
      const technician = authFactory.createTechnicianUser();
      await loginAs(technician);
    };

    await use(loginTechnician);
  },

  logout: async ({ page }, use) => {
    const logout = async () => {
      // Mock logout API call
      await page.route('**/auth/v1/logout', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        })
      );

      // Click logout button if visible
      const logoutButton = page.locator('[data-testid="logout-button"]');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        // Alternative: Trigger logout programmatically
        await page.evaluate(() => {
          window.localStorage.removeItem('supabase.auth.token');
          window.location.href = '/login';
        });
      }

      // Verify redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    };

    await use(logout);
  },

  getInvalidCredentials: async ({ authFactory }, use) => {
    const getCredentials = () => authFactory.createInvalidCredentials();
    await use(getCredentials);
  },

  mockAuthSuccess: async ({ page }, use) => {
    const mockSuccess = (user?: AuthUser) => {
      const defaultUser = user || {
        id: 'mock-user-id',
        email: 'mock@example.com',
        user_metadata: {}
      };

      page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock_access_token',
            refresh_token: 'mock_refresh_token',
            user: defaultUser,
          }),
        })
      );
    };

    await use(mockSuccess);
  },

  mockAuthFailure: async ({ page }, use) => {
    const mockFailure = (errorType: 'invalid' | 'network' | 'timeout' = 'invalid') => {
      switch (errorType) {
        case 'invalid':
          page.route('**/auth/v1/token', (route) =>
            route.fulfill({
              status: 400,
              contentType: 'application/json',
              body: JSON.stringify({
                error: 'invalid_grant',
                error_description: 'Invalid login credentials'
              }),
            })
          );
          break;
        case 'network':
          page.route('**/auth/v1/token', (route) =>
            route.abort('failed')
          );
          break;
        case 'timeout':
          page.route('**/auth/v1/token', () => {
            // Never respond to simulate timeout
            return new Promise(() => {});
          });
          break;
      }
    };

    await use(mockFailure);
  },

  verifySessionPersistence: async ({ page, context }, use) => {
    const verifyPersistence = async () => {
      // Check for authentication cookies
      const cookies = await context.cookies();
      const hasSessionCookie = cookies.some(cookie =>
        ['session', 'auth', 'supabase', 'token'].some(keyword =>
          cookie.name.toLowerCase().includes(keyword)
        )
      );

      if (!hasSessionCookie) {
        return false;
      }

      // Try to navigate to a protected route
      await page.goto('/dashboard');

      // Check if authentication is still valid
      const isAuthenticated = await page.locator('[data-testid="dashboard-container"]').isVisible();

      return isAuthenticated;
    };

    await use(verifyPersistence);
  },
});

// Create merged test with auth and existing fixtures
import { test as existingTest } from './index';
export const authTest = mergeTests(existingTest, test);

export { expect } from '@playwright/test';