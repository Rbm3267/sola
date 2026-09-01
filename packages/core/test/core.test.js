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
  popContext,
  __flush_mounts,
  __flush_destroys
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

  it('should fire a parent component\'s onMount even when a nested child mounts during its own construction and stays on the context stack', () => {
    // Mirrors exactly what compiled mount() output does: pushContext(), run
    // the component's own script/DOM construction (which may mount nested
    // children), then flush THIS component's own onMount callbacks using
    // the specific context pushContext() returned — not whatever happens
    // to be "active" afterward.
    const parentCtx = pushContext();
    let parentMounted = false;
    onMount(() => { parentMounted = true; });

    // Simulate a nested child component mounting while the parent's DOM is
    // being built. A real mounted child never calls popContext() until it
    // unmounts, so this reassigns the module-global activeContext to the
    // child and leaves it there.
    const childCtx = pushContext();
    let childMounted = false;
    onMount(() => { childMounted = true; });
    __flush_mounts(childCtx);
    assert.strictEqual(childMounted, true, 'child onMount should fire when flushed with its own context');
    // Child stays mounted — no popContext(childCtx) here, matching real usage.

    // Parent flushes its own mounts using the context IT was given, exactly
    // like the compiler's `__flush_mounts(__ctx)` call site.
    __flush_mounts(parentCtx);
    assert.strictEqual(parentMounted, true, 'parent onMount must fire even though a child is still on the context stack');

    // Teardown, again using the explicit context rather than relying on
    // whatever activeContext happens to be (still childCtx at this point,
    // since neither context has been popped yet).
    let parentDestroyed = false;
    parentCtx.destroys.push(() => { parentDestroyed = true; });
    __flush_destroys(parentCtx);
    assert.strictEqual(parentDestroyed, true);

    popContext(childCtx);
    popContext(parentCtx);
  });
});
