import { test, expect } from '@playwright/test';

test.describe('Agentic QA Planning Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display authentication page when unauthenticated', async ({ page }) => {
    await expect(page.getByText('Sign In to QA Planner')).toBeVisible();
  });

  test('should allow user registration and navigate to dashboard', async ({ page }) => {
    await page.getByRole('button', { name: "Don't have an account? Register" }).click();

    await page.getByPlaceholder('Developer Name').fill('E2E Tester');
    await page.getByPlaceholder('developer@company.com').fill(`e2e-${Date.now()}@example.com`);
    await page.getByPlaceholder('••••••••').fill('password123');

    await page.getByRole('button', { name: 'Register Account' }).click();

    await expect(page.getByText('Developer QA Dashboard')).toBeVisible();
  });
});
