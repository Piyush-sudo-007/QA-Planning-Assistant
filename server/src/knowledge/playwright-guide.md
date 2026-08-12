# Playwright E2E Best Practices & Guide

## Standard Structure for Playwright Tests
1. **Page Object Model (POM)**: Encapsulate page element locators and interaction helper methods into reusable class objects.
2. **User-Visible Locators**: Prefer resilient locators like `page.getByRole()`, `page.getByText()`, `page.getByLabel()`, and `page.getByTestId()`. Avoid fragile CSS paths or XPath.

## Recommended Playwright Syntax Pattern
```javascript
import { test, expect } from '@playwright/test';

test.describe('QA Planning Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create and review a QA plan', async ({ page }) => {
    await page.getByRole('button', { name: 'New QA Plan' }).click();
    await page.getByLabel('Project Name').fill('User Authentication System');
    await page.getByLabel('Requirement').fill('Implement OAuth2 login with Google');
    await page.getByRole('button', { name: 'Generate QA Plan' }).click();

    await expect(page.getByText('Coverage Analysis')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Plan' })).toBeEnabled();
  });
});
```

## Assertion Principles
- Use auto-retrying assertions (`await expect(locator).toBeVisible()`).
- Intercept and mock backend API calls during frontend-focused Playwright testing using `page.route()`.
