// Standing checks for the site problems the design review found, so they
// cannot quietly come back: sub-12px body text, contradictory component
// counts, dead repository links, unproven performance claims, and Studio
// rendering as a 60px sliver on a phone.

import { test, expect, type Page } from '@playwright/test';

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

/** Every page on the site. Sweeps run over all of them: the earlier checks
 *  covered four or five, so a dead repository link on /privacy and stale
 *  "1,000Hz" copy on /demo both passed while broken. */
const ALL_PAGES = ['/', '/docs', '/components', '/studio', '/community',
                   '/demo', '/demo/ai', '/preview', '/overview', '/privacy'];

/** Every rendered text size on the page, for elements that actually show text. */
async function textSizes(page: Page) {
  return page.evaluate(() => {
    const out: { text: string; px: number; tag: string }[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      // Only elements whose own text is what a reader sees.
      const own = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent?.trim() ?? '')
        .join(' ')
        .trim();
      if (!own) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const px = parseFloat(style.fontSize);
      if (Number.isFinite(px)) out.push({ text: own.slice(0, 60), px, tag: el.tagName });
    }
    return out;
  });
}

for (const path of ALL_PAGES) {
  test(`${path} has no text below the 12px floor`, async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const tooSmall = (await textSizes(page)).filter((t) => t.px < 12);
    expect(
      tooSmall,
      `text under 12px: ${JSON.stringify(tooSmall.slice(0, 10), null, 2)}`
    ).toEqual([]);
  });
}

