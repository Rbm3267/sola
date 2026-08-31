import assert from 'node:assert';
import { compile } from '../src/index.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ── Reactivity ──────────────────────────────────────────────────────────────

console.log('\n$state / $derived / $effect');

test('$state compiles to createSignal', () => {
  const { code } = compile(`<script>let count = $state(0);</script><span>{count}</span>`);
  assert(code.includes('const [count, set_count] = createSignal(0)'), 'createSignal');
});

test('$derived wraps expr in arrow when not already a fn', () => {
  const { code } = compile(`<script>let x = $state(1); let doubled = $derived(x * 2);</script><span>{doubled}</span>`);
  assert(code.includes('createDerived(() => x * 2)'), 'arrow wrap');
});

test('$derived passes fn through unchanged', () => {
  const { code } = compile(`<script>let x = $state(1); let d = $derived(() => x() * 2);</script><span>{d}</span>`);
  assert(code.includes('createDerived(() => x() * 2)'), 'fn passthrough');
});

test('count++ rewrites to set_count(count() + 1)', () => {
  const { code } = compile(`<script>let count = $state(0); function inc() { count++; }</script>`);
  assert(code.includes('set_count(count() + 1)'), '++ rewrite');
});

test('count-- rewrites to set_count(count() - 1)', () => {
  const { code } = compile(`<script>let count = $state(0); function dec() { count--; }</script>`);
  assert(code.includes('set_count(count() - 1)'), '-- rewrite');
});

test('compound assignment operators (*=, /=, **=)', () => {
  const { code } = compile(`<script>
    let count = $state(10);
    function multiply() { count *= 2; }
    function divide() { count /= 2; }
    function power() { count **= 2; }
  </script>`);
  assert(code.includes('set_count(count() * (2))'), '*=');
  assert(code.includes('set_count(count() / (2))'), '/=');
  assert(code.includes('set_count(count() ** (2))'), '**=');
});

// ── Nested brace expressions ─────────────────────────────────────────────────

console.log('\nNested brace expressions');

test('text interpolation with object literal {fn({key: val})}', () => {
  const { code } = compile(`<div>{JSON.stringify({a: 1, b: 2})}</div>`);
  assert(code.includes('JSON.stringify({a: 1, b: 2})'), 'nested object in text expr');
});

test('text interpolation with {a || b} does not produce invalid ?? mixing', () => {
  // JS forbids `x || y ?? ''` without explicit grouping — a naive `String(expr ?? '')`
  // wrapper breaks the extremely common {a || b} fallback pattern used throughout
  // this framework's own component library (e.g. Table.sola: {col.label || col}).
  const { code } = compile(`<div>{col.label || col}</div>`);
  assert(code.includes("String((col.label || col) ?? '')"), 'expr parenthesized before ??');
  new Function(code.replace(/^import.*\n/gm, '').replace('export default ', 'globalThis.__t = '));
});

test('attribute {expr} with nested object literal', () => {
  const { code } = compile(`<div class={getClass({active: true})}></div>`);
  assert(code.includes('getClass({active: true})'), 'nested object in attr expr');
});

test('ternary in attribute: attr={cond ? a : b}', () => {
  const { code } = compile(`<button disabled={count > 0 ? false : true}></button>`);
  assert(code.includes('count > 0 ? false : true'), 'ternary attr expr');
});

test('template literal interpolation in quoted attr: class="prefix-{name}"', () => {
  const { code } = compile(`<div class="item-{index}"></div>`);
  assert(code.includes('`item-${index}`'), 'template literal in quoted attr');
});

// ── TypeScript support ────────────────────────────────────────────────────────

console.log('\nTypeScript support');

test('type annotation stripped: let x: number = $state(0)', () => {
  const { code } = compile(`<script lang="ts">let x: number = $state(0);</script><span>{x}</span>`);
  assert(code.includes('createSignal(0)'), 'TS type annotation stripped');
  assert(!code.includes(': number'), 'no leftover annotation');
});

test('interface declaration stripped', () => {
  const { code } = compile(`<script lang="ts">
interface User { name: string; age: number; }
let name = $state('Alice');
</script><span>{name}</span>`);
  assert(code.includes('createSignal'), 'compiles after interface');
  assert(!code.includes('interface User'), 'interface removed');
});

test('as cast stripped', () => {
  const { code } = compile(`<script lang="ts">const el = document.getElementById('x') as HTMLElement;</script>`);
  assert(!code.includes(' as HTMLElement'), 'as cast removed');
});

// ── Conditionals ──────────────────────────────────────────────────────────────

