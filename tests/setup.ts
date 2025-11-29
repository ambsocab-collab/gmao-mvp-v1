/**
 * Test Setup for Epic 1 - Foundation & User Management
 * Addresses risks R-001, R-002, R-003, R-004
 */

import { defineConfig, devices } from '@playwright/test';

// Test configuration for Epic 1 security-focused testing
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Timeout settings for security tests
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // Reporting for Epic 1 risk mitigation
  reporter: [
    ['html', { outputFolder: 'playwright-report-epic1' }],
    ['json', { outputFile: 'test-results-epic1.json' }],
    ['junit', { outputFile: 'test-results-epic1.xml' }],
  ],

  use: {
    // Base URL for local testing
    baseURL: 'http://localhost:3000',

    // Trace collection for security audit
    trace: 'on-first-retry',

    // Screenshot capture for failure analysis
    screenshot: 'only-on-failure',

    // Video recording for E2E tests
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 },
    },
  },

  // Projects for different test levels and priorities
  projects: [
    // P0 - Critical Security Tests (High Risk R-001, R-002)
    {
      name: 'p0-critical-security',
      testMatch: '**/e2e/auth/**/*p0*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // P0 - Critical Authentication Tests
    {
      name: 'p0-critical-auth',
      testMatch: '**/api/auth/**/*p0*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // P1 - High Priority Tests
    {
      name: 'p1-high-priority',
      testMatch: '**/{api,e2e}/**/*p1*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // P2 - Medium Priority Tests
    {
      name: 'p2-medium-priority',
      testMatch: '**/{unit,api}/**/*p2*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // P3 - Low Priority Tests
    {
      name: 'p3-low-priority',
      testMatch: '**/unit/**/*p3*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Global setup for test environment
  globalSetup: './tests/global-setup.ts',

  // Test dependencies
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
  ],
});