import { compile } from '../packages/compiler/src/index.js';

const source = `
<script>
  let count = $state(0);
  let doubled = $derived(() => count() * 2);
  let intentData = $intent("Show analytics");
</script>

<div class="test-container">
  <h1>Count: {count()}</h1>
  <p>Doubled: {doubled()}</p>
  <button on:click={() => count.set(count() + 1)}>Increment</button>
</div>

<style>
  .test-container {
    background: #0ea5e9;
    padding: 24px;
    border-radius: 12px;
  }
</style>
`;

const result = compile(source, 'Test.sola');
console.log('--- COMPILED OUTPUT (First 400 chars) ---');
console.log(result.slice(0, 400));
console.log('--- EXPORT SIGNATURE ---');
console.log(result.slice(result.lastIndexOf('export default')));
