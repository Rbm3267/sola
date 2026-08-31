# Changelog

All notable fixes and changes to the Sola AIR packages. Dates are UTC.

## 2026-08-31

Found and fixed while dogfooding the published `sola-air` npm package end-to-end
in a real host application (a ServiceNow Service Portal widget) — building an
actual multi-page app surfaced a class of bug that isolated unit tests hadn't
caught, since several of them only manifest when consuming the *published*
package the way a real user would, not the local monorepo source.

### `@sola-air-ui/core@1.0.3`

- **Fixed:** the IIFE build (`dist/sola-core.iife.js`, used by the `./iife`
  export and by anyone targeting a no-bundler environment) was never present
  in the published tarball. The `prepare` script that builds it was present
  in source, but `esbuild` — the tool that script depends on — was never
  declared as a dependency, so the build silently failed for any real
  consumer, and separately, `dist/` was still being excluded by an inherited
  root `.gitignore` rule even after that was fixed. Added `esbuild` as a
  dependency and an explicit `files` allowlist; verified with a clean install
  from the registry (not local source) that `dist/` now ships and needs no
  manual build step.

### `@sola-air-ui/compiler@1.0.6`

- **Fixed:** `stripTypeScript()` ran on every `<script>` block regardless of
  whether it declared `lang="ts"`, and its regex couldn't distinguish a type
  annotation's `:` from a ternary's `: falsyBranch` or an object literal's
  `key: value` — silently corrupting ordinary JavaScript. Now only runs on
  `<script lang="ts">`.
- **Fixed:** htmlparser2 lowercases tag names by default, so a component
  import comparison against a PascalCase tag (`<Table>` arrives as `"table"`)
  never matched. This made the entire nested-component code path unreachable
  for any component named the way this library's own components are named,
  and was the underlying cause of the next two bugs going unnoticed.
- **Fixed:** with components actually reachable, two more surfaced — dynamic
  props (`rows={items}`) were passed through as a stringified placeholder
  instead of the real value, and slot content (children between a
  component's open/close tags) was silently dropped with no projection
  mechanism at all. Both fixed: dynamic props resolve correctly, and a
  `<slot>` element now projects a parent's children.
- **Fixed:** bare `onclick={fn}` (no colon) compiled to
  `setAttribute('onclick', String(fn))` — the handler's source text, never
  invoked, so clicks did nothing. This is the exact syntax used in this
  README's own quickstart example and in `create-sola`'s scaffolded starter.
  The colon form (`on:click={fn}`) already worked; extended the same
  handling to the bare form.
- **Fixed:** text interpolation always wrapped an expression as
  `String(expr ?? '')`. JavaScript forbids mixing `??` with `||`/`&&`
  without explicit parentheses, so any `{a || b}`-style fallback — including
  this library's own `Table.sola` (`{col.label || col}`) — was a
  compile-time `SyntaxError`. Fixed by parenthesizing the expression.
- **Fixed:** `bin.sola` was `"./src/cli.js"` — npm's bin normalizer rejects
  the leading `./` and silently strips the entire `bin` field on publish.
  The `sola` CLI has never been reachable as an installed command until this
  fix; verified by installing the packed tarball fresh and running
  `npx sola --help` / `npx sola -v` through the real installed bin symlink.
- **Fixed:** the CLI's `--version` output and the `// Compiled by...` header
  stamped on every compiled file both hardcoded a version string that was
  already stale. Both now read the real version from `package.json`.

### `@sola-air-ui/ui@1.0.2`

- **Fixed:** most components declared their configurable state as a plain
  `let` instead of `export let` — silently ignoring any props passed in and
  always rendering fixed demo content regardless of usage. Fixed across the
  whole library: `Card`, `StatGrid`, `DatePicker`, `Select`, `Toggle`,
  `Toast`, `Chart`, `Modal`, `StreamView`, `Dashboard`.
- **Fixed:** `Card` and `StatGrid`'s slot content was a dead HTML comment
  ("Slot content mounts here") with no actual `<slot>` element — children
  passed to them were always dropped. `Select`'s `<option>` children had the
  same problem. All three now have a real `<slot>`.
- **Fixed:** `Toggle`, `Toast`, and `Modal` each called `.set(...)` directly
  on a `$state` signal (e.g. `checked.set(!checked())`) — that method
  doesn't exist on this framework's signals, which pair a plain getter
  function with a separate compiler-generated `set_x` function. Moved the
  toggle/dismiss/close logic into a named `<script>`-level function using
  the correct `x = newValue` assignment (which the compiler *does* rewrite
  to `set_x(...)`), mirroring the pattern `Dashboard.sola`'s own
  `boostTraffic`/`throttleTraffic` already used correctly.
- **Changed:** `Chart`'s sparkline now renders from a `data` prop via
  `{#each}` instead of eight hardcoded bar heights.
