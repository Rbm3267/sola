# Sola ☀️

**The ambient intent framework.** Compile `.sola` files into zero-dependency vanilla DOM with native `$intent` signals that resolve AI state at the framework level.

```bash
npm create sola@latest
```

---

## What is Sola?

Sola is a compiler-first JavaScript framework where AI isn't bolted on — it's a reactive primitive. Write `.sola` files with familiar syntax, and the compiler outputs hyper-optimized vanilla DOM instructions. No virtual DOM. No runtime framework. Just raw performance.

```html
<script>
  let count = $state(0);
  let doubled = $derived(() => count() * 2);
  let dashboard = $intent("Show MRR trend for Q3");
</script>

<div>
  <h1>Count: {count()}</h1>
  <p>Doubled: {doubled()}</p>
  <input bind:value="count" />

  {#if count() > 10}
    <p>That's a lot of clicks.</p>
  {:else}
    <p>Keep going.</p>
  {/if}
</div>

<style>
  h1 { color: #0ea5e9; }
</style>
```

The compiler transforms this into a self-contained ES module with:
- **Signals-based reactivity** — fine-grained updates, no diffing
- **Scoped styles** — auto-hashed CSS selectors per component
- **Native AI resolution** — `$intent` resolves structured data from any LLM provider

## Why Sola?

| | Sola | React | Svelte | Vue |
|---|---|---|---|---|
| **Bundle size** (hello world) | ~3 KB | ~45 KB | ~4 KB | ~33 KB |
| **Virtual DOM** | No | Yes | No | Yes |
| **Built-in AI primitive** | `$intent` | ❌ | ❌ | ❌ |
| **Scoped styles** | ✅ | CSS Modules | ✅ | ✅ |
| **Compiler** | ✅ | ❌ | ✅ | ✅ |

Every framework has state. Every framework has effects. **No framework has intent.** Sola's `$intent` is a first-class reactive signal that resolves structured AI responses, with built-in AbortController cancellation, provider configuration, and caching.

## Features

- **`$state`** — Fine-grained reactive signals
- **`$derived`** — Computed values with automatic dependency tracking
- **`$intent`** — AI-native signal that resolves structured data from LLMs
- **`{#if}` / `{:else}`** — Conditional rendering
- **`{#each}`** — List rendering with index support
- **`bind:value`** — Two-way binding for inputs
- **`on:click`** — Event handling
- **`<style>`** — Scoped CSS with auto-hashed selectors
- **Component imports** — `import Counter from './Counter.sola'`
- **Props** — `export let title = 'default'`
- **Lifecycle hooks** — `onMount`, `onDestroy`
- **Batched updates** — Signal writes are queued and flushed in a microtask

## Architecture

```
packages/
├── compiler/          @sola/compiler — AST-based .sola → ES module compiler
├── core/              @sola/core — Signals, effects, derived, intent runtime
├── vite-plugin-sola/  vite-plugin-sola — Vite integration with HMR
└── create-sola/       create-sola — Project scaffolding CLI (coming soon)

apps/
├── test-app/          Minimal Vite app running .sola files
└── docs/              Documentation site (coming soon)
```

### How the compiler works

1. **Extract** — Splits `.sola` source into `<script>`, `<style>`, and template blocks
2. **Parse JS** — Acorn AST traversal detects `$state`, `$derived`, `$intent` declarations and rewrites assignments (`count = x` → `set_count(x)`)
3. **Scope CSS** — Hashes selectors with a unique per-component class
4. **Parse HTML** — htmlparser2 builds a template AST, with expression extraction to protect JS in attributes from HTML parsing
5. **Emit DOM** — Generates `document.createElement` / `createTextNode` calls with `createEffect` wrappers for reactive bindings
6. **Output** — A self-contained ES module exporting a `mount(target, props?)` function

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Rbm3267/sola.git
cd sola

# Install dependencies
npm install

# Run the test app
cd apps/test-app
npx vite
```

## Configuration

Configure the `$intent` provider globally:

```js
import { configureIntent } from '@sola/core';

configureIntent({
  provider: 'openai',        // 'openai' | 'gemini' | 'anthropic' | 'local'
  endpoint: '/api/intent',   // Your intent resolution endpoint
  model: 'gpt-4o'            // Model to use
});
```

## Roadmap

- [x] Compiler V3 — AST-based reactive transforms
- [x] Signals engine — `createSignal`, `createEffect`, `createDerived`
- [x] `$intent` — AI-native reactive signal
- [x] Scoped styles — Per-component CSS hashing
- [x] Component imports & props
- [x] `bind:value` two-way binding
- [x] Batched microtask updates
- [ ] `create-sola` CLI scaffolding
- [ ] HMR with source maps
- [ ] SSR / hydration
- [ ] TypeScript in `<script lang="ts">`
- [ ] Plugin ecosystem
- [ ] VS Code syntax highlighting
- [ ] Documentation site

## License

MIT