test('nav offers four destinations, with the rest under Tools', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto('/');

  const nav = page.locator('header nav').first();
  await expect(nav.getByRole('link', { name: 'Docs' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Components' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Studio' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Tools' })).toBeVisible();

  // Secondary destinations must not sit at the top level any more.
  await expect(nav.getByRole('link', { name: 'AI Demo' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'Extension' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'Community' })).toHaveCount(0);

  // They are reachable, one click away.
  await nav.getByRole('button', { name: 'Tools' }).click();
  const header = page.locator('header');
  await expect(header.getByRole('link', { name: /AI Demo/ })).toBeVisible();
  await expect(header.getByRole('link', { name: /Extension/ })).toBeVisible();
});

test('hero CTA sends a developer to the quickstart', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto('/');

  const cta = page.getByRole('link', { name: 'Get started' }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/docs');
});

test('the hero demonstrates the thing the headline claims', async ({ page }) => {
  // "Your UI shouldn't wait to be asked" has to be shown, not asserted. The
  // hero used to be three tabs of generic telemetry widgets instead.
  await page.setViewportSize(DESKTOP);
  await page.goto('/');

  await expect(page.getByText('Sentinel · observing')).toBeVisible();

  const destination = page.getByPlaceholder('Lisbon');
  await expect(destination).toBeVisible();

  // Nothing suggested until the user actually does something.
  await expect(page.getByText('the form has not been touched')).toBeVisible();

  // Exactly what the on-screen copy tells the visitor to do: type, then stop.
  // No blur. Sentinel could previously only observe focus and blur, so typing
  // produced no events and the panel said "Waiting for a pause…" forever.
  await destination.click();
  await destination.type('Lisbon', { delay: 40 });

  const suggestion = page.locator('[role="status"]').filter({ hasText: 'Add dates' });
  await expect(suggestion).toBeVisible({ timeout: 8000 });
  await expect(suggestion).toContainText('confidence');

  // The observer buffer must reflect real events, not a canned script — and it
  // must show the typing, which is the behaviour the thesis is about.
  await expect(page.getByText(/focused "destination"/)).toBeVisible();
  await expect(page.getByText(/typing in "destination"/)).toBeVisible();
});

test('every repository link points at the real repository', async ({ page }) => {
  for (const path of ALL_PAGES) {
    await page.goto(path);
    const hrefs = await page
      .locator('a[href*="github.com"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
    for (const href of hrefs) {
      expect(href, `${path} links to a repository that does not exist: ${href}`)
        .toMatch(/github\.com\/[Rr]bm3267\/sola-air/);
    }
  }
});

test('no performance claim without a number behind it', async ({ page }) => {
  const banned = [
    /1,?000\s?Hz/i,
    /sub-millisecond/i,
    /hardware-grade/i,
    /zero garbage collection/i,
    /spring physics/i
  ];

  for (const path of ALL_PAGES) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText();
    for (const pattern of banned) {
      expect(body, `${path} still claims ${pattern}`).not.toMatch(pattern);
    }
  }
});

test('the page written in Sola is legible and links its own source', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/overview');
  await page.waitForLoadState('networkidle');

  const heading = page.getByRole('heading', { name: /This page is a Sola component/i });
  await expect(heading).toBeVisible();

  // The original bug was white text on a white ground in the light theme.
  const contrast = await heading.evaluate((el) => {
    const lum = (c: string) => {
      const [r, g, b] = (c.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0']).map(Number);
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let bg = 'rgb(255,255,255)';
    for (let n: HTMLElement | null = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !c.includes('rgba(0, 0, 0, 0)')) { bg = c; break; }
    }
    const a = lum(getComputedStyle(el).color);
    const b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  expect(contrast, 'heading must meet WCAG AA for large text').toBeGreaterThan(3);

  // A compiler sells itself with its own output.
  const source = page.getByRole('link', { name: /Read its source/i });
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute('href', /Overview\.sola$/);

  // And the signal it renders must actually be live.
  const value = page.locator('.proof-value');
  const before = await value.innerText();
  await page.getByRole('button', { name: /Emit signal/i }).click();
  await expect(value).not.toHaveText(before);
});

test('Studio is usable on a phone', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/studio');
  await page.waitForLoadState('networkidle');

  // Nothing may overflow the viewport horizontally.
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, 'page must not scroll sideways on a 390px screen')
    .toBeLessThanOrEqual(PHONE.width + 1);

  // The original failure was not overflow but starvation: the palette docked
  // beside the canvas and left it about 60px wide, clipping every card to two
  // characters. The canvas must get essentially the whole screen.
  const canvas = page.locator('main').first();
  const box = await canvas.boundingBox();
  expect(box, 'studio canvas must render').not.toBeNull();
  expect(box!.width, 'canvas must not be squeezed by a docked palette')
    .toBeGreaterThan(PHONE.width * 0.85);
});

// The site marks its theme with a `.dark` class, while design tokens and
// compiled .sola components key off `data-theme` / prefers-color-scheme. When
// only one of those was set, a visitor on a dark OS viewing the site in light
// mode got dark token values on a light ground — white text on white cards,
// measured at 1.10:1. All four combinations must be legible.
for (const osTheme of ['light', 'dark'] as const) {
  for (const siteTheme of ['light', 'dark'] as const) {
    test(`text is legible with OS ${osTheme} and site ${siteTheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: osTheme });
      await page.setViewportSize(DESKTOP);

      for (const path of ['/', '/demo', '/overview']) {
        await page.goto(path);
        await page.evaluate((t) => localStorage.setItem('sola_theme', t), siteTheme);
        await page.reload({ waitUntil: 'networkidle' });

        const ratio = await page.evaluate(() => {
          const el = document.querySelector('.dash-title, .hero-heading, h1');
          if (!el) return 21;
          const parse = (c: string) => {
            const m = (c || '').match(/[\d.]+/g) ?? ['0', '0', '0'];
            return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
          };
          type C = { r: number; g: number; b: number; a: number };
          const over = (f: C, b: C): C => ({
            r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a),
            b: f.b * f.a + b.b * (1 - f.a), a: 1
          });
          const lum = (c: C) => {
            const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
            return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
          };
          // Composite the whole ancestor background stack; a near-transparent
          // overlay must not be mistaken for a solid one.
          const stack: string[] = [];
          for (let n: Element | null = el; n; n = n.parentElement) stack.push(getComputedStyle(n).backgroundColor);
          let bg: C = { r: 255, g: 255, b: 255, a: 1 };
          for (const c of stack.reverse()) { const p = parse(c); if (p.a > 0) bg = over(p, bg); }
          const fg = over(parse(getComputedStyle(el).color), bg);
          return (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
        });

        expect(ratio, `${path} heading contrast (OS ${osTheme}, site ${siteTheme})`).toBeGreaterThan(4.5);
      }
    });
  }
}

test('every page is reachable, and the policy page especially', async ({ page }) => {
  // /privacy, /demo and /overview were linked from nowhere. A privacy policy a
  // visitor cannot reach is a problem beyond navigation.
  await page.setViewportSize(DESKTOP);
  await page.goto('/');
  // The site renders client-side, so the nav and footer do not exist yet
  // at goto time.
  await page.waitForLoadState('networkidle');
  const norm = (h: string) => {
    const path = (h ?? '').split('?')[0].split('#')[0];
    return path.length > 1 ? path.replace(/\/$/, '') : path;
  };
  const hrefs = new Set(
    (await page.locator('a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? '')))
      .map(norm)
  );
  for (const route of ALL_PAGES) {
    expect(hrefs.has(norm(route)), `${route} is not reachable from the homepage`).toBe(true);
  }
});

test('no page ships debug output', async ({ page }) => {
  // /demo/ai rendered `open=false · loading=false · content=null` to visitors.
  for (const path of ALL_PAGES) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText();
    for (const pattern of [/open=(true|false)/, /loading=(true|false)/, /content=(null|undefined)/, /undefined/]) {
      expect(body, `${path} shows debug output matching ${pattern}`).not.toMatch(pattern);
    }
  }
});

test('a version on screen names the package it belongs to', async ({ page }) => {
  // Four bare version strings across the site read as contradictions.
  await page.goto('/docs');
  await page.waitForLoadState('networkidle');
  const footer = await page.locator('footer').innerText();
  for (const pkg of ['core', 'compiler', 'ui']) {
    expect(footer, `footer should attribute the ${pkg} version`).toContain(pkg);
  }
});
