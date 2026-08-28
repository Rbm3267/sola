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
  import { fade, fly } from 'svelte/transition';

  // Active Category Ecosystem
  let activeEcosystem = $state<'primitives' | 'enterprise' | 'solo'>('primitives');
  let selectedComponent = $state('DataCard');
  let viewMode = $state<'preview' | 'embed' | 'code'>('preview');
  let embedFramework = $state<'react' | 'vue' | 'html' | 'svelte'>('react');

  // Interactive component states
  let isToggleOn = $state(true);
  let isModalOpen = $state(false);
  let toasts = $state<Array<{ id: number; text: string; type: string }>>([]);
  let gaugePercent = $state(78);

  function triggerToast() {
    const id = Date.now();
    toasts = [...toasts, { id, text: `Signal ${id.toString().slice(-4)} dispatched`, type: 'success' }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 3000);
  }

  // ── 1. Core Universal Primitives ──
  const corePrimitives = [
    { id: 'DataCard', name: 'DataCard', desc: 'KPI metric tile with vector SVG sparklines and change indicators', category: 'Analytics' },
    { id: 'GaugeCard', name: 'GaugeCard', desc: 'Circular SVG progress arc for memory, CPU, and hardware load', category: 'Telemetry' },
    { id: 'ClusterMatrix', name: 'ClusterMatrix', desc: 'High-density node matrix with sub-pixel glow status and APM hover cards', category: 'Infrastructure' },
    { id: 'FlowWaterfall', name: 'FlowWaterfall', desc: 'Financial revenue realization and APM request trace latency split breakdown', category: 'Analytics' },
    { id: 'SchemaInspector', name: 'SchemaInspector', desc: 'Relational database schema explorer with types, row counts, and foreign keys', category: 'Data Display' },
    { id: 'DynamicForm', name: 'DynamicForm', desc: 'Declarative auto-binding schema form with instant submit state', category: 'Inputs' },
    { id: 'ListBlock', name: 'ListBlock', desc: 'Real-time reactive server entity list with pulse status indicators', category: 'Data Display' },
    { id: 'StreamView', name: 'StreamView', desc: 'Live event stream viewer with animated delta feeds', category: 'Data Display' },
    { id: 'Toggle', name: 'Toggle', desc: 'Accessible two-state micro-switch with spring transition', category: 'Inputs' },
    { id: 'Modal', name: 'Modal', desc: 'High-focus backdrop overlay dialog with escape listener', category: 'Feedback' },
    { id: 'Toast', name: 'Toast', desc: 'Floating notification stack with auto-dismiss timer', category: 'Feedback' }
  ];

  // ── 2. Enterprise SaaS Surfaces ──
  const enterpriseSurfaces = [
    { id: 'servicenow-mim', name: 'ServiceNow Incident MIM', desc: 'Real-time P1 War Room capsule with live SLA breach dial & automated playbooks', category: 'ServiceNow' },
    { id: 'servicenow-cab', name: 'ServiceNow CAB Drift Diff', desc: 'Change Advisory Board visual diff with risk score & 1-click ACL approvals', category: 'ServiceNow' },
    { id: 'aws-mesh', name: 'AWS Cloud Mesh Matrix', desc: 'Multi-region RDS & EC2 node cluster matrix with APM telemetry hover drawers', category: 'AWS Cloud' },
    { id: 'stripe-realization', name: 'Stripe Settlement Split', desc: 'Gross volume to net merchant bank payout reconciliation waterfall', category: 'Stripe' }
  ];

  // ── 3. Solo Dev, MCP & A2A Surfaces ──
  const soloSurfaces = [
    { id: 'sheet-relay', name: 'Google Sheets Live Sync', desc: '1-line zero-backend personal spreadsheet binding (15s auto-polling)', category: 'Google Sheets' },
    { id: 'mcp-public-data', name: 'Model Context Protocol (MCP)', desc: 'Surface live public API weather, crypto, and GitHub telemetry via MCP servers', category: 'MCP Tooling' },
    { id: 'a2a-agent-stream', name: 'Agent-to-Agent (A2A) Telemetry', desc: 'Live multi-agent step execution and autonomous negotiation event bus', category: 'A2A Agents' },
    { id: 'sqlite-edge-db', name: 'Edge SQLite / D1 Explorer', desc: 'Schema inspector and real-time query runner for solo engineers and cloud edge apps', category: 'Database' }
  ];

  const currentList = $derived(
    activeEcosystem === 'primitives' 
      ? corePrimitives 
      : activeEcosystem === 'enterprise' 
        ? enterpriseSurfaces 
        : soloSurfaces
  );

  function switchEcosystem(eco: 'primitives' | 'enterprise' | 'solo') {
    activeEcosystem = eco;
    if (eco === 'primitives') selectedComponent = 'DataCard';
    else if (eco === 'enterprise') selectedComponent = 'servicenow-mim';
    else selectedComponent = 'sheet-relay';
  }
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
    
    <!-- Hero Title & Ecosystem Selector -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold mb-3">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Sola UI Component Catalog</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-[-0.03em]">
          Interactive Component System
        </h1>
        <p class="text-slate-600 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
          Explore Sola's zero-VDOM UI primitives, enterprise SaaS headless integrations, or lightweight MCP and Google Sheets relays for solo developers.
        </p>
      </div>

      <!-- Segmented Ecosystem Switcher -->
      <div class="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 self-start md:self-auto overflow-x-auto max-w-full">
        <button 
          onclick={() => switchEcosystem('primitives')}
          class="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 {activeEcosystem === 'primitives' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-black' : 'text-slate-600 hover:text-slate-900'}">
          <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          <span>Universal Primitives</span>
        </button>
        <button 
          onclick={() => switchEcosystem('enterprise')}
          class="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 {activeEcosystem === 'enterprise' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-black' : 'text-slate-600 hover:text-slate-900'}">
          <svg class="w-3.5 h-3.5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>Enterprise SaaS</span>
        </button>
        <button 
          onclick={() => switchEcosystem('solo')}
          class="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 {activeEcosystem === 'solo' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-black' : 'text-slate-600 hover:text-slate-900'}">
          <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>Solo Dev • MCP • A2A</span>
        </button>
      </div>
    </div>

    <!-- Mobile Horizontal Scroller & Desktop 2-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Component Sidebar Drawer -->
      <aside class="lg:col-span-4 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        <div class="flex items-center justify-between px-2">
          <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            {activeEcosystem === 'primitives' ? 'UI Primitives' : activeEcosystem === 'enterprise' ? 'SaaS Workflows' : 'Relays & Agents'} ({currentList.length})
          </span>
          <span class="text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
            0 kB VDOM
          </span>
        </div>

        <!-- Scrollable Button List (Wraps on Desktop, Scroll on Mobile) -->
        <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {#each currentList as comp}
            <button 
              onclick={() => selectedComponent = comp.id}
              class="shrink-0 lg:shrink text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer {selectedComponent === comp.id ? 'bg-amber-500/10 border border-amber-500/30 shadow-xs' : 'hover:bg-slate-50 border border-slate-100 lg:border-transparent'}">
              <div>
                <div class="text-xs sm:text-sm font-bold {selectedComponent === comp.id ? 'text-amber-950 font-black' : 'text-slate-800'} font-mono">{comp.name}</div>
                <div class="text-[11px] {selectedComponent === comp.id ? 'text-amber-800/80' : 'text-slate-500'} line-clamp-1 mt-0.5 hidden sm:block">{comp.desc}</div>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap {selectedComponent === comp.id ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}">
                {comp.category}
              </span>
            </button>
          {/each}
        </div>
      </aside>

      <!-- Live Stage Area & Code Inspector -->
      <section class="lg:col-span-8 flex flex-col gap-6">
        
        <!-- Component Header & View Switcher Bar -->
        <div class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 font-mono flex items-center gap-2.5">
              <span>{currentList.find(c => c.id === selectedComponent)?.name || selectedComponent}</span>
              <span class="text-xs font-sans font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">Live Surface</span>
            </h2>
            <p class="text-xs text-slate-600 mt-1">
              {currentList.find(c => c.id === selectedComponent)?.desc}
            </p>
          </div>

          <!-- View Mode Switcher -->
          <div class="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button 
              onclick={() => viewMode = 'preview'}
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              Live Preview
            </button>
            <button 
              onclick={() => viewMode = 'embed'}
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'embed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              1-Click Embed
            </button>
            <button 
              onclick={() => viewMode = 'code'}
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {viewMode === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
              .sola Markup
            </button>
          </div>
        </div>

        <!-- Stage Area Canvas -->
        <div class="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-8 shadow-sm min-h-[460px] flex items-center justify-center relative overflow-hidden">
          
          <!-- Subtle Grid Texture -->
          <div class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-35 pointer-events-none"></div>

          {#if viewMode === 'preview'}
            <div class="w-full max-w-xl relative z-10 flex flex-col items-center gap-6">
              
              <!-- ── Universal Primitives Previews ── -->
              {#if selectedComponent === 'DataCard'}
                <div class="w-full">
                  <DataCard config={{
                    title: "Monthly Recurring Revenue",
                    value: "$184,200",
                    trend: "+24.8% vs last month",
                    icon: "trending-up"
                  }} />
                </div>
              {:else if selectedComponent === 'GaugeCard'}
                <div class="w-full flex flex-col gap-4">
                  <GaugeCard config={{
                    title: "Cluster CPU Utilization",
                    value: `${gaugePercent}%`,
                    percentage: gaugePercent,
                    subtext: "Auto-scaled across 3 AWS AZs",
                    color: gaugePercent > 85 ? 'amber' : 'emerald'
                  }} />
                  <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                    <div class="flex justify-between text-xs font-mono font-bold text-slate-600">
                      <span>Simulate Telemetry Load</span>
                      <span>{gaugePercent}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      bind:value={gaugePercent}
                      class="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              {:else if selectedComponent === 'ClusterMatrix'}
                <div class="w-full">
                  <ClusterMatrix config={{
                    title: "Distributed Cluster Mesh",
                    subtitle: "12 Regional Shards Distributed Across 6 Global Regions"
                  }} />
                </div>
              {:else if selectedComponent === 'FlowWaterfall'}
                <div class="w-full">
                  <FlowWaterfall config={{
                    title: "SaaS Gross Revenue Realization",
                    subtitle: "End-to-end deduction breakdown across gateway and AWS egress"
                  }} />
                </div>
              {:else if selectedComponent === 'SchemaInspector'}
                <div class="w-full">
                  <SchemaInspector config={{
                    table: "public.incident",
                    rowCount: "2,419,042",
                    sizeBytes: "842 MB"
                  }} />
                </div>
              {:else if selectedComponent === 'DynamicForm'}
                <div class="w-full">
                  <DynamicForm config={{
                    title: "Deploy Edge Canary",
                    endpoint: "/api/deploy",
                    fields: [
                      { name: "cluster", type: "text", label: "Target Cluster", required: true },
                      { name: "trafficPct", type: "number", label: "Initial Traffic (%)", required: true },
                      { name: "operatorEmail", type: "email", label: "SRE Operator Email", required: true }
                    ]
                  }} onSubmit={() => triggerToast()} />
                </div>
              {:else if selectedComponent === 'ListBlock'}
                <div class="w-full">
                  <ListBlock config={{
                    title: "Active Microservice Instances",
                    items: [
                      { label: "auth-service-v2", description: "us-east-1 • 14ms p99", status: "Active" },
                      { label: "billing-relay-v1", description: "eu-west-1 • 8ms p99", status: "Active" },
                      { label: "ml-inference-v3", description: "us-west-2 • Synchronized", status: "Completed" }
                    ]
                  }} />
                </div>
              {:else if selectedComponent === 'StreamView'}
                <div class="w-full">
                  <StreamView config={{
                    title: "Live Edge Ingress Stream",
                    events: [
                      { id: "e1", message: "Edge CDN cache hit ratio 99.4%", timestamp: "Just now", type: "success" },
                      { id: "e2", message: "Kubernetes worker pod auto-scaled", timestamp: "12s ago", type: "info" },
                      { id: "e3", message: "Rate-limiting threshold elevated", timestamp: "45s ago", type: "warning" }
                    ]
                  }} />
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
                    aria-label="Toggle switch">
                    <span class="w-6 h-6 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>
              {:else if selectedComponent === 'Modal'}
                <div class="flex flex-col items-center gap-4">
                  <button 
                    onclick={() => isModalOpen = true}
                    style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
                    class="font-bold text-xs text-white px-7 py-4 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2">
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
                        Deploy 12 additional worker instances to <code class="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">us-east-1</code>?
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

              <!-- ── Enterprise SaaS Surfaces ── -->
              {:else if selectedComponent === 'servicenow-mim'}
                <div class="w-full">
                  <IncidentTriageMatrix config={{
                    incidentId: "INC009481",
                    title: "ServiceNow P1 Incident • Gateway Latency Spike (EU-West)",
                    severity: "P1 - Critical",
                    slaRemainingMin: 11,
                    blastRadius: "42,000 Active Sessions • Checkout Ingress",
                    playbooks: [
                      { id: "pb-1", title: "Reroute Edge DNS to eu-central-1", action: "Route53 Failover", automated: true },
                      { id: "pb-2", title: "Scale Container Workers (x4)", action: "Auto-Provision", automated: true },
                      { id: "pb-3", title: "Page Tier 3 Database SRE On-Call", action: "PagerDuty Incident", automated: false }
                    ]
                  }} />
                </div>
              {:else if selectedComponent === 'servicenow-cab'}
                <div class="w-full">
                  <DiffAudit config={{
                    title: "Scale Redis Cluster Max Connections (x10)",
                    entityId: "CHG009842",
                    entityType: "ServiceNow CAB Release",
                    riskLevel: "Moderate",
                    riskScore: 42,
                    requester: "Tier 3 Platform SRE",
                    window: "Tonight 02:00 – 04:00 UTC"
                  }} />
                </div>
              {:else if selectedComponent === 'aws-mesh'}
                <div class="w-full">
                  <ClusterMatrix config={{
                    title: "AWS Multi-Region ECS / RDS Cluster Mesh",
                    subtitle: "12 Primary & Read-Replica Shards across us-east-1, eu-west-1, ap-northeast-1"
                  }} />
                </div>
              {:else if selectedComponent === 'stripe-realization'}
                <div class="w-full">
                  <FlowWaterfall config={{
                    title: "Stripe Realized Settlement Breakdown",
                    subtitle: "End-to-end deduction reconciliation from gross payment volume to net bank transfer"
                  }} />
                </div>

              <!-- ── Solo Dev, MCP & A2A Surfaces ── -->
              {:else if selectedComponent === 'sheet-relay'}
                <div class="w-full flex flex-col gap-4">
                  <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs font-mono text-amber-950 flex items-center justify-between">
                    <span>Relay URI: <code>sheet://1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code></span>
                    <span class="font-bold text-emerald-700">15s Auto-Sync</span>
                  </div>
                  <DataCard config={{
                    title: "Google Sheet Live MRR",
                    value: "$184,200",
                    trend: "+$14,800 this month (Auto-Parsed CSV)",
                    icon: "trending-up"
                  }} />
                </div>
              {:else if selectedComponent === 'mcp-public-data'}
                <div class="w-full flex flex-col gap-4">
                  <div class="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-xs font-mono text-sky-950 flex items-center justify-between">
                    <span>MCP Server: <code>mcp://github.com/telemetry-tool</code></span>
                    <span class="font-bold text-sky-700">Model Context Protocol</span>
                  </div>
                  <StreamView config={{
                    title: "MCP Autonomous Tool Execution Feed",
                    events: [
                      { id: "mcp-1", message: "MCP weather_query executed in 24ms", timestamp: "Just now", type: "success" },
                      { id: "mcp-2", message: "MCP github_commit_sync pulled 48 diffs", timestamp: "18s ago", type: "info" }
                    ]
                  }} />
                </div>
              {:else if selectedComponent === 'a2a-agent-stream'}
                <div class="w-full flex flex-col gap-4">
                  <div class="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-xs font-mono text-purple-950 flex items-center justify-between">
                    <span>Protocol: <code>a2a://agent-negotiation-bus</code></span>
                    <span class="font-bold text-purple-700">Agent-to-Agent Autonomous</span>
                  </div>
                  <ListBlock config={{
                    title: "Live A2A Agent Task Allocations",
                    items: [
                      { label: "Sola Planner Agent", description: "Decomposed prompt into 3 subagent tasks", status: "Active" },
                      { label: "Database Worker Agent", description: "Executing index bloat mitigation query", status: "Active" },
                      { label: "Security Validator Agent", description: "Cryptographic signoff verified", status: "Completed" }
                    ]
                  }} />
                </div>
              {:else if selectedComponent === 'sqlite-edge-db'}
                <div class="w-full">
                  <SchemaInspector config={{
                    table: "cloudflare_d1.users",
                    rowCount: "48,200",
                    sizeBytes: "12.4 MB"
                  }} />
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

              <pre class="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>{#if embedFramework === 'react'}// In any React / Next.js app:
import &#123; useSola &#125; from '@sola/react';
import {selectedComponent} from '@sola/ui/{selectedComponent}';

export function Widget() &#123;
  const ref = useSola({selectedComponent}, &#123;
    title: "Production Telemetry",
    value: "$184,200"
  &#125;);
  return &lt;div ref=&#123;ref&#125; /&gt;;
&#125;{:else if embedFramework === 'vue'}&lt;template&gt;
  &lt;div ref="solaContainer" /&gt;
&lt;/template&gt;
&lt;script setup&gt;
import &#123; onMounted, ref &#125; from 'vue';
import {selectedComponent} from '@sola/ui/{selectedComponent}';

const solaContainer = ref(null);
onMounted(() =&gt; {selectedComponent}(solaContainer.value, &#123; title: "Production" &#125;));
&lt;/script&gt;{:else if embedFramework === 'html'}&lt;!-- Zero Framework Vanilla Drop --&gt;
&lt;div id="sola-target"&gt;&lt;/div&gt;
&lt;script type="module"&gt;
  import {selectedComponent} from 'https://cdn.sola-air.dev/ui/{selectedComponent}.js';
  {selectedComponent}(document.getElementById('sola-target'), &#123;
    title: "Production Telemetry"
  &#125;);
&lt;/script&gt;{:else}&lt;script&gt;
  import {selectedComponent} from '@sola/ui/{selectedComponent}';
  const data = $data("sheet://production-telemetry");
&lt;/script&gt;

&lt;{selectedComponent} title="MRR" value="&#123;data.mrr&#125;" /&gt;{/if}</code></pre>
            </div>
          {:else}
            <div class="w-full max-w-xl relative z-10">
              <pre class="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800"><code>&lt;script&gt;
  // Sola Declarative Component Definition
  import &#123; createSignal &#125; from '@sola/core';
  let [count, setCount] = createSignal(100);
&lt;/script&gt;

&lt;!-- Native Zero-VDOM Signal Binding --&gt;
&lt;div class="sola-card"&gt;
  &lt;h3&gt;{selectedComponent}&lt;/h3&gt;
  &lt;span&gt;&#123;count()&#125;&lt;/span&gt;
&lt;/div&gt;</code></pre>
            </div>
          {/if}

        </div>

      </section>

    </div>

  </main>
</div>
