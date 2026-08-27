import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { compile } from '../packages/compiler/src/index.js';
import { readFileSync } from 'fs';
import path from 'path';

function sola() {
	return {
		name: 'vite-plugin-sola',
		enforce: 'pre' as const,
		load(id: string) {
			if (!id.endsWith('.sola')) return null;
			const source = readFileSync(id, 'utf-8');
			const code = compile(source, id);
			return { code, map: null };
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
