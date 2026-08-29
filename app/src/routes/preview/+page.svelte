<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import ClusterMatrix from '$lib/components/ClusterMatrix.svelte';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';

  let currentStep = $state(1);
  let isInjected = $state(false);
  let selectedWidget = $state<'triage' | 'dial' | 'waterfall' | 'cluster'>('triage');
  let isExtensionDetected = $state(false);
  let hostTheme = $state<'dark' | 'light'>('dark');

  // Simulated Host Metrics that Sola interacts with
  let mauCount = $state('1.24M');
  let revenue = $state('$842.1K');
  let errorRate = $state('2.4%');
  let activeNodes = $state(32);

  // Listen for real Chrome Extension message events
  onMount(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'SOLA_EXTENSION_CONNECTED') {
        isExtensionDetected = true;
      }
      if (event.data && (event.data.type === 'SOLA_INJECT_HUD' || event.data.type === 'SOLA_MOUNT_IN_SITU')) {
        isInjected = true;
        if (event.data.template) {
          selectedWidget = event.data.template;
        }
      }
      if (event.data && event.data.type === 'SOLA_EJECT_HUD') {
        isInjected = false;
      }
    }

    window.addEventListener('message', handleMessage);
    // Announce presence to any active extension content script
    window.postMessage({ type: 'SOLA_HOST_PAGE_READY' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  function toggleInjection() {
    isInjected = !isInjected;
    if (typeof window !== 'undefined') {
      window.postMessage({ type: isInjected ? 'SOLA_INJECT_HUD' : 'SOLA_EJECT_HUD' }, '*');
    }
  }
</script>

<svelte:head>
  <title>Live Browser Overlay Preview - Sola</title>
</svelte:head>

<div class="min-h-screen bg-[#fafafa] dark:bg-[#090d19] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full transition-colors duration-200">
  <Navbar />

  <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-12 lg:gap-16">
    
    <!-- Hero Section -->
    <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
      
      <!-- Text Content -->
      <div class="flex-1 flex flex-col items-start text-left max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-mono text-xs font-bold mb-4 shadow-2xs">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Manifest V3 • Shadow DOM Isolation</span>
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-5">
          Live Browser Overlay on any <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Active Web App</span>.
        </h1>
        
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          The Sola Chrome Extension uses zero-VDOM native Shadow DOM encapsulation to mount reactive UI components, 
          telemetry gauges, and action triggers on top of any SaaS platform (ServiceNow, Stripe, Jira, or internal dashboards) without modifying host source code.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
          <a 
            href="https://chromewebstore.google.com/detail/sola-intent-runtime" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            <span>Add to Chrome (Web Store)</span>
          </a>
          <a 
            href="https://github.com/Rbm3267/sola/tree/main/packages/sola-extension" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>View Source (GitHub)</span>
          </a>
        </div>
      </div>

      <!-- Interactive 3-Step Guide -->
      <div class="flex-1 w-full max-w-lg">
        <div class="bg-white dark:bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl p-6 relative overflow-hidden">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 uppercase tracking-wider">How It Works</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20">3 Steps</span>
          </div>
          
          <div class="space-y-3">
            <!-- Step 1 -->
            <button onclick={() => currentStep = 1} class="w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all border {currentStep === 1 ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'} cursor-pointer">
              <div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 {currentStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">1</div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-xs">Install from Chrome Store</h4>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">Adds the Manifest V3 client runtime to your browser with isolated sandbox permissions.</p>
              </div>
            </button>
            
            <!-- Step 2 -->
            <button onclick={() => currentStep = 2} class="w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all border {currentStep === 2 ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'} cursor-pointer">
              <div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 {currentStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">2</div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-xs">Navigate to Any Web Page</h4>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">Open your target localhost app, ServiceNow instance, or cloud platform dashboard.</p>
              </div>
            </button>
            
            <!-- Step 3 -->
            <button onclick={() => currentStep = 3} class="w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all border {currentStep === 3 ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'} cursor-pointer">
              <div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 {currentStep === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">3</div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-xs">Mount Isolated Shadow DOM</h4>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">Click the Sola icon or trigger via postMessage to inject zero-VDOM components in real time.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Testing Ground & In-Situ Simulator -->
    <div class="flex flex-col gap-6 pt-4 border-t border-slate-900/[0.03] dark:border-white/[0.04]">
      
      <div class="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 text-xs font-mono font-bold mb-2 border border-amber-200 dark:border-amber-500/20">
            <span>Live Interactive Sandbox</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Interactive Extension Sandbox
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Test the live Shadow DOM injection right now in your browser. Toggle the injection switch below to see Sola overlay widgets into the host application.
          </p>
        </div>

        <!-- Simulator Toolbar -->
        <div class="flex flex-wrap items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
          <!-- Widget Selector -->
          <div class="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-xs font-mono">
            <button 
              onclick={() => selectedWidget = 'triage'}
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold {selectedWidget === 'triage' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}">
              Triage
            </button>
            <button 
              onclick={() => selectedWidget = 'dial'}
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold {selectedWidget === 'dial' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}">
              Dial
            </button>
            <button 
              onclick={() => selectedWidget = 'waterfall'}
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold {selectedWidget === 'waterfall' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}">
              Waterfall
            </button>
            <button 
              onclick={() => selectedWidget = 'cluster'}
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold {selectedWidget === 'cluster' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}">
              Cluster
            </button>
          </div>

          <!-- Main Inject Toggle Button -->
          <button 
            onclick={toggleInjection}
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm {isInjected ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'}">
            <svg class="w-4 h-4 {isInjected ? '' : 'animate-spin'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>{isInjected ? 'Eject Sola Overlay' : 'Inject Sola Overlay'}</span>
          </button>
        </div>
      </div>

      <!-- Simulated Host Web Application Frame -->
      <div class="relative bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl overflow-hidden min-h-[550px] flex flex-col">
        
        <!-- Host App Header -->
        <div class="h-14 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50 dark:bg-[#090d19]">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">App</div>
            <div>
              <span class="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Host Cloud Dashboard</span>
              <span class="ml-2 text-[10px] font-mono text-slate-400">production-cluster.internal</span>
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs font-mono">
            {#if isInjected}
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold animate-pulse">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Shadow DOM Active (0.1ms)</span>
              </div>
            {:else}
              <span class="text-slate-400 text-[11px]">Clean Host DOM</span>
            {/if}
          </div>
        </div>

        <!-- Host App Body -->
        <div class="flex-1 p-6 sm:p-8 bg-slate-100/60 dark:bg-[#0b1021] relative flex flex-col gap-6">
          
          <!-- Host Base Metrics Row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-2xs">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Monthly Active Users</span>
              <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{mauCount}</div>
            </div>
            <div class="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-2xs">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Platform MRR</span>
              <div class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{revenue}</div>
            </div>
            <div class="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-2xs">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Edge Error Rate</span>
              <div class="text-2xl font-black text-rose-500 font-mono mt-1">{errorRate}</div>
            </div>
          </div>

          <!-- The Injection Target Container (Shadow DOM Host) -->
          <div class="flex-1 min-h-[360px] rounded-2xl border {isInjected ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-dashed border-slate-300 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]'} p-6 transition-all duration-300 relative flex flex-col justify-center">
            
            {#if isInjected}
              <div in:fade={{ duration: 200 }} class="w-full space-y-4">
                <!-- Sola Injected Shadow DOM Banner -->
                <div class="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Sola Ambient HUD Overlay ({selectedWidget})
                    </span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400">Isolated CSS • Zero VDOM Diff</span>
                </div>

                <!-- Dynamic Mounted Sola Widget -->
                {#if selectedWidget === 'triage'}
                  <IncidentTriageMatrix config={{
                    title: "Host Cluster Incident Radar",
                    description: "P1 triage resolution staging directly over host DOM",
                    incidents: [
                      { id: "INC-9021", service: "Auth Token Service", severity: "P1", status: "Investigating", latency: "340ms" },
                      { id: "INC-9024", service: "PostgreSQL Primary Pool", severity: "P2", status: "Mitigating", latency: "42ms" }
                    ]
                  }} />
                {:else if selectedWidget === 'dial'}
                  <TactileDialCard config={{
                    title: "Node Capacity Throttle",
                    metric: `${activeNodes} Nodes`,
                    min: 8,
                    max: 128,
                    currentValue: activeNodes,
                    unit: "Cluster Capacity"
                  }} />
                {:else if selectedWidget === 'waterfall'}
                  <FlowWaterfall config={{
                    title: "Live FinOps Realization Flow",
                    steps: [
                      { name: "Gross Ingress Revenue", value: 842100, type: "positive" },
                      { name: "Compute & Egress Costs", value: -128400, type: "negative" },
                      { name: "Sola Zero-VDOM Savings", value: 18400, type: "positive" },
                      { name: "Net Sovereign Margin", value: 732100, type: "total" }
                    ]
                  }} />
                {:else if selectedWidget === 'cluster'}
                  <ClusterMatrix config={{
                    title: "Multi-Region Topology Matrix",
                    clusters: [
                      { name: "us-east-1a", status: "healthy", load: "42%", p99: "12ms" },
                      { name: "eu-west-1b", status: "healthy", load: "68%", p99: "18ms" },
                      { name: "ap-southeast-1", status: "degraded", load: "91%", p99: "142ms" }
                    ]
                  }} />
                {/if}
              </div>
            {:else}
              <div in:fade={{ duration: 150 }} class="flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-2xs">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-1">Ready for Overlay Injection</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Click the <strong>Inject Sola Overlay</strong> button above to mount live Sola widgets directly into this mock host application view.
                </p>
                <button 
                  onclick={toggleInjection}
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md">
                  Simulate Live Injection
                </button>
              </div>
            {/if}

          </div>

        </div>
      </div>

    </div>

  </main>
</div>
