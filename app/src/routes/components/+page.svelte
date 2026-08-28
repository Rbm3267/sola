<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  import StreamView from '$lib/components/StreamView.svelte';
  import ClusterMatrix from '$lib/components/ClusterMatrix.svelte';
  import DiffAudit from '$lib/components/DiffAudit.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import SchemaInspector from '$lib/components/SchemaInspector.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import ReportDocViewer from '$lib/components/ReportDocViewer.svelte';
  import ActionReportGenerator from '$lib/components/ActionReportGenerator.svelte';
  import { SAAS_ECOSYSTEM, type SaasIntegration } from '$lib/data/ecosystem';
  import { fade, fly } from 'svelte/transition';

  // Active Category Ecosystem
  let activeCategory = $state<string>('All');
  let searchQuery = $state<string>('');
  let selectedIntegration = $state<SaasIntegration>(SAAS_ECOSYSTEM[0]);
  let viewMode = $state<'preview' | 'embed' | 'protocol'>('preview');
  let embedFramework = $state<'react' | 'vue' | 'html' | 'svelte'>('react');

  // Interactive component states
  let isToggleOn = $state(true);
  let isModalOpen = $state(false);
  let toasts = $state<Array<{ id: number; text: string; type: string }>>([]);
  let gaugePercent = $state(78);

  function triggerToast(msg?: string) {
    const id = Date.now();
    toasts = [...toasts, { id, text: msg || `Signal ${id.toString().slice(-4)} dispatched`, type: 'success' }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 3000);
  }

  const categories = [
    'All',
    'ITSM & Security',
    'Cloud & DevOps',
    'Observability',
    'Databases',
    'Billing & Finance',
    'AI & Agents',
    'Solo & MCP'
  ];

  function getPresetForIntegration(item: SaasIntegration): string {
    const b = (item.badge || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    if (b.includes('servicenow') || id.includes('servicenow')) return 'servicenow';
    if (b.includes('stripe') || id.includes('stripe') || id.includes('finance')) return 'stripe';
    if (b.includes('shopify') || id.includes('shopify') || id.includes('cart')) return 'shopify';
    if (b.includes('moveworks') || id.includes('moveworks')) return 'moveworks';
    if (b.includes('linear') || id.includes('linear')) return 'linear';
    if (b.includes('grafana') || b.includes('datadog') || id.includes('telemetry')) return 'grafana';
    if (b.includes('vercel') || b.includes('cloudflare') || b.includes('aws') || id.includes('cloud')) return 'vercel';
    return 'servicenow';
  }

  function getComponentParam(compName: string): string {
    switch (compName) {
      case 'IncidentTriageMatrix': return 'incident';
      case 'ClusterMatrix': return 'cluster';
      case 'FlowWaterfall': return 'waterfall';
      case 'TactileDialCard': return 'dial';
      case 'DataCard': return 'datacard';
      case 'GaugeCard': return 'dial';
      default: return 'incident';
    }
  }

  const filteredIntegrations = $derived(
    SAAS_ECOSYSTEM.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchQuery = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.protocolUri.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
  );
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex flex-col font-sans">
  
  <Navbar />

  <!-- Toast Notification Container -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
    {#each toasts as toast (toast.id)}
      <div 
        transition:fly={{ y: 20, duration: 250 }}
        class="bg-slate-900 text-white text-xs font-mono px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 pointer-events-auto">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>{toast.text}</span>
      </div>
    {/each}
  </div>

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
    
    <!-- Hero Title & Search Header -->
    <div class="flex flex-col gap-6 border-b border-slate-200/80 pb-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Enterprise Integration & Component Matrix</span>
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-[-0.03em]">
            SaaS & Component Ecosystem
          </h1>
          <p class="text-slate-600 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
            Surface live telemetry, incident triage, and real-time data across hundreds of cloud platforms, enterprise SaaS, AI protocols, and database relays.
          </p>
        </div>

        <!-- Search Input Field -->
        <div class="w-full md:w-80 relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Search platforms, protocols, components..."
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
          />
          {#if searchQuery}
            <button 
              onclick={() => searchQuery = ''}
              aria-label="Clear search"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          {/if}
        </div>
      </div>

      <!-- Category Filter Chips (Scrollbar-Free) -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 select-none">
        {#each categories as cat}
          <button 
            onclick={() => activeCategory = cat}
            class="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 {activeCategory === cat ? 'bg-amber-500 text-white shadow-xs font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}">
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <!-- 2-Column Catalog & Live Interactive Stage -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Integrations Sidebar Drawer -->
      <aside class="lg:col-span-5 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div class="flex items-center justify-between px-2">
          <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Integrations & Surfaces ({filteredIntegrations.length})
          </span>
          <span class="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            Live Protocol Bindings
          </span>
        </div>

        <!-- Scrollable Button List -->
        <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0 max-h-[620px] lg:overflow-y-auto">
          {#each filteredIntegrations as item}
            <button 
              onclick={() => selectedIntegration = item}
              class="shrink-0 lg:shrink text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer {selectedIntegration.id === item.id ? 'bg-amber-500/10 border border-amber-500/30 shadow-xs' : 'hover:bg-slate-50 border border-slate-100 lg:border-transparent'}">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm font-bold {selectedIntegration.id === item.id ? 'text-amber-950 font-black' : 'text-slate-800'} font-mono truncate">{item.name}</span>
                </div>
                <div class="text-[11px] {selectedIntegration.id === item.id ? 'text-amber-800/80' : 'text-slate-500'} line-clamp-1 mt-0.5">{item.description}</div>
                <div class="text-[10px] font-mono text-amber-700/80 truncate mt-1">
                  <code>{item.protocolUri}</code>
                </div>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 {selectedIntegration.id === item.id ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}">
                {item.badge}
              </span>
            </button>
          {/each}
        </div>
      </aside>

      <!-- Live Stage Area & Code Inspector -->
      <section class="lg:col-span-7 flex flex-col gap-6">
        
        <!-- Component Header & View Switcher Bar -->
        <div class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5 mb-1">
              <span class="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">{selectedIntegration.badge}</span>
              <span class="text-xs font-mono text-slate-500">• {selectedIntegration.primaryComponent}</span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
              {selectedIntegration.name}
            </h2>
            <p class="text-xs text-slate-600 mt-1">
              {selectedIntegration.description}
            </p>
          </div>

          <!-- View Mode Switcher -->
          <div class="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto shrink-0 select-none">
            <button 
              onclick={() => viewMode = 'preview'}
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              Live Preview
            </button>
            <button 
              onclick={() => viewMode = 'embed'}
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'embed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              1-Click Embed
            </button>
            <a 
              href={'/preview?preset=' + getPresetForIntegration(selectedIntegration) + '&component=' + getComponentParam(selectedIntegration.primaryComponent)}
              class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer bg-amber-500 text-white shadow-xs hover:bg-amber-600 flex items-center gap-1.5">
              <span>View on My UI</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        <!-- Stage Area Canvas -->
        <div class="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 shadow-sm min-h-[460px] flex items-center justify-center relative overflow-hidden">
          
          <!-- Subtle Grid Texture -->
          <div class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none"></div>

          {#if viewMode === 'preview'}
            <div class="w-full max-w-xl relative z-10 flex flex-col items-center gap-6">
              
              {#if selectedIntegration.primaryComponent === 'IncidentTriageMatrix'}
                <div class="w-full">
                  <IncidentTriageMatrix config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'DiffAudit'}
                <div class="w-full">
                  <DiffAudit config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'ClusterMatrix'}
                <div class="w-full">
                  <ClusterMatrix config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'FlowWaterfall'}
                <div class="w-full">
                  <FlowWaterfall config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'SchemaInspector'}
                <div class="w-full">
                  <SchemaInspector config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'TactileDialCard'}
                <div class="w-full">
                  <TactileDialCard config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'DataCard'}
                <div class="w-full">
                  <DataCard config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'GaugeCard'}
                <div class="w-full">
                  <GaugeCard config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'StreamView'}
                <div class="w-full">
                  <StreamView config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'ListBlock'}
                <div class="w-full">
                  <ListBlock config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'ReportDocViewer'}
                <div class="w-full">
                  <ReportDocViewer config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'ActionReportGenerator'}
                <div class="w-full">
                  <ActionReportGenerator config={selectedIntegration.config} />
                </div>
              {:else if selectedIntegration.primaryComponent === 'DynamicForm'}
                <div class="w-full">
                  <DynamicForm config={selectedIntegration.config} onSubmit={() => triggerToast()} />
                </div>
              {/if}

            </div>
          {:else if viewMode === 'embed'}
            <div class="w-full max-w-xl relative z-10 flex flex-col gap-4">
              <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span class="text-xs font-mono font-bold text-slate-400 uppercase">Framework:</span>
                {#each ['react', 'vue', 'html', 'svelte'] as fw}
                  <button 
                    onclick={() => embedFramework = fw as any}
                    class="px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer {embedFramework === fw ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                    {fw.toUpperCase()}
                  </button>
                {/each}
              </div>

              <pre class="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{#if embedFramework === 'react'}// React / Next.js Binding for {selectedIntegration.badge}:
import &#123; useSola &#125; from '@sola/react';
import &#123; {selectedIntegration.primaryComponent} &#125; from '@sola/ui/{selectedIntegration.primaryComponent}';

export function {selectedIntegration.badge.replace(/[^a-zA-Z]/g, '')}Widget() &#123;
  const ref = useSola({selectedIntegration.primaryComponent}, &#123;
    source: "{selectedIntegration.protocolUri}"
  &#125;);
  return &lt;div ref=&#123;ref&#125; /&gt;;
&#125;{:else if embedFramework === 'vue'}&lt;template&gt;
  &lt;div ref="container" /&gt;
&lt;/template&gt;
&lt;script setup&gt;
import &#123; onMounted, ref &#125; from 'vue';
import &#123; {selectedIntegration.primaryComponent} &#125; from '@sola/ui/{selectedIntegration.primaryComponent}';

const container = ref(null);
onMounted(() =&gt; {selectedIntegration.primaryComponent}(container.value, &#123;
  source: "{selectedIntegration.protocolUri}"
&#125;));
&lt;/script&gt;{:else if embedFramework === 'html'}&lt;!-- Zero-Framework Vanilla CDN Drop --&gt;
&lt;div id="sola-root"&gt;&lt;/div&gt;
&lt;script type="module"&gt;
  import &#123; {selectedIntegration.primaryComponent} &#125; from 'https://cdn.sola-air.dev/ui/{selectedIntegration.primaryComponent}.js';
  {selectedIntegration.primaryComponent}(document.getElementById('sola-root'), &#123;
    source: "{selectedIntegration.protocolUri}"
  &#125;);
&lt;/script&gt;{:else}&lt;script&gt;
  // Native Sola Declarative Signal
  import &#123; {selectedIntegration.primaryComponent} &#125; from '@sola/ui/{selectedIntegration.primaryComponent}';
  const data = $data("{selectedIntegration.protocolUri}");
&lt;/script&gt;

&lt;{selectedIntegration.primaryComponent} data=&#123;data&#125; /&gt;{/if}</code></pre>
            </div>
          {:else}
            <div class="w-full max-w-xl relative z-10 flex flex-col gap-4">
              <div class="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs border border-slate-800 flex flex-col gap-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span class="text-amber-400 font-bold">Protocol Relay Endpoint</span>
                  <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">HTTP/2 SSE</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 break-all select-all">
                  {selectedIntegration.protocolUri}
                </div>
                <div class="text-slate-400 text-[11px] leading-relaxed">
                  Natural Language Intent:
                  <div class="text-slate-200 font-bold mt-1">"{selectedIntegration.sampleIntent}"</div>
                </div>
              </div>
            </div>
          {/if}

        </div>

      </section>

    </div>

  </main>
</div>
