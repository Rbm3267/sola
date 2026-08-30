import { compile } from '@sola-air-ui/compiler';
import { readFileSync } from 'fs';

export default function solaPlugin(options = {}) {
  return {
    name: 'vite-plugin-sola',
    enforce: 'pre',

    load(id) {
      if (!id.endsWith('.sola')) return null;
      try {
        const source = readFileSync(id, 'utf-8');
        const compiled = compile(source, { filename: id });
        return { code: compiled.code, map: null };
      } catch (err) {
        this.error(err.message);
      }
    },

    handleHotUpdate({ file, server }) {
      if (!file.endsWith('.sola')) return;
      const mod = server.moduleGraph.getModuleById(file);
      if (mod) {
        server.moduleGraph.invalidateModule(mod);
        server.hot.send({ type: 'full-reload', path: '*' });
      }
    }
  };
}
