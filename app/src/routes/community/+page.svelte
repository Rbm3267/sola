<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import SolaLogo from '$lib/components/SolaLogo.svelte';

  let selectedTier = $state<string>('All');
  let searchQuery = $state<string>('');
  let forkedToast = $state<string | null>(null);

  const tiers = ['All', 'Personal & Creator', 'Product & SaaS', 'FinOps & Billing', 'Telemetry & APM', 'Operations & Governance'];

  const communityTemplates = [
    {
      id: 'comm-01',
      title: 'Real-Time Subscription Waterfall & Dunning',
      author: 'alex.finops',
      tier: 'FinOps & Billing',
      stars: 482,
      installs: '12.4k',
      desc: 'Flow waterfall tracking gross MRR deductions, payment gateway fees, and automated dunning trigger chips.',
      signals: ['finance/mrr', 'billing/churn'],
      previewType: 'waterfall'
    },
    {
      id: 'comm-02',
      title: 'Solo Creator Habit & Kettlebell Log',
      author: 'sarah.fit',
      tier: 'Personal & Creator',
      stars: 318,
      installs: '8.9k',
      desc: 'Minimalist habit tracker with rotary weight dials, volume gauge arcs, and optimistic completion confetti.',
      signals: ['user/streak', 'fitness/volume'],
      previewType: 'dial'
    },
    {
      id: 'comm-03',
      title: 'Kubernetes Cluster Saturation & Auto-Scaler',
      author: 'devops.dave',
      tier: 'Telemetry & APM',
      stars: 620,
      installs: '19.2k',
      desc: 'Live telemetry HUD with node auto-scaling rotary dials, CPU rings, and sub-millisecond signal mesh stream.',
      signals: ['cluster/nodes', 'cluster/cpu'],
      previewType: 'dial'
    },
    {
      id: 'comm-04',
      title: 'Sprint Cycle Velocity & Issue Triage Matrix',
      author: 'product.lead',
      tier: 'Product & SaaS',
      stars: 541,
      installs: '14.1k',
      desc: 'Linear-grade issue matrix with priority vectors, SLA clocks, and 1-click playbook mitigation triggers.',
      signals: ['sprint/velocity', 'issues/active'],
      previewType: 'card'
    },
    {
      id: 'comm-05',
      title: 'Air-Gap Policy Diff & Schema Redline Audit',
      author: 'secops.enclave',
      tier: 'Operations & Governance',
      stars: 284,
      installs: '6.5k',
      desc: 'Fine-grained AST comparison engine highlighting non-standard risk liability clauses and zero-egress gates.',
      signals: ['compliance/score', 'secops/alerts'],
      previewType: 'card'
    }
  ];

  let filteredTemplates = $derived.by(() => {
    return communityTemplates.filter(t => {
      const matchTier = selectedTier === 'All' || t.tier === selectedTier;
      const matchSearch = !searchQuery || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTier && matchSearch;
    });
  });

  function handleFork(title: string) {
    forkedToast = `Forked "${title}" into Sola Design Studio!`;
    setTimeout(() => forkedToast = null, 3000);
  }
</script>

<svelte:head>
  <title>Sola Design Community — Discover & Share UI Components</title>
</svelte:head>

<div class="min-h-screen bg-[#070a13] text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
  <Navbar />

  {#if forkedToast}
    <div class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
      <span>✓</span>
      <span>{forkedToast}</span>
    </div>
  {/if}

  <!-- Header Banner -->
  <header class="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-10">
    <div class="max-w-7xl mx-auto flex flex-col items-center text-center gap-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-violet-500/10 text-violet-400 border border-violet-500/25">
        <span>Sola Design Community Registry</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
        Discover, Fork, and Share Sola UI
      </h1>
      <p class="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
        Explore community-crafted zero-VDOM components, presets, and action playbooks. 1-click import directly into your Studio or preview on your active web apps.
      </p>

      <!-- Search & Filters -->
      <div class="w-full max-w-xl flex gap-2 mt-2">
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Search templates, authors, signals..." 
          class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono" />
      </div>

      <!-- Tier Filters -->
      <div class="flex flex-wrap items-center justify-center gap-1.5 mt-2">
        {#each tiers as tier}
          <button 
            onclick={() => selectedTier = tier}
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all {selectedTier === tier ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'}">
            {tier}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Community Grid -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredTemplates as tmpl}
        <div class="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between gap-5 group shadow-xl">
          
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                {tmpl.tier}
              </span>
              <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>★ {tmpl.stars}</span>
                <span>•</span>
                <span>{tmpl.installs}</span>
              </div>
            </div>

            <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              {tmpl.title}
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              {tmpl.desc}
            </p>
          </div>

          <!-- Signals Used Badge -->
          <div class="flex flex-wrap gap-1 border-t border-slate-800/60 pt-3">
            {#each tmpl.signals as sig}
              <span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ${sig}
              </span>
            {/each}
          </div>

          <!-- Card Actions -->
          <div class="flex items-center gap-2 pt-2">
            <button 
              onclick={() => handleFork(tmpl.title)}
              class="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer text-center">
              ⚡ Fork to Studio
            </button>
            <a 
              href="/preview"
              class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 transition-all text-center">
              Test in UI ↗
            </a>
          </div>

        </div>
      {/each}
    </div>
  </main>
</div>
