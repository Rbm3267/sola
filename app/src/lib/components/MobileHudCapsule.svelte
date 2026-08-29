<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import FlowWaterfall from './FlowWaterfall.svelte';
  import TactileDialCard from './TactileDialCard.svelte';
  import ClusterMatrix from './ClusterMatrix.svelte';
  import SolaLogo from './SolaLogo.svelte';

  let isExpanded = $state(false);
  let selectedIntentKey = $state<string | null>(null);

  // Live Reactive Signals for Mobile Preview
  let clusterNodes = $state(8);
  let clusterLoad = $state(74);
  let mrrAmount = $state(148200);
  let p1Incidents = $state(2);

  const intents = [
    {
      id: 'incident',
      label: 'P1 Incident Triage',
      badge: 'Operations',
      desc: 'Realtime SLA breach monitor & triage queue',
      prompt: 'Show active P1 incidents breaching SLA in 30 mins'
    },
    {
      id: 'cloud',
      label: 'Cloud Node Mesh',
      badge: 'Telemetry',
      desc: 'Distributed Kubernetes worker topology',
      prompt: 'Display AWS us-east-1 RDS replica topology'
    },
    {
      id: 'revenue',
      label: 'Revenue Waterfall',
      badge: 'FinOps',
      desc: 'Gross volume to net ARR realization',
      prompt: 'Breakdown SaaS gross volume to net payout'
    },
    {
      id: 'ratelimit',
      label: 'API Rate Limiter',
      badge: 'Infrastructure',
      desc: 'Token bucket throttle and p99 latency',
      prompt: 'API Gateway token bucket rate limiter'
    }
  ];

  function handleTriggerIntent(id: string) {
    selectedIntentKey = id;
  }

  function closeAll() {
    isExpanded = false;
    selectedIntentKey = null;
  }
</script>

