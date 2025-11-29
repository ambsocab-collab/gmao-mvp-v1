/**
 * Authentication Helper for Epic 1 Testing
 * Centralizes authentication operations for risk mitigation tests
 */

import { Page, Locator, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with email and password
   * Risk Mitigation: R-001 (Authentication compromised)
   */
  async login(email: string, password: string): Promise<void> {
    // Fill email field
    const emailField = this.page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
    await expect(emailField).toBeVisible({ timeout: 5000 });
    await emailField.fill(email);

    // Fill password field
    const passwordField = this.page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]');
    await expect(passwordField).toBeVisible();
    await passwordField.fill(password);

    // Click submit button
    const submitButton = this.page.locator('button[type="submit"], [data-testid="login-button"], button:has-text("Sign"), button:has-text("Login")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for either success (redirect) or error
    await Promise.race([
      this.page.waitForURL(/dashboard|admin/, { timeout: 10000 }),
      this.page.waitForSelector('[data-testid="error-message"], .error, .alert-error', { timeout: 5000 })
    ]);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const userMenu = this.page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")');
    await expect(userMenu).toBeVisible();
    await userMenu.click();

    const logoutButton = this.page.locator('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign")');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await this.page.waitForURL(/login/, { timeout: 5000 });
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const userMenu = this.page.locator('[data-testid="user-menu"], .user-menu');
      await userMenu.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current user role from UI
   */
  async getUserRole(): Promise<string | null> {
    try {
      const roleElement = this.page.locator('[data-testid="user-role"], .user-role, [data-testid="current-role"]');
      await expect(roleElement).toBeVisible({ timeout: 2000 });
      return await roleElement.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Verify user has specific role
   * Risk Mitigation: R-002 (Role-based access control)
   */
  async verifyRole(expectedRole: string): Promise<boolean> {
    const actualRole = await this.getUserRole();
    return actualRole?.toLowerCase().includes(expectedRole.toLowerCase()) || false;
  }

  /**
   * Navigate to protected route
   */
  async navigateToProtectedRoute(route: string): Promise<void> {
    await this.page.goto(route);

    // Check if redirected to login (not authenticated)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(`Authentication required for route: ${route}`);
    }
  }

  /**
   * Test access control for specific route
   * Risk Mitigation: R-002 (Role-based access control)
   */
  async testAccessControl(route: string, expectedAccessible: boolean): Promise<boolean> {
    try {
      await this.navigateToProtectedRoute(route);
      return expectedAccessible;
    } catch {
      return !expectedAccessible;
    }
  }
}