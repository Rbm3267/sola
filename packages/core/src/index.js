// @sola/core — Reactivity Engine V4
// Milestone 1: Full reactivity primitives, lifecycle hooks, batched updates, configurable intents

// ─── Effect Stack ───
let effectStack = [];
let pendingEffects = new Set();
let isFlushing = false;

export function flushSync() {
  while (pendingEffects.size > 0) {
    const effects = [...pendingEffects];
    pendingEffects.clear();
    for (const effect of effects) {
      effect.execute();
    }
  }
  isFlushing = false;
}

// ─── Batched Updates ───
function scheduleFlush() {
  if (!isFlushing) {
    isFlushing = true;
    queueMicrotask(flushSync);
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

// ─── Component Lifecycle Scope Context Stack ───
const contextStack = [];
let activeContext = null;

export function pushContext() {
  const ctx = { mounts: [], destroys: [] };
  contextStack.push(ctx);
  activeContext = ctx;
  return ctx;
}

export function popContext(ctx) {
  const idx = contextStack.lastIndexOf(ctx);
  if (idx !== -1) {
    contextStack.splice(idx, 1);
  }
  activeContext = contextStack.length > 0 ? contextStack[contextStack.length - 1] : null;
}

export function onMount(fn) {
  if (activeContext) {
    activeContext.mounts.push(fn);
  } else {
    fn();
  }
}

export function onDestroy(fn) {
  if (activeContext) {
    activeContext.destroys.push(fn);
  }
}

// Called by compiled mount() function to flush instance mounts
export function __flush_mounts() {
  if (activeContext && activeContext.mounts.length > 0) {
    const cbs = [...activeContext.mounts];
    activeContext.mounts = [];
    for (const cb of cbs) {
      cb();
    }
  }
}

// Called when a component is torn down
export function __flush_destroys() {
  if (activeContext && activeContext.destroys.length > 0) {
    const cbs = [...activeContext.destroys];
    activeContext.destroys = [];
    for (const cb of cbs) {
      cb();
    }
  }
}

// ─── createIntent ───
// Configurable ambient intent resolver with streaming support.
const defaultIntentConfig = {
  provider: 'local',
  endpoint: '/api/intent',
  model: 'gemini-2.5-flash',
  stream: false
};

let globalIntentConfig = { ...defaultIntentConfig };

export function configureIntent(config) {
  globalIntentConfig = { ...globalIntentConfig, ...config };
}

async function _consumeSSE(response, onToken, onDone, onError) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      const lines = buf.split('\n');
      buf = lines.pop(); // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(payload);
          const token = parsed.token ?? parsed.delta ?? parsed.content ?? '';
          if (token) onToken(token);
        } catch {
          if (payload) onToken(payload);
        }
      }
    }
    onDone();
  } catch (err) {
    if (err.name !== 'AbortError') onError(err);
  }
}

export function createIntent(promptFn, options = {}) {
  const config = { ...globalIntentConfig, ...options };
  const [read, write] = createSignal(options.initial ?? null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  let abortController = null;

  onDestroy(() => {
    if (abortController) abortController.abort();
  });

  createEffect(() => {
    const prompt = typeof promptFn === 'function' ? promptFn() : promptFn;
    if (!prompt) return;

    if (abortController) abortController.abort();
    abortController = new AbortController();

    write(null);
    setError(null);
    setLoading(true);

    const body = JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: config.model,
      provider: config.provider,
      stream: config.stream
    });

    fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: abortController.signal
    }).then(res => {
      if (!res.ok) throw new Error(`Intent failed: ${res.status}`);

      if (config.stream) {
        let accumulated = '';
        return _consumeSSE(
          res,
          token => { accumulated += token; write(accumulated); },
          () => setLoading(false),
          err => { setError(err.message); setLoading(false); }
        );
      }

      return res.json().then(data => {
        if (data?.components?.length > 0) write(data.components[0]);
        else if (data?.result != null) write(data.result);
        else write(data);
        setLoading(false);
      });
    }).catch(err => {
      if (err.name !== 'AbortError') {
        console.error('[Sola Intent Error]', err);
        setError(err.message);
        setLoading(false);
      }
    });
  });

  const accessor = read;
  accessor.loading = loading;
  accessor.error = error;
  return accessor;
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

// ─── Sola Sentinel & Intent Telemetry Observer ───
export class SolaSentinel {
  constructor(name = 'default', options = {}) {
    this.name = name;
    this.thresholdMs = options.thresholdMs || 600;
    this.maxRageClicks = options.maxRageClicks || 3;
    this.clickHistory = [];
    this.subscribers = new Set();
    this.frictionEvents = [];
    this.flowIndex = 99.8;
  }

  recordClick(actionId, target = 'button') {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.clickHistory.push({ actionId, target, timestamp: now });
    this.clickHistory = this.clickHistory.filter(c => now - c.timestamp < 2000);
    
    const recent = this.clickHistory.filter(c => c.actionId === actionId && now - c.timestamp < this.thresholdMs);
    if (recent.length >= this.maxRageClicks) {
      this.triggerFrictionAlert({
        type: 'RAGE_CLICK',
        actionId,
        target,
        count: recent.length,
        timestamp: now,
        severity: 'HIGH',
        message: `Rage-click burst: ${recent.length} taps in ${Math.round(now - recent[0].timestamp)}ms`
      });
    }
  }

  recordSignalDrop(topic, error) {
    this.triggerFrictionAlert({
      type: 'SIGNAL_TIMEOUT',
      topic,
      error: error?.message || String(error),
      timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      severity: 'CRITICAL',
      message: `Signal channel "${topic}" breached SLA timeout (504 Gateway Stall)`
    });
  }

  triggerFrictionAlert(event) {
    this.frictionEvents.unshift(event);
    if (this.frictionEvents.length > 50) this.frictionEvents.pop();
    this.flowIndex = Math.max(68.5, Number((this.flowIndex - 3.8).toFixed(1)));
    
    this.subscribers.forEach(cb => {
      try { cb(event, this); } catch(e) { console.error(e); }
    });
  }

  onFriction(cb) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }
}

export function createSentinel(name, options) {
  return new SolaSentinel(name, options);
}

