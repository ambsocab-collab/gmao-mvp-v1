/**
 * Infrastructure Data Factories
 *
 * Factory functions for creating test data related to infrastructure validation
 * and preparation for future GMAO application testing.
 */

import { faker } from '@faker-js/faker';

// Types for infrastructure testing
export interface EnvironmentConfig {
  name: string;
  url: string;
  isProduction: boolean;
  supabaseConfigured: boolean;
  featuresEnabled: string[];
}

export interface DependencyInfo {
  name: string;
  version: string;
  installed: boolean;
  configured: boolean;
  type: 'dependency' | 'devDependency';
}

export interface BuildResult {
  success: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  outputSize: number;
}

export interface ProjectStructure {
  path: string;
  exists: boolean;
  type: 'directory' | 'file';
  lastModified: Date;
}

// Environment configuration factory
export const createEnvironmentConfig = (overrides = {}): EnvironmentConfig => ({
  name: faker.helpers.arrayElement(['development', 'staging', 'production']),
  url: faker.internet.url(),
  isProduction: false,
  supabaseConfigured: false, // Will fail until implemented
  featuresEnabled: ['auth', 'dashboard'],
  ...overrides
});

// Dependency information factory
export const createDependencyInfo = (overrides = {}): DependencyInfo => ({
  name: faker.helpers.arrayElement([
    'next', '@supabase/ssr', 'tailwindcss', '@radix-ui/react-slot',
    'lucide-react', '@tanstack/react-query', 'zustand'
  ]),
  version: `${faker.number.int({ min: 1, max: 20 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
  installed: false, // Will fail until implementation
  configured: false, // Will fail until implementation
  type: faker.helpers.arrayElement(['dependency', 'devDependency']),
  ...overrides
});

// Build result factory
export const createBuildResult = (overrides = {}): BuildResult => ({
  success: false, // Will fail until implementation
  duration: faker.number.int({ min: 30000, max: 300000 }), // 30s - 5min
  errors: [
    'Next.js project not yet configured',
    'Dependencies not installed',
    'TypeScript errors found'
  ],
  warnings: [
    'PWA configuration incomplete',
    'Environment variables missing'
  ],
  outputSize: faker.number.int({ min: 1000000, max: 5000000 }), // 1MB - 5MB
  ...overrides
});

// Project structure factory
export const createProjectStructure = (overrides = {}): ProjectStructure => ({
  path: faker.helpers.arrayElement([
    'app/(auth)', 'app/(dashboard)', 'components/ui',
    'lib/supabase.ts', 'types/database.ts'
  ]),
  exists: false, // Will fail until implementation
  type: faker.helpers.arrayElement(['directory', 'file']),
  lastModified: faker.date.past(),
  ...overrides
});

// Bulk creation helpers
export const createDependencyList = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createDependencyInfo(overrides));

export const createStructureList = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createProjectStructure(overrides));

// Specific configurations for different scenarios
export const createFailingEnvironmentConfig = () => createEnvironmentConfig({
  name: 'development',
  supabaseConfigured: false,
  featuresEnabled: [] // No features working yet
});

export const createSuccessEnvironmentConfig = () => createEnvironmentConfig({
  name: 'development',
  supabaseConfigured: true,
  featuresEnabled: ['auth', 'dashboard', 'pwa']
});

export const createFailingBuildResult = () => createBuildResult({
  success: false,
  errors: [
    'Next.js 15 not installed',
    'App Router not configured',
    'Supabase client missing',
    'TypeScript strict mode not enabled',
    'Tailwind CSS not configured',
    'PWA manifest missing'
  ],
  duration: faker.number.int({ min: 60000, max: 120000 }) // 1-2 min
});

export const createSuccessBuildResult = () => createBuildResult({
  success: true,
  errors: [],
  warnings: [],
  duration: faker.number.int({ min: 30000, max: 90000 }) // 30-90 sec
});

// Utility for generating test scenarios
export const createInfrastructureTestScenario = () => ({
  environment: createFailingEnvironmentConfig(),
  dependencies: createDependencyList(8, { installed: false, configured: false }),
  build: createFailingBuildResult(),
  structure: createStructureList(12, { exists: false }),
  typeCheck: {
    success: false,
    strictMode: false,
    errors: ['TypeScript strict mode not enabled', 'Missing type definitions']
  }
});

// Future GMAO-specific factories (preparation for ATDD)
export const createGmaoAsset = (overrides = {}) => ({
  id: faker.number.int(),
  code: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
  name: faker.company.name(),
  type: faker.helpers.arrayElement(['machinery', 'vehicle', 'equipment', 'tool']),
  status: faker.helpers.arrayElement(['operational', 'maintenance', 'repair', 'decommissioned']),
  location: faker.location.streetAddress(),
  createdAt: faker.date.recent().toISOString(),
  lastMaintenance: faker.date.past().toISOString(),
  ...overrides
});

export const createGmaoUser = (overrides = {}) => ({
  id: faker.number.int(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: faker.helpers.arrayElement(['technician', 'supervisor', 'admin', 'operator']),
  department: faker.helpers.arrayElement(['maintenance', 'operations', 'quality']),
  createdAt: faker.date.recent().toISOString(),
  ...overrides
});

export const createGmaoOrder = (overrides = {}) => ({
  id: faker.number.int(),
  assetId: faker.number.int(),
  technicianId: faker.number.int(),
  type: faker.helpers.arrayElement(['maintenance', 'repair', 'inspection', 'calibration']),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
  status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed', 'cancelled']),
  createdAt: faker.date.recent().toISOString(),
  scheduledFor: faker.date.future().toISOString(),
  ...overrides
});