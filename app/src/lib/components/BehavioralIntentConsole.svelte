<script lang="ts">
  import { behavioralObserver, type BehavioralMetrics } from '../../../../packages/behavior/src/index';
  import IncidentTriageMatrix from './IncidentTriageMatrix.svelte';
  import FlowWaterfall from './FlowWaterfall.svelte';
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  let metrics = $state<BehavioralMetrics>({
    typingVelocityCps: 0,
    activeDwellTarget: null,
    dwellDurationMs: 0,
    rageClickCount: 0,
    persona: 'visual_explorer',
    densityMode: 'comfortable'
  });

  let testInput = $state('');
  let unfoldedDrawer = $state<string | null>(null);
  let emergencyAlert = $state(false);

  onMount(() => {
    return behavioralObserver.subscribe((m) => {
      metrics = m;
    });
  });

  function handleTyping() {
    behavioralObserver.registerKeyStroke();
  }

  function handleHoverStart(target: string) {
    behavioralObserver.registerHoverStart(target, () => {
      unfoldedDrawer = target;
    }, 1000);
  }

  function handleHoverEnd(target: string) {
    behavioralObserver.registerHoverEnd(target);
  }

  function handleNodeClick(target: string) {
    behavioralObserver.registerClick(target, () => {
      emergencyAlert = true;
    });
  }

  function resetState() {
    behavioralObserver.resetUrgency();
    unfoldedDrawer = null;
    emergencyAlert = false;
    testInput = '';
  }
</script>

