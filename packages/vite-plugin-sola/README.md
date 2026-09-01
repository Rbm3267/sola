# @sola-air-ui/vite-plugin-sola

Vite plugin for [Sola AIR](https://sola-air.dev) — compiles `.sola` single-file components at build time via `@sola-air-ui/compiler`, so `import App from './App.sola'` just works.

## Install

```bash
npm install -D @sola-air-ui/vite-plugin-sola
```

## Setup

```js
// vite.config.js
import { defineConfig } from 'vite';
import sola from '@sola-air-ui/vite-plugin-sola';

export default defineConfig({
  plugins: [sola()],
});
```

Then import `.sola` files directly:

```js
import App from './App.sola';

App(document.getElementById('app'), {});
```

Requires Vite 4 or newer (peer dependency).

## License

MIT — see the [repo root](https://github.com/rbm3267/sola-air) for the full license and [changelog](https://github.com/rbm3267/sola-air/blob/main/CHANGELOG.md).
