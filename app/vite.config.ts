import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Fallback resolver for standalone Vercel builds when root directory is set to app
const compilerPath = existsSync(path.resolve(__dirname, '../packages/compiler/src/index.js'))
  ? path.resolve(__dirname, '../packages/compiler/src/index.js')
  : path.resolve(__dirname, './src/lib/sola-engine/compiler.js');

const corePath = existsSync(path.resolve(__dirname, '../packages/core/src/index.js'))
  ? path.resolve(__dirname, '../packages/core/src/index.js')
  : path.resolve(__dirname, './src/lib/sola-engine/core.js');

const uiPath = existsSync(path.resolve(__dirname, '../packages/ui/src/index.js'))
  ? path.resolve(__dirname, '../packages/ui/src/index.js')
  : path.resolve(__dirname, './src/lib/sola-engine/ui.js');

// Dynamically import compiler
const { compile } = await import(path.pathToFileURL(compilerPath).href);

function sola() {
	return {
		name: 'vite-plugin-sola',
		enforce: 'pre' as const,
		load(id: string) {
			if (!id.endsWith('.sola')) return null;
			const source = readFileSync(id, 'utf-8');
			const compiled = compile(source, id);
			return { code: compiled.code || compiled, map: null };
		}
	};
}

export default defineConfig({
	resolve: {
		alias: {
			'@sola/core': corePath,
			'@sola/compiler': compilerPath,
			'@sola/ui': uiPath
		}
	},
	plugins: [
		sola(),
		UnoCSS(),
		sveltekit()
	]
});