<div class="w-full flex flex-col gap-6">
  
  <!-- Top Behavioral Vector Telemetry HUD -->
  <div class="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
    
    <!-- Ambient Persona Glow -->
    <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none {metrics.persona === 'sre_commander' ? 'bg-rose-500' : metrics.persona === 'finops_auditor' ? 'bg-violet-500' : 'bg-emerald-500'}"></div>

    <div class="flex items-center gap-4 relative z-10">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg {metrics.persona === 'sre_commander' ? 'bg-gradient-to-br from-rose-500 to-amber-600' : metrics.persona === 'finops_auditor' ? 'bg-gradient-to-br from-violet-600 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono uppercase tracking-widest text-slate-400">Detected User Persona:</span>
          <span class="text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-full border {metrics.persona === 'sre_commander' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : metrics.persona === 'finops_auditor' ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}">
            {metrics.persona === 'sre_commander' ? 'SRE Incident Commander' : metrics.persona === 'finops_auditor' ? 'FinOps Cloud Auditor' : 'Visual Explorer'}
          </span>
        </div>
        <h3 class="text-lg font-black font-sans mt-0.5 text-slate-100">
          Behavioral Intent Engine (@sola/behavior)
        </h3>
      </div>
    </div>

    <!-- Live Telemetry Readout Chips -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto relative z-10 font-mono text-xs">
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
        <span class="text-[10px] text-slate-500 uppercase">Typing Speed</span>
        <span class="text-amber-400 font-bold">{metrics.typingVelocityCps} chars/sec</span>
      </div>
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
        <span class="text-[10px] text-slate-500 uppercase">Hover Dwell</span>
        <span class="text-sky-400 font-bold">{metrics.activeDwellTarget ? `${metrics.activeDwellTarget} (Active)` : 'None'}</span>
      </div>
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
        <span class="text-[10px] text-slate-500 uppercase">Rage Click Vector</span>
        <span class="{metrics.rageClickCount >= 2 ? 'text-rose-400 font-black animate-pulse' : 'text-slate-400'}">{metrics.rageClickCount} Clicks / 600ms</span>
      </div>
    </div>

  </div>

  <!-- Interactive Test Playground Bar -->
  <div class="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex-1 w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-amber-400 focus-within:bg-white transition-all">
      <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      <input 
        type="text"
        bind:value={testInput}
        oninput={handleTyping}
        placeholder="Type rapidly here to trigger Power SRE Compact density mode..."
        class="w-full bg-transparent text-xs sm:text-sm font-mono text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
    
    <div class="flex items-center gap-2 shrink-0">
      <button 
        onclick={resetState}
        class="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">
        Reset Vectors
      </button>
    </div>
  </div>

  <!-- Emergency Escalation Banner -->
  {#if emergencyAlert}
    <div 
      transition:fly={{ y: -10, duration: 200 }}
      class="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
        <div>
          <div class="text-sm font-black text-rose-950 font-mono">Urgency Vector Escalated • Anomaly Under Investigation</div>
          <div class="text-xs text-rose-700 font-mono mt-0.5">Sola auto-surfaced 1-click mitigation playbooks due to rapid user clicks.</div>
        </div>
      </div>
      <button 
        onclick={() => alert("Mitigation Playbook Executed: Traffic Rerouted to eu-central-1")}
        class="px-4 py-2 rounded-xl bg-rose-600 text-white font-mono text-xs font-bold hover:bg-rose-700 shadow-sm cursor-pointer whitespace-nowrap">
        Execute Route53 Failover
      </button>
    </div>
  {/if}

  <!-- Adaptive Surface Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    
    <!-- Column 1: Anomaly Hover Target -->
    <div class="lg:col-span-6 flex flex-col gap-4">
      
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onmouseenter={() => handleHoverStart('incident')}
        onmouseleave={() => handleHoverEnd('incident')}
        class="relative group cursor-pointer transition-all">
        
        <div class="absolute -top-3 left-4 z-20 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold shadow-sm flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Hover Dwell Target (>1.0s to Unfold)</span>
        </div>

        <IncidentTriageMatrix config={{
          incidentId: "INC009481",
          title: "API Gateway Ingress Spike (EU-West)",
          severity: "P1 - Critical",
          slaRemainingMin: 8,
          blastRadius: "42,000 Active Checkout Sessions",
          playbooks: [
            { id: "pb-1", title: "Reroute Edge DNS", action: "Route53 Failover", automated: true },
            { id: "pb-2", title: "Scale Redis Replicas (x4)", action: "Auto-Provision", automated: true }
          ]
        }} />
      </div>

      <!-- Unfolded Drilldown Drawer (Progressive Disclosure) -->
      {#if unfoldedDrawer === 'incident' || metrics.persona === 'sre_commander'}
        <div 
          transition:fly={{ y: 15, duration: 250 }}
          class="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col gap-3 font-mono text-xs">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-amber-400 font-bold">Implicit Drill-Down: Root Cause Trace</span>
            <span class="text-[10px] text-slate-400">Triggered by Dwell / Persona</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Correlated spike with deployment <code class="text-emerald-400 font-bold">v2.4.19-edge</code> in Frankfurt. 38% connection saturation on primary write replica.
          </p>
        </div>
      {/if}

    </div>

    <!-- Column 2: Rage Click Target & FinOps Affinity Target -->
    <div class="lg:col-span-6 flex flex-col gap-6">
      
      <!-- Rage Click Target -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onclick={() => handleNodeClick('degraded-node')}
        class="relative group cursor-pointer transition-all">
        
        <div class="absolute -top-3 left-4 z-20 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold shadow-sm flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>Rage-Click Target (Tap 3x rapidly)</span>
        </div>

        <GaugeCard config={{
          title: "Edge Worker Saturation",
          value: "94.2%",
          percentage: 94,
          subtext: "Click rapidly to simulate operator urgency",
          color: "amber"
        }} />
      </div>

      <!-- FinOps Hover Target -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onmouseenter={() => handleHoverStart('finops')}
        onmouseleave={() => handleHoverEnd('finops')}
        class="relative group cursor-pointer transition-all">
        
        <div class="absolute -top-3 left-4 z-20 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold shadow-sm flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
          <span>Domain Interest Target (FinOps)</span>
        </div>

        <FlowWaterfall config={{
          title: "SaaS Gross Revenue Realization",
          subtitle: "Hover to expand financial deduction model",
          steps: [
            { label: "Gross ARR Billing", amount: "$184,200", type: "positive", note: "Tier 1 Enterprise Subscriptions" },
            { label: "Payment Gateway Fees", amount: "-$5,340", type: "negative", note: "2.9% Stripe processing" },
            { label: "Net Bank Realization", amount: "$178,860", type: "subtotal", note: "Clearing to corporate treasury" }
          ]
        }} />
      </div>

    </div>

  </div>

</div>
