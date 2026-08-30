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
		configureServer(server) {
			const c1 = '\x1b[38;2;56;189;248m'; // sky-400
			const c2 = '\x1b[38;2;59;130;246m'; // blue-500
			const c3 = '\x1b[38;2;139;92;246m'; // violet-500
			const b = '\x1b[1m';
			const d = '\x1b[2m';
			const r = '\x1b[0m';

			setTimeout(() => {
				console.log('');
				console.log(`   ${c1} ✧ ${r}`);
				console.log(`  ${c1}✧${r} ${c2}◯${r} ${c3}✧${r}    ${b}Sola${r} ${d}v1.0.0${r}`);
				console.log(`   ${c3} ✧ ${r}      ${c2}Ambient Zero-VDOM Intent Runtime${r}`);
				console.log(`            ${d}Compiler ready in ${Math.round(performance.now())}ms${r}`);
				console.log('');
			}, 100);
		},
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
			'@sola/ui': path.resolve(__dirname, '../packages/ui/src/index.js'),
			'@sola-air-ui/core': path.resolve(__dirname, '../packages/core/src/index.js'),
			'@sola-air-ui/compiler': path.resolve(__dirname, '../packages/compiler/src/index.js'),
			'@sola-air-ui/ui': path.resolve(__dirname, '../packages/ui/src/index.js')
		}
	},
	plugins: [
		sola(),
		UnoCSS(),
		sveltekit()
	]
});
