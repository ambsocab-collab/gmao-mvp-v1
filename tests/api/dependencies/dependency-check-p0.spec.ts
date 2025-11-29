/**
 * Dependency Validation API Tests - Story 1.1
 *
 * Validates that all core dependencies from Acceptance Criteria 2 are properly installed
 * and accessible in the application runtime environment.
 */

import { test, expect } from '@playwright/test';

test.describe('Story 1.1: Dependency Validation API', () => {

  test('Tailwind CSS 3.4+ should be properly configured and working', async ({ request }) => {
    // GIVEN: Tailwind CSS is a required dependency
    const response = await request.get('/api/validate/tailwind');

    // WHEN: Checking Tailwind CSS configuration
    expect(response.status()).toBe(200);
    const validation = await response.json();

    // THEN: Tailwind should be fully configured
    expect(validation.installed).toBeTruthy();
    expect(validation.version).toMatch(/^3\.[4-9]\./); // 3.4+
    expect(validation.configured).toBeTruthy();
    expect(validation.postcss_configured).toBeTruthy();
    expect(validation.theme_industrial).toBeTruthy(); // Industrial UI specific
  });

  test('Shadcn/UI components should be available and working', async ({ request }) => {
    // GIVEN: Shadcn/UI is required for component library
    const response = await request.get('/api/validate/shadcn');

    // WHEN: Checking Shadcn/UI setup
    expect(response.status()).toBe(200);
    const validation = await response.json();

    // THEN: Shadcn/UI should be properly configured
    expect(validation.components_available).toContain('Button');
    expect(validation.components_available).toContain('Input');
    expect(validation.components_available).toContain('Label');
    expect(validation.radix_ui_available).toBeTruthy();
    expect(validation.custom_styling).toBeTruthy();
  });

  test('Lucide React icons should be available for industrial UI', async ({ request }) => {
    // GIVEN: Lucide React is required for icons
    const response = await request.get('/api/validate/lucide');

    // WHEN: Checking Lucide React availability
    expect(response.status()).toBe(200);
    const validation = await response.json();

    // THEN: Lucide React should be working
    expect(validation.installed).toBeTruthy();
    expect(validation.icons_count).toBeGreaterThan(100); // Reasonable icon count
    expect(validation.industrial_icons).toContain('Wrench');
    expect(validation.industrial_icons).toContain('Settings');
    expect(validation.tree_shakable).toBeTruthy();
  });

  test('TanStack Query v5 should be configured for server state', async ({ request }) => {
    // GIVEN: TanStack Query v5 is required for server state management
    const response = await request.get('/api/validate/tanstack-query');

    // WHEN: Checking TanStack Query configuration
    expect(response.status()).toBe(200);
    const validation = await response.json();

    // THEN: TanStack Query v5 should be properly configured
    expect(validation.installed).toBeTruthy();
    expect(validation.version).toMatch(/^5\./); // v5.x
    expect(validation.query_client_configured).toBeTruthy();
    expect(validation.provider_wrapped).toBeTruthy();
    expect(validation.devtools_available).toBeTruthy();
  });

  test('Zustand should be available for client state management', async ({ request }) => {
    // GIVEN: Zustand is required for client state
    const response = await request.get('/api/validate/zustand');

    // WHEN: Checking Zustand setup
    expect(response.status()).toBe(200);
    const validation = await response.json();

    // THEN: Zustand should be properly configured
    expect(validation.installed).toBeTruthy();
    expect(validation.stores_created).toContain('auth-store');
    expect(validation.stores_created).toContain('ui-store');
    expect(validation.typescript_support).toBeTruthy();
    expect(validation.persist_configured).toBeTruthy(); // For offline capability
  });

  test('All dependencies should be properly integrated', async ({ request }) => {
    // GIVEN: All dependencies need to work together
    const response = await request.get('/api/validate/integration');

    // WHEN: Testing integration between all dependencies
    expect(response.status()).toBe(200);
    const validation = await response.json();

    // THEN: Integration should be seamless
    expect(validation.tailwind_shadcn_integration).toBeTruthy();
    expect(validation.icons_working).toBeTruthy();
    expect(validation.state_management_integration).toBeTruthy();
    expect(validation.no_conflicts).toBeTruthy();
    expect(validation.build_optimized).toBeTruthy();
  });
});