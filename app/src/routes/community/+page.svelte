<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import { goto } from '$app/navigation';

  interface CommunityTemplate {
    id: string;
    title: string;
    description: string;
    tier: 'Personal & Creator' | 'Product & SaaS' | 'FinOps & Billing' | 'Telemetry & Systems' | 'Operations & Governance';
    componentType: 'datacard' | 'gauge' | 'dial' | 'waterfall' | 'list' | 'incident';
    stars: number;
    installs: string;
    author: string;
    signals: string[];
    config: any;
  }

  const templates: CommunityTemplate[] = [
    {
      id: 'finops-arr-waterfall',
      title: 'Subscription ARR Waterfall & Dunning',
      description: 'Flow waterfall calculating gross MRR realization, gateway fees, and automated dunning trigger chips.',
      tier: 'FinOps & Billing',
      componentType: 'waterfall',
      stars: 482,
      installs: '12.4k',
      author: '@alex_sre',
      signals: ['finance/mrr', 'billing/churn'],
      config: {
        title: 'Monthly ARR Realization',
        grossVolume: 184000,
        computeExpense: 34000,
        supportExpense: 16000,
        tierDiscount: 8000
      }
    },
    {
      id: 'creator-habit-dial',
      title: 'Solo Creator Habit & Workout Log',
      description: 'Tactile habit tracker with rotary weight dials, volume progress arcs, and optimistic completion triggers.',
      tier: 'Personal & Creator',
      componentType: 'dial',
      stars: 318,
      installs: '8.9k',
      author: '@fitness_indie',
      signals: ['user/streak', 'fitness/volume'],
      config: {
        title: 'Session Weight Throttle',
        value: 24,
        min: 8,
        max: 48,
        unit: 'kg',
        subtext: 'Daily volume target: 85%'
      }
    },
    {
      id: 'k8s-cluster-saturation',
      title: 'Cluster Saturation & Auto-Scaler',
      description: 'Live telemetry HUD with node auto-scaling rotary dials, CPU rings, and sub-millisecond signal mesh stream.',
      tier: 'Telemetry & Systems',
      componentType: 'gauge',
      stars: 620,
      installs: '19.2k',
      author: '@cloud_architect',
      signals: ['cluster/nodes', 'cluster/cpu'],
      config: {
        title: 'Cluster CPU Saturation',
        value: '78.4%',
        percentage: 78,
        subtext: 'Optimal operational envelope',
        color: 'emerald'
      }
    },
    {
      id: 'sprint-cycle-tracker',
      title: 'Product Sprint Cycles & Issues',
      description: 'Keyboard-first issue triage list with cycle completion bars and reactive priority filters.',
      tier: 'Product & SaaS',
      componentType: 'list',
      stars: 540,
      installs: '15.8k',
      author: '@pm_builder',
      signals: ['sprint/velocity', 'issues/active'],
      config: {
        title: 'Active Sprint Cycle #14',
        items: [
          { label: 'Optimize Zero-VDOM Signal Batching', description: 'Priority: P0 • Assigned: Runtime Team', status: 'Active' },
          { label: 'Implement Closed Shadow DOM Exporter', description: 'Priority: P1 • Assigned: Extension Team', status: 'Completed' },
          { label: 'Multi-Region Relay Replication', description: 'Priority: P2 • In Staging Review', status: 'Pending' }
        ]
      }
    },
    {
      id: 'incident-command-capsule',
      title: 'Enterprise Incident Command Matrix',
      description: 'P1 SLA countdown dial with blast-radius estimation and 1-click automated failover playbooks.',
      tier: 'Operations & Governance',
      componentType: 'incident',
      stars: 712,
      installs: '24.1k',
      author: '@platform_governance',
      signals: ['ops/incident_id', 'ops/sla_remain'],
      config: {
        incidentId: 'INC009481',
        title: 'API Gateway Ingress Spike (EU-West)',
        severity: 'P1 - Critical Outage',
        slaRemainingMin: 11,
        blastRadius: '42,000 Active Sessions',
        playbooks: [
          { id: 'pb-1', title: 'Route53 Edge DNS Failover', action: 'DNS Failover', automated: true },
          { id: 'pb-2', title: 'Scale Container Workers (x4)', action: 'Auto-Scale', automated: true }
        ]
      }
    },
    {
      id: 'saas-mrr-growth',
      title: 'B2B SaaS MRR & Net Retention',
      description: 'Clean KPI summary cards tracking net expansion revenue with sub-millisecond signal updates.',
      tier: 'Product & SaaS',
      componentType: 'datacard',
      stars: 395,
      installs: '11.3k',
      author: '@metrics_lead',
      signals: ['saas/mrr', 'saas/ndr'],
      config: {
        title: 'Monthly Recurring Revenue',
        value: '$142,800',
        trend: '+18.4% vs last month',
        icon: 'trending-up'
      }
    }
  ];

  let searchQuery = $state('');
  let selectedTier = $state<string>('All');
  let selectedModalTemplate = $state<CommunityTemplate | null>(null);
  let toastMessage = $state<string | null>(null);

  const tiers = ['All', 'Personal & Creator', 'Product & SaaS', 'FinOps & Billing', 'Telemetry & Systems', 'Operations & Governance'];

  let filteredTemplates = $derived(
    templates.filter(t => {
      const matchTier = selectedTier === 'All' || t.tier === selectedTier;
      const matchQuery = !searchQuery || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.signals.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTier && matchQuery;
    })
  );

  function triggerForkToStudio(tmpl: CommunityTemplate) {
    showToast(`Forked "${tmpl.title}" into Studio`);
    setTimeout(() => {
      goto(`/studio?template=${tmpl.id}`);
    }, 600);
  }

  function openExtensionModal(tmpl: CommunityTemplate) {
    selectedModalTemplate = tmpl;

    // Broadcast postMessage to any active Sola Chrome Extension content script on the page
    if (typeof window !== 'undefined') {
      window.postMessage({
        type: 'SOLA_MOUNT_IN_SITU',
        source: 'sola_community',
        template: {
          id: tmpl.id,
          title: tmpl.title,
          description: tmpl.description,
          componentType: tmpl.componentType,
          config: tmpl.config
        }
      }, '*');
    }
  }

  function copyCode(tmpl: CommunityTemplate) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`npm i @sola/core @sola/ui\n// Component: ${tmpl.title}\n// Signals: ${tmpl.signals.join(', ')}`);
      showToast('Copied integration snippet to clipboard');
    }
  }

  function showToast(msg: string) {
    toastMessage = msg;
    setTimeout(() => {
      if (toastMessage === msg) toastMessage = null;
    }, 3000);
  }
