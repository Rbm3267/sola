<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';

  let activeSection = $state('quickstart');
  let askQuery = $state('');
  let askLoading = $state(false);
  let aiAnswer = $state('');
  let isMobileNavOpen = $state(false);
  let packageManager = $state<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');

  // Live Docs Sandbox State
  let sandboxTitle = $state('Active Cluster Telemetry');
  let sandboxValue = $state('1,420 RPS');

  // Copy Feedback State
  let copiedId = $state('');
  function handleCopy(text: string, id: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copiedId = id;
      setTimeout(() => {
        if (copiedId === id) copiedId = '';
      }, 2000);
    }
  }

  const groups = [
    {
      name: 'Getting Started',
      items: [
        { id: 'quickstart', title: 'Quickstart & Installation', badge: 'Popular' },
        { id: 'syntax', title: 'The .sola Component Format', badge: 'Core' }
      ]
    },
    {
      name: 'Reactivity & Primitives',
      items: [
        { id: 'api-reactivity', title: 'Core Reactivity API' },
        { id: 'api-macros', title: 'Compiler Macro Primitives ($intent, $data)' },
        { id: 'engine', title: 'Compiler & Zero-VDOM Engine' }
      ]
    },
    {
      name: 'Integration & Embedding',
      items: [
        { id: 'host-embedding', title: 'React & Enterprise Embedding' },
        { id: 'relay-saas', title: 'Sola Relay SaaS Deployment' },
        { id: 'llm-spec', title: 'LLM & AI Agent Prompting Spec' }
      ]
    }
  ];

  const currentItem = $derived(
    groups.flatMap(g => g.items).find(i => i.id === activeSection) || groups[0].items[0]
  );
  const currentGroup = $derived(
    groups.find(g => g.items.some(i => i.id === activeSection)) || groups[0]
  );

  async function askSolaAi() {
    if (!askQuery.trim() || askLoading) return;
    askLoading = true;
    aiAnswer = '';

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: `You are the Sola Framework Technical Documentation Assistant. Answer concisely with working code examples: ${askQuery}` 
        })
      });

      const data = await res.json();
      if (typeof data === 'string') {
        aiAnswer = data;
      } else if (data.components) {
        aiAnswer = "Generated Component Architecture:\n\n" + JSON.stringify(data.components, null, 2);
      } else {
        aiAnswer = JSON.stringify(data, null, 2);
      }
    } catch {
      aiAnswer = "Sola components compile directly into native reactive DOM nodes via @sola/compiler. Use createSignal() for local state, $intent for ambient generative resolution, and $data for live remote polling without virtual DOM overhead.";
    } finally {
      askLoading = false;
    }
  }

  // Dynamic CLI code by package manager
  const scaffoldCmds = {
    npm: 'npm create sola@latest my-sola-app',
    pnpm: 'pnpm create sola my-sola-app',
    yarn: 'yarn create sola my-sola-app',
    bun: 'bun create sola my-sola-app'
  };

  const installCmds = {
    npm: 'npm install @sola/core @sola/compiler @sola/vite-plugin-sola',
    pnpm: 'pnpm add @sola/core @sola/compiler @sola/vite-plugin-sola',
    yarn: 'yarn add @sola/core @sola/compiler @sola/vite-plugin-sola',
    bun: 'bun add @sola/core @sola/compiler @sola/vite-plugin-sola'
  };
  
  const viteConfigCode = `import { defineConfig } from 'vite';
import sola from '@sola/vite-plugin-sola';

export default defineConfig({
  plugins: [sola()]
});`;

  const syntaxExample = `<` + `script>
  export let title = "Cluster Dashboard";
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count++;
  }
<` + `/script>

<div class="card">
  <h3>{title}</h3>
  <div class="value">{doubled}</div>
  <button onclick={increment}>Increment Metric</button>
</div>

<` + `style>
  .card {
    padding: 1.5rem;
    border-radius: 1rem;
    background: #090d19;
    color: #fff;
  }
  .value {
    font-size: 2rem;
    font-weight: 800;
    color: #10b981;
  }
<` + `/style>`;

  const signalExample = `import { createSignal } from '@sola/core';

// Create a reactive state tuple
const [getCount, setCount] = createSignal(0);

console.log(getCount()); // 0
setCount(prev => prev + 1);
console.log(getCount()); // 1`;

  const derivedExample = `import { createSignal, createDerived } from '@sola/core';

const [getRps, setRps] = createSignal(1200);
// Automatically recomputes when getRps updates
const getThroughput = createDerived(() => \`\${getRps() * 60} req/min\`);

console.log(getThroughput()); // "72000 req/min"`;

  const effectExample = `import { createSignal, createEffect } from '@sola/core';

const [getLatency, setLatency] = createSignal(12);

// Auto-subscribes to getLatency()
createEffect(() => {
  if (getLatency() > 100) {
    console.warn("High latency threshold breach!");
  }
});`;

  const mountExample = `import MyComponent from './MyComponent.sola';

// Mount directly into vanilla DOM container
const unmount = MyComponent(document.getElementById('root'), {
  title: "Production Ingress Cluster"
});

// Clean up listeners when done
unmount();`;

  const intentMacroExample = `<` + `script>
  // Declares an ambient component compiled via Gemini AST
  let liveWidget = $intent("Generate cluster latency gauge with 50ms SLA threshold");
<` + `/script>

<div class="widget-host">
  {liveWidget}
</div>`;

  const dataMacroExample = `<` + `script>
  // Bi-directional WebSocket / SSE signal binding to Google Sheets or Postgres
  let mrr = $data("sheet://finance/q3_metrics?field=mrr", { pollIntervalMs: 1000 });
<` + `/script>

<div class="metric-tile">
  <span>Monthly Revenue</span>
  <h2>{mrr.value}</h2>
</div>`;

  const dockerfileCode = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "relay-server.js"]`;

  const nginxCode = `server {
    listen 443 ssl http2;
    server_name sola-relay.internal.net;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}`;

  const relayJsonCode = `{
  "port": 8080,
  "datasources": {
    "postgres": {
      "host": "db.internal.net",
      "user": "sola_reader",
      "password": "\${DB_PASSWORD}"
    }
  }
}`;

  const engineExample = `// Sola Native Output (Zero Virtual DOM overhead)
