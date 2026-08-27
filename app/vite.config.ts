import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { compile } from '@sola/compiler';
import { readFileSync } from 'fs';

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
	plugins: [
		sola(),
		UnoCSS(),
		sveltekit()
	]
});
