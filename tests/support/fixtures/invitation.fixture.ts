/**
 * Invitation Fixture - Test Infrastructure
 *
 * Playwright fixture for invitation testing with auto-cleanup
 * Following BMad Test Architecture patterns
 */

import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
  createUser,
  createAdminUser,
  createInvitation,
  createInvitationWorkflowData,
  type User,
  type Invitation,
} from '../factories/invitation.factory';

// Extend base test with invitation fixtures
export const test = base.extend<{
  adminUser: User;
  invitationData: {
    adminUser: User;
    pendingInvitations: Invitation[];
    acceptedInvitations: Invitation[];
    expiredInvitations: Invitation[];
    allInvitations: Invitation[];
  };
  mockInvitations: (invitations: Invitation[]) => Promise<void>;
  authenticateAs: (user: User) => Promise<void>;
}>({
  // Admin user fixture for all invitation tests
  adminUser: async ({ page }, use) => {
    const adminUser = createAdminUser({
      email: 'admin-invitation-test@gmao.com',
      name: 'Test Admin',
    });

    // Setup admin authentication mocks
    await page.route('**/auth/v1/token', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_admin_access_token',
          refresh_token: 'mock_admin_refresh_token',
          user: {
            id: adminUser.id,
            email: adminUser.email,
            role: 'admin'
          }
        }),
      })
    );

    // Mock user profile API
    await page.route('**/api/user/profile', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...adminUser,
          permissions: ['admin', 'invite_users', 'manage_users'],
        }),
      })
    );

    // Mock role permissions API
    await page.route('**/api/roles/permissions', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          roles: [
            { name: 'operator', permissions: ['view_maintenance', 'create_reports'] },
            { name: 'technician', permissions: ['view_maintenance', 'edit_equipment'] },
            { name: 'supervisor', permissions: ['view_maintenance', 'manage_team', 'view_reports'] },
            { name: 'admin', permissions: ['*'] }
          ]
        }),
      })
    );

    await use(adminUser);
  },

  // Complete invitation workflow data fixture
  invitationData: async ({ page }, use) => {
    const invitationData = createInvitationWorkflowData({
      pendingCount: 3,
      acceptedCount: 2,
      expiredCount: 1,
    });

    // Setup authentication for admin user
    await page.route('**/auth/v1/token', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'admin_workflow_token',
          refresh_token: 'admin_workflow_refresh',
          user: {
            id: invitationData.adminUser.id,
            email: invitationData.adminUser.email,
            role: 'admin'
          }
        }),
      })
    );

    await use(invitationData);
  },

  // Mock invitations API helper
  mockInvitations: async ({ page }, use) => {
    const mockInvitations = async (invitations: Invitation[]) => {
      await page.route('**/api/invitations', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(invitations),
        })
      );
    };

    await use(mockInvitations);
  },

  // Authentication helper fixture
  authenticateAs: async ({ page }, use) => {
    const authenticateAs = async (user: User) => {
      // Mock authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: `mock_token_${user.role}`,
            refresh_token: `mock_refresh_${user.role}`,
            user: {
              id: user.id,
              email: user.email,
              role: user.role
            }
          }),
        })
      );

      // Mock user profile
      await page.route('**/api/user/profile', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...user,
            permissions: user.role === 'admin'
              ? ['admin', 'invite_users', 'manage_users']
              : ['view_maintenance'], // Basic permissions for non-admin
          }),
        })
      );

      // Perform login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', user.email);
      await page.fill('[data-testid="password-input"]', 'mock_password');
      await page.click('[data-testid="login-button"]');

      // Wait for redirect to dashboard
      await expect(page).toHaveURL(/dashboard/);
    };

    await use(authenticateAs);
  },
});

// Export expect for test files
export { expect };

// Re-export all test functions for convenience
export * from '@playwright/test';

export default test;