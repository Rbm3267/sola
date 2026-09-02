// Compiles every code sample the docs publish and runs it in a real browser.
//
// This exists because the docs' own "The .sola Format" example used to render
// the source text of an internal runtime function where a number belonged. A
// sample that cannot survive being compiled and mounted is not documentation,
// so it fails here before a reader ever meets it.
//
// No dev server needed: each snippet is compiled to an IIFE bundle, injected
// into about:blank alongside core's IIFE build, and asserted against the DOM.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { solaSnippets, jsSnippets } from '../app/src/lib/data/docsSnippets';

const REPO_ROOT = join(__dirname, '..');

const CORE_IIFE = readFileSync(
  join(REPO_ROOT, 'packages/core/dist/sola-core.iife.js'),
  'utf8'
);

// The compiler is a real ESM package and these specs are transpiled to CJS,
// so it has to be pulled in dynamically rather than with a static import.
type CompileFn = (source: string, options?: Record<string, unknown>) => { code: string };
let compilePromise: Promise<CompileFn> | undefined;
function getCompiler(): Promise<CompileFn> {
  compilePromise ??= import(
    pathToFileURL(join(REPO_ROOT, 'packages/compiler/src/index.js')).href
  ).then((m) => m.compile as CompileFn);
  return compilePromise;
}

test.describe('published docs snippets', () => {
  for (const snippet of solaSnippets) {
    test(`.sola snippet "${snippet.id}" compiles and renders`, async ({ page }) => {
      const compile = await getCompiler();
      const { code } = compile(snippet.code, {
        target: 'iife',
        exportName: 'DocsSnippet',
        filename: `docs:${snippet.id}`
      });

      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      await page.goto('about:blank');
      await page.addScriptTag({ content: CORE_IIFE });
      await page.addScriptTag({ content: code });
      await page.evaluate((props) => {
        const host = document.createElement('div');
        host.id = 'host';
        document.body.appendChild(host);
        (window as any).DocsSnippet(host, props);
      }, snippet.props ?? {});

      const host = page.locator('#host');
      for (const expected of snippet.expectText) {
        await expect(host).toContainText(expected);
      }

      // The original bug rendered a function body into the DOM. Assert directly
      // against that failure mode, not just against the happy-path strings.
      const text = (await host.innerText()).trim();
      expect(text, 'snippet must not render function source').not.toMatch(/=>\s*\{|function\s*\(/);
      expect(text, 'snippet must not render NaN').not.toContain('NaN');
      expect(text, 'snippet must not render undefined').not.toContain('undefined');

      if (snippet.click) {
        await host.locator(snippet.click).first().click();
        for (const expected of snippet.expectAfterClick ?? []) {
          await expect(host).toContainText(expected);
        }
      }

      expect(pageErrors, 'snippet must not throw').toEqual([]);
    });
  }

  for (const snippet of jsSnippets) {
    test(`runtime snippet "${snippet.id}" produces its documented output`, async ({ page }) => {
      // Rewrite the sample's bare import to read from the IIFE global, leaving
      // every other line — the part a reader copies — executed verbatim.
      const executable = snippet.code.replace(
        /import\s*\{([^}]+)\}\s*from\s*'@sola-air-ui\/core';/,
        'const {$1} = window.SolaCore;'
      );

      await page.goto('about:blank');
      await page.addScriptTag({ content: CORE_IIFE });

      const logs = await page.evaluate((src) => {
        const captured: string[] = [];
        const original = console.log;
        console.log = (...args: unknown[]) => captured.push(args.map(String).join(' '));
        try {
          new Function(src)();
        } finally {
          console.log = original;
        }
        return captured;
      }, executable);

      expect(logs).toEqual(snippet.expectLogs);
    });
  }
});
