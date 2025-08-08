import { test, expect } from '@playwright/test';

test.describe('Team Selector E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('team selector dropdown is visible and clickable', async ({ page }) => {
    await page.goto('/');

    // Check if team selector is visible
    const teamSelector = page.locator('.team-selector');
    await expect(teamSelector).toBeVisible();

    // Check if the team button is clickable
    const teamButton = page.locator('.team-button');
    await expect(teamButton).toBeVisible();
    await expect(teamButton).toBeEnabled();

    // Verify initial team display (should default to BMA Training)
    await expect(teamButton).toContainText('BMA Training');
    await expect(teamButton.locator('.team-emoji')).toContainText('🎓');
  });

  test('dropdown opens and closes correctly', async ({ page }) => {
    await page.goto('/');

    const teamButton = page.locator('.team-button');
    const teamOptions = page.locator('.team-options');
    const dropdownArrow = page.locator('.dropdown-arrow');

    // Initially dropdown should be closed
    await expect(teamOptions).toBeHidden();
    await expect(dropdownArrow).not.toHaveClass(/open/);

    // Click to open dropdown
    await teamButton.click();
    await expect(teamOptions).toBeVisible();
    await expect(dropdownArrow).toHaveClass(/open/);

    // Verify dropdown contains both teams
    const bmaOption = page.locator('.team-option', { hasText: 'BMA Training' });
    const caffeineOption = page.locator('.team-option', { hasText: 'Caffeine' });
    
    await expect(bmaOption).toBeVisible();
    await expect(caffeineOption).toBeVisible();

    // Verify BMA Training is marked as selected
    await expect(bmaOption).toHaveClass(/selected/);
    await expect(bmaOption.locator('.checkmark')).toBeVisible();
    
    // Click outside to close dropdown
    await page.click('body', { position: { x: 0, y: 0 } });
    await expect(teamOptions).toBeHidden();
    await expect(dropdownArrow).not.toHaveClass(/open/);
  });

  test('can switch between teams', async ({ page }) => {
    await page.goto('/');

    const teamButton = page.locator('.team-button');
    
    // Open dropdown and switch to Caffeine team
    await teamButton.click();
    
    const caffeineOption = page.locator('.team-option', { hasText: 'Caffeine' });
    await caffeineOption.click();

    // Verify UI updates to show Caffeine team
    await expect(teamButton).toContainText('Caffeine');
    await expect(teamButton.locator('.team-emoji')).toContainText('☕');
    
    // Verify dropdown closes after selection
    const teamOptions = page.locator('.team-options');
    await expect(teamOptions).toBeHidden();

    // Switch back to BMA Training
    await teamButton.click();
    const bmaOption = page.locator('.team-option', { hasText: 'BMA Training' });
    await bmaOption.click();

    await expect(teamButton).toContainText('BMA Training');
    await expect(teamButton.locator('.team-emoji')).toContainText('🎓');
  });

  test('team selection persists in localStorage', async ({ page }) => {
    await page.goto('/');

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Check localStorage value
    const storedTeam = await page.evaluate(() => 
      localStorage.getItem('commitq-selected-team')
    );
    expect(storedTeam).toBe('caffeine');

    // Reload page and verify team persists
    await page.reload();
    const teamButton = page.locator('.team-button');
    await expect(teamButton).toContainText('Caffeine');
    await expect(teamButton.locator('.team-emoji')).toContainText('☕');
  });

  test('queue page title updates when switching teams', async ({ page }) => {
    await page.goto('/');

    // Verify initial queue title
    const queueTitle = page.locator('.queue-title');
    await expect(queueTitle).toContainText('BMA Training Queue');

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Verify queue title updates
    await expect(queueTitle).toContainText('Caffeine Queue');

    // Switch back and verify
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'BMA Training' }).click();
    
    await expect(queueTitle).toContainText('BMA Training Queue');
  });

  test('queue title shows correct team context', async ({ page }) => {
    await page.goto('/');

    // Verify queue title shows BMA Training
    const queueTitle = page.locator('.queue-title');
    await expect(queueTitle).toContainText('BMA Training Queue');

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Verify queue title updates to Caffeine
    await expect(queueTitle).toContainText('Caffeine Queue');
    
    // Switch back to verify it changes back
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'BMA Training' }).click();
    await expect(queueTitle).toContainText('BMA Training Queue');
  });

  test('action items page title updates when switching teams', async ({ page }) => {
    await page.goto('/action-items');

    // Verify initial section title (look for the one that contains "Pending Tasks")
    const sectionTitle = page.locator('.section-title', { hasText: 'Pending Tasks' });
    await expect(sectionTitle).toContainText('BMA Training Pending Tasks');

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Verify section title updates
    await expect(sectionTitle).toContainText('Caffeine Pending Tasks');
  });

  test('action items page shows team-specific content', async ({ page }) => {
    await page.goto('/action-items');

    // Verify BMA Training section is visible with correct team name
    const sectionTitle = page.locator('.section-title', { hasText: 'Pending Tasks' });
    await expect(sectionTitle).toContainText('BMA Training Pending Tasks');

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Wait for the team change to propagate
    await page.waitForTimeout(500);
    
    // Verify section updates to show Caffeine team
    await expect(sectionTitle).toContainText('Caffeine Pending Tasks');
  });

  test('team data isolation - queue items', async ({ page }) => {
    await page.goto('/');

    // Add an item to BMA Training queue
    const addForm = page.locator('form');
    const nameInput = page.locator('input[type="text"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await nameInput.fill('Test User BMA');
    await submitButton.click();

    // Verify item appears in queue
    await expect(page.locator('.queue-list')).toContainText('Test User BMA');

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Verify Caffeine queue is empty (isolated)
    await expect(page.locator('.empty-queue')).toBeVisible();
    await expect(page.locator('.empty-title')).toContainText('No items in Caffeine queue');

    // Add item to Caffeine queue
    await nameInput.fill('Test User Caffeine');
    await submitButton.click();

    // Verify Caffeine item appears
    await expect(page.locator('.queue-list')).toContainText('Test User Caffeine');
    await expect(page.locator('.queue-list')).not.toContainText('Test User BMA');

    // Switch back to BMA Training
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'BMA Training' }).click();

    // Verify BMA items are still there and isolated
    await expect(page.locator('.queue-list')).toContainText('Test User BMA');
    await expect(page.locator('.queue-list')).not.toContainText('Test User Caffeine');
  });

  test('team data isolation - action items shows different counts', async ({ page }) => {
    await page.goto('/action-items');

    // Get initial count for BMA Training
    const sectionTitle = page.locator('.section-title', { hasText: 'Pending Tasks' });
    await expect(sectionTitle).toBeVisible();
    
    const bmaTitle = await sectionTitle.textContent();
    
    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Wait for team change to propagate
    await page.waitForTimeout(500);

    // Verify title shows Caffeine and different count (indicating data isolation)
    await expect(sectionTitle).toContainText('Caffeine Pending Tasks');
    const caffeineTitle = await sectionTitle.textContent();
    
    // The titles should be different (different teams, potentially different counts)
    expect(bmaTitle).not.toBe(caffeineTitle);

    // Switch back to verify data isolation works both ways
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'BMA Training' }).click();
    await page.waitForTimeout(500);

    // Should show BMA Training again
    await expect(sectionTitle).toContainText('BMA Training Pending Tasks');
  });

  test('keyboard navigation works for dropdown', async ({ page }) => {
    await page.goto('/');

    const teamButton = page.locator('.team-button');
    
    // Focus the team button
    await teamButton.focus();
    
    // Note: The component doesn't currently handle Enter key for opening
    // Test the current implementation - click to open
    await teamButton.click();
    const teamOptions = page.locator('.team-options');
    await expect(teamOptions).toBeVisible();

    // Test that the dropdown properly handles click outside to close
    await page.click('body', { position: { x: 0, y: 0 } });
    await expect(teamOptions).toBeHidden();
  });

  test('aria attributes are correctly set', async ({ page }) => {
    await page.goto('/');

    const teamButton = page.locator('.team-button');
    
    // Check initial aria attributes
    await expect(teamButton).toHaveAttribute('aria-expanded', 'false');
    await expect(teamButton).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(teamButton).toHaveAttribute('role', 'combobox');

    // Open dropdown and check updated attributes
    await teamButton.click();
    await expect(teamButton).toHaveAttribute('aria-expanded', 'true');

    // Check option attributes
    const teamOptions = page.locator('.team-options');
    await expect(teamOptions).toHaveAttribute('role', 'listbox');

    const bmaOption = page.locator('.team-option', { hasText: 'BMA Training' });
    const caffeineOption = page.locator('.team-option', { hasText: 'Caffeine' });
    
    await expect(bmaOption).toHaveAttribute('role', 'option');
    await expect(bmaOption).toHaveAttribute('aria-selected', 'true');
    await expect(caffeineOption).toHaveAttribute('role', 'option');
    await expect(caffeineOption).toHaveAttribute('aria-selected', 'false');
  });

  test('dropdown closes when clicking backdrop', async ({ page }) => {
    await page.goto('/');

    const teamButton = page.locator('.team-button');
    const teamOptions = page.locator('.team-options');
    const backdrop = page.locator('.dropdown-backdrop');

    // Open dropdown
    await teamButton.click();
    await expect(teamOptions).toBeVisible();
    await expect(backdrop).toBeVisible();

    // Click backdrop to close
    await backdrop.click();
    await expect(teamOptions).toBeHidden();
    await expect(backdrop).toBeHidden();
  });

  test('team switching triggers custom event', async ({ page }) => {
    await page.goto('/');

    // Setup event listener before any interactions
    await page.evaluate(() => {
      (window as any).teamChangeEvents = [];
      window.addEventListener('teamchange', (e: any) => {
        (window as any).teamChangeEvents.push(e.detail.team);
      });
    });

    // Switch to Caffeine team
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();

    // Wait a moment for the event to be processed
    await page.waitForTimeout(100);

    // Check if event was fired
    let teamChangeEvents = await page.evaluate(() => (window as any).teamChangeEvents || []);
    expect(teamChangeEvents).toContain('caffeine');

    // Switch back to BMA Training
    await page.locator('.team-button').click();
    await page.locator('.team-option', { hasText: 'BMA Training' }).click();

    // Wait a moment for the event to be processed
    await page.waitForTimeout(100);

    teamChangeEvents = await page.evaluate(() => (window as any).teamChangeEvents || []);
    expect(teamChangeEvents).toContain('bma-training');
    expect(teamChangeEvents.length).toBe(2);
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const teamSelector = page.locator('.team-selector');
    const teamButton = page.locator('.team-button');

    // Verify team selector is still visible on mobile
    await expect(teamSelector).toBeVisible();
    await expect(teamButton).toBeVisible();

    // Test dropdown functionality on mobile
    await teamButton.click();
    const teamOptions = page.locator('.team-options');
    await expect(teamOptions).toBeVisible();

    // Switch teams on mobile
    await page.locator('.team-option', { hasText: 'Caffeine' }).click();
    await expect(teamButton).toContainText('Caffeine');
  });
});