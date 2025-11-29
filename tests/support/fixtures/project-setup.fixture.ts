import { test as base } from '@playwright/test';

export type ProjectSetupFixture = {
  mockEnvironmentVariables: () => void;
  validatePWAManifest: () => Promise<boolean>;
  checkServiceWorker: () => Promise<boolean>;
};

export const test = base.extend<ProjectSetupFixture>({
  mockEnvironmentVariables: async ({ page }, use) => {
    const mockEnv = () => {
      // Mock environment variables for testing
      page.addInitScript(() => {
        // This would typically be handled by the build process
        // For testing, we ensure these are available
        (window as any).__TEST_ENV__ = true;
      });
    };

    await use(mockEnv);
  },

  validatePWAManifest: async ({ page }, use) => {
    const validateManifest = async () => {
      try {
        const manifestResponse = await page.goto('/manifest.json');
        if (!manifestResponse?.ok()) return false;

        const manifest = await manifestResponse?.json();
        return !!(
          manifest.name &&
          manifest.short_name &&
          manifest.display &&
          manifest.theme_color &&
          manifest.background_color
        );
      } catch {
        return false;
      }
    };

    await use(validateManifest);
  },

  checkServiceWorker: async ({ page }, use) => {
    const checkSW = async () => {
      return await page.evaluate(() => {
        return navigator.serviceWorker.getRegistration()
          .then(registration => !!registration)
          .catch(() => false);
      });
    };

    await use(checkSW);
  },
});