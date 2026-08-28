import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { readFileSync } from 'fs';
import path from 'path';
import { compile } from '../packages/compiler/src/index.js';

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
			'@sola/core': path.resolve(__dirname, '../packages/core/src/index.js'),
			'@sola/compiler': path.resolve(__dirname, '../packages/compiler/src/index.js'),
			'@sola/ui': path.resolve(__dirname, '../packages/ui/src/index.js')
		}
	},
	plugins: [
		sola(),
		UnoCSS(),
		sveltekit()
	]
});
