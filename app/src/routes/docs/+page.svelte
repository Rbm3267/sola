<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let activeSection = $state('quickstart');
  let askQuery = $state('');
  let askLoading = $state(false);
  let aiAnswer = $state<string | null>(null);

  const sections = [
    { id: 'quickstart', title: 'Quickstart & Installation' },
    { id: 'syntax', title: 'The .sola File Format' },
    { id: 'reactivity', title: 'Signals & State ($state, $derived)' },
    { id: 'intent', title: 'Ambient Intent Signals ($intent)' },
    { id: 'data', title: 'Remote Data Signals ($data)' },
    { id: 'compiler', title: 'Compiler & Zero-VDOM Engine' },
    { id: 'relay', title: 'Sola Relay Connectors' },
    { id: 'deployment', title: 'Production Deployment' }
  ];

  async function askSolaAi() {
    if (!askQuery.trim() || askLoading) return;
    askLoading = true;
    aiAnswer = null;

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: `You are the Sola Framework AI Technical Assistant. Answer this question clearly with code examples: ${askQuery}` 
        })
      });

      const data = await res.json();
      if (typeof data === 'string') {
        aiAnswer = data;
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
    if ($page.url.searchParams.get('ai') === 'true') {
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
    border-radius: 16px;
    background: white;
  }
</style>`;

  const intentExample = `<` + `script>
  // Sola compiles $intent into an ambient AI reactive pipeline
  const view = $intent("Show active database clusters with latency sparklines");
</` + `script>

<!-- Automatically mounts the dynamically synthesized component tree -->
<svelte:component this={view} />`;
</script>

<div class="min-h-screen bg-[#fafafa] text-slate-950 font-sans selection:bg-slate-200 selection:text-slate-900">
  <Navbar />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- AI Documentation Assistant Bar -->
    <div class="mb-12 bg-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
      
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-bold mb-3">
          <svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          <span>Ask Sola • Generative Documentation</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black tracking-tight mb-2">
          Documentation that explains itself.
        </h2>
        <p class="text-slate-400 text-sm mb-6 leading-relaxed">
          Ask any architectural or syntax question. Sola will synthesize live working examples on the fly.
        </p>

        <form class="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl" onsubmit={(e) => { e.preventDefault(); askSolaAi(); }}>
          <input 
            id="ai-ask-input"
            type="text" 
            bind:value={askQuery}
            placeholder="e.g. 'How do I bind a remote API with $data?' or 'How does zero-VDOM work?'"
            class="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={askLoading || !askQuery.trim()}
            class="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-md shrink-0">
            {#if askLoading}
              <div class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Synthesizing...</span>
            {:else}
              <span>Ask AI</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            {/if}
          </button>
        </form>

        {#if aiAnswer}
          <div class="mt-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed shadow-lg">
            {aiAnswer}
          </div>
        {/if}
      </div>
    </div>

    <!-- Documentation Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      <!-- Table of Contents Sidebar -->
      <aside class="lg:col-span-3 sticky top-24 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div class="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 px-3 py-2">
          Documentation Index
        </div>
        <nav class="flex flex-col gap-1 mt-2">
          {#each sections as sec}
            <button 
              onclick={() => activeSection = sec.id}
              class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all {activeSection === sec.id ? 'bg-slate-950 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'}">
              {sec.title}
            </button>
          {/each}
        </nav>
      </aside>

      <!-- Main Content Reader -->
      <main class="lg:col-span-9 bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col gap-10">
        
        {#if activeSection === 'quickstart'}
          <div>
            <h1 class="text-3xl font-black text-slate-950 tracking-tight mb-4">Quickstart & Installation</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Create a new Sola application in seconds using the official project generator:
            </p>
            <div class="bg-slate-950 text-sky-300 p-5 rounded-2xl font-mono text-sm mb-6 flex items-center justify-between shadow-inner">
              <code>$ npm create sola@latest my-ambient-app</code>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed mb-4">
              This configures Vite with <code class="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">vite-plugin-sola</code>, preconfigures Tailwind/UnoCSS styling, and sets up your first <code class="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">App.sola</code> component.
            </p>
          </div>
        {:else if activeSection === 'syntax'}
          <div>
            <h1 class="text-3xl font-black text-slate-950 tracking-tight mb-4">The .sola Component Format</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Sola components are single-file, declarative modules that combine logic, layout, and scoped styles without virtual DOM runtime overhead:
            </p>
            <pre class="bg-slate-950 text-sky-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner mb-6"><code>{syntaxExample}</code></pre>
          </div>
        {:else if activeSection === 'intent'}
          <div>
            <h1 class="text-3xl font-black text-slate-950 tracking-tight mb-4">Ambient Intent Signals ($intent)</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Sola is the world's first framework with native ambient intent resolution. A <code class="font-mono text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded font-bold border border-violet-200">$intent</code> signal allows the UI to describe <em>what</em> it needs in plain language, and Sola synthesizes and compiles matching UI components at the framework layer:
            </p>
            <pre class="bg-slate-950 text-violet-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner"><code>{intentExample}</code></pre>
          </div>
        {:else}
          <div>
            <h1 class="text-3xl font-black text-slate-950 tracking-tight mb-4">Reactivity & Core Engine</h1>
            <p class="text-slate-600 text-base leading-relaxed mb-6">
              Sola's reactive engine is under 3.2 kB with zero dependencies. Signals notify subscriber effects directly via fine-grained dependency graphs.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                <h4 class="font-bold text-slate-900 text-sm mb-1 font-mono">createSignal(value)</h4>
                <p class="text-xs text-slate-600">Creates a reactive getter/setter pair that automatically tracks subscribers.</p>
              </div>
              <div class="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                <h4 class="font-bold text-slate-900 text-sm mb-1 font-mono">createEffect(fn)</h4>
                <p class="text-xs text-slate-600">Runs immediately and re-executes whenever any accessed signals change.</p>
              </div>
            </div>
          </div>
        {/if}

      </main>

    </div>

  </div>
</div>
