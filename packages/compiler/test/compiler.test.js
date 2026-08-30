import assert from 'node:assert';
import { compile } from '../src/index.js';

console.log('Testing @sola/compiler v1.0.0...');

// Test 1: {#if}{:else} compiles to structured sola-then and sola-else branches
{
  const template = `
<script>
  let loggedIn = $state(false);
</script>
{#if loggedIn}
  <span class="user">Welcome User</span>
{:else}
  <span class="guest">Please Log In</span>
{/if}
`;
  const result = compile(template);
  assert(result.code.includes('createEffect'), 'Must emit createEffect');
  assert(result.code.includes('if (loggedIn)'), 'Must check condition');
  assert(result.code.includes('Welcome User'), 'Must include then branch');
  assert(result.code.includes('Please Log In'), 'Must include else branch');
  assert(!result.code.includes('// else block (rendered by paired if)'), 'Should not have broken else comment');
  console.log('✓ Test 1 Passed: {#if}{:else} conditional branch structuring');
}

// Test 2: {#each} renders in ascending index order
{
  const template = `
<script>
  let items = $state(['A', 'B', 'C']);
</script>
{#each items as item, i}
  <div class="item">{item}</div>
{/each}
`;
  const result = compile(template);
  assert(result.code.includes('for (let _i = 0; _i < _items.length; _i++)'), 'Must iterate ascending');
  assert(result.code.includes('const f = document.createDocumentFragment()'), 'Must build fragment before inserting');
  console.log('✓ Test 2 Passed: {#each} natural ascending order');
}

// Test 3: Style deduplication guard
{
  const template = `
<style>
  .card { color: red; }
</style>
<div class="card">Hello</div>
`;
  const result = compile(template);
  assert(result.code.includes('!window['), 'Must include global style deduplication guard');
  console.log('✓ Test 3 Passed: Scoped style deduplication guard');
}

// Test 4: All assignment operators
{
  const template = `
<script>
  let count = $state(10);
  function multiply() { count *= 2; }
  function divide() { count /= 2; }
  function power() { count **= 2; }
</script>
<button onclick={multiply}>Double</button>
`;
  const result = compile(template);
  assert(result.code.includes('set_count(count() * (2))'), 'Must rewrite *=');
  assert(result.code.includes('set_count(count() / (2))'), 'Must rewrite /=');
  assert(result.code.includes('set_count(count() ** (2))'), 'Must rewrite **=');
  console.log('✓ Test 4 Passed: Extended assignment operators (*=, /=, **=)');
}

console.log('\nAll compiler tests passed successfully! 🎉');
