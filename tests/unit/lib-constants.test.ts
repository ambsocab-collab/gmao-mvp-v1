import { describe, it, expect } from 'vitest';
import { APP_CONFIG, API_ENDPOINTS, PWA_CONFIG } from '../../lib/constants';

describe('Application Constants - lib/constants.ts', () => {
  describe('APP_CONFIG', () => {
    test('[P2] should have required app configuration', () => {
      expect(APP_CONFIG).toBeDefined();
      expect(typeof APP_CONFIG.name).toBe('string');
      expect(typeof APP_CONFIG.version).toBe('string');
      expect(APP_CONFIG.name).toBeTruthy();
      expect(APP_CONFIG.version).toBeTruthy();
    });

    test('[P2] should have valid app name for industrial context', () => {
      expect(APP_CONFIG.name).toBe('GMAO MVP');
    });
  });

  describe('API_ENDPOINTS', () => {
    test('[P2] should have defined API endpoints structure', () => {
      expect(API_ENDPOINTS).toBeDefined();
      expect(typeof API_ENDPOINTS).toBe('object');
    });

    test('[P2] should have base URL configuration', () => {
      if (API_ENDPOINTS.baseURL) {
        expect(typeof API_ENDPOINTS.baseURL).toBe('string');
        expect(API_ENDPOINTS.baseURL).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('PWA_CONFIG', () => {
    test('[P2] should have PWA configuration for industrial app', () => {
      expect(PWA_CONFIG).toBeDefined();
      expect(typeof PWA_CONFIG).toBe('object');
    });

    test('[P2] should have proper PWA theme colors', () => {
      if (PWA_CONFIG.themeColor) {
        expect(PWA_CONFIG.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }

      if (PWA_CONFIG.backgroundColor) {
        expect(PWA_CONFIG.backgroundColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    test('[P2] should have proper PWA display mode', () => {
      if (PWA_CONFIG.display) {
        expect(['fullscreen', 'standalone', 'minimal-ui', 'browser']).toContain(PWA_CONFIG.display);
      }
    });
  });
});