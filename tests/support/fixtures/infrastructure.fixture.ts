/**
 * Infrastructure Testing Fixtures
 *
 * Provides reusable fixtures for infrastructure validation tests
 * and prepares foundation for future ATDD acceptance tests.
 */

import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Define comprehensive fixture types
type InfrastructureFixtures = {
  testEnvironment: {
    isCI: boolean;
    baseURL: string;
    buildTimeout: number;
    typeCheckTimeout: number;
  };
  projectStructure: {
    requiredDirectories: string[];
    requiredFiles: string[];
    requiredConfigFiles: string[];
  };
  dependencyChecker: {
    coreDependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  buildValidator: {
    validateBuild(): Promise<{ success: boolean; output: string; duration: number }>;
    validateTypeScript(): Promise<{ success: boolean; errors: string[]; warnings: string[] }>;
  };
  mockData: {
    createMockUser(overrides?: any): any;
    createMockAsset(overrides?: any): any;
    createMockOrder(overrides?: any): any;
  };
};

// Base infrastructure fixture
export const test = base.extend<InfrastructureFixtures>({
  // Test environment configuration
  testEnvironment: async ({}, use) => {
    const env = {
      isCI: !!process.env.CI,
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      buildTimeout: 5 * 60 * 1000, // 5 minutes for build tests
      typeCheckTimeout: 2 * 60 * 1000, // 2 minutes for type checking
    };

    await use(env);
  },

  // Project structure validator
  projectStructure: async ({}, use) => {
    const structure = {
      requiredDirectories: [
        'app/(auth)',
        'app/(dashboard)',
        'components/ui',
        'components/assets',
        'components/orders',
        'components/canvas',
        'components/shared',
        'lib',
        'types'
      ],
      requiredFiles: [
        'app/layout.tsx',
        'app/(auth)/layout.tsx',
        'app/(dashboard)/layout.tsx',
        'components/ui/button.tsx',
        'lib/supabase.ts',
        'types/database.ts'
      ],
      requiredConfigFiles: [
        'next.config.js',
        'tailwind.config.ts',
        'tsconfig.json',
        'eslint.config.mjs',
        '.prettierrc',
        'playwright.config.ts'
      ]
    };

    await use(structure);
  },

  // Dependency validator
  dependencyChecker: async ({}, use) => {
    const checker = {
      coreDependencies: {
        'next': '15',
        '@supabase/ssr': 'latest',
        '@supabase/supabase-js': '^2.86.0',
        'tailwindcss': '^3.4.1',
        '@radix-ui/react-slot': '^1.2.2',
        'lucide-react': '^0.511.0',
        '@tanstack/react-query': '^5',
        'zustand': '^4'
      },
      devDependencies: {
        '@playwright/test': '^1.57.0',
        '@faker-js/faker': '^10.1.0',
        'typescript': '^5'
      }
    };

    await use(checker);
  },

  // Build and type checking utilities
  buildValidator: async ({}, use) => {
    const validator = {
      async validateBuild(): Promise<{ success: boolean; output: string; duration: number }> {
        // This will be implemented by the build API endpoint
        return {
          success: false, // Will fail until implementation
          output: 'Build not yet implemented',
          duration: 0
        };
      },

      async validateTypeScript(): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
        // This will be implemented by the type-check API endpoint
        return {
          success: false, // Will fail until implementation
          errors: ['TypeScript strict mode not yet configured'],
          warnings: []
        };
      }
    };

    await use(validator);
  },

  // Mock data generators for future ATDD
  mockData: async ({}, use) => {
    const mock = {
      createMockUser: (overrides = {}) => ({
        id: faker.number.int(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: 'technician',
        createdAt: faker.date.recent().toISOString(),
        ...overrides
      }),

      createMockAsset: (overrides = {}) => ({
        id: faker.number.int(),
        code: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
        name: faker.company.name(),
        type: 'machinery',
        status: 'operational',
        location: faker.location.streetAddress(),
        lastMaintenance: faker.date.past().toISOString(),
        ...overrides
      }),

      createMockOrder: (overrides = {}) => ({
        id: faker.number.int(),
        technicianId: faker.number.int(),
        assetId: faker.number.int(),
        type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        createdAt: faker.date.recent().toISOString(),
        ...overrides
      })
    };

    await use(mock);
  }
});

// Re-export expect for test assertions
export { expect };

// Export test fixtures for use in other test files
export {
  test as infrastructureTest,
  type InfrastructureFixtures
};