export default function mount(target, props) {
  const el = document.createElement('div');
  el.className = 'sola-card-s8f9';
  
  const textNode = document.createTextNode(props.title);
  el.appendChild(textNode);
  
  target.appendChild(el);
  return () => target.removeChild(el);
}`;

  const llmSystemPrompt = `You are a specialist in the Sola component format (.sola).
Sola components compile single-file markup into pure zero-VDOM native DOM nodes.
- Use <script> with $state(val) and $derived(expr)
- Use HTML template with {expression} and standard HTML elements
- Use <style> for scoped CSS
- Use $intent("...") for ambient generative nodes
- Use $data("uri://...") for live signal bindings`;

  const serviceNowEmbedCode = `// ServiceNow UI Script / Widget Client Controller
function(spUtil) {
  var c = this;
  var container = document.getElementById('sola-matrix-root');
  
  // Mount zero-VDOM Sola Incident Matrix directly into Service Portal DOM
  window.SolaIncidentMatrix(container, {
    incidentId: c.data.sys_id,
    onResolve: function(incident) {
      spUtil.addInfoMessage('Resolved via Sola Ambient Action');
    }
  });
}`;

  const reactEmbedCode = `import React, { useEffect, useRef } from 'react';
import mountSolaComponent from '@sola/ui/IncidentTriageMatrix';

