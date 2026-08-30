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
        { id: 'quickstart', title: 'Installation & Setup', badge: 'v1.0.0' },
        { id: 'syntax', title: 'The .sola Format' }
      ]
    },
    {
      name: 'Core Concepts',
      items: [
        { id: 'api-reactivity', title: 'Reactivity & Signals' },
        { id: 'api-macros', title: 'Compiler Macros' },
        { id: 'engine', title: 'Zero-VDOM Engine' }
      ]
    },
    {
      name: 'Deployment & Adapters',
      items: [
        { id: 'host-embedding', title: 'React & Portal Embeds' },
        { id: 'relay-saas', title: 'Sola Relay SaaS' },
        { id: 'llm-spec', title: 'AI Prompting Spec' }
      ]
    }
  ];

  // Flat list for Next / Prev navigation
  const allItems = $derived(groups.flatMap(g => g.items));
  const currentIndex = $derived(allItems.findIndex(i => i.id === activeSection));
  const currentItem = $derived(allItems[currentIndex] || allItems[0]);
  const currentGroup = $derived(groups.find(g => g.items.some(i => i.id === activeSection)) || groups[0]);
  const prevItem = $derived(currentIndex > 0 ? allItems[currentIndex - 1] : null);
  const nextItem = $derived(currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null);

  async function askSolaAi() {
    if (!askQuery.trim() || askLoading) return;
    askLoading = true;
    aiAnswer = '';

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: `You are the Sola Framework Technical Assistant. Answer concisely with working code examples: ${askQuery}` 
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
  <title>{currentItem.title} - Sola Documentation</title>
</svelte:head>

<div class="flex flex-col w-full min-h-screen bg-[#fafafa] dark:bg-[#090d19] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
  <Navbar />

  <!-- Mobile Sticky Header (Tailwind Style) -->
  <div class="lg:hidden sticky top-16 z-30 bg-white/90 dark:bg-[#090d19]/90 backdrop-blur-xl border-b border-slate-900/[0.03] dark:border-white/[0.04] px-4 py-3 flex items-center justify-between shadow-2xs">
    <div class="flex items-center gap-2 text-xs font-mono">
      <span class="text-slate-400">{currentGroup.name}</span>
      <span class="text-slate-300 dark:text-slate-700">/</span>
      <span class="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{currentItem.title}</span>
    </div>
    <button 
      onclick={() => (isMobileNavOpen = !isMobileNavOpen)}
      class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer">
      <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      <span>Menu</span>
    </button>
  </div>

  <!-- Mobile Navigation Slide Drawer -->
  {#if isMobileNavOpen}
    <div class="lg:hidden bg-white/95 dark:bg-[#090d19]/95 border-b border-slate-900/[0.04] dark:border-white/[0.06] p-5 space-y-6 shadow-2xl">
      {#each groups as grp}
        <div>
          <h5 class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">{grp.name}</h5>
          <div class="space-y-1">
            {#each grp.items as item}
              <button 
                onclick={() => { activeSection = item.id; isMobileNavOpen = false; }}
                class="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between {activeSection === item.id ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-500/25' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
                <span>{item.title}</span>
                {#if item.badge}
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">{item.badge}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Main 3-Column Docs Layout Container (Tailwind CSS style) -->
  <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-10 w-full items-start">
    
    <!-- 1. Left Sidebar Navigation (Tailwind Rail style) -->
    <aside class="hidden lg:block w-64 shrink-0 sticky top-24 space-y-8 pr-4">
      
      <!-- Quick Search Bar -->
      <div class="relative">
        <input 
          type="text"
          bind:value={askQuery}
          onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); askSolaAi(); } }}
          placeholder="Quick search... ⌘K"
          class="w-full pl-8 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-400 shadow-2xs transition-all"
        />
        <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>

      <!-- Navigation Hierarchy -->
      {#each groups as grp}
        <div class="space-y-2">
          <h5 class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 px-3">
            {grp.name}
          </h5>
          <ul class="border-l border-slate-200 dark:border-white/10 space-y-1">
            {#each grp.items as item}
              <li>
                <button 
                  onclick={() => activeSection = item.id}
                  class="w-full text-left pl-4 pr-3 py-1.5 text-xs transition-all duration-150 cursor-pointer flex items-center justify-between border-l -ml-px {activeSection === item.id ? 'border-emerald-500 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-r-lg' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400'}">
                  <span class="truncate">{item.title}</span>
                  {#if item.badge}
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold">{item.badge}</span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}

      <!-- Documentation Meta Box -->
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs space-y-2">
        <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>Sola v0.9 Engine</span>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
          Single-file zero-VDOM reactivity for the ambient web.
        </p>
      </div>
    </aside>

    <!-- 2. Center Article Reader (Tailwind Prose & Code Blocks) -->
    <main class="flex-1 w-full min-w-0 max-w-4xl space-y-12">
      
      <!-- AI Answer Callout (if active) -->
      {#if aiAnswer}
        <div class="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-mono text-slate-900 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap relative shadow-xs">
          <button 
            onclick={() => (aiAnswer = '')}
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white text-base font-bold cursor-pointer">
            &times;
          </button>
          <div class="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" stroke-dasharray="4 4"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            <span>Sola Arc Intelligence Response</span>
          </div>
          {aiAnswer}
        </div>
      {/if}

      <!-- ================= 1. QUICKSTART ================= -->
      {#if activeSection === 'quickstart'}
        <article class="space-y-8">
          <!-- Article Header -->
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Getting Started</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Installation & Setup
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              Get started with Sola by creating a new standalone project or integrating the compiler into your existing Vite setup.
            </p>
          </header>

          <!-- Tailwind Style Callout Note -->
          <div class="border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 p-4 rounded-r-2xl space-y-1">
            <h4 class="text-xs font-bold text-emerald-950 dark:text-emerald-400 font-mono">Zero-VDOM Runtime Note</h4>
            <p class="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
              Sola compiles directly to standard ES modules without virtual DOM reconciliation. No runtime react-dom or large framework wrappers required.
            </p>
          </div>

          <!-- Step 1: Scaffold -->
          <section class="space-y-4 pt-2">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Creating a new project</span>
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              The fastest way to get started is with the official CLI initializer, which sets up Vite, UnoCSS, and Sola compiler hooks automatically:
            </p>

            <!-- Code Window (Tailwind Style) -->
            <div class="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
              <div class="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
                  <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                  <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  <span class="text-[11px] font-mono text-slate-400 ml-2">Terminal</span>
                </div>
                <!-- Package Manager Tabs -->
                <div class="flex items-center bg-slate-800 p-0.5 rounded-lg text-[10px] font-mono">
                  {#each (['npm', 'pnpm', 'yarn', 'bun'] as const) as pm}
                    <button 
                      onclick={() => packageManager = pm}
                      class="px-2 py-0.5 rounded transition-all cursor-pointer {packageManager === pm ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}">
                      {pm}
                    </button>
                  {/each}
                </div>
              </div>
              <div class="p-5 flex items-center justify-between font-mono text-xs text-emerald-400 overflow-x-auto">
                <code>$ {scaffoldCmds[packageManager]}</code>
                <button 
                  onclick={() => handleCopy(scaffoldCmds[packageManager], 'scaffold')}
                  class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 ml-4">
                  {#if copiedId === 'scaffold'}
                    <span class="text-[10px] text-emerald-400 font-bold px-1">Copied!</span>
                  {:else}
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>
          </section>

          <!-- Step 2: Existing Vite Project -->
          <section class="space-y-4 pt-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Adding to an existing Vite app</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              If you already have a Vite application, install the Sola core runtime and Vite compiler plugin:
            </p>

            <div class="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
              <div class="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <span class="text-[11px] font-mono text-slate-400">Terminal</span>
                <span class="text-[10px] font-mono text-slate-500">{packageManager}</span>
              </div>
              <div class="p-5 flex items-center justify-between font-mono text-xs text-emerald-400 overflow-x-auto">
                <code>$ {installCmds[packageManager]}</code>
                <button 
                  onclick={() => handleCopy(installCmds[packageManager], 'install')}
                  class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 ml-4">
                  {#if copiedId === 'install'}
                    <span class="text-[10px] text-emerald-400 font-bold px-1">Copied!</span>
                  {:else}
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>
          </section>

          <!-- Step 3: Vite Plugin Config -->
          <section class="space-y-4 pt-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Configuring Vite</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Add the Sola plugin to your <code>vite.config.ts</code>:
            </p>

            <div class="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
              <div class="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <span class="text-[11px] font-mono text-slate-400">vite.config.ts</span>
                <span class="text-[10px] font-mono text-slate-500">TypeScript</span>
              </div>
              <div class="p-5 relative font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
                <pre><code>{viteConfigCode}</code></pre>
                <button 
                  onclick={() => handleCopy(viteConfigCode, 'vite-cfg')}
                  class="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'vite-cfg'}
                    <span class="text-[10px] text-emerald-400 font-bold px-1">Copied!</span>
                  {:else}
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>
          </section>
        </article>

      <!-- ================= 2. SYNTAX ================= -->
      {:else if activeSection === 'syntax'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Component Architecture</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The .sola Format
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              Anatomy of single-file components compiling into reactive native DOM nodes.
            </p>
          </header>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Part 1</span>
              <h4 class="font-bold font-mono text-slate-900 dark:text-white text-xs mt-1 mb-1">&lt;script&gt;</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">Defines reactive signals (<code>$state</code>, <code>$derived</code>) and handlers.</p>
            </div>
            <div class="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Part 2</span>
              <h4 class="font-bold font-mono text-slate-900 dark:text-white text-xs mt-1 mb-1">HTML Template</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">Standard declarative markup with <code>&#123;expression&#125;</code> bindings.</p>
            </div>
            <div class="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Part 3</span>
              <h4 class="font-bold font-mono text-slate-900 dark:text-white text-xs mt-1 mb-1">&lt;style&gt;</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">Auto-scoped CSS hashed at compile time with 0 global collisions.</p>
            </div>
          </div>

          <!-- Code Window -->
          <div class="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
            <div class="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <span class="text-[11px] font-mono text-slate-400">MetricCard.sola</span>
              <span class="text-[10px] font-mono text-slate-500">Single-File Component</span>
            </div>
            <div class="p-5 relative font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{syntaxExample}</code></pre>
              <button 
                onclick={() => handleCopy(syntaxExample, 'syntax')}
                class="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'syntax'}
                  <span class="text-[10px] text-emerald-400 font-bold px-1">Copied!</span>
                {:else}
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>
          </div>

          <!-- Interactive Live Sandbox -->
          <div class="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 class="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">Live Synchronized Sandbox</h3>
              </div>
              <span class="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Native DOM</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div class="space-y-3">
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Card Title Prop</label>
                  <input 
                    type="text" 
                    bind:value={sandboxTitle}
                    class="w-full bg-slate-50 dark:bg-[#090d19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Card Value Prop</label>
                  <input 
                    type="text" 
                    bind:value={sandboxValue}
                    class="w-full bg-slate-50 dark:bg-[#090d19] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div class="flex items-center justify-center p-4 border border-slate-100 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-[#090d19]">
                <DataCard config={{ title: sandboxTitle, value: sandboxValue, trend: "+14.8% vs baseline", icon: "activity" }} />
              </div>
            </div>
          </div>
        </article>

      <!-- ================= 3. REACTIVITY ================= -->
      {:else if activeSection === 'api-reactivity'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Core Concepts</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Reactivity & Signals
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              Fine-grained state tracking primitives designed for zero overhead.
            </p>
          </header>

          <section class="space-y-3">
            <h3 class="text-base font-bold font-mono text-slate-900 dark:text-white">createSignal(initialValue)</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Creates a local reactive state tuple. Invoking the getter registers subscriptions; calling the setter notifies dependencies.
            </p>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{signalExample}</code></pre>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-base font-bold font-mono text-slate-900 dark:text-white">createDerived(fn)</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Creates a memoized computation that automatically re-evaluates only when its dependencies change.
            </p>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{derivedExample}</code></pre>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-base font-bold font-mono text-slate-900 dark:text-white">createEffect(callback)</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Executes side effects and automatically reruns whenever accessed signals change.
            </p>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{effectExample}</code></pre>
            </div>
          </section>
        </article>

      <!-- ================= 4. MACROS ================= -->
      {:else if activeSection === 'api-macros'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Core Concepts</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Compiler Macros
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              Compile-time macros for ambient generative resolution and remote data signals.
            </p>
          </header>

          <section class="space-y-3">
            <h3 class="text-base font-bold font-mono text-slate-900 dark:text-white">$intent(prompt, options)</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Translates natural language descriptions into live compiled UI trees at compile time.
            </p>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{intentMacroExample}</code></pre>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-base font-bold font-mono text-slate-900 dark:text-white">$data(sourceUri, options)</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Binds component fields directly to WebSocket or HTTP/2 SSE signals from Google Sheets or PostgreSQL.
            </p>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{dataMacroExample}</code></pre>
            </div>
          </section>
        </article>

      <!-- ================= 5. ENGINE ================= -->
      {:else if activeSection === 'engine'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Architecture</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Zero-VDOM Engine
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              How Sola compiles components into direct DOM operations.
            </p>
          </header>

          <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
            <pre><code>{engineExample}</code></pre>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-white dark:bg-white/5">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs mb-1 font-mono">3.2 kB Bundle</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">Zero third-party dependencies. Instant time-to-interactive.</p>
            </div>
            <div class="p-5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-white dark:bg-white/5">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs mb-1 font-mono">Sub-Millisecond Speed</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">Only modified DOM nodes are updated on state shifts.</p>
            </div>
          </div>
        </article>

      <!-- ================= 6. HOST EMBEDDING ================= -->
      {:else if activeSection === 'host-embedding'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Deployment & Adapters</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              React & Portal Embeds
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              Embedding Sola zero-VDOM components into React applications and enterprise portals.
            </p>
          </header>

          <section class="space-y-3">
            <h3 class="text-sm font-bold font-mono text-slate-900 dark:text-white">React 19 Hook Wrapper</h3>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{reactEmbedCode}</code></pre>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-sm font-bold font-mono text-slate-900 dark:text-white">Enterprise Service Portal Controller</h3>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{serviceNowEmbedCode}</code></pre>
            </div>
          </section>
        </article>

      <!-- ================= 7. RELAY SAAS ================= -->
      {:else if activeSection === 'relay-saas'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Deployment & Adapters</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sola Relay SaaS
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              Deploying Sola Relay close to private database clusters.
            </p>
          </header>

          <section class="space-y-3">
            <h3 class="text-sm font-bold font-mono text-slate-900 dark:text-white">1. Dockerfile</h3>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{dockerfileCode}</code></pre>
            </div>
          </section>

          <section class="space-y-3">
            <h3 class="text-sm font-bold font-mono text-slate-900 dark:text-white">2. Nginx Reverse Proxy</h3>
            <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              <pre><code>{nginxCode}</code></pre>
            </div>
          </section>
        </article>

      <!-- ================= 8. LLM SPEC ================= -->
      {:else if activeSection === 'llm-spec'}
        <article class="space-y-8">
          <header class="space-y-2 pb-6 border-b border-slate-900/[0.04] dark:border-white/[0.05]">
            <p class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Deployment & Adapters</p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Prompting Spec
            </h1>
            <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              System prompt context for Claude 3.5 Sonnet, GPT-4o, and Gemini 2.5 Flash models.
            </p>
          </header>

          <div class="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
            <pre><code>{llmSystemPrompt}</code></pre>
          </div>
        </article>
      {/if}

      <!-- Next / Previous Page Navigation Footer (Tailwind Style) -->
      <nav class="pt-8 border-t border-slate-900/[0.04] dark:border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#if prevItem}
          <button 
            onclick={() => activeSection = prevItem.id}
            class="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-left transition-all group cursor-pointer shadow-2xs">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <svg class="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              <span>Previous</span>
            </div>
            <div class="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {prevItem.title}
            </div>
          </button>
        {:else}
          <div></div>
        {/if}

        {#if nextItem}
          <button 
            onclick={() => activeSection = nextItem.id}
            class="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-right transition-all group cursor-pointer shadow-2xs ml-auto w-full sm:w-auto sm:min-w-[200px]">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <span>Next</span>
              <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <div class="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {nextItem.title}
            </div>
          </button>
        {/if}
      </nav>

    </main>

  </div>
</div>
