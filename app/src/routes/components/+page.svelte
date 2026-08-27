<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  import { fade, fly } from 'svelte/transition';

  let selectedComponent = $state('DataCard');
  let viewMode = $state('preview'); // 'preview' | 'embed' | 'code' | 'compiled'
  let embedFramework = $state('react'); // 'react' | 'vue' | 'html' | 'svelte'

  // Interactive component states
  let isToggleOn = $state(true);
  let isModalOpen = $state(false);
  let toasts = $state<Array<{ id: number; text: string; type: string }>>([]);
  let selectValue = $state('Production (us-east-1)');
  let isSelectOpen = $state(false);
  let gaugePercent = $state(78);
  let streamEvents = $state([
    { id: 1, text: 'Cluster node-iad-04 scaled to 8 replicas', time: 'Just now', type: 'info' },
    { id: 2, text: 'Postgres primary failover healthcheck passed', time: '12s ago', type: 'success' },
    { id: 3, text: 'Redis cache memory snapshot synchronized', time: '45s ago', type: 'info' }
  ]);

  function triggerToast() {
    const id = Date.now();
    toasts = [...toasts, { id, text: `Telemetry event ${id.toString().slice(-4)} emitted`, type: 'success' }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 3000);
  }

  function addStreamEvent() {
    const actions = [
      'Edge gateway cache hit ratio at 99.4%',
      'Kubernetes worker provisioned successfully',
      'API rate limit quota adjusted +500 req/s',
      'SSL certificate renewal automated'
    ];
    const text = actions[Math.floor(Math.random() * actions.length)];
    streamEvents = [{ id: Date.now(), text, time: 'Just now', type: 'success' }, ...streamEvents.slice(0, 4)];
  }

  const componentList = [
    { id: 'DataCard', name: 'DataCard', desc: 'KPI metric tile with vector SVG sparklines and change indicators', category: 'Analytics' },
    { id: 'GaugeCard', name: 'GaugeCard', desc: 'Circular SVG progress arc for memory, CPU, and hardware load', category: 'Telemetry' },
    { id: 'DynamicForm', name: 'DynamicForm', desc: 'Declarative auto-binding schema form with instant submit state', category: 'Inputs' },
    { id: 'ListBlock', name: 'ListBlock', desc: 'Real-time reactive server entity list with pulse status indicators', category: 'Data Display' },
    { id: 'StreamView', name: 'StreamView', desc: 'Live event stream viewer with animated delta feeds', category: 'Data Display' },
    { id: 'Toggle', name: 'Toggle', desc: 'Accessible two-state micro-switch with spring transition', category: 'Inputs' },
    { id: 'Select', name: 'Select', desc: 'Custom glass dropdown with search filtering and keyboard trap', category: 'Inputs' },
    { id: 'Modal', name: 'Modal', desc: 'High-focus backdrop overlay dialog with escape listener', category: 'Feedback' },
    { id: 'Toast', name: 'Toast', desc: 'Floating notification stack with auto-dismiss timer', category: 'Feedback' }
  ];

  const embedSnippets: Record<string, Record<string, string>> = {
    DataCard: {
      react: `// In any React / Next.js app:
import { useSola } from '@sola/react';
import DataCard from '@sola/ui/DataCard';

export function Metric() {
  const containerRef = useSola(DataCard, {
    title: "Monthly Recurring Revenue",
    value: "$148,200",
    trend: "+24.8%"
  });

  return <div ref={containerRef} />;
}`,
      vue: `<!-- In any Vue 3 / Nuxt app: -->
<` + `script setup>
import { vSola } from '@sola/vue';
import DataCard from '@sola/ui/DataCard';
</` + `script>

<template>
  <div v-sola="[DataCard, { title: 'MRR', value: '$148,200', trend: '+24.8%' }]" />
</template>`,
      html: `<!-- In any HTML page, Webflow, or WordPress: -->
<div id="mrr-card"></div>

<` + `script type="module">
  import mount from 'https://esm.sh/@sola/ui/DataCard';
  
  mount(document.getElementById('mrr-card'), {
    title: "Monthly Recurring Revenue",
    value: "$148,200",
    trend: "+24.8%"
  });
</` + `script>`,
      svelte: `<!-- In any Svelte app: -->
<` + `script>
  import { onMount } from 'svelte';
  import mountDataCard from '@sola/ui/DataCard';

  let el;
  onMount(() => mountDataCard(el, { title: "MRR", value: "$148,200" }));
</` + `script>

<div bind:this={el} />`
    }
  };

  const solaCodeSamples: Record<string, string> = {
    DataCard: `<` + `script>
  export let title = "Monthly Recurring Revenue";
  export let value = "$124,500";
  export let change = "+18.2%";
  export let trend = "up";
</` + `script>

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
    GaugeCard: `<` + `script>
  export let title = "Memory Allocation";
  export let value = "14.2 / 16 GB";
  export let percentage = 78;
</` + `script>

<div class="gauge-card">
  <h4>{title}</h4>
  <div class="value">{value}</div>
  <svg class="ring" viewBox="0 0 88 88">
    <circle cx="44" cy="44" r="36" stroke-dashoffset={226 - (percentage / 100) * 226} />
  </svg>
</div>`,
    Toggle: `<` + `script>
  export let checked = $state(false);
  function toggle() { checked = !checked; }
</` + `script>

<button class="sola-toggle {checked ? 'active' : ''}" onclick={toggle}>
  <span class="thumb"></span>
</button>`,
    Modal: `<` + `script>
  export let open = $state(false);
</` + `script>

{#if open}
  <div class="sola-backdrop" onclick={() => open = false}>
    <div class="sola-dialog" onclick={(e) => e.stopPropagation()}>
      <h3>Dialog Title</h3>
      <button onclick={() => open = false}>Close</button>
    </div>
  </div>
{/if}`
  };
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
  <Navbar />

  <!-- Live Floating Toasts Container -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
    {#each toasts as toast (toast.id)}
      <div 
        transition:fly={{ y: 20, duration: 200 }}
        class="bg-slate-950 text-white border border-slate-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-mono pointer-events-auto">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{toast.text}</span>
      </div>
    {/each}
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Hero Header -->
    <div class="max-w-3xl mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold mb-3">
        <span>@sola/ui • Embeddable Primitives</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-black text-slate-950 tracking-[-0.035em] mb-3">
        Component Library
      </h1>
      <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
        Drop high-density, luxury UI components into <strong>React, Vue, Svelte, or Vanilla HTML</strong> with one line of code. Zero virtual DOM overhead.
      </p>
    </div>

    <!-- Main Grid: Sidebar + Canvas -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Primitives Sidebar -->
      <aside class="lg:col-span-4 bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <div class="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 px-3 py-2 flex items-center justify-between">
          <span>Available Primitives</span>
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </div>
        <div class="flex flex-col gap-2 mt-2">
          {#each componentList as comp}
            <button 
              onclick={() => selectedComponent = comp.id}
              class="w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer {selectedComponent === comp.id ? 'bg-amber-500/10 border border-amber-500/25 shadow-xs' : 'hover:bg-slate-50 border border-transparent'}">
              <div>
                <div class="text-sm font-bold {selectedComponent === comp.id ? 'text-amber-950 font-black' : 'text-slate-800'} font-mono">{comp.name}</div>
                <div class="text-xs {selectedComponent === comp.id ? 'text-amber-800/80' : 'text-slate-500'} line-clamp-1 mt-0.5">{comp.desc}</div>
              </div>
              <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full {selectedComponent === comp.id ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}">
                {comp.category}
              </span>
            </button>
          {/each}
        </div>
      </aside>

      <!-- Live Interactive Stage & Code Inspector -->
      <main class="lg:col-span-8 flex flex-col gap-6">
        
        <!-- Component Header & View Switcher Bar -->
        <div class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 font-mono flex items-center gap-2.5">
              <span>{selectedComponent}.sola</span>
              <span class="text-xs font-sans font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">Interactive Demo</span>
            </h2>
            <p class="text-xs text-slate-600 mt-1">
              {componentList.find(c => c.id === selectedComponent)?.desc}
            </p>
          </div>

          <!-- Segmented Control View Switcher -->
          <div class="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button 
              onclick={() => viewMode = 'preview'}
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              Live Preview
            </button>
            <button 
              onclick={() => viewMode = 'embed'}
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'embed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              1-Click Embed
            </button>
            <button 
              onclick={() => viewMode = 'code'}
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              .sola Markup
            </button>
          </div>
        </div>

        <!-- Stage Area -->
        <div class="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm min-h-[420px] flex items-center justify-center relative overflow-hidden">
          
          <!-- Subtle Grid Texture -->
          <div class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none"></div>

          {#if viewMode === 'preview'}
            <div class="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
              
              {#if selectedComponent === 'DataCard'}
                <DataCard config={{
                  title: "Monthly Recurring Revenue",
                  value: "$148,200",
                  trend: "+24.8%",
                  icon: "trending-up"
                }} />
              {:else if selectedComponent === 'GaugeCard'}
                <div class="w-full flex flex-col gap-4">
                  <GaugeCard config={{
                    title: "Memory Allocation",
                    value: `${(16 * (gaugePercent / 100)).toFixed(1)} / 16 GB`,
                    percentage: gaugePercent,
                    subtext: "Live Cluster Node Memory",
                    color: gaugePercent > 85 ? 'amber' : 'emerald'
                  }} />
                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                    <div class="flex justify-between text-xs font-mono font-bold text-slate-600">
                      <span>Simulate Load</span>
                      <span>{gaugePercent}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      bind:value={gaugePercent}
                      class="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>
              {:else if selectedComponent === 'Toggle'}
                <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between w-full">
                  <div>
                    <div class="text-sm font-bold text-slate-900 font-mono">Ambient Auto-Healing</div>
                    <div class="text-xs text-slate-500">Continuous background intent recovery</div>
                  </div>
                  <button 
                    onclick={() => isToggleOn = !isToggleOn}
                    class="w-14 h-8 rounded-full p-1 transition-all cursor-pointer flex items-center {isToggleOn ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}"
                    aria-label="Toggle switch"
                  >
                    <span class="w-6 h-6 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>
              {:else if selectedComponent === 'Modal'}
                <div class="flex flex-col items-center gap-4">
                  <button 
                    onclick={() => isModalOpen = true}
                    style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
                    class="font-bold text-xs text-white px-7 py-4 rounded-2xl shadow-[0_6px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_26px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-2">
                    <span>Open Modal Dialog</span>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </button>
                  <span class="text-xs text-slate-500 font-mono">Click to trigger real backdrop overlay</span>
                </div>

                {#if isModalOpen}
                  <div 
                    transition:fade={{ duration: 200 }}
                    onclick={() => isModalOpen = false}
                    onkeydown={(e) => { if (e.key === 'Escape') isModalOpen = false; }}
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                    class="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <div 
                      transition:fly={{ y: 20, duration: 250 }}
                      onclick={(e) => e.stopPropagation()}
                      onkeydown={(e) => e.stopPropagation()}
                      role="document"
                      class="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-7 max-w-sm w-full shadow-2xl flex flex-col gap-4">
                      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 class="font-black text-slate-900 font-mono text-base">Scale Cluster</h3>
                        <button onclick={() => isModalOpen = false} aria-label="Close dialog" class="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <p class="text-xs text-slate-600 leading-relaxed">
                        Are you sure you want to deploy 12 additional worker instances to <code class="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">us-east-1</code>?
                      </p>
                      <div class="flex gap-2 justify-end pt-2">
                        <button onclick={() => isModalOpen = false} class="text-xs font-bold px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button 
                          onclick={() => { isModalOpen = false; triggerToast(); }} 
                          style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
                          class="font-bold text-xs text-white px-5 py-2.5 rounded-xl shadow-sm">
                          Confirm Scale
                        </button>
                      </div>
                    </div>
                  </div>
                {/if}
              {:else if selectedComponent === 'Toast'}
                <div class="flex flex-col items-center gap-4">
                  <button 
                    onclick={triggerToast}
                    style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
                    class="font-bold text-xs text-white px-7 py-4 rounded-2xl shadow-[0_6px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_26px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-2">
                    <span>Trigger Notification Toast</span>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </button>
                  <span class="text-xs text-slate-500 font-mono">Spawns auto-dismissing toast in bottom-right</span>
                </div>
              {:else if selectedComponent === 'Select'}
                <div class="w-full relative">
                  <span class="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">Target Cluster</span>
                  <button 
                    id="select-button"
                    onclick={() => isSelectOpen = !isSelectOpen}
                    class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 flex items-center justify-between hover:bg-white transition-all cursor-pointer">
                    <span>{selectValue}</span>
                    <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {#if isSelectOpen}
                    <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20">
                      {#each ['Production (us-east-1)', 'Staging (eu-central-1)', 'Edge Gateway (ap-southeast-1)'] as opt}
                        <button 
                          onclick={() => { selectValue = opt; isSelectOpen = false; }}
                          class="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 hover:bg-amber-50/50 hover:text-amber-900 transition-all flex items-center justify-between cursor-pointer">
                          <span>{opt}</span>
                          {#if selectValue === opt}
                            <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {:else if selectedComponent === 'StreamView'}
                <div class="w-full bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-4">
                  <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span class="text-xs font-mono font-bold text-sky-300">Live Telemetry Feed</span>
                    </div>
                    <button 
                      onclick={addStreamEvent}
                      class="text-[11px] font-mono bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 px-3 py-1 rounded-lg border border-sky-400/30 transition-all cursor-pointer">
                      + Simulate Event
                    </button>
                  </div>
                  <div class="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {#each streamEvents as evt (evt.id)}
                      <div class="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                        <span class="text-slate-300">{evt.text}</span>
                        <span class="text-slate-500 text-[10px] shrink-0 ml-2">{evt.time}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {:else if selectedComponent === 'DynamicForm'}
                <DynamicForm config={{
                  title: "Provision PostgreSQL Instance",
                  endpoint: "/api/database/create",
                  fields: [
                    { name: "db_name", label: "Database Identifier", type: "text", required: true },
                    { name: "tier", label: "Compute Tier", type: "text", required: true }
                  ]
                }} />
              {:else}
                <ListBlock config={{
                  title: "Active Edge Clusters",
                  items: [
                    { label: "sola-edge-iad1", description: "Washington DC • 99.99% Uptime", status: "Active" },
                    { label: "sola-edge-fra1", description: "Frankfurt • 99.98% Uptime", status: "Active" }
                  ]
                }} />
              {/if}

            </div>

          {:else if viewMode === 'embed'}
            <!-- 1-Click Framework Embed Codes -->
            <div class="w-full relative z-10 flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
                <span class="text-xs font-bold font-mono text-slate-400">Choose Target:</span>
                {#each ['react', 'vue', 'html', 'svelte'] as fw}
                  <button 
                    onclick={() => embedFramework = fw}
                    class="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer {embedFramework === fw ? 'bg-amber-500/10 text-amber-950 border border-amber-500/30 shadow-xs font-black' : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 border border-transparent'}">
                    {fw === 'html' ? 'Vanilla HTML / CDN' : fw}
                  </button>
                {/each}
              </div>

              <pre class="bg-slate-900 text-amber-200 p-6 rounded-3xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner"><code>{embedSnippets[selectedComponent]?.[embedFramework] || embedSnippets['DataCard'][embedFramework]}</code></pre>
            </div>

          {:else}
            <!-- Raw .sola Markup -->
            <div class="w-full relative z-10">
              <pre class="bg-slate-900 text-amber-200 p-6 rounded-3xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner"><code>{solaCodeSamples[selectedComponent] || solaCodeSamples['DataCard']}</code></pre>
            </div>
          {/if}

        </div>

      </main>

    </div>

  </div>
</div>
