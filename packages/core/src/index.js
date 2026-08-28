// @sola/core — Reactivity Engine V4
// Milestone 1: Full reactivity primitives, lifecycle hooks, batched updates, configurable intents

// ─── Effect Stack ───
let effectStack = [];
let pendingEffects = new Set();
let isFlushing = false;

// ─── Batched Updates ───
function scheduleFlush() {
  if (!isFlushing) {
    isFlushing = true;
    queueMicrotask(() => {
      while (pendingEffects.size > 0) {
        const effects = [...pendingEffects];
        pendingEffects.clear();
        for (const effect of effects) {
          effect.execute();
        }
      }
      isFlushing = false;
    });
  }
}

// ─── createSignal ───
export function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  const read = () => {
    const currentEffect = effectStack[effectStack.length - 1];
    if (currentEffect) {
      subscribers.add(currentEffect);
      currentEffect.dependencies.add(subscribers);
    }
    return value;
  };

  const write = (newValue) => {
    if (value !== newValue) {
      value = newValue;
      for (const sub of [...subscribers]) {
        pendingEffects.add(sub);
      }
      scheduleFlush();
    }
  };

  return [read, write];
}

// ─── createEffect ───
export function createEffect(fn) {
  const effect = {
    execute() {
      cleanup();
      effectStack.push(effect);
      try {
        fn();
      } finally {
        effectStack.pop();
      }
    },
    dependencies: new Set(),
    cleanup
  };

  function cleanup() {
    for (const dep of effect.dependencies) {
      dep.delete(effect);
    }
    effect.dependencies.clear();
  }

  // Run immediately (synchronous initial execution)
  effectStack.push(effect);
  try {
    fn();
  } finally {
    effectStack.pop();
  }

  return cleanup;
}

// ─── createDerived ───
// Computed signal that auto-tracks dependencies and lazily recomputes.
export function createDerived(fn) {
  let cachedValue;
  let dirty = true;
  const subscribers = new Set();
  let innerDependencies = new Set();

  // Track when our dependencies change
  const markDirty = {
    execute() {
      if (!dirty) {
        dirty = true;
        // Propagate to our own subscribers
        for (const sub of [...subscribers]) {
          pendingEffects.add(sub);
        }
        scheduleFlush();
      }
    },
    dependencies: innerDependencies,
    cleanup() {
      for (const dep of innerDependencies) {
        dep.delete(markDirty);
      }
      innerDependencies.clear();
    }
  };

  const read = () => {
    // Subscribe the current running effect to us
    const currentEffect = effectStack[effectStack.length - 1];
    if (currentEffect) {
      subscribers.add(currentEffect);
      currentEffect.dependencies.add(subscribers);
    }

    if (dirty) {
      // Clean up old deps
      markDirty.cleanup();
      innerDependencies = new Set();
      markDirty.dependencies = innerDependencies;

      // Track which signals fn() reads
      effectStack.push(markDirty);
      try {
        cachedValue = fn();
      } finally {
        effectStack.pop();
      }
      dirty = false;
    }

    return cachedValue;
  };

  return read;
}

// ─── Lifecycle Hooks ───
let mountCallbacks = [];
let destroyCallbacks = [];
let isMounted = false;

export function onMount(fn) {
  if (isMounted) {
    // Already mounted, run immediately
    fn();
  } else {
    mountCallbacks.push(fn);
  }
}

export function onDestroy(fn) {
  destroyCallbacks.push(fn);
}

// Called by the compiled mount() function after DOM is built
export function __flush_mounts() {
  isMounted = true;
  const cbs = [...mountCallbacks];
  mountCallbacks = [];
  for (const cb of cbs) {
    cb();
  }
}

// Called when a component is torn down
export function __flush_destroys() {
  isMounted = false;
  const cbs = [...destroyCallbacks];
  destroyCallbacks = [];
  for (const cb of cbs) {
    cb();
  }
}

// ─── createIntent ───
// Configurable ambient intent resolver.
const defaultIntentConfig = {
  provider: 'local',
  endpoint: '/api/intent',
  model: 'gemini-3.6-flash'
};

let globalIntentConfig = { ...defaultIntentConfig };

export function configureIntent(config) {
  globalIntentConfig = { ...globalIntentConfig, ...config };
}

