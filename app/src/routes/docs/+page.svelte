<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let activeSection = $state('quickstart');
  let askQuery = $state('');
  let askLoading = $state(false);
  let aiAnswer = $state('');

  // Live Docs Sandbox State
  let sandboxTitle = $state('Active Cluster Telemetry');
  let sandboxValue = $state('1,420 RPS');

  const sections = [
    { id: 'quickstart', title: 'Quickstart & Installation' },
    { id: 'syntax', title: 'The .sola Component Format' },
    { id: 'intent', title: 'Ambient Intent Signals ($intent)' },
    { id: 'data', title: 'Remote Data Signals ($data)' },
    { id: 'engine', title: 'Compiler & Zero-VDOM Engine' }
  ];

  async function askSolaAi() {
    if (!askQuery.trim() || askLoading) return;
    askLoading = true;
    aiAnswer = '';

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: `You are the Sola Framework AI Technical Assistant. Answer concisely with working code examples: ${askQuery}` 
        })
      });

      const data = await res.json();
      if (typeof data === 'string') {
        aiAnswer = data;
      } else if (data.components) {
        aiAnswer = "Generated Component Tree:\n\n" + JSON.stringify(data.components, null, 2);
      } else {
        aiAnswer = JSON.stringify(data, null, 2);
      }
    } catch (e: any) {
      aiAnswer = "Sola components compile directly into native reactive DOM nodes via @sola/compiler. Use createSignal() for local state, $intent for ambient generative resolution, and $data for live remote polling without virtual DOM overhead.";
    } finally {
      askLoading = false;
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ai') === 'true') {
      const input = document.getElementById('ai-ask-input');
      input?.focus();
    }
  });

  const syntaxExample = `<` + `script>
  export let title = "Cluster Dashboard";
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
  }
</` + `script>

<div class="dashboard-card">
  <h3>{title}</h3>
  <p>Active workers: {count} (Capacity: {doubled})</p>
  <button onclick={increment}>Scale Node +1</button>
</div>

<style>
  .dashboard-card {
    padding: 24px;
    border-radius: 20px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  }
</style>`;

  const intentExample = `<` + `script>
  // $intent resolves plain-language requests into compiled UI
  const view = $intent("Show active database clusters with latency sparklines");
</` + `script>

<!-- Mounts the synthesized reactive component tree -->
<svelte:component this={view} />`;

  const dataExample = `<` + `script>
  // 1-line reactive binding to any Google Sheet or remote API
  const fitness = $data("sheet://1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
</` + `script>

<!-- Pure reactive data surfaces without async boilerplate -->
<div class="grid grid-cols-2 gap-4">
  <DataCard title="Daily Volume" value="{fitness.volume} lbs" trend="{fitness.delta}" />
  <GaugeCard title="Recovery Index" value="{fitness.recovery} / 100" percentage={fitness.recovery} />
</div>`;

  const engineExample = `// Sola compiled output: Pure direct DOM node manipulation
export function mount(__target, props = {}) {
  const root = document.createElement('div');
  root.className = 'sola-metric-card';

  const textNode = document.createTextNode(props.value || '0');
  root.appendChild(textNode);

  // Fine-grained signal subscription (No VDOM diffing loop!)
  createEffect(() => {
    textNode.data = props.value();
  });

  __target.appendChild(root);
  return () => __target.removeChild(root);
}`;
</script>

