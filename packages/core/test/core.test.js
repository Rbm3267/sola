import assert from 'node:assert';
import { describe, it } from 'node:test';
import { 
  createSignal, 
  createDerived, 
  createEffect, 
  flushSync,
  onMount, 
  onDestroy,
  pushContext,
  popContext
} from '../src/index.js';

describe('@sola/core reactivity engine', () => {
  it('should create reactive signals and update values', () => {
    const [count, setCount] = createSignal(10);
    assert.strictEqual(count(), 10);
    setCount(25);
    assert.strictEqual(count(), 25);
  });

  it('should compute derived values reactively', () => {
    const [a, setA] = createSignal(2);
    const [b, setB] = createSignal(3);
    const sum = createDerived(() => a() + b());
    
    assert.strictEqual(sum(), 5);
    setA(10);
    flushSync();
    assert.strictEqual(sum(), 13);
    setB(20);
    flushSync();
    assert.strictEqual(sum(), 30);
  });

  it('should run effects when dependency signals change', () => {
    const [name, setName] = createSignal('Sola');
    let effectRan = 0;
    let observedName = '';

    const cleanup = createEffect(() => {
      effectRan++;
      observedName = name();
    });

    assert.strictEqual(effectRan, 1);
    assert.strictEqual(observedName, 'Sola');

    setName('Zero-VDOM');
    flushSync();
    assert.strictEqual(effectRan, 2);
    assert.strictEqual(observedName, 'Zero-VDOM');

    cleanup();
    setName('Ignored');
    flushSync();
    assert.strictEqual(effectRan, 2);
  });

  it('should isolate component lifecycle contextStack without leaking', () => {
    const ctx1 = pushContext();
    let mounted1 = false;
    onMount(() => { mounted1 = true; });

    const ctx2 = pushContext();
    let mounted2 = false;
    onMount(() => { mounted2 = true; });

    popContext(ctx2);
    popContext(ctx1);

    assert.strictEqual(ctx1.mounts.length, 1);
    assert.strictEqual(ctx2.mounts.length, 1);
    ctx1.mounts[0]();
    ctx2.mounts[0]();
    assert.strictEqual(mounted1, true);
    assert.strictEqual(mounted2, true);
  });
});