export function createIntent(promptFn, options = {}) {
  const config = { ...globalIntentConfig, ...options };
  const [read, write] = createSignal(options.initial || 'Resolving...');
  let abortController = null;

  createEffect(() => {
    const currentPrompt = typeof promptFn === 'function' ? promptFn() : promptFn;
    if (!currentPrompt) return;

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    // Resolve the endpoint
    let url = config.endpoint;
    if (config.provider === 'local') {
      // Use relative URL for same-origin
      url = config.endpoint;
    }

    write('Resolving...');

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: currentPrompt }],
        model: config.model,
        provider: config.provider
      }),
      signal: abortController.signal
    })
    .then(res => {
      if (!res.ok) throw new Error(`Intent failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data && data.components && data.components.length > 0) {
        write(data.components[0]);
      } else if (data && data.result) {
        write(data.result);
      } else {
        write(data);
      }
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('[Sola Intent Error]', err);
        write({ error: err.message });
      }
    });
  });

  return read;
}

// ─── createData ───
// Reactive data connection through the Sola Relay.
const defaultDataConfig = {
  relayEndpoint: 'http://localhost:4040/api/query',
  refresh: null // e.g. '30s', '1m', '5m'
};

let globalDataConfig = { ...defaultDataConfig };

export function configureData(config) {
  globalDataConfig = { ...globalDataConfig, ...config };
}

function parseInterval(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;
  const val = parseInt(match[1]);
  switch (match[2]) {
    case 's': return val * 1000;
    case 'm': return val * 60 * 1000;
    case 'h': return val * 3600 * 1000;
  }
  return null;
}

export function createData(source, options = {}) {
  const config = { ...globalDataConfig, ...options };
  const [read, write] = createSignal({ loading: true, data: null, error: null });
  let abortController = null;
  let refreshTimer = null;

  function fetchData() {
    if (abortController) abortController.abort();
    abortController = new AbortController();

    write({ loading: true, data: read().data, error: null });

    fetch(config.relayEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        query: config.query || null,
        filters: config.filters || null,
        sort: config.sort || null,
        limit: config.limit || null,
        offset: config.offset || null
      }),
      signal: abortController.signal
    })
    .then(res => {
      if (!res.ok) throw new Error(`Data fetch failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      write({ loading: false, data: data.rows || data, error: null });
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('[Sola Data Error]', err);
        write({ loading: false, data: null, error: err.message });
      }
    });
  }

  // Initial fetch
  fetchData();

  // Auto-refresh
  const interval = parseInterval(config.refresh);
  if (interval) {
    refreshTimer = setInterval(fetchData, interval);
  }

  // Return a signal that provides .loading, .data, .error
  const accessor = () => read();
  accessor.refetch = fetchData;
  accessor.stop = () => {
    if (refreshTimer) clearInterval(refreshTimer);
    if (abortController) abortController.abort();
  };

  return accessor;
}

// ─── Named Cross-Widget Signal Telemetry Mesh ───

class SignalMeshEngine {
  constructor() {
    this.topics = new Map();
    this.telemetrySubscribers = new Set();
    this.cycleStack = new Set();
  }

  topic(name, initialValue) {
    if (!this.topics.has(name)) {
      const [read, write] = createSignal(initialValue);
      this.topics.set(name, { read, write, value: initialValue, subscribers: new Set() });
    }

    const entry = this.topics.get(name);

    const read = () => entry.read();
    const write = (next, originId = 'signal') => {
      const nextVal = typeof next === 'function' ? next(entry.value) : next;
      if (entry.value === nextVal) return;

      if (this.cycleStack.has(name)) {
        console.warn(`[Sola Signal Mesh] Cycle detected on topic "${name}". Aborting cyclic dispatch.`);
        return;
      }

      const prev = entry.value;
      entry.value = nextVal;
      entry.write(nextVal);

      const event = {
        topic: name,
        value: nextVal,
        prevValue: prev,
        timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
        originWidgetId: originId
      };

      this.telemetrySubscribers.forEach(cb => {
        try { cb(event); } catch (e) { console.error(e); }
      });

      this.cycleStack.add(name);
      try {
        entry.subscribers.forEach(sub => {
          try { sub(nextVal, event); } catch (e) { console.error(e); }
        });
      } finally {
        this.cycleStack.delete(name);
      }
    };

    return [read, write];
  }

  subscribe(name, fn) {
    if (!this.topics.has(name)) {
      this.topic(name, undefined);
    }
    const entry = this.topics.get(name);
    entry.subscribers.add(fn);
    return () => entry.subscribers.delete(fn);
  }

  onTelemetry(fn) {
    this.telemetrySubscribers.add(fn);
    return () => this.telemetrySubscribers.delete(fn);
  }
}

export const signalMesh = new SignalMeshEngine();
export const createTopicSignal = (topic, initialVal) => signalMesh.topic(topic, initialVal);