<div class="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 pb-20">
  <Navbar />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- AI Documentation Assistant Bar -->
    <div class="mb-12 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold mb-3">
          <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          <span>Ask Sola • Generative Documentation</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-[-0.03em] mb-2">
          Documentation that explains itself.
        </h2>
        <p class="text-slate-600 text-sm mb-6 leading-relaxed">
          Ask any architectural or syntax question. Sola will synthesize live working examples on the fly.
        </p>

        <form class="flex items-center gap-3 bg-slate-50 border border-slate-200/90 p-2 rounded-2xl" onsubmit={(e) => { e.preventDefault(); askSolaAi(); }}>
          <input 
            id="ai-ask-input"
            type="text" 
            bind:value={askQuery}
            placeholder="e.g. 'How do I bind Google Sheets with $data?' or 'Explain zero-VDOM reactivity'"
            class="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={askLoading || !askQuery.trim()}
            style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
            class="font-bold text-xs text-white px-6 py-3 rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-sm shrink-0">
            {#if askLoading}
              <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Synthesizing...</span>
            {:else}
              <span>Ask AI</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            {/if}
          </button>
        </form>

        {#if aiAnswer}
          <div class="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-xs">
            {aiAnswer}
          </div>
        {/if}
      </div>
    </div>

    <!-- Documentation Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Table of Contents Sidebar -->
      <aside class="lg:col-span-4 sticky top-24 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <div class="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 px-3 py-2 flex items-center justify-between">
          <span>Documentation Index</span>
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </div>
        <nav class="flex flex-col gap-1.5 mt-2">
          {#each sections as sec}
            <button 
              onclick={() => activeSection = sec.id}
              class="w-full text-left px-4 py-3 rounded-2xl text-xs transition-all duration-200 cursor-pointer {activeSection === sec.id ? 'bg-amber-500/10 border border-amber-500/25 text-amber-950 font-black shadow-xs' : 'text-slate-700 hover:bg-slate-50 font-medium border border-transparent'}">
              {sec.title}
            </button>
          {/each}
        </nav>
      </aside>

      <!-- Main Content Reader -->
      <main class="lg:col-span-8 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col gap-8">
        
        {#if activeSection === 'quickstart'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
              <span>Getting Started</span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-[-0.03em] mb-4">Quickstart & Installation</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Create a new Sola application in under 3 seconds using the official project generator:
            </p>
            <div class="bg-slate-900 text-amber-300 p-5 rounded-2xl font-mono text-sm mb-6 flex items-center justify-between shadow-inner">
              <code>$ npm create sola@latest my-ambient-app</code>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              This configures Vite with <code class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 font-bold border border-slate-200">vite-plugin-sola</code>, preconfigures Tailwind/UnoCSS styling, and sets up your first <code class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 font-bold border border-slate-200">App.sola</code> component.
            </p>
          </div>

        {:else if activeSection === 'syntax'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
              <span>Syntax Reference</span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-[-0.03em] mb-4">The .sola Component Format</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Sola components are single-file, declarative modules that combine logic, layout, and scoped styles without virtual DOM runtime overhead:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-8"><code>{syntaxExample}</code></pre>

            <!-- Live Editable Component Sandbox -->
            <div class="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <h3 class="text-sm font-bold font-mono text-slate-900 uppercase tracking-wider">Live Sandbox Preview</h3>
                </div>
                <span class="text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-bold">Synchronized DOM</span>
              </div>

              <!-- Live Playground Sandbox Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div class="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <label for="sandbox-metric-title" class="block text-xs font-mono font-bold text-slate-500 uppercase">Live Card Title</label>
                  <input 
                    id="sandbox-metric-title"
                    type="text" 
                    bind:value={sandboxTitle}
                    class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />

                  <label for="sandbox-metric-val" class="block text-xs font-mono font-bold text-slate-500 uppercase mt-2">Live Value</label>
                  <input 
                    id="sandbox-metric-val"
                    type="text" 
                    bind:value={sandboxValue}
                    class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <!-- Synchronized Live Card -->
                <div class="w-full">
                  <DataCard config={{ title: sandboxTitle, value: sandboxValue, trend: "+18.4%", icon: "trending-up" }} />
                </div>
              </div>
            </div>
          </div>

        {:else if activeSection === 'intent'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
              <span>Ambient AI Engine</span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-[-0.03em] mb-4">Ambient Intent Signals ($intent)</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Sola is the world's first framework with native ambient intent resolution. A <code class="font-mono text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded font-bold border border-amber-200">$intent</code> signal allows the UI to describe <em>what</em> it needs in plain language, and Sola synthesizes and compiles matching UI components at the framework layer:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{intentExample}</code></pre>
          </div>

        {:else if activeSection === 'data'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
              <span>Data Pipelines</span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-[-0.03em] mb-4">Remote Data Signals ($data)</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Connect Google Sheets, PostgreSQL, MySQL, or REST endpoints in a single line of declarative code. Sola manages connection lifecycle, auto-polling, and real-time reactive signals automatically:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-6"><code>{dataExample}</code></pre>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-sm mb-1 font-mono">sheet://[id]</h4>
                <p class="text-xs text-slate-600">Zero-backend Google Sheets reader. Auto-extracts column headers and streams row data.</p>
              </div>
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-sm mb-1 font-mono">postgres://...</h4>
                <p class="text-xs text-slate-600">Zero-knowledge relay proxy. Database credentials remain strictly on your local machine.</p>
              </div>
            </div>
          </div>

        {:else if activeSection === 'engine'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
              <span>Architecture & Runtime</span>
            </div>
            <h1 class="text-3xl font-black text-slate-900 tracking-[-0.03em] mb-4">Compiler & Zero-VDOM Engine</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Traditional frameworks waste CPU cycles recreating virtual DOM trees on every state change. Sola compiles declarative markup into <strong>direct native DOM updates</strong>:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-6"><code>{engineExample}</code></pre>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-sm mb-1 font-mono">3.2 kB Core Bundle</h4>
                <p class="text-xs text-slate-600">Zero third-party dependencies. Instant time-to-interactive on low-power devices.</p>
              </div>
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-sm mb-1 font-mono">Fine-Grained Signals</h4>
                <p class="text-xs text-slate-600">Only the precise text node or attribute that changed is modified in the DOM.</p>
              </div>
            </div>
          </div>
        {/if}

      </main>

    </div>

  </div>
</div>
