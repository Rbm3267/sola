import { compile } from '@sola-air-ui/compiler';
import { readFileSync } from 'fs';

export default function solaPlugin(options = {}) {
  return {
    name: 'vite-plugin-sola',
    enforce: 'pre',
    
    // Tell Rollup we handle .sola files
    load(id) {
      if (!id.endsWith('.sola')) return null;
      
      try {
        const source = readFileSync(id, 'utf-8');
        const compiled = compile(source, id);
        return {
          code: compiled.code,
          map: null
        };
      } catch (err) {
        this.error(`[Sola] Failed to compile ${id}:\n${err.message}`);
      }
    }
  };
}