console.log('\nConditionals');

test('{#if}{:else} emits both branches', () => {
  const { code } = compile(`
<script>let ok = $state(true);</script>
{#if ok}<span>Yes</span>{:else}<span>No</span>{/if}`);
  assert(code.includes('if (ok)'), 'condition check');
  assert(code.includes('Yes'), 'then branch');
  assert(code.includes('No'), 'else branch');
});

test('{#if} without else compiles', () => {
  const { code } = compile(`{#if show}<p>Visible</p>{/if}`);
  assert(code.includes('if (show)'), 'condition');
  assert(code.includes('Visible'), 'content');
});

// ── Each loops ────────────────────────────────────────────────────────────────

console.log('\nEach loops');

test('unkeyed {#each} iterates ascending', () => {
  const { code } = compile(`
<script>let items = $state(['A', 'B']);</script>
{#each items as item}<div>{item}</div>{/each}`);
  assert(code.includes('for (let _i = 0; _i < _items.length; _i++)'), 'ascending loop');
  assert(code.includes('createDocumentFragment()'), 'fragment batching');
});

test('keyed {#each items as item (item.id)} uses Map reconciliation', () => {
  const { code } = compile(`
<script>let rows = $state([{id:1, name:'A'}]);</script>
{#each rows as row (row.id)}<div>{row.name}</div>{/each}`);
  assert(code.includes('_keyMap'), 'keyed map');
  assert(code.includes('String(row.id)'), 'key expression');
  assert(code.includes('e0_keyMap.has(_key)'), 'key existence check');
  assert(code.includes('e0_keyMap.delete(_k)'), 'stale key removal');
});

test('{#each} with index variable', () => {
  const { code } = compile(`{#each items as item, i}<li>{i}: {item}</li>{/each}`);
  assert(code.includes('const i = _i'), 'index variable bound');
});

// ── Styles ────────────────────────────────────────────────────────────────────

console.log('\nStyles');

test('scoped style: button.hash:hover (pseudo after hash)', () => {
  const { code, css } = compile(`
<style>button:hover { color: red; }</style>
<button>Hi</button>`);
  assert(/button\.sola-[a-z0-9]+:hover/.test(css), 'hash before pseudo');
  assert(!/button:hover\./.test(css), 'hash not appended after pseudo');
});

test('style deduplication guard emitted', () => {
  const { code } = compile(`<style>.x { color: red; }</style><div class="x">Hi</div>`);
  assert(code.includes('!window['), 'dedup guard');
});

// ── Events and bindings ───────────────────────────────────────────────────────

console.log('\nEvents and bindings');

test('on:click={handler} wires addEventListener', () => {
  const { code } = compile(`<script>function go() {}</script><button on:click={go}>Go</button>`);
  assert(code.includes("addEventListener('click', go)"), 'on:click');
});

test('bind:value={signal} wires two-way', () => {
  const { code } = compile(`<script>let val = $state('');</script><input bind:value={val} />`);
  assert(code.includes("addEventListener('input'"), 'input listener');
  assert(code.includes('set_val(e.target.value)'), 'setter call');
  assert(code.includes('val() ??'), 'reactive read');
});

// ── IIFE target (ServiceNow / no-bundler) ────────────────────────────────────

console.log('\nIIFE target');

test('iife target wraps output in IIFE and uses window.SolaCore', () => {
  const src = '<script>let n = $state(0);</script><span>{n}</span>';
  const { code } = compile(src, { target: 'iife', exportName: 'MyWidget' });
  assert(code.includes('(function()'), 'IIFE wrapper');
  assert(code.includes('window.SolaCore'), 'pulls from global');
  assert(code.includes("window['MyWidget']"), 'exports named global');
  assert(code.includes('createSignal(0)'), '$state compiled inside IIFE');
  assert(!code.includes("import {"), 'no ESM import');
  assert(!code.includes('export default'), 'no ESM export');
});

test('iife target closes IIFE correctly', () => {
  const { code } = compile('<div>Hello</div>', { target: 'iife' });
  assert(code.trimEnd().endsWith('})();'), 'IIFE closes');
});

// ── Error messages ────────────────────────────────────────────────────────────

console.log('\nError messages');

test('parse error includes file path and line number', () => {
  try {
    compile(`<script>const x = @@@;</script>`, { filename: 'Test.sola' });
    assert.fail('should have thrown');
  } catch (err) {
    assert(err.message.includes('Test.sola'), 'filename in error');
    assert(/line \d+/.test(err.message), 'line number in error');
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
