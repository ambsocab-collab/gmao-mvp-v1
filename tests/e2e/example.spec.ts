import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    // Expect the page to contain the intro text from the starter template
    await expect(page.getByText('Next.js')).toBeVisible();
    await expect(page.getByText('Supabase')).toBeVisible();
  });

  test('should create user (simulated)', async ({ userFactory }) => {
    // Create test user
    const user = await userFactory.createUser();
    expect(user.email).toContain('@');
  });
});
