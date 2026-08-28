<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import ClusterMatrix from '$lib/components/ClusterMatrix.svelte';

  // Active Filter & Search States (Svelte 5 Runes)
  let selectedCategory = $state<string>('All');
  let searchQuery = $state<string>('');
  
  // Extension & Simulator States
  let isExtensionDetected = $state<boolean>(false);
  let activeModalTemplate = $state<any | null>(null);
  let toastMessage = $state<{ text: string; type: 'success' | 'info' | 'amber' } | null>(null);

  const categories = [
    'All',
    'FinOps & Billing',
    'Telemetry & APM',
    'Operations & Governance',
    'Product & SaaS',
    'Executive & Mobile'
  ];

  interface CommunityTemplate {
    id: string;
    title: string;
    author: {
      name: string;
      handle: string;
      verified: boolean;
      avatarBg: string;
    };
    category: string;
    stars: number;
    installs: string;
    desc: string;
    signals: string[];
    previewType: 'waterfall' | 'cluster' | 'dial' | 'incident' | 'datacard' | 'gauge';
    previewConfig: any;
    schema: Record<string, any>;
    targetPreset: 'workspace' | 'fintech' | 'commerce' | 'aifrontdoor' | 'enterprise' | 'telemetry' | 'developer';
  }

  const templates: CommunityTemplate[] = [
    {
      id: 'comm-01',
      title: 'Subscription ARR Realization & Fee Waterfall',
      author: { name: 'Elena Rostova', handle: 'elena.finops', verified: true, avatarBg: '#635bff' },
      category: 'FinOps & Billing',
      stars: 642,
      installs: '18.4k',
      desc: 'Zero-VDOM waterfall tracking gross volume, interchange deductions, and net payout batches.',
      signals: ['stripe/gross_volume', 'billing/interchange_fees', 'payout/net_settlement'],
      previewType: 'waterfall',
      targetPreset: 'fintech',
      previewConfig: {
        title: 'Gross Payout Realization',
        subtitle: 'Settlement pipeline to merchant bank',
        grossVolume: 248000,
        computeExpense: 38000,
        supportExpense: 14000,
        tierDiscount: 6400
      },
      schema: {
        type: 'waterfall',
        version: '1.2.0',
        inputs: ['gross_volume', 'interchange', 'reserve'],
        outputs: ['net_payout']
      }
    },
    {
      id: 'comm-02',
      title: 'Cluster Saturation & Pod Mesh',
      author: { name: 'Devin K.', handle: 'devops.dave', verified: true, avatarBg: '#0ea5e9' },
      category: 'Telemetry & APM',
      stars: 819,
      installs: '24.1k',
      desc: 'Real-time observability matrix with node load indicators, region tags, and sub-millisecond status rings.',
      signals: ['k8s/node_load', 'telemetry/latency', 'cluster/shards'],
      previewType: 'cluster',
      targetPreset: 'telemetry',
      previewConfig: {
        title: 'Primary Ingress Cluster',
        subtitle: '12 Attached Edge Microservices',
        regions: [
          { name: 'us-east-1 (Primary)', status: 'Optimal', lagMs: 0, tps: 14200 },
          { name: 'us-west-2 (Replica)', status: 'Optimal', lagMs: 4, tps: 8900 },
          { name: 'eu-central-1 (Replica)', status: 'Optimal', lagMs: 12, tps: 6400 }
        ]
      },
      schema: {
        type: 'cluster-matrix',
        version: '2.0.0',
        nodeCount: 12,
        metrics: ['cpu', 'ram', 'network_io']
      }
    },
    {
      id: 'comm-03',
      title: 'P1 Incident Rapid Triage & Playbook Dispatch',
      author: { name: 'Marcus Vance', handle: 'marcus.sre', verified: true, avatarBg: '#f43f5e' },
      category: 'Operations & Governance',
      stars: 730,
      installs: '19.8k',
      desc: 'Critical incident HUD with active SLA countdown clocks, blast radius indicators, and 1-click playbooks.',
      signals: ['ops/incident_state', 'oncall/roster', 'sla/countdown'],
      previewType: 'incident',
      targetPreset: 'enterprise',
      previewConfig: {
        incidentId: 'INC009481',
        title: 'API Gateway Ingress Spike (EU-West)',
        severity: 'P1 - Critical Outage',
        slaRemainingMin: 9,
        blastRadius: '42,000 Active Sessions',
        playbooks: [
          { id: 'pb-1', title: 'Route53 Edge DNS Failover', action: 'Route53 Failover', automated: true },
          { id: 'pb-2', title: 'Scale Container Workers (x4)', action: 'Auto-Provision', automated: true }
        ]
      },
      schema: {
        type: 'incident-matrix',
        severity: 'P1',
        slaThresholdMin: 15,
        playbookIds: ['pb-1', 'pb-2']
      }
    },
    {
      id: 'comm-04',
      title: 'Tactile SLA Urgency & Capacity Dial',
      author: { name: 'Sofia Chen', handle: 'sofia.design', verified: true, avatarBg: '#f59e0b' },
      category: 'Executive & Mobile',
      stars: 512,
      installs: '11.3k',
      desc: 'Apple-grade tactile rotary dial with 1-thumb touch tracking and physical haptic click feedback.',
      signals: ['hardware/throttle', 'rate_limit/threshold', 'velocity/sprint'],
      previewType: 'dial',
      targetPreset: 'workspace',
      previewConfig: {
        title: 'Auto-Scaler Urgency Throttle',
        value: 84,
        unit: '%',
        subtext: 'Rotary Sensitivity Limit'
      },
      schema: {
        type: 'tactile-dial',
        min: 0,
        max: 100,
        step: 1,
        haptic: true
      }
    },
    {
      id: 'comm-05',
      title: 'Live Net MRR Velocity & Sparkline HUD',
      author: { name: 'Julian Thorne', handle: 'julian.saas', verified: false, avatarBg: '#10b981' },
      category: 'Product & SaaS',
      stars: 488,
      installs: '13.7k',
      desc: 'High-density SaaS KPI card with real-time reactive trend pills, directional vector badges, and SVG sparkline.',
      signals: ['saas/arr', 'churn/velocity', 'pipeline/new_leads'],
      previewType: 'datacard',
      targetPreset: 'fintech',
      previewConfig: {
        title: 'Realized MRR Growth',
        value: '$184,290',
        trend: '+24.8%',
        icon: 'trending-up'
      },
      schema: {
        type: 'datacard',
        aggregation: 'sum',
        sparklineSamples: 12
      }
    },
    {
      id: 'comm-06',
      title: 'Zero-Egress Security & Compliance Score',
      author: { name: 'SecOps Enclave', handle: 'secops.core', verified: true, avatarBg: '#8b5cf6' },
      category: 'Operations & Governance',
      stars: 395,
      installs: '8.4k',
      desc: 'Circular arc gauge tracking SOC2 compliance gates, air-gap policy diffs, and live egress isolation score.',
      signals: ['soc2/audit_score', 'secops/egress_gates'],
      previewType: 'gauge',
      targetPreset: 'enterprise',
      previewConfig: {
        title: 'SOC2 Air-Gap Security Gate',
        value: '94%',
        percentage: 94,
        subtext: 'Zero-Egress Compliant',
        color: 'emerald'
      },
      schema: {
        type: 'gauge',
        targetScore: 90,
        framework: 'SOC2-Type-II'
      }
    }
  ];

  // Filter derivation
  let filteredTemplates = $derived.by(() => {
    return templates.filter((t) => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.author.handle.toLowerCase().includes(q) ||
        t.signals.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  });

  onMount(() => {
    // Check if Sola Chrome Extension content script is present
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'SOLA_PING_EXTENSION' }, '*');
      const handleMessage = (e: MessageEvent) => {
        if (e.data && (e.data.type === 'SOLA_EXTENSION_PONG' || e.data.type === 'SOLA_EXTENSION_READY')) {
          isExtensionDetected = true;
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  });

  function showToast(text: string, type: 'success' | 'info' | 'amber' = 'success') {
    toastMessage = { text, type };
    setTimeout(() => {
      toastMessage = null;
    }, 3500);
  }

  // 1. Broadcast directly to Sola Chrome Extension
  function handleTestInExtension(tmpl: CommunityTemplate) {
    if (typeof window !== 'undefined') {
      window.postMessage(
        {
          type: 'SOLA_MOUNT_IN_SITU',
          template: {
            id: tmpl.id,
            title: tmpl.title,
            description: tmpl.desc,
            previewType: tmpl.previewType,
            schema: tmpl.schema,
            config: tmpl.previewConfig
          }
        },
        '*'
      );
      showToast(`Broadcasted "${tmpl.title}" to Sola Chrome Extension!`, 'success');
    }
  }

  // 2. Open Live Host Simulator Modal
  function openInSituModal(tmpl: CommunityTemplate) {
    activeModalTemplate = tmpl;
  }

  // 3. Fork into Studio with schema payload
  function handleForkToStudio(tmpl: CommunityTemplate) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sola_forked_template', JSON.stringify(tmpl));
      } catch (e) {}
      showToast(`Forking "${tmpl.title}" into Sola Design Studio...`, 'info');
      setTimeout(() => {
        window.location.href = `/studio?template=${encodeURIComponent(tmpl.id)}&preset=${encodeURIComponent(tmpl.targetPreset)}`;
      }, 500);
    }
  }
