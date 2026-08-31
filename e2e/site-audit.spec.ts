import { test, expect } from '@playwright/test';

test.describe('Sola AIR Site & Product Audit', () => {

  test('Homepage Integrity & Consistency Check', async ({ page }) => {
    await page.goto('/');

    // 1. Title verification
    await expect(page).toHaveTitle(/Sola/);

    // 2. Main Brand Mark & Slogan
    await expect(page.locator('h1')).toContainText('Build beautiful interfaces');

    // 3. Primary Navigation Elements
    const nav = page.locator('nav');
    await expect(nav.getByText('Studio')).toBeVisible();
    await expect(nav.getByText('Components')).toBeVisible();
    await expect(nav.getByText('Community')).toBeVisible();
    await expect(nav.getByText('Docs')).toBeVisible();
    await expect(nav.getByText('Extension')).toBeVisible();
  });

  test('Component Library Page Audit', async ({ page }) => {
    await page.goto('/components');

    // Verify header and catalog list
    await expect(page.locator('h1')).toContainText('Foundational UI Building Blocks');
    await expect(page.getByRole('button', { name: 'Metric Card' }).first()).toBeVisible();

    // Test code tabs (Native .sola, React 19, Svelte 5, HTML)
    await page.getByRole('button', { name: '.sola' }).first().click();
    await expect(page.locator('pre code')).toBeVisible();

    await page.getByRole('button', { name: 'React 19' }).click();
    await expect(page.locator('pre code')).toBeVisible();
  });

  test('Interactive Documentation & Navigation Audit', async ({ page }) => {
    await page.goto('/docs');

    // Verify Docs Header & Content
    await expect(page.getByRole('heading', { name: 'Installation & Setup' })).toBeVisible();
    await expect(page.getByText('Reactivity & Signals').first()).toBeVisible();
  });

  test('Playground & Voice Recognition UI Audit', async ({ page }) => {
    await page.goto('/demo');

    // Verify Speech & Text Input elements
    await expect(page.getByRole('heading', { name: 'Ambient Intent Playground' })).toBeVisible();
    const input = page.locator('input[placeholder*="Speak or type intent"]');
    await expect(input).toBeVisible();

    // Verify Microphone button exists
    const micButton = page.locator('button[aria-label="Voice intent recognition"]');
    await expect(micButton).toBeVisible();
  });

});
