/**
 * Project Setup Validation Tests - Story 1.1
 *
 * These tests MUST FAIL initially (RED phase) to validate missing infrastructure
 * before development begins. Each test validates a specific acceptance criterion.
 */

import { test, expect } from '@playwright/test';

test.describe('Story 1.1: Project Setup & Initial Infrastructure Validation', () => {

  test('AC1: Next.js 15 project should initialize with App Router and Supabase integration', async ({ page }) => {
    // GIVEN: Project should be running
    await page.goto('/');

    // WHEN: Application loads
    // THEN: Next.js 15 App Router should be working
    await expect(page.locator('body')).toBeVisible();

    // Check for Next.js App Router patterns
    const response = await page.goto('/__nextjs_original-stack-frame');
    expect(response?.status()).toBe(404); // Next.js router pattern

    // Verify Supabase integration available
    await expect(page.locator('[data-testid="supabase-status"]')).toBeVisible();
  });

  test('AC2: Core dependencies should be installed and configured', async ({ page }) => {
    // GIVEN: Application is running
    await page.goto('/');

    // WHEN: Checking for Tailwind CSS
    const tailwindClasses = ['flex', 'container', 'bg-blue-500'];
    const bodyClasses = await page.locator('body').getAttribute('class') || '';

    // THEN: Tailwind CSS should be available
    expect(tailwindClasses.some(cls => bodyClasses.includes(cls))).toBeTruthy();

    // Verify Shadcn/UI components available
    await expect(page.locator('[data-testid="shadcn-button"]')).toBeVisible();

    // Verify Lucide React icons
    await expect(page.locator('[data-testid="lucide-icon"]')).toBeVisible();

    // Check TanStack Query availability
    await expect(page.locator('[data-testid="react-query-devtools"]')).toBeVisible();
  });

  test('AC3: ESLint and Prettier should be configured for code quality', async ({ page, request }) => {
    // GIVEN: Development environment
    // WHEN: Checking code quality configuration
    const eslintResponse = await request.get('/api/eslint-config');
    const prettierResponse = await request.get('/api/prettier-config');

    // THEN: Code quality tools should be configured
    expect(eslintResponse.status()).toBe(200);
    expect(prettierResponse.status()).toBe(200);

    // Verify ESLint rules are enforced
    await expect(page.locator('[data-testid="eslint-status"]')).toHaveText('configured');

    // Verify Prettier formatting active
    await expect(page.locator('[data-testid="prettier-status"]')).toHaveText('configured');
  });

  test('AC4: PWA configuration should be available with manifest', async ({ page }) => {
    // GIVEN: Application is running
    await page.goto('/');

    // WHEN: Checking PWA capabilities
    const manifestResponse = await page.evaluate(() => {
      return fetch('/manifest.json').then(r => r.json());
    });

    // THEN: PWA manifest should be properly configured
    expect(manifestResponse).toMatchObject({
      name: expect.any(String),
      short_name: expect.any(String),
      display: 'standalone',
      theme_color: expect.any(String),
      background_color: expect.any(String)
    });

    // Verify service worker registration
    const serviceWorker = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });
    expect(serviceWorker).toBeTruthy();

    // Verify PWA installation prompt capability
    const isInstallable = await page.evaluate(() => {
      return 'BeforeInstallPromptEvent' in window;
    });
    expect(isInstallable).toBeTruthy();
  });

  test('AC5: Project directory structure should follow architecture specification', async ({ request }) => {
    // GIVEN: Project should have proper structure
    const structureChecks = [
      'app/(auth)/layout.tsx',      // Auth route group
      'app/(dashboard)/layout.tsx', // Dashboard route group
      'components/ui/button.tsx',   // UI components
      'lib/supabase.ts',           // Utilities
      'types/database.ts'          // TypeScript definitions
    ];

    // WHEN: Checking each required structure element
    const results = await Promise.all(
      structureChecks.map(async (path) => {
        const response = await request.get(`/api/check-file?path=${path}`);
        return { path, exists: response.status() === 200 };
      })
    );

    // THEN: All structure elements should exist
    results.forEach(({ path, exists }) => {
      expect(exists).toBeTruthy();
    });

    // Verify architecture alignment
    await expect(await request.get('/api/architecture-validation')).toHaveStatus(200);
  });

  test('Build process should work without errors', async ({ request }) => {
    // GIVEN: Project should be buildable
    // WHEN: Attempting build
    const buildResponse = await request.post('/api/build', {
      data: { command: 'npm run build' }
    });

    // THEN: Build should succeed
    expect(buildResponse.status()).toBe(200);
    const buildResult = await buildResponse.json();

    expect(buildResult.success).toBeTruthy();
    expect(buildResult.output).not.toContain('error');
    expect(buildResult.output).toContain('completed');
  });

  test('Environment variables should be properly configured for Supabase', async ({ request }) => {
    // GIVEN: Supabase integration required
    // WHEN: Checking environment configuration
    const envCheck = await request.get('/api/env-validation');

    // THEN: Required environment variables should be present
    expect(envCheck.status()).toBe(200);
    const envValidation = await envCheck.json();

    expect(envValidation.required_vars).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(envValidation.required_vars).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(envValidation.all_present).toBeTruthy();
  });

  test('TypeScript strict mode should be enabled with no type errors', async ({ request }) => {
    // GIVEN: TypeScript configuration required
    // WHEN: Checking TypeScript compilation
    const typeCheck = await request.post('/api/type-check', {
      data: { command: 'npx tsc --noEmit --strict' }
    });

    // THEN: TypeScript should compile without errors
    expect(typeCheck.status()).toBe(200);
    const typeResult = await typeCheck.json();

    expect(typeResult.success).toBeTruthy();
    expect(typeResult.errorCount).toBe(0);
    expect(typeResult.strictMode).toBeTruthy();
  });
});