</script>

<svelte:head>
  <title>Sola Design Community — Discover & Share UI Components</title>
</svelte:head>

<div class="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden relative">
  <Navbar />

  <!-- Monochromatic Grid Texture -->
  <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>

  <!-- Toast Notification -->
  {#if toastMessage}
    <div class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white font-medium text-xs shadow-2xl flex items-center gap-2.5 animate-in">
      <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>{toastMessage}</span>
    </div>
  {/if}

  <!-- Header Banner -->
  <header class="relative z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-5xl mx-auto flex flex-col items-center text-center gap-4">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        <span>Open Component Registry</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-[-0.03em]">
        Discover, Fork, and Share Sola UI
      </h1>
      <p class="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
        Explore community-crafted zero-VDOM components, presets, and action playbooks. 1-click fork into Studio or preview live in your Chrome Extension.
      </p>

      <!-- Search & Filters -->
      <div class="w-full max-w-xl flex gap-2 mt-2">
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Search templates, authors, signals (e.g. mrr, cluster)..." 
            class="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-mono shadow-xs" />
        </div>
      </div>

      <!-- Tier Filters -->
      <div class="flex flex-wrap items-center justify-center gap-1.5 mt-2">
        {#each tiers as tier}
          <button 
            onclick={() => selectedTier = tier}
            class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer {selectedTier === tier ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/90'}">
            {tier}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Community Grid -->
  <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredTemplates as tmpl}
        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between gap-5 group">
          
          <div class="flex flex-col gap-4">
            <!-- Card Header -->
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {tmpl.tier}
              </span>
              <div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>{tmpl.stars}</span>
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>{tmpl.installs}</span>
                </span>
              </div>
            </div>

            <!-- Title & Description -->
            <div>
              <h3 class="text-base font-black text-slate-950 tracking-tight mb-1 group-hover:text-amber-700 transition-colors">
                {tmpl.title}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                {tmpl.description}
              </p>
            </div>

            <!-- LIVE MINI COMPONENT PREVIEW STAGE -->
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden min-h-[120px] flex items-center justify-center">
              {#if tmpl.componentType === 'waterfall'}
                <div class="w-full scale-90 transform-gpu origin-center">
                  <FlowWaterfall config={tmpl.config} />
                </div>
              {:else if tmpl.componentType === 'dial'}
                <div class="w-full scale-90 transform-gpu origin-center flex justify-center">
                  <TactileDialCard config={tmpl.config} />
                </div>
              {:else if tmpl.componentType === 'gauge'}
                <div class="w-full scale-90 transform-gpu origin-center flex justify-center">
                  <GaugeCard config={tmpl.config} />
                </div>
              {:else if tmpl.componentType === 'list'}
                <div class="w-full scale-90 transform-gpu origin-center">
                  <ListBlock config={tmpl.config} />
                </div>
              {:else if tmpl.componentType === 'incident'}
                <div class="w-full scale-90 transform-gpu origin-center">
                  <IncidentTriageMatrix config={tmpl.config} />
                </div>
              {:else}
                <div class="w-full scale-90 transform-gpu origin-center">
                  <DataCard config={tmpl.config} />
                </div>
              {/if}
            </div>

            <!-- Signals Tags -->
            <div class="flex flex-wrap gap-1.5">
              {#each tmpl.signals as sig}
                <span class="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                  ${sig}
                </span>
              {/each}
            </div>
          </div>

          <!-- Action Footer -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] font-mono text-slate-400">
              by <strong class="text-slate-700">{tmpl.author}</strong>
            </span>

            <div class="flex items-center gap-2">
              <!-- Fork to Studio -->
              <button 
                onclick={() => triggerForkToStudio(tmpl)}
                class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer">
                <svg class="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                <span>Fork to Studio</span>
              </button>

              <!-- Test in My UI (Chrome Extension Bridge) -->
              <button 
                onclick={() => openExtensionModal(tmpl)}
                class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
                <span>Test in UI</span>
              </button>
            </div>
          </div>

        </div>
      {/each}
    </div>
  </main>

  <!-- CHROME EXTENSION IN-SITU PREVIEW MODAL -->
  {#if selectedModalTemplate}
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-5 animate-in">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-950">In-Situ Preview Bridge</h3>
              <p class="text-xs text-slate-500">Test "{selectedModalTemplate.title}" on your live UI</p>
            </div>
          </div>
          <button 
            onclick={() => selectedModalTemplate = null}
            class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-emerald-950">
            <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            <div>
              <strong class="font-bold">Live Chrome Extension Event Dispatched:</strong>
              <p class="mt-0.5 text-[11px] text-emerald-800">
                If the Sola Chrome Extension is active on your browser, this component has been injected into your active tab's Shadow DOM!
              </p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <span class="font-bold text-slate-800">Test in Simulator or Install NPM:</span>
            <div class="flex flex-col sm:flex-row gap-2 pt-1">
              <a 
                href="/preview?component={selectedModalTemplate.componentType === 'waterfall' ? 'waterfall' : (selectedModalTemplate.componentType === 'dial' ? 'dial' : (selectedModalTemplate.componentType === 'gauge' ? 'cluster' : 'incident'))}"
                class="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-center text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <span>Open in Web Simulator</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <button 
                onclick={() => copyCode(selectedModalTemplate!)}
                class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer">
                <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copy NPM Code</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button 
            onclick={() => selectedModalTemplate = null}
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  {/if}

</div>
