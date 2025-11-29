import { faker } from '@faker-js/faker';

export type EnvironmentConfig = {
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_APP_VERSION: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  BASE_URL: string;
};

export type PWAManifest = {
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: string;
  orientation: string;
  start_url: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
};

export const createEnvironmentConfig = (overrides: Partial<EnvironmentConfig> = {}): EnvironmentConfig => {
  return {
    NEXT_PUBLIC_APP_NAME: 'GMAO MVP',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: faker.string.alphanumeric(40),
    BASE_URL: 'http://localhost:3000',
    ...overrides,
  };
};

export const createPWAManifest = (overrides: Partial<PWAManifest> = {}): PWAManifest => {
  return {
    name: 'GMAO MVP',
    short_name: 'GMAO',
    description: 'Gestión de Mantenimiento Industrial',
    theme_color: '#1e293b',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    ...overrides,
  };
};

export const createTestData = {
  environment: createEnvironmentConfig,
  pwaManifest: createPWAManifest,
};

// Utility functions for test data
export const generateRandomAppConfig = () => ({
  name: faker.company.name(),
  version: faker.system.semver(),
  description: faker.lorem.sentence(),
});

export const generateInvalidManifest = () => ({
  name: '',
  short_name: '',
  // Missing required fields for negative testing
});

export const generateValidEnvironmentVariables = () => ({
  NEXT_PUBLIC_APP_NAME: 'GMAO MVP',
  NEXT_PUBLIC_APP_VERSION: '1.0.0',
  SUPABASE_URL: 'https://valid.supabase.co',
  SUPABASE_ANON_KEY: 'valid-anon-key-string',
  BASE_URL: 'http://localhost:3000',
});