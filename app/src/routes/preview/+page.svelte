<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import ClusterMatrix from '$lib/components/ClusterMatrix.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import { fade, fly } from 'svelte/transition';

  type HostMode = 'preset' | 'screenshot';
  type TemplatePreset = 'linear' | 'stripe' | 'servicenow' | 'grafana' | 'vercel';

  let activeMode = $state<HostMode>('preset');
  let selectedPreset = $state<TemplatePreset>('linear');
  let uploadedImage = $state<string | null>(null);

  // Selected Sola Component to mount
  let activeComponent = $state<'incident' | 'cluster' | 'waterfall' | 'datacard' | 'dial'>('incident');
  let activeFramework = $state<'react' | 'vue' | 'html' | 'sola'>('react');
  let overlayAnchor = $state<'top-center' | 'bottom-right' | 'in-grid'>('in-grid');

  // Handle file drop for screenshot mode
  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImage = event.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  const presets: Record<TemplatePreset, { name: string; brand: string; theme: 'dark' | 'light'; bg: string; text: string; border: string; subtext: string }> = {
    linear: { name: 'Linear App', brand: '#5e6ad2', theme: 'dark', bg: '#0f1015', text: '#e2e8f0', border: '#232530', subtext: 'Ultra-Dark Keyboard-First Workspace' },
    stripe: { name: 'Stripe Dashboard', brand: '#635bff', theme: 'light', bg: '#f8fafc', text: '#0f172a', border: '#e2e8f0', subtext: 'Clean FinTech Light Surface' },
    servicenow: { name: 'ServiceNow Portal', brand: '#81b5a1', theme: 'dark', bg: '#16222f', text: '#f1f5f9', border: '#253545', subtext: 'High-Density Enterprise Navy Surface' },
    grafana: { name: 'Grafana Telemetry', brand: '#f97316', theme: 'dark', bg: '#111217', text: '#d8d9da', border: '#22252b', subtext: 'Real-Time Observability NOC' },
    vercel: { name: 'Vercel Console', brand: '#000000', theme: 'light', bg: '#ffffff', text: '#000000', border: '#eaeaea', subtext: 'Monochrome Edge Developer Platform' }
  };
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex flex-col font-sans">
  
  <Navbar />

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-6">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>In-Situ Preview Simulator</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-[-0.03em]">
          View on My UI
        </h1>
        <p class="text-slate-600 text-sm max-w-2xl mt-1 leading-relaxed">
          Simulate how Sola's zero-VDOM components, ambient signals, and Dynamic Island HUD seamlessly mount inside your existing application.
        </p>
      </div>

      <!-- Mode Selector -->
      <div class="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-xs self-start md:self-auto select-none">
        <button 
          onclick={() => activeMode = 'preset'}
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeMode === 'preset' ? 'bg-white text-slate-950 shadow-xs border border-slate-200/90 font-black' : 'text-slate-600 hover:text-slate-900'}">
          Enterprise Host Presets
        </button>
        <button 
          onclick={() => activeMode = 'screenshot'}
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeMode === 'screenshot' ? 'bg-white text-slate-950 shadow-xs border border-slate-200/90 font-black' : 'text-slate-600 hover:text-slate-900'}">
          Upload Screenshot / Figma
        </button>
      </div>
    </div>

    <!-- Controls Sub-Bar -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
      
      <!-- Sola Component Injected Selector -->
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span class="text-xs font-mono font-bold text-slate-400 uppercase">Inject:</span>
        <button 
          onclick={() => activeComponent = 'incident'}
          class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeComponent === 'incident' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          P1 Incident Matrix
        </button>
        <button 
          onclick={() => activeComponent = 'cluster'}
          class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeComponent === 'cluster' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          Node Cluster Mesh
        </button>
        <button 
          onclick={() => activeComponent = 'waterfall'}
          class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeComponent === 'waterfall' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          Revenue Waterfall
        </button>
        <button 
          onclick={() => activeComponent = 'datacard'}
          class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeComponent === 'datacard' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          KPI DataCard
        </button>
        <button 
          onclick={() => activeComponent = 'dial'}
          class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeComponent === 'dial' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          Tactile Touch Dial
        </button>
      </div>

      <!-- Preset Selection Chips -->
      {#if activeMode === 'preset'}
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {#each (['linear', 'stripe', 'servicenow', 'grafana', 'vercel'] as TemplatePreset[]) as t}
            <button 
              onclick={() => selectedPreset = t}
              class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 {selectedPreset === t ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}">
              <span class="w-2 h-2 rounded-full" style="background-color: {presets[t].brand}"></span>
              <span>{presets[t].name}</span>
            </button>
          {/each}
        </div>
      {:else}
        <label class="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono font-bold cursor-pointer hover:bg-slate-800 flex items-center gap-2">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>Select PNG / Figma Frame</span>
          <input type="file" accept="image/*" onchange={handleFileUpload} class="hidden" />
        </label>
      {/if}

    </div>

    <!-- Simulator Canvas Window -->
    <div class="relative bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
      
      <!-- Mock Browser Frame Chrome -->
      <div class="h-11 bg-slate-900/90 border-b border-slate-800 flex items-center px-4 gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
        
        <div class="flex-1 flex justify-center max-w-md mx-auto">
          <div class="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-400 text-center truncate">
            {activeMode === 'preset' ? `https://${selectedPreset}.app/workspace` : 'sandbox://in-situ-screenshot-stage'}
          </div>
        </div>

        <div class="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
          Sola Zero-VDOM Active
        </div>
      </div>

      <!-- Canvas Interior Surface -->
      <div class="flex-1 relative overflow-auto p-6 flex items-center justify-center transition-colors duration-300" style="background-color: {activeMode === 'preset' ? presets[selectedPreset].bg : '#090d19'}">
        
        {#if activeMode === 'preset'}
          
          <!-- Mock Host Dashboard UI Layout -->
          <div class="w-full max-w-4xl flex flex-col gap-6" style="color: {presets[selectedPreset].text}">
            
            <!-- Host Top Bar -->
            <div class="flex items-center justify-between border-b pb-4" style="border-color: {presets[selectedPreset].border}">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm" style="background: {presets[selectedPreset].brand}">
                  {presets[selectedPreset].name[0]}
                </span>
                <div>
                  <div class="font-bold font-mono text-sm">{presets[selectedPreset].name} Workspace</div>
                  <div class="text-[11px] opacity-60 font-mono">{presets[selectedPreset].subtext}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2.5 py-1 rounded-xl border font-mono" style="border-color: {presets[selectedPreset].border}">
                  Host Cluster: us-east-1
                </span>
              </div>
            </div>

            <!-- Host Grid with Injected Sola Component -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              <!-- Host Static Column -->
              <div class="md:col-span-4 flex flex-col gap-4">
                <div class="p-5 rounded-2xl border flex flex-col gap-2" style="background: {presets[selectedPreset].theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}; border-color: {presets[selectedPreset].border}">
                  <span class="text-xs font-mono opacity-60 uppercase">Host SLA Availability</span>
                  <span class="text-2xl font-black font-mono">99.98%</span>
                  <span class="text-xs text-emerald-500 font-mono">+0.04% vs 30-day target</span>
                </div>
                <div class="p-5 rounded-2xl border flex flex-col gap-2" style="background: {presets[selectedPreset].theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}; border-color: {presets[selectedPreset].border}">
                  <span class="text-xs font-mono opacity-60 uppercase">Active Gateway Sessions</span>
                  <span class="text-2xl font-black font-mono">142,800</span>
                  <span class="text-xs opacity-60 font-mono">Across 42 Global Regions</span>
                </div>
              </div>

              <!-- INJECTED SOLA COMPONENT -->
              <div class="md:col-span-8 relative group">
                
                <!-- Injection Highlight Badge -->
                <div class="absolute -top-3 left-4 z-20 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black shadow-md flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                  <span>Injected Sola Component</span>
                </div>

                {#if activeComponent === 'incident'}
                  <IncidentTriageMatrix config={{
                    incidentId: "INC009481",
                    title: `${presets[selectedPreset].name} • Ingress Latency Spike`,
                    severity: "P1 - Critical",
                    slaRemainingMin: 11,
                    blastRadius: "42,000 Active Sessions",
                    playbooks: [
                      { id: "pb-1", title: "Reroute Edge Traffic", action: "Route53 Failover", automated: true },
                      { id: "pb-2", title: "Scale Container Workers (x4)", action: "Auto-Provision", automated: true },
                      { id: "pb-3", title: "Page Tier 3 Database SRE", action: "PagerDuty Incident", automated: false }
                    ]
                  }} />
                {:else if activeComponent === 'cluster'}
                  <ClusterMatrix config={{
                    title: `${presets[selectedPreset].name} Distributed Mesh`,
                    subtitle: "12 Primary & Read-Replica Shards"
                  }} />
                {:else if activeComponent === 'waterfall'}
                  <FlowWaterfall config={{
                    title: `${presets[selectedPreset].name} Revenue Realization`,
                    subtitle: "Gross volume to net merchant bank payout"
                  }} />
                {:else if activeComponent === 'datacard'}
                  <DataCard config={{
                    title: `${presets[selectedPreset].name} Live ARR`,
                    value: "$2,480,000",
                    trend: "+24.8% vs last quarter",
                    icon: "trending-up"
                  }} />
                {:else if activeComponent === 'dial'}
                  <TactileDialCard config={{
                    title: "Host Cluster Capacity Throttle",
                    value: 78,
                    unit: "%",
                    subtext: "Drag rotary dial to adjust worker quota"
                  }} />
                {/if}

              </div>

            </div>

          </div>

        {:else}
          
          <div class="w-full max-w-3xl flex flex-col items-center gap-4">
            {#if uploadedImage}
              <div class="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                <img src={uploadedImage} alt="Uploaded UI Mockup" class="w-full max-h-[480px] object-contain" />
                <div class="absolute bottom-6 right-6 max-w-xs shadow-2xl">
                  <DataCard config={{
                    title: "Sola Overlay Widget",
                    value: "$184,200",
                    trend: "+24.8% Live In-Situ",
                    icon: "trending-up"
                  }} />
                </div>
              </div>
            {:else}
              <label class="w-full p-16 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-3xl text-center flex flex-col items-center gap-3 cursor-pointer transition-all">
                <svg class="w-12 h-12 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div class="text-sm font-mono text-slate-300 font-bold">Drop your Figma frame or App screenshot here</div>
                <p class="text-xs font-mono text-slate-500">Supports PNG, JPG, WebP. Sola anchors live components over your mockup.</p>
                <input type="file" accept="image/*" onchange={handleFileUpload} class="hidden" />
              </label>
            {/if}
          </div>

        {/if}

      </div>

    </div>

    <!-- 1-Click Embed Snippet Tray -->
    <div class="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <span class="text-xs font-mono font-bold text-slate-400 uppercase">Embed in your host app:</span>
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {#each (['react', 'vue', 'html', 'sola'] as const) as fw}
            <button 
              onclick={() => activeFramework = fw}
              class="px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer {activeFramework === fw ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              {fw.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>

      <pre class="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{#if activeFramework === 'react'}// In your React / Next.js app:
import &#123; useSola &#125; from '@sola/react';
import &#123; IncidentTriageMatrix &#125; from '@sola/ui/IncidentTriageMatrix';

export function SolaEmbedded() &#123;
  const ref = useSola(IncidentTriageMatrix, &#123; source: "now://table/incident" &#125;);
  return &lt;div ref=&#123;ref&#125; /&gt;;
&#125;{:else if activeFramework === 'vue'}&lt;template&gt;
  &lt;div ref="solaContainer" /&gt;
&lt;/template&gt;
&lt;script setup&gt;
import &#123; onMounted, ref &#125; from 'vue';
import &#123; IncidentTriageMatrix &#125; from '@sola/ui/IncidentTriageMatrix';

const solaContainer = ref(null);
onMounted(() =&gt; IncidentTriageMatrix(solaContainer.value, &#123; source: "now://table/incident" &#125;));
&lt;/script&gt;{:else if activeFramework === 'html'}&lt;!-- Zero Framework Vanilla Drop --&gt;
&lt;div id="sola-target"&gt;&lt;/div&gt;
&lt;script type="module"&gt;
  import &#123; IncidentTriageMatrix &#125; from 'https://cdn.sola-air.dev/ui/IncidentTriageMatrix.js';
  IncidentTriageMatrix(document.getElementById('sola-target'), &#123; source: "now://table/incident" &#125;);
&lt;/script&gt;{:else}&lt;script&gt;
  import &#123; IncidentTriageMatrix &#125; from '@sola/ui/IncidentTriageMatrix';
  const incidents = $data("now://table/incident");
&lt;/script&gt;

&lt;IncidentTriageMatrix data=&#123;incidents&#125; /&gt;{/if}</code></pre>
    </div>

  </main>
</div>
