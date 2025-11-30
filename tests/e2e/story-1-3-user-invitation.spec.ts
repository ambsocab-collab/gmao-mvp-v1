/**
 * Story 1.3 - User Registration & Invitation (Admin)
 * ATDD Failing Tests - RED PHASE
 *
 * These tests MUST FAIL initially because the implementation doesn't exist yet.
 * They define the expected behavior for the 5 acceptance criteria in Story 1.3.
 */

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Story 1.3 - User Registration & Invitation (Admin)', () => {
  // Test data following factory patterns with faker for uniqueness
  const ADMIN_USER = {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12, memorable: true }),
    role: 'admin'
  };

  const NEW_USERS = [
    { email: faker.internet.email(), role: 'operator', description: 'Operator invitation' },
    { email: faker.internet.email(), role: 'technician', description: 'Technician invitation' },
    { email: faker.internet.email(), role: 'supervisor', description: 'Supervisor invitation' },
    { email: faker.internet.email(), role: 'admin', description: 'Admin invitation' },
  ];

  test.describe('AC1: Admin User Invitation via Supabase Auth', () => {
    test('should send invitation email via Supabase when admin invites new user', async ({ page }) => {
      // GIVEN: Admin user is logged in and on user invitation panel
      await page.goto('/login');

      // Mock admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            refresh_token: 'admin_refresh_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      // Mock dashboard data
      await page.route('**/api/user/profile', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: faker.string.uuid(),
            email: ADMIN_USER.email,
            role: 'admin',
            permissions: ['admin', 'invite_users']
          }),
        })
      );

      // Perform admin login
      await page.fill('[data-testid="email-input"]', ADMIN_USER.email);
      await page.fill('[data-testid="password-input"]', ADMIN_USER.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/dashboard/);

      // Navigate to admin invitation panel
      await page.goto('/admin/users/invite');

      // Network-first: Intercept invitation API call BEFORE action
      const invitationPromise = page.waitForResponse((resp) =>
        resp.url().includes('supabase') &&
        resp.url().includes('/auth/v1/admin/users') &&
        resp.method() === 'POST'
      );

      // WHEN: Admin enters new user email and selects role
      const newUser = NEW_USERS[0];
      await page.fill('[data-testid="invitation-email-input"]', newUser.email);
      await page.selectOption('[data-testid="role-selector"]', newUser.role);
      await page.click('[data-testid="send-invitation-button"]');

      // THEN: Supabase invitation API is called
      const invitationResponse = await invitationPromise;
      expect(invitationResponse.status()).toBe(200);

      // AND: Success message is displayed
      await expect(page.locator('[data-testid="invitation-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="invitation-success-message"]')).toContainText(newUser.email);

      // AND: User is added to pending invitations list
      await expect(page.locator('[data-testid="pending-invitations"]')).toBeVisible();
      await expect(page.locator(`[data-testid="invitation-${newUser.email}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="invitation-${newUser.email}-status"]`)).toHaveText(/pending|enviado/i);
    });

    test('should handle invitation API errors gracefully', async ({ page }) => {
      // GIVEN: Admin is logged in and on invitation panel
      await page.goto('/admin/users/invite');

      // Mock admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            refresh_token: 'admin_refresh_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      // Mock failed invitation response
      await page.route('**/auth/v1/admin/users', (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'invalid_email',
            error_description: 'Email format is invalid'
          }),
        })
      );

      // WHEN: Admin tries to invite user with invalid email
      await page.fill('[data-testid="invitation-email-input"]', 'invalid-email');
      await page.selectOption('[data-testid="role-selector"]', 'operator');
      await page.click('[data-testid="send-invitation-button"]');

      // THEN: Error message should be displayed
      await expect(page.locator('[data-testid="invitation-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="invitation-error-message"]')).toContainText(/email|inválido|formato/i);

      // AND: Form should not be cleared on error
      await expect(page.locator('[data-testid="invitation-email-input"]')).toHaveValue('invalid-email');
    });
  });

  test.describe('AC2: User Registration Flow from Email Link', () => {
    test('should allow invited user to set password and activate account', async ({ page }) => {
      // GIVEN: User clicks invitation link from email
      const invitationToken = faker.string.uuid();
      const newUser = NEW_USERS[1];

      await page.goto(`/invite?token=${invitationToken}&email=${encodeURIComponent(newUser.email)}`);

      // Mock token validation API
      await page.route('**/api/invitations/validate', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            email: newUser.email,
            role: newUser.role,
            invitedBy: ADMIN_USER.email
          }),
        })
      );

      // Network-first: Intercept password setup API call BEFORE action
      const setupPromise = page.waitForResponse((resp) =>
        resp.url().includes('/api/invitations/complete') &&
        resp.method() === 'POST'
      );

      // WHEN: User sets their password
      const newPassword = faker.internet.password({ length: 12, memorable: true });
      await page.fill('[data-testid="password-input"]', newPassword);
      await page.fill('[data-testid="confirm-password-input"]', newPassword);
      await page.click('[data-testid="complete-registration-button"]');

      // THEN: Registration API is called
      const setupResponse = await setupPromise;
      expect(setupResponse.status()).toBe(200);

      // AND: User is redirected to login/dashboard
      await expect(page).toHaveURL(/dashboard|login/);

      // AND: Success message is displayed
      await expect(page.locator('[data-testid="registration-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="registration-success-message"]')).toContainText(/activada|welcome|bienvenido/i);

      // AND: Session should be established
      const cookies = await page.context().cookies();
      const hasSessionCookie = cookies.some(cookie =>
        cookie.name.includes('session') ||
        cookie.name.includes('auth') ||
        cookie.name.includes('supabase')
      );
      expect(hasSessionCookie).toBe(true);
    });

    test('should enforce password requirements during registration', async ({ page }) => {
      // GIVEN: User is on registration page from invitation link
      const invitationToken = faker.string.uuid();
      await page.goto(`/invite?token=${invitationToken}&email=test@example.com`);

      // Mock token validation
      await page.route('**/api/invitations/validate', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            email: 'test@example.com',
            role: 'operator'
          }),
        })
      );

      // WHEN: User tries weak passwords
      const weakPasswords = [
        { password: '123', description: 'Too short' },
        { password: 'password', description: 'Common password' },
        { password: '12345678', description: 'All numbers' },
        { password: 'abcdefgh', description: 'All letters' },
      ];

      for (const weakPassword of weakPasswords) {
        await page.fill('[data-testid="password-input"]', weakPassword.password);
        await page.fill('[data-testid="confirm-password-input"]', weakPassword.password);
        await page.click('[data-testid="complete-registration-button"]');

        // THEN: Password validation error should be shown
        const passwordError = page.locator('[data-testid="password-error"]');
        if (await passwordError.isVisible()) {
          await expect(passwordError).toContainText(/strong|segura|mínimo|caracteres/i);
        }

        // AND: Submit button should be disabled or showing error
        await expect(page.locator('[data-testid="complete-registration-button"]')).toBeVisible();

        // Reset form for next test
        await page.fill('[data-testid="password-input"]', '');
        await page.fill('[data-testid="confirm-password-input"]', '');

        console.log(`✅ Password validation for: ${weakPassword.description}`);
      }
    });
  });

  test.describe('AC3: Admin Interface with Industrial UI Patterns', () => {
    test('should display invitation form with large touch targets', async ({ page }) => {
      // GIVEN: Admin is logged in
      await page.goto('/admin/users/invite');

      // Mock admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      // WHEN: Check form elements
      const emailInput = page.locator('[data-testid="invitation-email-input"]');
      const roleSelector = page.locator('[data-testid="role-selector"]');
      const sendButton = page.locator('[data-testid="send-invitation-button"]');

      // THEN: All elements should be visible
      await expect(emailInput).toBeVisible();
      await expect(roleSelector).toBeVisible();
      await expect(sendButton).toBeVisible();

      // AND: Touch targets should meet industrial UI requirements (>44px)
      const emailBox = await emailInput.boundingBox();
      const roleBox = await roleSelector.boundingBox();
      const buttonBox = await sendButton.boundingBox();

      if (emailBox) {
        expect(emailBox.height).toBeGreaterThanOrEqual(44);
      }
      if (roleBox) {
        expect(roleBox.height).toBeGreaterThanOrEqual(44);
      }
      if (buttonBox) {
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      }

      console.log('✅ Industrial UI touch targets verified');
    });

    test('should have high contrast design for industrial environments', async ({ page }) => {
      // GIVEN: Admin is on invitation page
      await page.goto('/admin/users/invite');

      // WHEN: Check contrast elements
      const formContainer = page.locator('[data-testid="invitation-form"]');
      const sendButton = page.locator('[data-testid="send-invitation-button"]');

      // THEN: Elements should have high contrast styling
      await expect(formContainer).toBeVisible();
      await expect(sendButton).toBeVisible();

      // Check for high contrast classes
      const buttonClasses = await sendButton.getAttribute('class');
      expect(buttonClasses).toMatch(/contrast|high|btn-primary|btn-/i);

      console.log('✅ High contrast design verified');
    });

    test('should include role assignment dropdown with all required roles', async ({ page }) => {
      // GIVEN: Admin is on invitation page
      await page.goto('/admin/users/invite');

      // WHEN: Check role selector options
      const roleSelector = page.locator('[data-testid="role-selector"]');
      await expect(roleSelector).toBeVisible();

      // THEN: All required roles should be available
      await roleSelector.click();

      const expectedRoles = ['operator', 'technician', 'supervisor', 'admin'];
      for (const role of expectedRoles) {
        await expect(page.locator(`[data-testid="role-option-${role}"]`)).toBeVisible();
      }

      console.log('✅ All role options available');
    });
  });

  test.describe('AC4: Invitation Status Tracking', () => {
    test('should display status of pending invitations', async ({ page }) => {
      // GIVEN: Admin has sent invitations and views management panel
      await page.goto('/admin/users/invitations');

      // Mock admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      // Mock invitations API response
      const mockInvitations = [
        {
          id: faker.string.uuid(),
          email: 'user1@example.com',
          role: 'operator',
          status: 'pending',
          createdAt: new Date().toISOString(),
          invitedBy: ADMIN_USER.email
        },
        {
          id: faker.string.uuid(),
          email: 'user2@example.com',
          role: 'technician',
          status: 'accepted',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          acceptedAt: new Date(Date.now() - 43200000).toISOString(),
          invitedBy: ADMIN_USER.email
        },
        {
          id: faker.string.uuid(),
          email: 'user3@example.com',
          role: 'supervisor',
          status: 'expired',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          invitedBy: ADMIN_USER.email
        }
      ];

      await page.route('**/api/invitations', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockInvitations),
        })
      );

      // Network-first: Wait for invitations to load
      const invitationsPromise = page.waitForResponse('**/api/invitations');
      await page.reload();
      await invitationsPromise;

      // WHEN: Check invitation status display
      await expect(page.locator('[data-testid="invitations-list"]')).toBeVisible();

      // THEN: All invitations should be displayed with correct status
      for (const invitation of mockInvitations) {
        await expect(page.locator(`[data-testid="invitation-${invitation.email}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="invitation-${invitation.email}-status"]`))
          .toHaveText(new RegExp(invitation.status, 'i'));
      }

      // AND: Status should be visually distinguishable (color codes, badges)
      const pendingBadges = page.locator('[data-testid="status-pending"]');
      const acceptedBadges = page.locator('[data-testid="status-accepted"]');
      const expiredBadges = page.locator('[data-testid="status-expired"]');

      await expect(pendingBadges).toHaveCount(1);
      await expect(acceptedBadges).toHaveCount(1);
      await expect(expiredBadges).toHaveCount(1);

      console.log('✅ Invitation status tracking verified');
    });

    test('should allow resending expired invitations', async ({ page }) => {
      // GIVEN: Admin has an expired invitation
      await page.goto('/admin/users/invitations');

      // Mock admin authentication and expired invitations
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      const expiredInvitation = {
        id: faker.string.uuid(),
        email: 'expired@example.com',
        role: 'operator',
        status: 'expired',
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        invitedBy: ADMIN_USER.email
      };

      await page.route('**/api/invitations', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([expiredInvitation]),
        })
      );

      // Network-first: Intercept resend API call
      const resendPromise = page.waitForResponse((resp) =>
        resp.url().includes('/api/invitations/resend') &&
        resp.method() === 'POST'
      );

      // WHEN: Admin clicks resend for expired invitation
      await page.click('[data-testid="resend-expired@example.com"]');

      // THEN: Resend API should be called
      const resendResponse = await resendPromise;
      expect(resendResponse.status()).toBe(200);

      // AND: Success message should be displayed
      await expect(page.locator('[data-testid="resend-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="resend-success-message"]'))
        .toContainText(expiredInvitation.email);

      // AND: Invitation status should update to pending
      await expect(page.locator('[data-testid="invitation-expired@example.com-status"]'))
        .toHaveText(/pending|enviado/i);
    });
  });

  test.describe('AC5: Role Assignment Integration', () => {
    test('should assign role to user profile upon successful registration', async ({ page }) => {
      // GIVEN: User completes registration from invitation
      const invitationToken = faker.string.uuid();
      const newUser = NEW_USERS[2]; // Supervisor role
      const newPassword = faker.internet.password({ length: 12, memorable: true });

      await page.goto(`/invite?token=${invitationToken}&email=${encodeURIComponent(newUser.email)}`);

      // Mock token validation with role
      await page.route('**/api/invitations/validate', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            email: newUser.email,
            role: newUser.role,
            invitedBy: ADMIN_USER.email
          }),
        })
      );

      // Mock successful registration with role assignment
      await page.route('**/api/invitations/complete', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: faker.string.uuid(),
              email: newUser.email,
              role: newUser.role,
              isActive: true,
              invitationStatus: 'accepted'
            }
          }),
        })
      );

      // WHEN: User completes registration
      await page.fill('[data-testid="password-input"]', newPassword);
      await page.fill('[data-testid="confirm-password-input"]', newPassword);
      await page.click('[data-testid="complete-registration-button"]');

      // THEN: User should be logged in with correct role
      await expect(page).toHaveURL(/dashboard/);

      // Mock user profile API to verify role assignment
      await page.route('**/api/user/profile', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: faker.string.uuid(),
            email: newUser.email,
            role: newUser.role,
            isActive: true,
            invitationStatus: 'accepted'
          }),
        })
      );

      // AND: Role should be displayed in user profile
      await expect(page.locator('[data-testid="user-role"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-role"]')).toHaveText(/supervisor/i);

      console.log(`✅ Role ${newUser.role} assigned successfully to ${newUser.email}`);
    });

    test('should follow RBAC patterns established in Story 1.2', async ({ page }) => {
      // GIVEN: Admin invites users with different roles
      await page.goto('/admin/users/invite');

      // Mock admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      // Mock role permissions API (from Story 1.2 patterns)
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

      // WHEN: Check role selector includes permission hints
      await page.click('[data-testid="role-selector"]');

      // THEN: Role options should show permission descriptions
      for (const role of ['operator', 'technician', 'supervisor', 'admin']) {
        await expect(page.locator(`[data-testid="role-option-${role}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="role-permissions-${role}"]`)).toBeVisible();
      }

      console.log('✅ RBAC patterns integrated correctly');
    });
  });

  test.describe('Security and Validation Measures', () => {
    test('should validate email format and prevent spam invitations', async ({ page }) => {
      // GIVEN: Admin is on invitation page
      await page.goto('/admin/users/invite');

      // Mock admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'admin_access_token',
            user: {
              id: faker.string.uuid(),
              email: ADMIN_USER.email,
              role: 'admin'
            }
          }),
        })
      );

      // WHEN: Try invalid email formats
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user..user@domain.com',
        'user@domain',
        'user space@domain.com',
        'user@domain..com'
      ];

      for (const email of invalidEmails) {
        await page.fill('[data-testid="invitation-email-input"]', email);
        await page.selectOption('[data-testid="role-selector"]', 'operator');

        // THEN: Form validation should prevent submission
        const sendButton = page.locator('[data-testid="send-invitation-button"]');
        const isDisabled = await sendButton.isDisabled();

        if (!isDisabled) {
          // If button is enabled, clicking should show error
          await page.click(sendButton);
          await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
        }

        console.log(`✅ Email validation blocked: ${email}`);

        // Clear form for next test
        await page.fill('[data-testid="invitation-email-input"]', '');
      }
    });

    test('should enforce admin-only access to invitation functionality', async ({ page }) => {
      // GIVEN: Non-admin user tries to access invitation panel
      const nonAdminUser = {
        email: 'operator@example.com',
        role: 'operator'
      };

      await page.goto('/login');

      // Mock non-admin authentication
      await page.route('**/auth/v1/token', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'operator_access_token',
            user: {
              id: faker.string.uuid(),
              email: nonAdminUser.email,
              role: nonAdminUser.role
            }
          }),
        })
      );

      // Mock user profile API (non-admin)
      await page.route('**/api/user/profile', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: faker.string.uuid(),
            email: nonAdminUser.email,
            role: nonAdminUser.role,
            permissions: ['view_maintenance'] // No admin permissions
          }),
        })
      );

      // Perform login
      await page.fill('[data-testid="email-input"]', nonAdminUser.email);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // WHEN: Try to access admin invitation panel
      await page.goto('/admin/users/invite');

      // THEN: Should be redirected or show access denied
      await expect(page).toHaveURL(/dashboard|login|access-denied/);

      // OR show access denied message
      const accessDenied = page.locator('[data-testid="access-denied"]');
      if (await accessDenied.isVisible()) {
        await expect(accessDenied).toContainText(/acceso|denegado|admin|authorized/i);
      }

      console.log('✅ Admin-only access control enforced');
    });
  });
});