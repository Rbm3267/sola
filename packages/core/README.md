# @sola-air-ui/core

Zero-VDOM reactivity engine for [Sola AIR](https://sola-air.dev) — signals, derived values, effects, component lifecycle, and the `$intent` primitive. This is the runtime that compiled `.sola` components import; most apps won't call it directly (use `@sola-air-ui/compiler` or the `sola-air` meta-package instead), but it's published standalone for anyone embedding Sola-compiled output in a custom build pipeline.

## Install

```bash
npm install @sola-air-ui/core
```

## What's in here

- **Signals** — `createSignal`, `createDerived`, `createEffect`, `flushSync`
- **Lifecycle** — `onMount`, `onDestroy`, `pushContext`/`popContext` (component-scoped mount/destroy queues)
- **Data & intent** — `createData`, `createIntent`, `configureIntent` (ambient AI state resolution, with SSE streaming support)
- **IIFE build** — `@sola-air-ui/core/iife` exports a pre-bundled `dist/sola-core.iife.js` for no-bundler environments (e.g. embedding in a CMS widget or a `<script>` tag), guarded so multiple copies on one page share a single instance via `window.SolaCore`.

## Usage

Compiled `.sola` output imports these directly:

```js
import { createSignal, createDerived, onMount } from '@sola-air-ui/core';

const [count, setCount] = createSignal(0);
const doubled = createDerived(() => count() * 2);

onMount(() => {
  console.log('mounted, doubled =', doubled());
});
```

## Component lifecycle contract

`pushContext()` / `popContext(ctx)` scope `onMount`/`onDestroy` callbacks to one component instance. If your own runtime code manually mounts nested components, always flush a component's mounts/destroys with the **specific context object** `pushContext()` returned for it — not by relying on whichever context happens to be globally "active":

```js
const ctx = pushContext();
onMount(() => { /* ... */ });
// ...build DOM, possibly mounting nested child components...
__flush_mounts(ctx);   // pass ctx explicitly
```

This matters because a mounted child component's own context stays on the stack (it isn't popped until that child unmounts), so relying on implicit "current" context after nested mounts silently drops the parent's own mount callbacks. `@sola-air-ui/compiler`-generated code already does this correctly.

## License

MIT — see the [repo root](https://github.com/rbm3267/sola-air) for the full license and [changelog](https://github.com/rbm3267/sola-air/blob/main/CHANGELOG.md).