export function SolaIncidentCard({ incidentId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Mount Sola component directly into React DOM container
    const unmount = mountSolaComponent(containerRef.current, { incidentId });
    return () => unmount();
  }, [incidentId]);

  return <div ref={containerRef} className="sola-container" />;
}`;
</script>

<svelte:head>
  <title>Sola Documentation — Architecture, Reactivity & APIs</title>
</svelte:head>

<div class="flex flex-col w-full min-h-screen bg-[#fafafa] dark:bg-[#090d19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
  <Navbar />

  <!-- Top Hero Header (Tailscale style) -->
  <header class="border-b border-slate-900/[0.03] dark:border-white/[0.04] bg-white/60 dark:bg-[#090d19]/60 backdrop-blur-xl py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div>
        <div class="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
          <span>Documentation</span>
          <span class="text-slate-300 dark:text-slate-700">/</span>
          <span class="text-slate-600 dark:text-slate-400">{currentGroup.name}</span>
          <span class="text-slate-300 dark:text-slate-700">/</span>
          <span class="text-slate-900 dark:text-slate-200 font-bold">{currentItem.title}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
          Sola Documentation
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Zero-VDOM reactivity, compiler macros, ambient signals, and embedding architecture for modern apps.
        </p>
      </div>

      <!-- Quick Ask Arc Input -->
      <div class="w-full md:w-80 shrink-0">
        <form 
          onsubmit={(e) => { e.preventDefault(); askSolaAi(); }}
          class="relative flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <input 
            type="text"
            bind:value={askQuery}
            placeholder="Ask docs AI (e.g. '$data syntax')..."
            class="w-full pl-3 pr-20 py-2 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-sans"
          />
          <button 
            type="submit"
            disabled={askLoading || !askQuery.trim()}
            class="absolute right-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:disabled:opacity-40 dark:text-slate-950 rounded-xl text-[11px] font-bold transition-all cursor-pointer">
            {#if askLoading}
              <span>...</span>
            {:else}
              <span>Ask</span>
            {/if}
          </button>
        </form>
      </div>

    </div>

    <!-- AI Response Card (if generated) -->
    {#if aiAnswer}
      <div class="max-w-7xl mx-auto mt-4 p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-mono text-slate-900 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap relative shadow-xs">
        <button 
          onclick={() => (aiAnswer = '')}
          class="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold">
          &times;
        </button>
        <div class="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" stroke-dasharray="4 4"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          <span>Sola Arc Response</span>
        </div>
        {aiAnswer}
      </div>
    {/if}
  </header>

  <!-- Mobile Quick Topic Bar (Tailscale-style compact selector) -->
  <div class="lg:hidden sticky top-16 z-30 bg-white/95 dark:bg-[#090d19]/95 backdrop-blur-xl border-b border-slate-900/[0.03] dark:border-white/[0.04] px-4 py-2.5 flex items-center justify-between shadow-2xs">
    <div class="flex items-center gap-2 truncate">
      <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Topic:</span>
      <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{currentItem.title}</span>
    </div>
    <button 
      onclick={() => (isMobileNavOpen = !isMobileNavOpen)}
      class="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer">
      <span>Index</span>
      <svg class="w-3.5 h-3.5 transform transition-transform {isMobileNavOpen ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  </div>

  <!-- Mobile Navigation Dropdown Modal -->
  {#if isMobileNavOpen}
    <div class="lg:hidden bg-white/95 dark:bg-[#090d19]/95 border-b border-slate-900/[0.04] dark:border-white/[0.06] p-4 space-y-4 shadow-xl animate-in">
      {#each groups as grp}
        <div>
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">{grp.name}</span>
          <div class="mt-1 space-y-1">
            {#each grp.items as item}
              <button 
                onclick={() => { activeSection = item.id; isMobileNavOpen = false; }}
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between {activeSection === item.id ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 font-bold border border-emerald-500/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
                <span>{item.title}</span>
                {#if item.badge}
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">{item.badge}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Main Layout Grid -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8 items-start w-full">
    
    <!-- Desktop Sidebar Navigation (Sticky Left) -->
    <aside class="hidden lg:block w-64 shrink-0 sticky top-24 space-y-6">
      {#each groups as grp}
        <div class="space-y-1.5">
          <h3 class="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 px-3">
            {grp.name}
          </h3>
          <nav class="space-y-0.5">
            {#each grp.items as item}
              <button 
                onclick={() => activeSection = item.id}
                class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer flex items-center justify-between {activeSection === item.id ? 'bg-emerald-500/10 text-emerald-950 dark:text-emerald-400 font-bold shadow-2xs border border-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'}">
                <span class="truncate">{item.title}</span>
                {#if item.badge}
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold">{item.badge}</span>
                {/if}
              </button>
            {/each}
          </nav>
        </div>
      {/each}
    </aside>

    <!-- Main Content Reader (Tailscale Article Card) -->
    <main class="flex-1 w-full bg-white dark:bg-[#0f172a]/70 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-10 shadow-xs">
      
      <!-- 1. QUICKSTART -->
      {#if activeSection === 'quickstart'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Getting Started</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Quickstart & Installation
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Scaffold a complete Sola application or add the zero-VDOM compiler to an existing Vite repository in under 60 seconds.
            </p>
          </div>

          <!-- Package Manager Tabs -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">1. Create a New Project</h3>
              <div class="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/60 dark:border-white/10 text-[11px] font-mono">
                {#each (['npm', 'pnpm', 'yarn', 'bun'] as const) as pm}
                  <button 
                    onclick={() => packageManager = pm}
                    class="px-2.5 py-0.5 rounded-md transition-all cursor-pointer font-bold {packageManager === pm ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                    {pm}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Scaffold Box -->
            <div class="relative group">
              <div class="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs shadow-inner border border-slate-800 flex items-center justify-between overflow-x-auto">
                <code>$ {scaffoldCmds[packageManager]}</code>
              </div>
              <button 
                onclick={() => handleCopy(scaffoldCmds[packageManager], 'scaffold')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'scaffold'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <!-- Existing App Install -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">2. Add to Existing Vite App</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400">Install the core runtime and Vite compiler plugin:</p>
            <div class="relative group">
              <div class="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs shadow-inner border border-slate-800 flex items-center justify-between overflow-x-auto">
                <code>$ {installCmds[packageManager]}</code>
              </div>
              <button 
                onclick={() => handleCopy(installCmds[packageManager], 'install')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'install'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <!-- Vite Plugin Config -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">3. Configure Vite Plugin</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400">Register the plugin in your <code>vite.config.ts</code>:</p>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 leading-relaxed"><code>{viteConfigCode}</code></pre>
              <button 
                onclick={() => handleCopy(viteConfigCode, 'vite-config')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'vite-config'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>
        </article>

      <!-- 2. SYNTAX -->
      {:else if activeSection === 'syntax'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Component Architecture</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              The .sola Component Format
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              A single-file <code>.sola</code> component encapsulates state logic, declarative markup, and scoped styles into a fine-grained native DOM module.
            </p>
          </div>

          <!-- 3-Part Architecture Breakdown Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20">
              <span class="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">Part 1</span>
              <h4 class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1 mb-1">&lt;script&gt;</h4>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Defines reactive signals (<code>$state</code>, <code>$derived</code>), macros (<code>$intent</code>), and handlers.</p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <span class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Part 2</span>
              <h4 class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1 mb-1">HTML Template</h4>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Declarative markup with fine-grained reactive expression bindings <code>&#123;count&#125;</code>.</p>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <span class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Part 3</span>
              <h4 class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1 mb-1">&lt;style&gt;</h4>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Styles are automatically hashed per-selector at compile time with zero global bleed.</p>
            </div>
          </div>

          <!-- Code Snippet -->
          <div class="relative group">
            <pre class="bg-slate-950 text-emerald-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{syntaxExample}</code></pre>
            <button 
              onclick={() => handleCopy(syntaxExample, 'syntax')}
              class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
              {#if copiedId === 'syntax'}
                <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span class="text-emerald-400">Copied</span>
              {:else}
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copy</span>
              {/if}
            </button>
          </div>

          <!-- Live Editable Component Sandbox -->
          <div class="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200/80 dark:border-white/5 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 class="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">Live Synchronized Sandbox</h3>
              </div>
              <span class="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">Native DOM</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div class="space-y-3">
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Card Title Prop</label>
                  <input 
                    type="text" 
                    bind:value={sandboxTitle}
                    class="w-full bg-white dark:bg-[#090d19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Card Value Prop</label>
                  <input 
                    type="text" 
                    bind:value={sandboxValue}
                    class="w-full bg-white dark:bg-[#090d19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <!-- Live Mounted Rendering -->
              <div class="flex flex-col items-center justify-center p-4 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-white dark:bg-[#090d19] min-h-[140px]">
                <DataCard config={{ title: sandboxTitle, value: sandboxValue, trend: "+12.4% live signal", icon: "activity" }} />
              </div>
            </div>
          </div>
        </article>

      <!-- 3. REACTIVITY -->
      {:else if activeSection === 'api-reactivity'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Developer API Reference</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Core Reactivity API
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Fine-grained signals that bypass virtual DOM tree reconciliation.
            </p>
          </div>

          <!-- createSignal -->
          <div class="space-y-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white font-mono">createSignal(initialValue)</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates a reactive local state tuple. Calling the getter auto-subscribes running effects; calling the setter updates only the bound DOM nodes.
            </p>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{signalExample}</code></pre>
              <button 
                onclick={() => handleCopy(signalExample, 'api-sig')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'api-sig'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <!-- createDerived -->
          <div class="space-y-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white font-mono">createDerived(fn)</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Establishes memoized derived values that automatically track dependency changes and recalculate with 0 ms overhead.
            </p>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{derivedExample}</code></pre>
              <button 
                onclick={() => handleCopy(derivedExample, 'api-der')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'api-der'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <!-- createEffect -->
          <div class="space-y-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white font-mono">createEffect(callback)</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Executes side effects and automatically registers reactive subscriptions on getters accessed inside the callback.
            </p>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{effectExample}</code></pre>
              <button 
                onclick={() => handleCopy(effectExample, 'api-eff')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'api-eff'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>
        </article>

      <!-- 4. MACROS -->
      {:else if activeSection === 'api-macros'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Compiler Macros</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Compiler Macro Primitives
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Compile-time macros that resolve natural language intent and bind remote data streams.
            </p>
          </div>

          <!-- $intent -->
          <div class="space-y-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white font-mono">$intent(prompt, options)</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Declared in component script blocks to resolve plain-text prompts into dynamically bound UI trees via Gemini AST translation.
            </p>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{intentMacroExample}</code></pre>
              <button 
                onclick={() => handleCopy(intentMacroExample, 'macro-int')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'macro-int'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <!-- $data -->
          <div class="space-y-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white font-mono">$data(sourceUri, options)</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Binds component properties directly to remote datasources (PostgreSQL, Google Sheets, REST SSE) without bespoke backend code.
            </p>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{dataMacroExample}</code></pre>
              <button 
                onclick={() => handleCopy(dataMacroExample, 'macro-dat')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'macro-dat'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>
        </article>

      <!-- 5. ENGINE -->
      {:else if activeSection === 'engine'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Architecture</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Compiler & Zero-VDOM Engine
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Sola compiles template nodes into <strong>direct native DOM updates</strong> instead of running Virtual DOM diffing routines.
            </p>
          </div>

          <div class="relative group">
            <pre class="bg-slate-950 text-emerald-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{engineExample}</code></pre>
            <button 
              onclick={() => handleCopy(engineExample, 'syntax-eng')}
              class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
              {#if copiedId === 'syntax-eng'}
                <span class="text-emerald-400">Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-white/5">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs mb-1 font-mono">3.2 kB Core Bundle</h4>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Zero third-party dependencies. Instant time-to-interactive on low-power mobile devices.</p>
            </div>
            <div class="p-5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-white/5">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs mb-1 font-mono">Sub-Millisecond Updates</h4>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Only the precise text node or attribute that changed is modified in the DOM tree.</p>
            </div>
          </div>
        </article>

      <!-- 6. HOST EMBEDDING -->
      {:else if activeSection === 'host-embedding'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Embedding Guide</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              React & Enterprise Embedding
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Because Sola compiles into pure, fine-grained DOM JavaScript (<code>~3.2 kB</code>), you can drop compiled Sola components directly into React applications or Enterprise Platform widgets with zero bundle penalty.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">1. React 19 / Next.js Hook Wrapper</h3>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{reactEmbedCode}</code></pre>
              <button 
                onclick={() => handleCopy(reactEmbedCode, 'react-emb')}
                class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'react-emb'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">2. Enterprise Service Portal Widget Controller</h3>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{serviceNowEmbedCode}</code></pre>
              <button 
                onclick={() => handleCopy(serviceNowEmbedCode, 'sn-emb')}
                class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'sn-emb'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>
        </article>

      <!-- 7. RELAY SAAS -->
      {:else if activeSection === 'relay-saas'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Production Deployment</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Sola Relay SaaS Deployment
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Deploy Sola Relay close to your target databases and expose it via reverse proxy with SSL termination.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">1. Docker Container</h3>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"><code>{dockerfileCode}</code></pre>
              <button 
                onclick={() => handleCopy(dockerfileCode, 'adm-dock')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'adm-dock'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono">2. Reverse Proxy Routing (Nginx)</h3>
            <div class="relative group">
              <pre class="bg-slate-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"><code>{nginxCode}</code></pre>
              <button 
                onclick={() => handleCopy(nginxCode, 'adm-ngx')}
                class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                {#if copiedId === 'adm-ngx'}
                  <span class="text-emerald-400">Copied</span>
                {:else}
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </div>
        </article>

      <!-- 8. LLM SPEC -->
      {:else if activeSection === 'llm-spec'}
        <article class="space-y-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>AI Specification</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              LLM & AI Agent Prompting Spec
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Provide this system prompt context block to <strong>Claude 3.7</strong>, <strong>ChatGPT (GPT-4o)</strong>, or <strong>Gemini 3.0</strong> so any LLM writes valid Sola components without hallucinating:
            </p>
          </div>

          <div class="relative group">
            <pre class="bg-slate-950 text-emerald-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{llmSystemPrompt}</code></pre>
            <button 
              onclick={() => handleCopy(llmSystemPrompt, 'llm-ctx')}
              class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
              {#if copiedId === 'llm-ctx'}
                <span class="text-emerald-400">Copied</span>
              {:else}
                <span>Copy</span>
              {/if}
            </button>
          </div>
        </article>
      {/if}

    </main>

  </div>
</div>
