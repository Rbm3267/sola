# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-audit.spec.ts >> Sola AIR Site & Product Audit >> Homepage Integrity & Consistency Check
- Location: e2e\site-audit.spec.ts:5:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected: "Sola"
Received: "Sola — The Ambient Intent Framework (AIR)"
Timeout:  5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "Sola — The Ambient Intent Framework (AIR)"

```

```yaml
- heading "500" [level=1]
- paragraph: Internal Error
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Sola AIR Site & Product Audit', () => {
  4   | 
  5   |   test('Homepage Integrity & Consistency Check', async ({ page }) => {
  6   |     const consoleErrors: string[] = [];
  7   |     page.on('console', msg => {
  8   |       if (msg.type() === 'error') {
  9   |         consoleErrors.push(msg.text());
  10  |       }
  11  |     });
  12  | 
  13  |     await page.goto('/');
  14  | 
  15  |     // 1. Title verification
> 16  |     await expect(page).toHaveTitle('Sola');
      |                        ^ Error: expect(page).toHaveTitle(expected) failed
  17  | 
  18  |     // 2. Main Brand Mark & Slogan
  19  |     await expect(page.locator('h1')).toContainText('Software that');
  20  |     await expect(page.locator('h1')).toContainText('builds itself.');
  21  | 
  22  |     // 3. Brand Pill & Specs Consistency
  23  |     await expect(page.getByText('3.2 kB Core')).toBeVisible();
  24  |     await expect(page.getByText('0 Dependencies')).toBeVisible();
  25  |     await expect(page.getByText('Native AI Intent')).toBeVisible();
  26  | 
  27  |     // 4. Primary Navigation Elements
  28  |     const nav = page.locator('nav');
  29  |     await expect(nav.getByText('Overview')).toBeVisible();
  30  |     await expect(nav.getByText('Component Library')).toBeVisible();
  31  |     await expect(nav.getByText('Interactive Docs')).toBeVisible();
  32  |     await expect(nav.getByText('Canvas Playground')).toBeVisible();
  33  | 
  34  |     // 5. Zero unhandled console errors
  35  |     expect(consoleErrors).toEqual([]);
  36  |   });
  37  | 
  38  |   test('Component Library Page Audit', async ({ page }) => {
  39  |     const consoleErrors: string[] = [];
  40  |     page.on('console', msg => {
  41  |       if (msg.type() === 'error') {
  42  |         consoleErrors.push(msg.text());
  43  |       }
  44  |     });
  45  | 
  46  |     await page.goto('/components');
  47  | 
  48  |     // Verify header and sidebar primitives
  49  |     await expect(page.locator('h1')).toContainText('Component Library');
  50  |     await expect(page.getByRole('button', { name: 'DataCard' })).toBeVisible();
  51  |     await expect(page.getByRole('button', { name: 'DynamicForm' })).toBeVisible();
  52  |     await expect(page.getByRole('button', { name: 'ListBlock' })).toBeVisible();
  53  | 
  54  |     // Test tab switching between Live Preview, .sola code, and Compiled JS
  55  |     await page.getByRole('button', { name: '.sola Markup' }).click();
  56  |     await expect(page.locator('pre code')).toContainText('sola-datacard');
  57  | 
  58  |     await page.getByRole('button', { name: 'Compiled JS' }).click();
  59  |     await expect(page.locator('pre code')).toContainText('@sola/compiler');
  60  | 
  61  |     expect(consoleErrors).toEqual([]);
  62  |   });
  63  | 
  64  |   test('Interactive Documentation & AI Assistant Audit', async ({ page }) => {
  65  |     const consoleErrors: string[] = [];
  66  |     page.on('console', msg => {
  67  |       if (msg.type() === 'error') {
  68  |         consoleErrors.push(msg.text());
  69  |       }
  70  |     });
  71  | 
  72  |     await page.goto('/docs');
  73  | 
  74  |     // Verify AI generative assistant and table of contents
  75  |     await expect(page.locator('h2')).toContainText('Documentation that explains itself.');
  76  |     await expect(page.getByRole('button', { name: 'Quickstart & Installation' })).toBeVisible();
  77  |     await expect(page.getByRole('button', { name: 'Ambient Intent Signals ($intent)' })).toBeVisible();
  78  | 
  79  |     // Click section
  80  |     await page.getByRole('button', { name: 'The .sola File Format' }).click();
  81  |     await expect(page.locator('h1')).toContainText('The .sola Component Format');
  82  | 
  83  |     expect(consoleErrors).toEqual([]);
  84  |   });
  85  | 
  86  |   test('Playground & Voice Recognition UI Audit', async ({ page }) => {
  87  |     const consoleErrors: string[] = [];
  88  |     page.on('console', msg => {
  89  |       if (msg.type() === 'error') {
  90  |         consoleErrors.push(msg.text());
  91  |       }
  92  |     });
  93  | 
  94  |     await page.goto('/demo');
  95  | 
  96  |     // Verify Speech & Text Input elements
  97  |     await expect(page.locator('h1')).toContainText('Ambient Intent Playground');
  98  |     const input = page.locator('input[type="text"]');
  99  |     await expect(input).toBeVisible();
  100 |     await expect(input).toHaveAttribute('placeholder', /Speak or type intent/);
  101 | 
  102 |     // Verify Microphone button exists
  103 |     const micButton = page.locator('button[aria-label="Voice intent recognition"]');
  104 |     await expect(micButton).toBeVisible();
  105 | 
  106 |     // Verify Suggestions exist
  107 |     await expect(page.getByText('Show Q3 revenue and churn rate for enterprise tier')).toBeVisible();
  108 | 
  109 |     expect(consoleErrors).toEqual([]);
  110 |   });
  111 | 
  112 | });
  113 | 
```