<!-- Mobile Floating Dynamic Island HUD (Visible on mobile screens < 640px) -->
<div class="sm:hidden fixed bottom-5 inset-x-3 z-40 flex flex-col items-center pointer-events-none">
  
  <!-- Backdrop Blur overlay when expanded or previewing -->
  {#if isExpanded || selectedIntentKey}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
      transition:fade={{ duration: 180 }}
      onclick={closeAll}
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[-1] pointer-events-auto">
    </div>
  {/if}

  <!-- Tactical HUD Capsule Container -->
  <div 
    class="w-full max-w-sm rounded-[28px] bg-slate-950/95 text-white border border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 pointer-events-auto overflow-hidden {isExpanded || selectedIntentKey ? 'p-4 max-h-[82vh] overflow-y-auto' : 'p-2.5 px-4'}">
    
    {#if !isExpanded && !selectedIntentKey}
      <!-- Collapsed Tactile Capsule Bar -->
      <button 
        type="button"
        onclick={() => isExpanded = true}
        class="w-full flex items-center justify-between gap-3 text-left cursor-pointer group">
        
        <!-- Pulsing Quantum Signal Dot -->
        <div class="flex items-center gap-2.5">
          <div class="relative flex items-center justify-center">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 relative shadow-sm"></span>
          </div>
          <span class="text-xs font-mono font-black text-slate-100 tracking-tight">Mobile Command Surface</span>
        </div>

        <!-- Latency Micro-Badge -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
            0.2ms Signal Bus
          </span>
          <svg class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </div>
      </button>

    {:else if selectedIntentKey}
      <!-- LIVE RENDERED COMPONENT VIEW -->
      <div transition:fly={{ y: 20, duration: 220 }} class="flex flex-col gap-3.5">
        
        <!-- View Header with Back button -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <button 
            type="button"
            onclick={() => selectedIntentKey = null}
            class="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white cursor-pointer">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
            <span>Back to Intents</span>
          </button>

          <button 
            type="button"
            onclick={closeAll}
            class="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Close HUD">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Active Preset Title -->
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-xs font-bold text-white font-mono uppercase tracking-wider">
              {intents.find(i => i.id === selectedIntentKey)?.label}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">
            {intents.find(i => i.id === selectedIntentKey)?.desc}
          </p>
        </div>

        <!-- Live Rendered Surface inside Mobile HUD -->
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
          
          {#if selectedIntentKey === 'incident'}
            <div class="grid grid-cols-2 gap-2">
              <DataCard config={{ title: "Active P1s", value: `${p1Incidents} Breaching`, trend: "Urgent", icon: "activity" }} />
              <GaugeCard config={{ title: "SLA Margin", value: 18, max: 60, unit: "m", icon: "clock" }} />
            </div>
            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400 font-mono">INC-9402 • Checkout Spill</span>
              <span class="text-rose-400 font-mono font-bold">12m to SLA</span>
            </div>

          {:else if selectedIntentKey === 'cloud'}
            <div class="grid grid-cols-2 gap-2">
              <DataCard config={{ title: "Nodes", value: `${clusterNodes} Active`, trend: "Optimal", icon: "server" }} />
              <GaugeCard config={{ title: "Compute Load", value: clusterLoad, max: 100, unit: "%", icon: "cpu" }} />
            </div>
            <TactileDialCard 
              title="Scale Cluster" 
              value={clusterNodes} 
              min={2} 
              max={24} 
              unit="nodes" />

          {:else if selectedIntentKey === 'revenue'}
            <div class="grid grid-cols-2 gap-2">
              <DataCard config={{ title: "MRR", value: `$${mrrAmount.toLocaleString()}`, trend: "+18.4%", icon: "trending-up" }} />
              <GaugeCard config={{ title: "Margin", value: 84, max: 100, unit: "%", icon: "check-circle" }} />
            </div>
            <FlowWaterfall 
              title="Realized Monthly ARR" 
              grossVolume={mrrAmount} 
              computeExpense={Math.round(mrrAmount * 0.18)}
              supportExpense={Math.round(mrrAmount * 0.08)}
              tierDiscount={Math.round(mrrAmount * 0.04)} />

          {:else if selectedIntentKey === 'ratelimit'}
            <div class="grid grid-cols-2 gap-2">
              <DataCard config={{ title: "Gateway Ingress", value: "142.8k/s", trend: "Normal", icon: "activity" }} />
              <GaugeCard config={{ title: "Bucket Saturation", value: 68, max: 100, unit: "%", icon: "activity" }} />
            </div>
            <TactileDialCard 
              title="Throttle Dial" 
              value={16} 
              min={4} 
              max={64} 
              unit="k req/s" />
          {/if}

        </div>

        <!-- Footer Actions: Studio Link -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <a 
            href="/studio" 
            onclick={closeAll}
            class="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs text-center transition-all">
            Open in Studio Editor →
          </a>
        </div>

      </div>

    {:else}
      <!-- Expanded Intent Selection Grid -->
      <div transition:fly={{ y: 15, duration: 200 }} class="flex flex-col gap-3.5">
        
        <!-- Top Title Bar & Close Button -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Mobile Command Surface</span>
          </div>
          <button 
            type="button"
            onclick={() => isExpanded = false}
            class="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Close HUD">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Explainer -->
        <p class="text-[11px] text-slate-400 leading-relaxed">
          1-thumb mobile triggers to generate and preview zero-VDOM components on your screen:
        </p>

        <!-- 1-Tap Quick Intent Grid -->
        <div class="grid grid-cols-2 gap-2">
          {#each intents as intent}
            <button 
              type="button"
              onclick={() => handleTriggerIntent(intent.id)}
              class="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition-all cursor-pointer group flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                    {intent.badge}
                  </span>
                </div>
                <span class="text-xs font-mono font-bold text-slate-100 group-hover:text-emerald-400 block truncate">
                  {intent.label}
                </span>
              </div>
              <span class="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-2">
                <span>Preview</span>
                <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </button>
          {/each}
        </div>

        <!-- Direct Studio Route Option -->
        <a 
          href="/studio"
          onclick={closeAll}
          class="w-full py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs text-center transition-all flex items-center justify-center gap-2">
          <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Launch Full Design Studio</span>
        </a>

      </div>
    {/if}

  </div>
</div>
