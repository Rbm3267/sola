# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-audit.spec.ts >> Sola AIR Site & Product Audit >> Playground & Voice Recognition UI Audit
- Location: e2e\site-audit.spec.ts:46:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Ambient Intent Playground' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Ambient Intent Playground' })

```

```yaml
- banner:
  - link "Sola Sun Logo Sola v1.0.0":
    - /url: /
    - img "Sola Sun Logo"
    - text: Sola v1.0.0
  - navigation:
    - link "Overview":
      - /url: /
    - link "Studio":
      - /url: /studio
    - link "Community":
      - /url: /community
    - link "Components":
      - /url: /components
    - link "Extension":
      - /url: /preview
    - link "Docs":
      - /url: /docs
  - button "Ask Sola Arc... ⌘K":
    - img
    - text: Ask Sola Arc... ⌘K
  - button "Toggle Theme":
    - img
  - link "GitHub Repository":
    - /url: https://github.com/Rbm3267/sola
    - img
- main:
  - text: Error 500
  - heading "Something went wrong" [level=1]
  - paragraph: Internal Error
  - link "← Return Home":
    - /url: /
  - link "Launch Studio Canvas":
    - /url: /studio
  - link "Explore Documentation":
    - /url: /docs
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sola AIR Site & Product Audit', () => {
  4  | 
  5  |   test('Homepage Integrity & Consistency Check', async ({ page }) => {
  6  |     await page.goto('/');
  7  | 
  8  |     // 1. Title verification
  9  |     await expect(page).toHaveTitle(/Sola/);
  10 | 
  11 |     // 2. Main Brand Mark & Slogan
  12 |     await expect(page.locator('h1')).toContainText('Build beautiful interfaces');
  13 | 
  14 |     // 3. Primary Navigation Elements
  15 |     const nav = page.locator('nav');
  16 |     await expect(nav.getByText('Studio')).toBeVisible();
  17 |     await expect(nav.getByText('Components')).toBeVisible();
  18 |     await expect(nav.getByText('Community')).toBeVisible();
  19 |     await expect(nav.getByText('Docs')).toBeVisible();
  20 |     await expect(nav.getByText('Extension')).toBeVisible();
  21 |   });
  22 | 
  23 |   test('Component Library Page Audit', async ({ page }) => {
  24 |     await page.goto('/components');
  25 | 
  26 |     // Verify header and catalog list
  27 |     await expect(page.locator('h1')).toContainText('Foundational UI Building Blocks');
  28 |     await expect(page.getByRole('button', { name: 'Metric Card' }).first()).toBeVisible();
  29 | 
  30 |     // Test code tabs (Native .sola, React 19, Svelte 5, HTML)
  31 |     await page.getByRole('button', { name: '.sola' }).first().click();
  32 |     await expect(page.locator('pre code')).toBeVisible();
  33 | 
  34 |     await page.getByRole('button', { name: 'React 19' }).click();
  35 |     await expect(page.locator('pre code')).toBeVisible();
  36 |   });
  37 | 
  38 |   test('Interactive Documentation & Navigation Audit', async ({ page }) => {
  39 |     await page.goto('/docs');
  40 | 
  41 |     // Verify Docs Header & Content
  42 |     await expect(page.getByRole('heading', { name: 'Installation & Setup' })).toBeVisible();
  43 |     await expect(page.getByText('Reactivity & Signals').first()).toBeVisible();
  44 |   });
  45 | 
  46 |   test('Playground & Voice Recognition UI Audit', async ({ page }) => {
  47 |     await page.goto('/demo');
  48 | 
  49 |     // Verify Speech & Text Input elements
> 50 |     await expect(page.getByRole('heading', { name: 'Ambient Intent Playground' })).toBeVisible();
     |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  51 |     const input = page.locator('input[placeholder*="Speak or type intent"]');
  52 |     await expect(input).toBeVisible();
  53 | 
  54 |     // Verify Microphone button exists
  55 |     const micButton = page.locator('button[aria-label="Voice intent recognition"]');
  56 |     await expect(micButton).toBeVisible();
  57 |   });
  58 | 
  59 | });
  60 | 
```