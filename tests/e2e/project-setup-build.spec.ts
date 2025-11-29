import { test, expect } from '@playwright/test';

test.describe('Project Setup - Build Process', () => {
  test('[P0] should load application without build errors', async ({ page }) => {
    // GIVEN: Application is running
    // (handled by playwright.config.ts webServer)

    // WHEN: User accesses the application
    await page.goto('/');

    // THEN: Page loads without errors
    await page.waitForLoadState('networkidle');

    // AND: No JavaScript errors in console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('[P1] should have proper Next.js App Router structure', async ({ page }) => {
    // GIVEN: Application is running
    await page.goto('/');

    // WHEN: Page loads completely
    await page.waitForLoadState('networkidle');

    // THEN: Root layout is properly structured
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // AND: No deprecated pages router usage
    const pagesRouterError = page.locator('text=This page could not be found');
    await expect(pagesRouterError).not.toBeVisible();
  });

  test('[P2] should load environment configuration properly', async ({ page }) => {
    // GIVEN: Application is running with environment variables
    await page.goto('/');

    // WHEN: Page loads
    await page.waitForLoadState('networkidle');

    // THEN: Environment variables are accessible (indirect validation)
    const title = await page.title();
    expect(title).toBe('GMAO MVP - Sistema de Mantenimiento Industrial'); // Actual title from layout

    // AND: Base URL is properly configured
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3000');
  });
});