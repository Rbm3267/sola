import { test, expect } from '@playwright/test';

test.describe('Sola AIR Site & Product Audit', () => {

  test('Homepage Integrity & Consistency Check', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // 1. Title verification
    await expect(page).toHaveTitle('Sola');

    // 2. Main Brand Mark & Slogan
    await expect(page.locator('h1')).toContainText('Software that');
    await expect(page.locator('h1')).toContainText('builds itself.');

    // 3. Brand Pill & Specs Consistency
    await expect(page.getByText('3.2 kB Core')).toBeVisible();
    await expect(page.getByText('0 Dependencies')).toBeVisible();
    await expect(page.getByText('Native AI Intent')).toBeVisible();

    // 4. Primary Navigation Elements
    const nav = page.locator('nav');
    await expect(nav.getByText('Overview')).toBeVisible();
    await expect(nav.getByText('Component Library')).toBeVisible();
    await expect(nav.getByText('Interactive Docs')).toBeVisible();
    await expect(nav.getByText('Canvas Playground')).toBeVisible();

    // 5. Zero unhandled console errors
    expect(consoleErrors).toEqual([]);
  });

  test('Component Library Page Audit', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/components');

    // Verify header and sidebar primitives
    await expect(page.locator('h1')).toContainText('Component Library');
    await expect(page.getByRole('button', { name: 'DataCard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'DynamicForm' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ListBlock' })).toBeVisible();

    // Test tab switching between Live Preview, .sola code, and Compiled JS
    await page.getByRole('button', { name: '.sola Markup' }).click();
    await expect(page.locator('pre code')).toContainText('sola-datacard');

    await page.getByRole('button', { name: 'Compiled JS' }).click();
    await expect(page.locator('pre code')).toContainText('@sola/compiler');

    expect(consoleErrors).toEqual([]);
  });

  test('Interactive Documentation & AI Assistant Audit', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/docs');

    // Verify AI generative assistant and table of contents
    await expect(page.locator('h2')).toContainText('Documentation that explains itself.');
    await expect(page.getByRole('button', { name: 'Quickstart & Installation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ambient Intent Signals ($intent)' })).toBeVisible();

    // Click section
    await page.getByRole('button', { name: 'The .sola File Format' }).click();
    await expect(page.locator('h1')).toContainText('The .sola Component Format');

    expect(consoleErrors).toEqual([]);
  });

  test('Playground & Voice Recognition UI Audit', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/demo');

    // Verify Speech & Text Input elements
    await expect(page.locator('h1')).toContainText('Ambient Intent Playground');
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', /Speak or type intent/);

    // Verify Microphone button exists
    const micButton = page.locator('button[aria-label="Voice intent recognition"]');
    await expect(micButton).toBeVisible();

    // Verify Suggestions exist
    await expect(page.getByText('Show Q3 revenue and churn rate for enterprise tier')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

});
