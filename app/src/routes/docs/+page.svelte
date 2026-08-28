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

  const groups = [
    {
      name: 'GETTING STARTED',
      items: [
        { id: 'quickstart', title: 'Quickstart & Installation' },
        { id: 'syntax', title: 'The .sola Component Format' }
      ]
    },
    {
      name: 'REACTIVITY ENGINE',
      items: [
        { id: 'intent', title: 'Ambient Intent Signals ($intent)' },
        { id: 'data', title: 'Remote Data Signals ($data)' },
        { id: 'engine', title: 'Compiler & Zero-VDOM Engine' }
      ]
    },
    {
      name: 'OPERATIONS',
      items: [
        { id: 'operations', title: 'Operational & Persona Guide' }
      ]
    }
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
    <div class="mb-12 bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-800 text-xs font-mono font-medium mb-3">
          <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>Sola API & Runtime Specification</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-[-0.03em] mb-2 font-sans">
          Documentation that explains itself.
        </h2>
        <p class="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
          Ask any architectural or syntax question. Sola will synthesize live working examples on the fly.
        </p>

        <form class="flex items-center gap-3 bg-slate-50 border border-slate-200/90 p-1.5 rounded-2xl" onsubmit={(e) => { e.preventDefault(); askSolaAi(); }}>
          <input 
            id="ai-ask-input"
            type="text" 
            bind:value={askQuery}
            placeholder="e.g. 'How do I bind Google Sheets with $data?' or 'Explain zero-VDOM reactivity'"
            class="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={askLoading || !askQuery.trim()}
            style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
            class="font-medium text-xs text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-sm shrink-0 active:scale-[0.97]">
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
        <div class="text-xs font-mono font-medium text-slate-400 px-3 py-2">
          <span>DOCUMENTATION INDEX</span>
        </div>
        <nav class="flex flex-col gap-5 mt-4">
          {#each groups as grp}
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-mono font-bold text-slate-400/90 tracking-wider px-3">{grp.name}</span>
              {#each grp.items as item}
                <button 
                  onclick={() => activeSection = item.id}
                  class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer flex items-center justify-between {activeSection === item.id ? 'bg-amber-500/10 text-amber-950 font-semibold shadow-2xs border border-amber-500/10' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}">
                  <span>{item.title}</span>
                  {#if activeSection === item.id}
                    <span class="w-1 h-3.5 rounded-full bg-amber-500"></span>
                  {/if}
                </button>
              {/each}
            </div>
          {/each}
        </nav>
      </aside>

      <!-- Main Content Reader -->
      <main class="lg:col-span-8 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col gap-8">
        
        {#if activeSection === 'quickstart'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Getting Started</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 tracking-[-0.03em] mb-4">Quickstart & Installation</h1>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Create a new Sola application in under 3 seconds using the official project generator:
            </p>
            <div class="bg-slate-900 text-amber-400 p-5 rounded-2xl font-mono text-xs sm:text-sm mb-6 flex items-center justify-between shadow-inner">
              <code>$ npm create sola@latest my-ambient-app</code>
            </div>
            <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
              This configures Vite with <code class="font-mono text-xs bg-slate-50 px-2 py-1 rounded text-slate-800 border border-slate-200">vite-plugin-sola</code>, preconfigures Tailwind/UnoCSS styling, and sets up your first <code class="font-mono text-xs bg-slate-50 px-2 py-1 rounded text-slate-800 border border-slate-200">App.sola</code> component.
            </p>
          </div>

        {:else if activeSection === 'syntax'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Syntax Reference</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 tracking-[-0.03em] mb-4">The .sola Component Format</h1>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Sola components are single-file, declarative modules that combine logic, layout, and scoped styles without virtual DOM runtime overhead:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-8"><code>{syntaxExample}</code></pre>

            <!-- Live Editable Component Sandbox -->
            <div class="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  <h3 class="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">Live Sandbox Preview</h3>
                </div>
                <span class="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">Synchronized DOM</span>
              </div>

              <!-- Live Playground Sandbox Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div class="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <label for="sandbox-metric-title" class="block text-[10px] font-mono font-bold text-slate-400 uppercase">Live Card Title</label>
                  <input 
                    id="sandbox-metric-title"
                    type="text" 
                    bind:value={sandboxTitle}
                    class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-amber-400"
                  />

                  <label for="sandbox-metric-val" class="block text-[10px] font-mono font-bold text-slate-400 uppercase mt-2">Live Value</label>
                  <input 
                    id="sandbox-metric-val"
                    type="text" 
                    bind:value={sandboxValue}
                    class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <!-- Actual Live Mounted Rendering -->
                <div class="flex flex-col items-center justify-center p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50 min-h-[140px]">
                  <DataCard title={sandboxTitle} value={sandboxValue} trend="+12.4% vs baseline" icon="activity" />
                </div>
              </div>
            </div>

          </div>

        {:else if activeSection === 'intent'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Generative UI</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 tracking-[-0.03em] mb-4">Ambient Intent Signals ($intent)</h1>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Use the built-in compiler macro <code>$intent(prompt)</code> to declare sections of your UI that automatically resolve and materialize layout structures on the fly:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-6"><code>{intentExample}</code></pre>
          </div>

        {:else if activeSection === 'data'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Data Plurality</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 tracking-[-0.03em] mb-4">Remote Data Signals ($data)</h1>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Connect Google Sheets, PostgreSQL, MySQL, or REST endpoints in a single line of declarative code. Sola manages connection lifecycle, auto-polling, and real-time reactive signals automatically:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-6"><code>{dataExample}</code></pre>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-xs mb-1 font-mono">sheet://[id]</h4>
                <p class="text-[11px] text-slate-500 leading-normal">Zero-backend Google Sheets reader. Auto-extracts column headers and streams row data.</p>
              </div>
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-xs mb-1 font-mono">postgres://...</h4>
                <p class="text-[11px] text-slate-500 leading-normal">Zero-knowledge relay proxy. Database credentials remain strictly on your local machine.</p>
              </div>
            </div>
          </div>

        {:else if activeSection === 'engine'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Architecture & Runtime</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 tracking-[-0.03em] mb-4">Compiler & Zero-VDOM Engine</h1>
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              Sola compiles template nodes into <strong>direct native DOM updates</strong> instead of running Virtual DOM diffing routines:
            </p>
            <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 mb-6"><code>{engineExample}</code></pre>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-xs mb-1 font-mono">3.2 kB Core Bundle</h4>
                <p class="text-[11px] text-slate-500 leading-normal">Zero third-party dependencies. Instant time-to-interactive on low-power devices.</p>
              </div>
              <div class="p-5 border border-slate-200/90 rounded-2xl bg-slate-50/80">
                <h4 class="font-bold text-slate-900 text-xs mb-1 font-mono">Fine-Grained Signals</h4>
                <p class="text-[11px] text-slate-500 leading-normal">Only the precise text node or attribute that changed is modified in the DOM.</p>
              </div>
            </div>
          </div>

        {:else if activeSection === 'operations'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>User Personas</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 tracking-[-0.03em] mb-4">Operational & Persona Guide</h1>
            <p class="text-slate-600 text-sm leading-relaxed mb-6 font-sans">
              Sola delineates clear platform boundaries between application developers, sysadmins, and security engineers.
            </p>

            <div class="flex flex-col gap-6">
              <!-- Developer -->
              <div class="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex gap-4">
                <div class="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 w-10 h-10 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <div>
                  <h3 class="font-bold text-slate-950 text-xs font-mono">Application Developers</h3>
                  <p class="text-[11px] text-slate-600 mt-1 leading-normal">
                    Code <code>.sola</code> components, use fine-grained signals (<code>$state</code>, <code>$derived</code>), and build custom business views. Bind real-time data inputs via <code>$data</code> without handling async boilerplates, API intervals, or local cache state.
                  </p>
                </div>
              </div>

              <!-- Admin -->
              <div class="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex gap-4">
                <div class="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 w-10 h-10 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <div>
                  <h3 class="font-bold text-slate-950 text-xs font-mono">System Administrators</h3>
                  <p class="text-[11px] text-slate-600 mt-1 leading-normal">
                    Deploy, run, and scale Sola Relay instances inside protected private subnets close to your data assets. Admins manage the <code>relay.json</code> configuration, register database clusters, and monitor latency metrics.
                  </p>
                </div>
              </div>

              <!-- Security -->
              <div class="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 flex gap-4">
                <div class="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 w-10 h-10 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <h3 class="font-bold text-slate-950 text-xs font-mono">Security Engineers</h3>
                  <p class="text-[11px] text-slate-600 mt-1 leading-normal">
                    Assure zero-knowledge perimeter containment. Credentials for downstream resources (PostgreSQL, ServiceNow tokens) never leave the Sola Relay boundary. Security enforces table read-only limits, query scopes, and staging authorization gates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/if}

      </main>

    </div>

  </div>
</div>
