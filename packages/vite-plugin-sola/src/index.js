import { compile } from '@sola-air-ui/compiler';
import { readFileSync } from 'fs';

/**
 * Vite plugin for .sola single-file components.
 *
 * @param {object}  [options]
 * @param {boolean} [options.sourcemap=true] Emit a source map so runtime errors
 *   and breakpoints land in the .sola file rather than in generated output.
 */
export default function solaPlugin(options = {}) {
  const { sourcemap = true } = options;

  return {
    name: 'vite-plugin-sola',
    enforce: 'pre',

    load(id) {
      if (!id.endsWith('.sola')) return null;
      try {
        const source = readFileSync(id, 'utf-8');
        const compiled = compile(source, { filename: id, sourcemap });
        return { code: compiled.code, map: compiled.map ?? null };
      } catch (err) {
        this.error(err.message);
      }
    },

    handleHotUpdate({ file, modules }) {
      if (!file.endsWith('.sola')) return;

      // Hand the changed modules back so Vite propagates the update through the
      // import graph as it would for any other module. It reloads the page only
      // when no importer accepts the update — which is a far better default than
      // unconditionally forcing a full reload on every keystroke and discarding
      // state an upstream boundary could have kept.
      return modules;
    }
  };
}
