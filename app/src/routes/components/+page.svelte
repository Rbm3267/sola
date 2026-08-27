<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';

  let selectedComponent = $state('DataCard');
  let viewMode = $state<'preview' | 'code' | 'compiled'>('preview');

  const componentList = [
    { id: 'DataCard', name: 'DataCard', desc: 'KPI metric tile with vector SVG sparklines and change indicators', category: 'Analytics' },
    { id: 'DynamicForm', name: 'DynamicForm', desc: 'Declarative auto-binding schema form with instant submit state', category: 'Inputs' },
    { id: 'ListBlock', name: 'ListBlock', desc: 'Real-time reactive server entity list with pulse status indicators', category: 'Data Display' },
    { id: 'StatGrid', name: 'StatGrid', desc: 'Multi-metric analytical grid with responsive flex layouts', category: 'Analytics' },
    { id: 'StreamView', name: 'StreamView', desc: 'Live event stream viewer with animated delta feeds', category: 'Data Display' },
    { id: 'Toggle', name: 'Toggle', desc: 'Accessible two-state micro-switch with spring transition', category: 'Inputs' },
    { id: 'Select', name: 'Select', desc: 'Custom glass dropdown with search filtering and keyboard trap', category: 'Inputs' },
    { id: 'Modal', name: 'Modal', desc: 'High-focus backdrop overlay dialog with escape listener', category: 'Feedback' },
    { id: 'Toast', name: 'Toast', desc: 'Floating notification stack with auto-dismiss timer', category: 'Feedback' },
    { id: 'Card', name: 'Card', desc: 'Container primitive with frosted glass border and specular gradient', category: 'Layout' }
  ];

  const solaCodeSamples: Record<string, string> = {
    DataCard: `<script>
  export let title = "Monthly Recurring Revenue";
  export let value = "$124,500";
  export let change = "+18.2%";
  export let trend = "up";
</script>

<div class="sola-datacard">
  <div class="header">
    <span class="label">{title}</span>
    <span class="status-dot"></span>
  </div>
  <div class="metric">{value}</div>
  <div class="footer">
    <span class="badge {trend}">{change}</span>
    <span class="sub">vs previous cycle</span>
  </div>
</div>`,
    DynamicForm: `<script>
  export let title = "Provision Cloud Node";
  export let endpoint = "/api/v1/nodes";

  let nodeName = $state("");
  let memory = $state("16GB");
  let isSubmitting = $state(false);

  async function submit() {
    isSubmitting = true;
    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ nodeName, memory })
    });
    isSubmitting = false;
  }
</script>

<form onsubmit={submit}>
  <h3>{title}</h3>
  <input bind:value={nodeName} placeholder="node-us-east-01" required />
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Deploying..." : "Launch Instance"}
  </button>
</form>`,
    ListBlock: `<script>
  export let title = "Active Clusters";
  export let items = [
    { name: "core-router-01", region: "iad1", status: "online" },
    { name: "redis-cache-eu", region: "fra1", status: "online" },
    { name: "backup-vault", region: "sfo2", status: "syncing" }
  ];
</script>

<div class="list-container">
  <div class="title-bar">
    <h4>{title}</h4>
    <span>{items.length} instances</span>
  </div>
  <div class="items">
    {#each items as item}
      <div class="row">
        <strong>{item.name}</strong>
        <span class="badge {item.status}">{item.status}</span>
      </div>
    {/each}
  </div>
</div>`
  };

  const compiledDomSamples: Record<string, string> = {
    DataCard: `// Compiled by @sola/compiler v0.2.0 (Zero Dependencies)
import { createSignal, createEffect } from '@sola/core';

export default function mount(__target, props = {}) {
  const [title, set_title] = createSignal(props.title || "Monthly Recurring Revenue");
  const [value, set_value] = createSignal(props.value || "$124,500");
  const [change, set_change] = createSignal(props.change || "+18.2%");

  const root = document.createElement('div');
  root.className = 'sola-datacard_sola-d938a';

  const valEl = document.createElement('div');
  valEl.className = 'metric_sola-d938a';
  createEffect(() => { valEl.textContent = value(); });

  root.appendChild(valEl);
  __target.appendChild(root);
  return () => root.remove();
}`
  };
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
  <Navbar />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Hero Header -->
    <div class="max-w-3xl mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-sky-700 text-xs font-mono font-bold mb-3">
        <span>@sola/ui • Core Primitive Suite</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight mb-3">
        Component Library
      </h1>
      <p class="text-lg text-slate-600 leading-relaxed font-normal">
        Every component is authored in declarative <code class="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">.sola</code> syntax and compiles directly to direct DOM mutations with zero virtual DOM overhead.
      </p>
    </div>

    <!-- Main Layout: Sidebar + Canvas -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Component List Sidebar -->
      <aside class="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div class="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 px-3 py-2">
          Available Primitives
        </div>
        <div class="flex flex-col gap-1 mt-2">
          {#each componentList as comp}
            <button 
              onclick={() => selectedComponent = comp.id}
              class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group {selectedComponent === comp.id ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}">
              <div>
                <div class="text-sm font-bold {selectedComponent === comp.id ? 'text-white' : 'text-slate-900'} font-mono">{comp.name}</div>
                <div class="text-xs {selectedComponent === comp.id ? 'text-slate-300' : 'text-slate-400'} line-clamp-1">{comp.desc}</div>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded {selectedComponent === comp.id ? 'bg-slate-800 text-sky-300' : 'bg-slate-100 text-slate-500'}">
                {comp.category}
              </span>
            </button>
          {/each}
        </div>
      </aside>

      <!-- Live Preview & Code Panel -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        
        <!-- Component Title & Mode Toggle Bar -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-950 font-mono flex items-center gap-2">
              <span>{selectedComponent}.sola</span>
              <span class="text-xs font-sans font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Reactive Signal</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {componentList.find(c => c.id === selectedComponent)?.desc}
            </p>
          </div>

          <!-- Segmented Control View Switcher -->
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
            <button 
              onclick={() => viewMode = 'preview'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all {viewMode === 'preview' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}">
              Live Preview
            </button>
            <button 
              onclick={() => viewMode = 'code'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all {viewMode === 'code' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}">
              .sola Markup
            </button>
            <button 
              onclick={() => viewMode = 'compiled'}
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all {viewMode === 'compiled' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}">
              Compiled JS
            </button>
          </div>
        </div>

        <!-- Display Area -->
        <div class="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm min-h-[400px] flex items-center justify-center relative overflow-hidden">
          
          <!-- Background Grid Texture -->
          <div class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

          {#if viewMode === 'preview'}
            <div class="w-full max-w-lg relative z-10">
              {#if selectedComponent === 'DataCard' || selectedComponent === 'StatGrid'}
                <DataCard config={{
                  title: "Monthly Recurring Revenue",
                  value: "$148,200",
                  change: "+24.8%",
                  trend: "up"
                }} />
              {:else if selectedComponent === 'DynamicForm'}
                <DynamicForm config={{
                  title: "Provision PostgreSQL Instance",
                  endpoint: "/api/database/create",
                  fields: [
                    { name: "db_name", label: "Database Identifier", type: "text", required: true },
                    { name: "tier", label: "Compute Tier", type: "text", required: true },
                    { name: "nodes", label: "Replica Count", type: "text", required: true }
                  ]
                }} />
              {:else if selectedComponent === 'ListBlock' || selectedComponent === 'StreamView'}
                <ListBlock config={{
                  title: "Active Edge Clusters",
                  items: [
                    { label: "sola-edge-iad1", description: "Washington DC • 99.99% Uptime", status: "Active" },
                    { label: "sola-edge-fra1", description: "Frankfurt • 99.98% Uptime", status: "Active" },
                    { label: "sola-edge-syd1", description: "Sydney • Performing Cache Sync", status: "Syncing" }
                  ]
                }} />
              {:else}
                <div class="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-mono font-bold text-sky-400">{selectedComponent} Primitive</span>
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <p class="text-sm text-slate-300 leading-relaxed font-sans mb-4">
                    Interactive preview ready. Import and mount via <code class="text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">@sola/ui/{selectedComponent}</code>.
                  </p>
                  <button class="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all">
                    Trigger Interaction
                  </button>
                </div>
              {/if}
            </div>
          {:else if viewMode === 'code'}
            <div class="w-full relative z-10">
              <pre class="bg-slate-950 text-sky-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner"><code>{solaCodeSamples[selectedComponent] || solaCodeSamples['DataCard']}</code></pre>
            </div>
          {:else}
            <div class="w-full relative z-10">
              <pre class="bg-slate-950 text-emerald-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner"><code>{compiledDomSamples[selectedComponent] || compiledDomSamples['DataCard']}</code></pre>
            </div>
          {/if}

        </div>

      </main>

    </div>

  </div>
</div>
