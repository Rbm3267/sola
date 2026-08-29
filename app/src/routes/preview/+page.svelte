<script lang="ts">
  import { page } from '$app/state';
  import Navbar from '$lib/components/Navbar.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import ClusterMatrix from '$lib/components/ClusterMatrix.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import { fade, fly } from 'svelte/transition';

  type HostMode = 'preset' | 'screenshot';
  type TemplatePreset = 'workspace' | 'fintech' | 'commerce' | 'aifrontdoor' | 'enterprise' | 'telemetry' | 'developer';

  let activeMode = $state<HostMode>('preset');
  let selectedPreset = $state<TemplatePreset>('workspace');
  let uploadedImage = $state<string | null>(null);

  // Selected Sola Component to mount
  let activeComponent = $state<'incident' | 'cluster' | 'waterfall' | 'datacard' | 'dial'>('incident');
  let activeFramework = $state<'react' | 'vue' | 'swift' | 'html' | 'sola'>('react');

  $effect(() => {
    try {
      const p = page.url.searchParams.get('preset');
      const c = page.url.searchParams.get('component');
      if (p && p in presets) {
        selectedPreset = p as TemplatePreset;
      }
      if (c && ['incident', 'cluster', 'waterfall', 'datacard', 'dial'].includes(c)) {
        activeComponent = c as any;
      }
    } catch (e) {}
  });

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
    workspace: { name: 'Project Workspace', brand: '#5e6ad2', theme: 'dark', bg: '#0f1015', text: '#e2e8f0', border: '#232530', subtext: 'Ultra-Dark Keyboard-First Workspace' },
    fintech: { name: 'FinTech & Billing', brand: '#635bff', theme: 'light', bg: '#f8fafc', text: '#0f172a', border: '#e2e8f0', subtext: 'Clean FinTech Light Surface' },
    commerce: { name: 'E-Commerce Admin', brand: '#95bf47', theme: 'light', bg: '#f6f6f7', text: '#202223', border: '#e1e3e5', subtext: 'E-Commerce Storefront & Analytics' },
    aifrontdoor: { name: 'AI Front Door', brand: '#00b4d8', theme: 'dark', bg: '#0f172a', text: '#f8fafc', border: '#1e293b', subtext: 'Conversational AI Front Door' },
    enterprise: { name: 'Enterprise Portal', brand: '#81b5a1', theme: 'dark', bg: '#16222f', text: '#f1f5f9', border: '#253545', subtext: 'High-Density Enterprise Navy Surface' },
    telemetry: { name: 'Telemetry NOC', brand: '#f97316', theme: 'dark', bg: '#111217', text: '#d8d9da', border: '#22252b', subtext: 'Real-Time Observability NOC' },
    developer: { name: 'Developer Console', brand: '#000000', theme: 'light', bg: '#ffffff', text: '#000000', border: '#eaeaea', subtext: 'Monochrome Edge Developer Platform' }
  };
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#090d19] dark:via-[#0f172a] dark:to-[#090d19] text-slate-900 dark:text-slate-100 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
  
  <Navbar />

  <main class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-6 overflow-x-hidden">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-white/5">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20/80 text-amber-900 text-xs font-mono font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Live UI Simulator</span>
        </div>
        <h1 class="text-2xl sm:text-[#475569] dark:text-slate-400xl lg:text-[#475569] dark:text-slate-400xl font-black text-slate-950 tracking-[-0.03em]">
          View on My UI
        </h1>
        <p class="text-slate-600 dark:text-slate-400 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
          Simulate how Sola's zero-VDOM components, ambient signals, and Dynamic Island HUD seamlessly mount inside your existing application.
        </p>
      </div>

      <!-- Mode Selector -->
      <div class="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-xs self-start md:self-auto select-none overflow-x-auto no-scrollbar max-w-full dark:border-white/5">
        <button 
          onclick={() => activeMode = 'preset'}
          class="px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeMode === 'preset' ? 'bg-white dark:bg-[#0f172a] text-slate-950 shadow-xs border border-slate-200/90 font-black' : 'text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100'}">
          Enterprise Host Presets
        </button>
        <button 
          onclick={() => activeMode = 'screenshot'}
          class="px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap {activeMode === 'screenshot' ? 'bg-white dark:bg-[#0f172a] text-slate-950 shadow-xs border border-slate-200/90 font-black' : 'text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100'}">
          Upload Screenshot / Figma
        </button>
      </div>
    </div>

    <!-- Controls Sub-Bar (Stacked & Labeled Rows) -->
    <div class="bg-white dark:bg-[#0f172a] border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col gap-4 max-w-full overflow-hidden dark:border-white/5">
      
      <!-- Row 1: Target App Environment -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <span class="text-xs font-mono font-medium text-slate-400 uppercase shrink-0 w-32">Host Environment:</span>
        
        {#if activeMode === 'preset'}
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full select-none">
            {#each (['workspace', 'fintech', 'commerce', 'aifrontdoor', 'enterprise', 'telemetry', 'developer'] as TemplatePreset[]) as t}
              <button 
                onclick={() => selectedPreset = t}
                class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 {selectedPreset === t ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 dark:text-slate-400 border border-slate-200/60 hover:bg-slate-100'}">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background-color: {presets[t].brand}"></span>
                <span>{presets[t].name}</span>
              </button>
            {/each}
          </div>
        {:else}
          <label class="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-mono font-medium cursor-pointer hover:bg-slate-800 flex items-center gap-2 self-start shrink-0 active:scale-[0.97] transition-all">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Select PNG / Figma Frame</span>
            <input type="file" accept="image/*" onchange={handleFileUpload} class="hidden" />
          </label>
        {/if}
      </div>

      <!-- Row 2: Sola Component to Inject -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-100">
        <span class="text-xs font-mono font-medium text-slate-400 uppercase shrink-0 w-32">Inject Component:</span>
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full select-none">
          <button 
            onclick={() => activeComponent = 'incident'}
            class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 {activeComponent === 'incident' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:bg-slate-200'}">
            P1 Incident Matrix
          </button>
          <button 
            onclick={() => activeComponent = 'cluster'}
            class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 {activeComponent === 'cluster' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:bg-slate-200'}">
            Node Cluster Mesh
          </button>
          <button 
            onclick={() => activeComponent = 'waterfall'}
            class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 {activeComponent === 'waterfall' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:bg-slate-200'}">
            Revenue Waterfall
          </button>
          <button 
            onclick={() => activeComponent = 'datacard'}
            class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 {activeComponent === 'datacard' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:bg-slate-200'}">
            KPI DataCard
          </button>
          <button 
            onclick={() => activeComponent = 'dial'}
            class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0 {activeComponent === 'dial' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:bg-slate-200'}">
            Tactile Touch Dial
          </button>
        </div>
      </div>

    </div>

    <!-- Simulator Canvas Window -->
    <div class="relative bg-slate-950 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[460px] flex flex-col w-full max-w-full">
      
      <!-- Mock Browser Frame Chrome -->
      <div class="h-10 bg-slate-900/90 border-b border-slate-800 flex items-center px-3 sm:px-4 gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-red-400/80 shrink-0"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-amber-400/80 shrink-0"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400/80 shrink-0"></div>
        
        <div class="flex-1 flex justify-center max-w-md mx-auto px-2">
          <div class="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono text-slate-400 text-center truncate">
            {activeMode === 'preset' ? `https://${selectedPreset}.app/workspace` : 'sandbox://live overlay-screenshot-stage'}
          </div>
        </div>

        <div class="text-[9px] sm:text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">
          Zero-VDOM Active
        </div>
      </div>

      <!-- Canvas Interior Surface -->
      <div class="flex-1 relative overflow-auto p-3 sm:p-6 flex items-center justify-center transition-colors duration-300 w-full max-w-full" style="background-color: {activeMode === 'preset' ? presets[selectedPreset].bg : '#090d19'}">
        
        {#if activeMode === 'preset'}
          
          <!-- Mock Host Dashboard UI Layout -->
          <div class="w-full max-w-4xl flex flex-col gap-4 sm:gap-6" style="color: {presets[selectedPreset].text}">
            
            {#if selectedPreset === 'enterprise'}
              <!-- Official Enterprise Platform Employee Center (ec_ticket_page) Standard Ticket Page Layout -->
              <div class="flex flex-col gap-4 font-sans text-slate-200">
                
                <!-- Enterprise Portal Header & Breadcrumbs (navbar-default) -->
                <div class="bg-[#162638] -mx-3 -mt-3 sm:-mx-6 sm:-mt-6 p-3 sm:p-4 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-between border-b border-[#253950]">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-md bg-[#81b5a1] flex items-center justify-center font-bold text-xs text-[#0e1924]">sn</span>
                      <span class="font-bold text-sm tracking-tight text-white">Enterprise Platform Employee Center</span>
                    </div>
                    <div class="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 ml-4">
                      <span class="opacity-60">Home</span>
                      <span class="opacity-40">/</span>
                      <span class="opacity-60">My Requests</span>
                      <span class="opacity-40">/</span>
                      <span class="text-[#81b5a1] font-bold">Standard Ticket View (INC009481)</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="relative hidden sm:block">
                      <input type="text" placeholder="Search for help, KB, or requests..." class="px-3 py-1.5 rounded bg-[#0e1924] text-slate-200 placeholder-slate-400 text-xs border border-[#253950] outline-none w-52 focus:w-64 transition-all" />
                    </div>
                    <div class="w-7 h-7 rounded-full bg-[#81b5a1] text-[#0e1924] font-bold text-xs flex items-center justify-center shadow-xs">JD</div>
                  </div>
                </div>

                <!-- Ticket Header Banner Panel (panel panel-default) -->
                <div class="p-4 rounded-xl bg-[#162638] border border-[#253950] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2 py-0.5 rounded bg-[#81b5a1]/20 text-[#81b5a1] font-mono font-bold text-[10px]">INCIDENT #INC009481</span>
                      <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">State: In Progress</span>
                    </div>
                    <h2 class="text-sm sm:text-base font-bold text-white">Production Database Ingress Latency & SLA Degradation</h2>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold">P1 - Critical Outage</span>
                  </div>
                </div>

                <!-- Standard Ticket Page Split Layout (Primary Column + Widget Container) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
                  
                  <!-- Left Primary Column: Standard Ticket Configuration Details -->
                  <div class="lg:col-span-5 flex flex-col gap-3 font-sans">
                    <!-- Ticket Details Panel -->
                    <div class="rounded-xl bg-[#162638] border border-[#253950] overflow-hidden">
                      <div class="bg-[#0e1924] px-4 py-2.5 border-b border-[#253950] flex items-center justify-between">
                        <span class="text-xs font-mono font-bold text-[#81b5a1] uppercase">Standard Ticket Details</span>
                        <span class="text-[10px] font-mono text-slate-400">sp_instance: 9481</span>
                      </div>
                      
                      <div class="p-4 flex flex-col gap-3 text-xs">
                        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span class="text-slate-400">Caller / Opened For:</span>
                          <span class="font-bold text-white">Jason Statham</span>
                        </div>
                        
                        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span class="text-slate-400">Assignment Group:</span>
                          <span class="font-mono text-[#81b5a1]">Cloud Infrastructure SRE</span>
                        </div>

                        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span class="text-slate-400">Configuration Item (CI):</span>
                          <span class="font-mono text-amber-400 text-[11px]">aws-prod-aurora-pg-us-east-1a</span>
                        </div>

                        <div class="flex items-center justify-between">
                          <span class="text-slate-400">Resolution SLA:</span>
                          <span class="font-mono text-red-400 font-bold">11m 42s Remaining</span>
                        </div>
                      </div>
                    </div>

                    <!-- Enterprise Platform Page Route Badge -->
                    <div class="p-3 rounded-xl bg-[#162638] border border-[#253950] flex items-center justify-between text-xs">
                      <span class="text-slate-400 font-mono text-[10px]">Page ID:</span>
                      <span class="font-mono text-[#81b5a1] text-[10px] bg-[#0e1924] px-2 py-0.5 rounded border border-[#253950]">/esc?id=ec_ticket_page&sys_id=INC009481</span>
                    </div>
                  </div>

                  <!-- Right Primary Column: Injected Sola Service Portal Widget Container (sp-widget-content) -->
                  <div class="lg:col-span-7 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-[#81b5a1] text-[#0e1924] font-mono text-[10px] font-black shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#0e1924] animate-ping"></span>
                      <span>Enterprise Widget Slot (`sp-widget-content`)</span>
                    </div>

                    {#if activeComponent === 'incident'}
                      <IncidentTriageMatrix config={{
                        incidentId: "INC009481",
                        title: "Enterprise Operations • Ingress Latency Spike",
                        severity: "P1 - Critical Outage",
                        slaRemainingMin: 11,
                        blastRadius: "42,000 Active Sessions",
                        playbooks: [
                          { id: "pb-1", title: "Reroute Edge Traffic", action: "Route53 Failover", automated: true },
                          { id: "pb-2", title: "Scale Container Workers (x4)", action: "Auto-Provision", automated: true },
                          { id: "pb-3", title: "Page Tier 3 Database SRE", action: "PagerDuty Incident", automated: false }
                        ]
                      }} />
                    {:else if activeComponent === 'cluster'}
                      <ClusterMatrix config={{ title: "Enterprise Operations Attached Cluster Mesh", subtitle: "12 Primary & Read-Replica Shards" }} />
                    {:else if activeComponent === 'waterfall'}
                      <FlowWaterfall config={{ title: "Enterprise Operations FinOps Allocation", subtitle: "Monthly cloud allocation to ITSM cost centers" }} />
                    {:else if activeComponent === 'datacard'}
                      <DataCard config={{ title: "Open Work Items", value: "14 Active", trend: "-4 vs yesterday", icon: "activity" }} />
                    {:else if activeComponent === 'dial'}
                      <TactileDialCard config={{ title: "SLA Breach Risk", value: 84, unit: "%", subtext: "Urgency throttle" }} />
                    {/if}
                  </div>
                </div>
              </div>

            {:else if selectedPreset === 'fintech'}
              <!-- Authentic Stripe Dashboard Layout -->
              <div class="flex flex-col gap-4">
                <!-- Stripe Top Bar -->
                <div class="flex items-center justify-between border-b pb-3" style="border-color: {presets[selectedPreset].border}">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">Stripe Dashboard</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">LIVE MODE</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-slate-500 dark:text-slate-400">Balance: <strong class="text-slate-900 dark:text-slate-100">$184,920.00</strong></span>
                  </div>
                </div>

                <!-- Stripe Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div class="lg:col-span-4 flex flex-col gap-3">
                    <div class="p-4 rounded-xl border bg-white dark:bg-[#0f172a] dark:bg-[#0f172a] border-slate-200 dark:border-white/5 flex flex-col gap-1 shadow-xs">
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Gross Volume (30D)</span>
                      <span class="text-2xl font-bold text-slate-900 dark:text-slate-100">$1,420,800</span>
                      <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+18.4% vs last month</span>
                    </div>
                    <div class="p-4 rounded-xl border bg-white dark:bg-[#0f172a] dark:bg-[#0f172a] border-slate-200 dark:border-white/5 flex flex-col gap-1 shadow-xs">
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">Successful Payments</span>
                      <span class="text-2xl font-bold text-slate-900 dark:text-slate-100">42,910</span>
                      <span class="text-xs text-slate-500 dark:text-slate-400">99.4% approval rate</span>
                    </div>
                  </div>

                  <!-- Injected Sola Component Surface -->
                  <div class="lg:col-span-8 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping dark:bg-[#0f172a]"></span>
                      <span>Injected Sola FinTech Card</span>
                    </div>

                    {#if activeComponent === 'waterfall'}
                      <FlowWaterfall config={{ title: "Stripe Payout Realization", subtitle: "Gross volume to net merchant bank payout" }} />
                    {:else if activeComponent === 'datacard'}
                      <DataCard config={{ title: "Live Stripe Volume ARR", value: "$2,480,000", trend: "+24.8% vs Q2", icon: "trending-up" }} />
                    {:else if activeComponent === 'dial'}
                      <TactileDialCard config={{ title: "Stripe Dunning Escalation Dial", value: 65, unit: "%", subtext: "Automated retry frequency" }} />
                    {:else if activeComponent === 'incident'}
                      <IncidentTriageMatrix config={{
                        incidentId: "CHG-9941",
                        title: "Stripe Webhook Gateway Latency",
                        severity: "P2 - High",
                        slaRemainingMin: 24,
                        blastRadius: "1,200 Pending Webhooks",
                        playbooks: [
                          { id: "pb-1", title: "Flush Webhook Queue", action: "Retry Failed Hooks", automated: true }
                        ]
                      }} />
                    {:else}
                      <ClusterMatrix config={{ title: "Stripe Payment Gateway Nodes", subtitle: "Active PCI-DSS Clusters" }} />
                    {/if}
                  </div>
                </div>
              </div>

            {:else if selectedPreset === 'commerce'}
              <!-- Authentic Shopify Admin & E-Commerce Storefront Analytics Layout -->
              <div class="flex flex-col gap-4">
                <!-- Shopify Top Navigation Bar -->
                <div class="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/5">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded bg-[#95bf47] text-white font-bold text-xs flex items-center justify-center font-mono">S</div>
                    <span class="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Shopify Store Admin</span>
                    <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-bold">Store: sola-apparel.myshopify.com</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-slate-500 dark:text-slate-400">Live Traffic:</span>
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">842 online shoppers</span>
                  </div>
                </div>

                <!-- Shopify KPI & Sola Widget Split Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <!-- Shopify Sales Metrics Column -->
                  <div class="lg:col-span-4 flex flex-col gap-3">
                    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 shadow-xs flex flex-col gap-2 dark:border-white/5">
                      <span class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Today's Sales</span>
                      <div class="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">$48,290.00</div>
                      <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">↑ 18.4% vs yesterday</span>
                    </div>

                    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 shadow-xs flex flex-col gap-2 dark:border-white/5">
                      <span class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Checkout Conversion</span>
                      <div class="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">3.84%</div>
                      <span class="text-xs font-mono text-slate-500 dark:text-slate-400">2,410 Sessions Completed</span>
                    </div>
                  </div>

                  <!-- Injected Sola Component Surface inside Shopify Admin -->
                  <div class="lg:col-span-8 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-[#95bf47] text-slate-950 font-mono text-[10px] font-black shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                      <span>Shopify Admin App Extension (`@sola/ui`)</span>
                    </div>

                    {#if activeComponent === 'waterfall'}
                      <FlowWaterfall config={{ title: "Shopify Store Conversion Realization", subtitle: "Visitors → Add to Cart → Reached Checkout → Purchased" }} />
                    {:else if activeComponent === 'datacard'}
                      <DataCard config={{ title: "Shopify Live Gross Volume", value: "$48,290", trend: "+18.4% today", icon: "shopping-bag" }} />
                    {:else if activeComponent === 'dial'}
                      <TactileDialCard config={{ title: "Shopify Cart Recovery Urgency", value: 92, unit: "%", subtext: "Automated SMS/Email throttle" }} />
                    {:else if activeComponent === 'incident'}
                      <IncidentTriageMatrix config={{
                        incidentId: "CART-8812",
                        title: "Shopify Checkout Drop-off Alert",
                        severity: "P2 - High",
                        slaRemainingMin: 18,
                        blastRadius: "142 Abandoned Carts ($18,400)",
                        playbooks: [
                          { id: "pb-1", title: "Trigger 1-Click SMS Discount (10% Off)", action: "Klaviyo Hook", automated: true }
                        ]
                      }} />
                    {:else}
                      <ClusterMatrix config={{ title: "Shopify Edge Storefront Nodes", subtitle: "Global CDN Edge Replicas" }} />
                    {/if}
                  </div>
                </div>
              </div>

            {:else if selectedPreset === 'aifrontdoor'}
              <!-- Authentic Moveworks Next-Gen AI Front Door & Copilot Layout -->
              <div class="flex flex-col gap-4">
                <!-- Moveworks Top Header Bar -->
                <div class="flex items-center justify-between border-b pb-3 border-slate-800">
                  <div class="flex items-center gap-3">
                    <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-xs flex items-center justify-center font-mono shadow-md">
                      M
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-sm text-slate-100 tracking-tight">Moveworks AI Copilot</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-bold">Enterprise Front Door</span>
                      </div>
                      <p class="text-[11px] font-mono text-slate-400">Autonomous Resolution • Connected to Enterprise Platform ITSM</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/60">
                    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>NLP Intent: Ingress Anomaly</span>
                  </div>
                </div>

                <!-- Moveworks Conversational Stream & Sola Interactive Canvas -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <!-- Conversational Dialogue Stream -->
                  <div class="lg:col-span-5 flex flex-col gap-3 font-mono text-xs">
                    <!-- User Prompt Bubble -->
                    <div class="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-200 self-end max-w-[90%] flex flex-col gap-1">
                      <span class="text-[10px] text-cyan-400 font-bold">You (SRE Commander):</span>
                      <p class="leading-relaxed">"Moveworks, why is checkout latency spiking in us-east-1 and what playbooks are available?"</p>
                    </div>

                    <!-- Moveworks Copilot Response Bubble -->
                    <div class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-900/60 text-slate-200 self-start max-w-[95%] flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span class="text-[10px] text-cyan-300 font-bold uppercase">Moveworks Copilot • Instant Analysis</span>
                      </div>
                      <p class="text-[11px] text-slate-300 leading-relaxed">
                        I identified an active P1 incident (<strong class="text-white">INC009481</strong>) linked to Aurora DB connection pool saturation. I've launched the <strong class="text-cyan-300">Sola Ambient Triage Canvas</strong> below with 1-click mitigation actions.
                      </p>
                    </div>
                  </div>

                  <!-- Injected Sola Zero-VDOM Interactive Canvas inside Moveworks -->
                  <div class="lg:col-span-7 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono text-[10px] font-black shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                      <span>Moveworks Interactive Canvas (`@sola/core`)</span>
                    </div>

                    {#if activeComponent === 'incident'}
                      <IncidentTriageMatrix config={{
                        incidentId: "INC009481",
                        title: "Moveworks • Production Aurora Latency Spike",
                        severity: "P1 - Critical Outage",
                        slaRemainingMin: 11,
                        blastRadius: "42,000 Active Sessions Impacted",
                        playbooks: [
                          { id: "pb-1", title: "Route53 Edge Failover", action: "1-Click Auto-Reroute", automated: true },
                          { id: "pb-2", title: "Scale Container Workers (x4)", action: "Auto-Provision", automated: true },
                          { id: "pb-3", title: "Page Tier 3 Database SRE", action: "PagerDuty Trigger", automated: false }
                        ]
                      }} />
                    {:else if activeComponent === 'cluster'}
                      <ClusterMatrix config={{ title: "Moveworks Connected AWS Cluster", subtitle: "12 Pods In Sync with Enterprise Platform" }} />
                    {:else if activeComponent === 'waterfall'}
                      <FlowWaterfall config={{ title: "Moveworks Automated Ticket Cost Avoidance", subtitle: "Deflection savings realized across ITSM tiers" }} />
                    {:else if activeComponent === 'datacard'}
                      <DataCard config={{ title: "Moveworks Autonomous MTTR", value: "4.2 mins", trend: "-82% vs manual portal", icon: "activity" }} />
                    {:else}
                      <TactileDialCard config={{ title: "Moveworks Mitigation Confidence", value: 96, unit: "%", subtext: "Deterministic ActionContract" }} />
                    {/if}
                  </div>
                </div>
              </div>

            {:else if selectedPreset === 'workspace'}
              <!-- Authentic Linear Workspace Layout -->
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b pb-3" style="border-color: {presets[selectedPreset].border}">
                  <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span class="font-bold text-slate-200">Linear Workspace</span>
                    <span class="opacity-40">/</span>
                    <span class="opacity-80">Active Cycle 42</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Press CMD+K to search</span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div class="lg:col-span-4 flex flex-col gap-2 font-mono text-xs">
                    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-slate-300">
                      <span>SOL-104 Scale Redis Worker</span>
                      <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">In Progress</span>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-slate-300">
                      <span>SOL-108 Zero-VDOM Macro AST</span>
                      <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Done</span>
                    </div>
                  </div>

                  <div class="lg:col-span-8 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                      <span>Injected Sola Linear Widget</span>
                    </div>

                    {#if activeComponent === 'incident'}
                      <IncidentTriageMatrix config={{
                        incidentId: "SOL-104",
                        title: "Linear Issue • Scale Redis Cluster Worker",
                        severity: "High Priority",
                        slaRemainingMin: 45,
                        blastRadius: "Affects API Rate Limits",
                        playbooks: [
                          { id: "pb-1", title: "Trigger Auto-Scale Workflow", action: "Deploy Worker v2.4", automated: true }
                        ]
                      }} />
                    {:else if activeComponent === 'dial'}
                      <TactileDialCard config={{ title: "Linear Sprint Capacity Dial", value: 92, unit: "%", subtext: "Cycle 42 Velocity" }} />
                    {:else}
                      <ClusterMatrix config={{ title: "Linear Dev Cluster Mesh", subtitle: "8 Active Microservices" }} />
                    {/if}
                  </div>
                </div>
              </div>

            {:else if selectedPreset === 'telemetry'}
              <!-- Authentic Grafana Telemetry NOC Layout -->
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b pb-3" style="border-color: {presets[selectedPreset].border}">
                  <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span class="font-bold text-amber-400">Grafana NOC Dashboard</span>
                    <span class="opacity-40">•</span>
                    <span class="opacity-80">Prometheus / Cluster Metrics</span>
                  </div>
                  <span class="text-[10px] font-mono bg-slate-900 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30">Last 15 minutes (Live 5s)</span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div class="lg:col-span-4 flex flex-col gap-3 font-mono">
                    <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-1">
                      <span class="text-[10px] opacity-60">PROMETHEUS CPU SATURATION</span>
                      <span class="text-2xl font-bold text-amber-400">78.4%</span>
                      <span class="text-[10px] text-slate-400">12/16 Cores Allocated</span>
                    </div>
                  </div>

                  <div class="lg:col-span-8 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                      <span>Injected Sola Grafana NOC Card</span>
                    </div>

                    {#if activeComponent === 'cluster'}
                      <ClusterMatrix config={{ title: "Grafana Prometheus Node Cluster", subtitle: "12 Pod Shards Monitored Live" }} />
                    {:else if activeComponent === 'datacard'}
                      <DataCard config={{ title: "Grafana Active Telemetry RPS", value: "14,800 RPS", trend: "Nominal Load", icon: "activity" }} />
                    {:else}
                      <TactileDialCard config={{ title: "Grafana Alert Threshold Dial", value: 85, unit: "%", subtext: "Trigger PagerDuty if exceeded" }} />
                    {/if}
                  </div>
                </div>
              </div>

            {:else}
              <!-- Authentic Vercel Console Layout -->
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/5">
                  <div class="flex items-center gap-2 font-mono text-xs text-slate-900 dark:text-slate-100">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 76 65"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
                    <span class="font-bold">Vercel Console</span>
                    <span class="text-slate-400">/</span>
                    <span class="text-slate-600 dark:text-slate-400 dark:text-slate-400">sola-air</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">● Ready</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div class="lg:col-span-4 flex flex-col gap-3 font-mono text-xs">
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 flex flex-col gap-1 dark:border-white/5">
                      <span class="text-[10px] text-slate-400 uppercase">Git Branch</span>
                      <span class="font-bold text-slate-900 dark:text-slate-100">main (ca94995)</span>
                      <span class="text-[10px] text-slate-500 dark:text-slate-400">Built in 16s via Edge</span>
                    </div>
                  </div>

                  <div class="lg:col-span-8 relative group w-full max-w-full">
                    <div class="absolute -top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-slate-950 text-white font-mono text-[10px] font-bold shadow-md flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping dark:bg-[#0f172a]"></span>
                      <span>Injected Sola Edge Console Widget</span>
                    </div>

                    {#if activeComponent === 'datacard'}
                      <DataCard config={{ title: "Vercel Edge Functions Requests", value: "1,420,800", trend: "0ms Cold Start", icon: "activity" }} />
                    {:else if activeComponent === 'waterfall'}
                      <FlowWaterfall config={{ title: "Vercel Bandwidth & Compute Cost", subtitle: "Edge network bandwidth utilization" }} />
                    {:else}
                      <ClusterMatrix config={{ title: "Vercel Global Edge Regions", subtitle: "iad1, sfo1, cdg1, hnd1" }} />
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

          </div>

        {:else}
          
          <div class="w-full max-w-3xl flex flex-col items-center gap-4">
            {#if uploadedImage}
              <div class="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl max-w-full">
                <img src={uploadedImage} alt="Uploaded UI Mockup" class="w-full max-h-[480px] object-contain" />
                <div class="absolute bottom-4 right-4 max-w-xs shadow-2xl">
                  <DataCard config={{
                    title: "Sola Overlay Widget",
                    value: "$184,200",
                    trend: "+24.8% Live Live Browser Overlay",
                    icon: "trending-up"
                  }} />
                </div>
              </div>
            {:else}
              <label class="w-full p-10 sm:p-16 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-3xl text-center flex flex-col items-center gap-3 cursor-pointer transition-all">
                <svg class="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 dark:text-slate-400 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div class="text-xs sm:text-sm font-mono text-slate-300 font-bold">Drop your Figma frame or App screenshot here</div>
                <p class="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">Supports PNG, JPG, WebP. Sola anchors live components over your mockup.</p>
                <input type="file" accept="image/*" onchange={handleFileUpload} class="hidden" />
              </label>
            {/if}
          </div>

        {/if}

      </div>

    <!-- 1-Click Embed Snippet Tray -->
    <div class="bg-white dark:bg-[#0f172a] border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col gap-3 sm:gap-4 max-w-full overflow-hidden dark:border-white/5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <span class="text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase truncate">Embed in your host app:</span>
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          {#each (['react', 'vue', 'swift', 'html', 'sola'] as const) as fw}
            <button 
              onclick={() => activeFramework = fw}
              class="px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold capitalize transition-all cursor-pointer {activeFramework === fw ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100'}">
              {fw === 'swift' ? 'SwiftUI (iOS)' : fw}
            </button>
          {/each}
        </div>
      </div>

      <pre class="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-w-full"><code>{#if activeFramework === 'react'}// React 18 / Next.js Host Component
import React, &#123; useEffect, useRef &#125; from 'react';
import &#123; mount &#125; from '@sola/core';
import IncidentWidget from './IncidentWidget.sola';

export function SolaReactHost(&#123; incidentId, severity &#125;) &#123;
  const containerRef = useRef(null);

  useEffect(() =&gt; &#123;
    if (!containerRef.current) return;
    const unmount = mount(containerRef.current, IncidentWidget, &#123; incidentId, severity &#125;);
    return () =&gt; unmount();
  &#125;, [incidentId, severity]);

  return &lt;div ref=&#123;containerRef&#125; className="sola-react-wrapper" /&gt;;
&#125;{:else if activeFramework === 'vue'}&lt;script setup&gt;
import &#123; ref, onMounted, onUnmounted &#125; from 'vue';
import &#123; mount &#125; from '@sola/core';
import FlowWaterfall from './FlowWaterfall.sola';

const props = defineProps(['mrr', 'churn']);
const container = ref(null);
let unmountFn = null;

onMounted(() =&gt; &#123;
  unmountFn = mount(container.value, FlowWaterfall, &#123; mrr: props.mrr, churn: props.churn &#125;);
&#125;);

onUnmounted(() =&gt; &#123; if (unmountFn) unmountFn(); &#125;);
&lt;/script&gt;

&lt;template&gt;
  &lt;div ref="container" class="sola-vue-wrapper" /&gt;
&lt;/template&gt;{:else if activeFramework === 'swift'}// SwiftUI Native iOS Host (SolaSwiftBridge)
import SwiftUI
import WebKit

struct SolaIncidentCardView: UIViewRepresentable &#123;
    let incidentId: String
    
    func makeUIView(context: Context) -&gt; WKWebView &#123;
        let webView = WKWebView()
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.loadHTMLString("&lt;div id='sola-root'&gt;&lt;/div&gt;&lt;script src='https://cdn.jsdelivr.net/npm/@sola/core'&gt;&lt;/script&gt;", baseURL: nil)
        return webView
    &#125;
    func updateUIView(_ uiView: WKWebView, context: Context) &#123;&#125;
&#125;{:else if activeFramework === 'html'}&lt;!-- Zero Framework Vanilla / Web Component Drop --&gt;
&lt;div id="sola-target"&gt;&lt;/div&gt;
&lt;script type="module"&gt;
  import &#123; mount &#125; from 'https://cdn.jsdelivr.net/npm/@sola/core@latest/dist/index.js';
  mount(document.getElementById('sola-target'), window.IncidentMatrix, &#123; incidentId: 'INC009481' &#125;);
&lt;/script&gt;{:else}&lt;script&gt;
  export let title = "Cluster Saturation";
  export let value = 84;
&lt;/script&gt;

&lt;div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-white"&gt;
  &lt;h3 class="text-xs font-mono font-bold text-slate-400"&gt;&#123;title&#125;&lt;/h3&gt;
  &lt;div class="text-3xl font-mono font-black text-amber-400 mt-2"&gt;&#123;value&#125;%&lt;/div&gt;
&lt;/div&gt;{/if}</code></pre>
    </div>

  </main>
</div>
