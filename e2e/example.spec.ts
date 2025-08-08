import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check if main components are present
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    
    // Check if header is present
    await expect(page.locator('header')).toBeVisible();
  });

  test('action items page loads correctly', async ({ page }) => {
    await page.goto('/action-items');
    
    // Check if main components are present
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    
    // Check for action items specific elements
    await expect(page.locator('.section-title')).toBeVisible();
  });

  test('navigation between pages works', async ({ page }) => {
    await page.goto('/');
    
    // Go to action items page
    await page.goto('/action-items');
    await expect(page.locator('.section-title')).toContainText('Pending Tasks');
    
    // Go back to home
    await page.goto('/');
    await expect(page.locator('.queue-title')).toContainText('Queue');
  });
});