</script>

<svelte:head>
  <title>Sola Design Community — Discover & Mount Live Micro-Frontends</title>
</svelte:head>

<!-- Toast Notification -->
{#if toastMessage}
  <div class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] flex items-center gap-3 border transition-all duration-300 backdrop-blur-xl {toastMessage.type === 'success' ? 'bg-slate-900 text-white border-emerald-500/50' : toastMessage.type === 'amber' ? 'bg-amber-50 text-amber-950 border-amber-300' : 'bg-slate-900 text-white border-slate-700'}">
    <div class="w-2 h-2 rounded-full {toastMessage.type === 'success' ? 'bg-emerald-400 animate-ping' : toastMessage.type === 'amber' ? 'bg-amber-500' : 'bg-sky-400'}"></div>
    <span class="text-xs font-mono font-bold tracking-tight">{toastMessage.text}</span>
  </div>
{/if}

<!-- Live Browser Overlay Host Picker Modal -->
{#if activeModalTemplate}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
    <div class="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
          <div>
            <h3 class="text-base font-black text-slate-950 tracking-tight">Test Live Page Preview</h3>
            <span class="text-xs font-mono text-slate-500">{activeModalTemplate.title}</span>
          </div>
        </div>
        <button onclick={() => activeModalTemplate = null} class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <span class="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Choose Test Environment:</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Option A: Chrome Extension -->
          <button 
            onclick={() => { handleTestInExtension(activeModalTemplate); activeModalTemplate = null; }}
            class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 flex flex-col gap-2 text-left cursor-pointer transition-all">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-slate-900">Active Chrome Tab</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Extension</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              Injects directly into your current webpage via Shadow DOM with zero CSS bleed.
            </p>
          </button>

          <!-- Option B: Built-in Sandbox Simulator -->
          <a 
            href="/preview?component={activeModalTemplate.previewType}&preset={activeModalTemplate.targetPreset}"
            class="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 flex flex-col gap-2 text-left cursor-pointer transition-all text-decoration-none">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-amber-950">Host Simulator</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">Web Sandbox</span>
            </div>
            <p class="text-[11px] text-amber-800/80 leading-relaxed">
              Preview inside mock Workspace, Operations, Billing, or Telemetry dashboards.
            </p>
          </a>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <span class="text-[11px] font-mono text-slate-400">Target Preset: <strong class="text-slate-700">{activeModalTemplate.targetPreset}</strong></span>
        <div class="flex items-center gap-2">
          <button onclick={() => activeModalTemplate = null} class="px-4 py-2 rounded-xl text-xs font-mono text-slate-600 hover:text-slate-900 cursor-pointer">
            Cancel
          </button>
          <button 
            onclick={() => handleForkToStudio(activeModalTemplate)} 
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-xs">
            Fork to Studio ↗
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Main Luxury Surface Container -->
<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 font-sans selection:bg-amber-500/20 selection:text-amber-900">
  <Navbar />

  <!-- Hero & Extension Status Banner -->
  <header class="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 pt-12 pb-10 overflow-hidden">
    <!-- Ambient Radial Specular Lighting -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-amber-200/20 via-sky-200/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto flex flex-col items-center text-center gap-5 relative z-10">
      
      <!-- Status Badge & Chrome Extension Indicator -->
      <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 shadow-xs">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full {isExtensionDetected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 {isExtensionDetected ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
        </span>
        <span class="text-xs font-mono font-bold text-slate-700">
          Sola Community Registry • {isExtensionDetected ? 'Chrome Extension Connected' : 'Extension Ready for Live Browser Overlay Mounting'}
        </span>
      </div>

      <!-- Headline -->
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-[-0.03em] max-w-4xl">
        Discover, Test Live Browser Overlay, and Fork Sola Micro-Frontends
      </h1>
      
      <p class="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
        Community-crafted zero-VDOM components, real-time signal waterflows, and tactile dials. Mount in 1-click on your live application or fork directly into Studio.
      </p>

      <!-- Search Bar -->
      <div class="w-full max-w-xl relative mt-2">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Search components, signals ($finance/mrr), authors..." 
          class="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-mono shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all" />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center justify-center gap-1.5 mt-2 select-none">
        {#each categories as cat}
          <button 
            onclick={() => selectedCategory = cat}
            class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap {selectedCategory === cat ? 'bg-slate-950 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'}">
            {cat}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Community Grid Section -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Section Toolbar Header -->
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/80">
      <div class="flex items-center gap-2 text-xs font-mono text-slate-500">
        <span>Showing <strong class="text-slate-900">{filteredTemplates.length}</strong> live components</span>
      </div>

      <!-- Quick Action: Chrome Companion Helper -->
      <div class="flex items-center gap-2">
        <a 
          href="/preview" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all text-decoration-none">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Open Full Live Host Simulator</span>
        </a>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {#each filteredTemplates as tmpl (tmpl.id)}
        <div class="group relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 hover:border-amber-500/40 rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between gap-5 overflow-hidden">
          
          <!-- Subtle Specular Corner Sheen -->
          <div class="absolute -right-12 -top-12 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

          <!-- Top Metadata Header -->
          <div class="flex flex-col gap-3 relative z-10">
            <div class="flex items-center justify-between">
              <!-- Category Pill -->
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                {tmpl.category}
              </span>

              <!-- Star & Install Metrics -->
              <div class="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <strong class="text-slate-700">{tmpl.stars}</strong>
                </span>
                <span>·</span>
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>{tmpl.installs}</span>
                </span>
              </div>
            </div>

            <!-- Title & Description -->
            <div>
              <h3 class="text-base font-bold text-slate-950 group-hover:text-amber-600 transition-colors tracking-tight">
                {tmpl.title}
              </h3>
              <p class="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                {tmpl.desc}
              </p>
            </div>
          </div>

          <!-- LIVE MINI INTERACTIVE COMPONENT PREVIEW -->
          <div class="relative rounded-2xl bg-slate-50/80 border border-slate-200/70 p-3 overflow-hidden shadow-inner min-h-[160px] flex items-center justify-center">
            
            <div class="w-full scale-[0.92] sm:scale-100 origin-center transition-transform">
              {#if tmpl.previewType === 'waterfall'}
                <FlowWaterfall config={tmpl.previewConfig} />
              {:else if tmpl.previewType === 'cluster'}
                <ClusterMatrix config={tmpl.previewConfig} />
              {:else if tmpl.previewType === 'incident'}
                <IncidentTriageMatrix config={tmpl.previewConfig} />
              {:else if tmpl.previewType === 'datacard'}
                <DataCard config={tmpl.previewConfig} />
              {:else if tmpl.previewType === 'gauge'}
                <GaugeCard config={tmpl.previewConfig} />
              {:else if tmpl.previewType === 'dial'}
                <TactileDialCard config={tmpl.previewConfig} />
              {/if}
            </div>

            <!-- Live Telemetry Watermark Pill -->
            <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white font-mono text-[9px] font-bold flex items-center gap-1 shadow-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Zero-VDOM Live</span>
            </div>
          </div>

          <!-- Signals & Author Row -->
          <div class="flex flex-col gap-3 relative z-10 border-t border-slate-100 pt-3">
            
            <!-- Author Handle & Verified Badge -->
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white font-mono shadow-xs" style="background-color: {tmpl.author.avatarBg}">
                  {tmpl.author.name.charAt(0)}
                </div>
                <span class="font-mono text-slate-700 font-medium">{tmpl.author.handle}</span>
                {#if tmpl.author.verified}
                  <svg class="w-3.5 h-3.5 text-sky-500 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                {/if}
              </div>
              <span class="text-[10px] font-mono text-slate-400">Host: {tmpl.targetPreset}</span>
            </div>

            <!-- Signal Badges -->
            <div class="flex flex-wrap gap-1">
              {#each tmpl.signals as sig}
                <span class="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/90 shadow-xs">
                  ${sig}
                </span>
              {/each}
            </div>
          </div>

          <!-- Card Action Buttons -->
          <div class="grid grid-cols-2 gap-2 relative z-10 pt-1">
            <!-- Action 1: Fork to Studio -->
            <button 
              onclick={() => handleForkToStudio(tmpl)}
              class="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-xs">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
              <span>Fork Studio</span>
            </button>

            <!-- Action 2: Test in My UI (Extension / Live Browser Overlay Modal) -->
            <button 
              onclick={() => openInSituModal(tmpl)}
              class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-xs">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Test in My UI</span>
            </button>
          </div>

        </div>
      {/each}
    </div>
  </main>
</div>
