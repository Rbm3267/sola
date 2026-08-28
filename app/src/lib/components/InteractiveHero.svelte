<script lang="ts">
  import { onMount } from 'svelte';
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import DynamicForm from './DynamicForm.svelte';
  import ListBlock from './ListBlock.svelte';

  const scenarios = [
    {
      id: 'deployments',
      tabLabel: 'Active Deployments',
      prompt: 'Show active deployment cluster in us-east-1 and p99 latency',
      components: [
        {
          type: 'DataCard',
          config: {
            title: 'Cluster Status',
            value: 'Healthy (32 Nodes)',
            trend: '+4 nodes provisioned',
            icon: 'check-circle'
          }
        },
        {
          type: 'GaugeCard',
          config: {
            title: 'p99 Ingress Latency',
            value: '14.2ms',
            percentage: 86,
            subtext: 'Global edge median: 18ms',
            color: 'emerald'
          }
        }
      ]
    },
    {
      id: 'arr',
      tabLabel: 'Enterprise ARR',
      prompt: 'Show enterprise monthly recurring revenue and expansion rate',
      components: [
        {
          type: 'DataCard',
          config: {
            title: 'Monthly Recurring Revenue',
            value: '$184,200',
            trend: '+24.8% vs last month',
            icon: 'trending-up'
          }
        },
        {
          type: 'DataCard',
          config: {
            title: 'Net Revenue Retention',
            value: '138%',
            trend: '+6.2% expansion',
            icon: 'activity'
          }
        }
      ]
    },
    {
      id: 'telemetry',
      tabLabel: 'Edge Telemetry',
      prompt: 'Display real-time memory pressure and active worker threads',
      components: [
        {
          type: 'GaugeCard',
          config: {
            title: 'Memory Utilization',
            value: '78.4%',
            percentage: 78,
            subtext: 'Auto-balanced across AZs',
            color: 'amber'
          }
        },
        {
          type: 'ListBlock',
          config: {
            title: 'Top Ingress Nodes',
            items: [
              { label: 'edge-iad-01', description: '2.4 GB/s • 4.1ms p99', status: 'Active' },
              { label: 'edge-lhr-02', description: '1.8 GB/s • 3.8ms p99', status: 'Active' },
              { label: 'edge-nrt-01', description: '940 MB/s • Synchronized', status: 'Completed' }
            ]
          }
        }
      ]
    },
    {
      id: 'postgres',
      tabLabel: 'PostgreSQL Relay',
      prompt: 'Connect to live database relay and show active connections',
      components: [
        {
          type: 'DataCard',
          config: {
            title: 'Active DB Pool Connections',
            value: '42 / 100',
            trend: 'Pool saturation: 42%',
            icon: 'activity'
          }
        },
        {
          type: 'DynamicForm',
          config: {
            title: 'Scale Connection Pool',
            endpoint: '/api/pool',
            fields: [
              { name: 'maxPool', type: 'number', label: 'Max Connections (e.g. 150)', required: true },
              { name: 'idleTimeout', type: 'number', label: 'Idle Timeout (ms)', required: true }
            ]
          }
        }
      ]
    }
  ];

  let activeIndex = $state(0);
  let typedPrompt = $state(scenarios[0].prompt);
  let isTyping = $state(false);
  let isResolving = $state(false);
  let copied = $state(false);

  let typingTimeout: any = null;
  let resolveTimeout: any = null;

  function selectScenario(index: number) {
    if (activeIndex === index && !isTyping && !isResolving) return;

    if (typingTimeout) clearTimeout(typingTimeout);
    if (resolveTimeout) clearTimeout(resolveTimeout);

    activeIndex = index;
    const targetPrompt = scenarios[index].prompt;
    typedPrompt = '';
    isTyping = true;
    isResolving = false;

    let charIdx = 0;
    const speed = 14;

    function typeNextChar() {
      if (charIdx < targetPrompt.length) {
        typedPrompt = targetPrompt.slice(0, charIdx + 1);
        charIdx++;
        typingTimeout = setTimeout(typeNextChar, speed);
      } else {
        isTyping = false;
        isResolving = true;
        resolveTimeout = setTimeout(() => {
          isResolving = false;
        }, 650);
      }
    }

    typeNextChar();
  }

  function copyCliCommand() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('npm create sola@latest');
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    }
  }
</script>

<!-- Centered, High-Impact Hero -->
<div class="flex flex-col items-center text-center max-w-4xl mx-auto pt-4 md:pt-8 pb-12 relative w-full max-w-full overflow-x-hidden">

  <!-- Floating Announcement Pill -->
  <a href="https://github.com/Rbm3267/sola" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8 hover:border-amber-300 hover:shadow-[0_4px_12px_rgba(245,158,11,0.1)] transition-all duration-200 group cursor-pointer text-decoration-none">
    <span class="flex h-2 w-2 relative">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
    </span>
    <span class="text-xs font-mono font-bold text-slate-800 tracking-tight">Sola v0.9 • Zero-VDOM Intent Runtime</span>
    <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  </a>

  <!-- Main Headline -->
  <h1 class="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-[-0.04em] leading-[1.08] mb-6 max-w-3xl px-2">
    UI that synthesizes from <span class="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">intent</span>.
  </h1>

  <!-- Subheadline -->
  <p class="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-normal px-2">
    The zero-VDOM ambient runtime for the agentic web. Single-file declarative components that compile natural language into fine-grained native DOM signals with 0 kB framework bloat.
  </p>

  <!-- CTA Buttons -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8 w-full sm:w-auto justify-center px-4">
    <a 
      href="/demo" 
      style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
      class="px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 text-center text-xs flex items-center justify-center gap-2 cursor-pointer">
      <span class="text-white">Open Playground</span>
      <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </a>
    
    <!-- Interactive CLI Copy Box -->
    <div class="px-5 py-2.5 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-md text-slate-800 font-mono text-xs flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all">
      <div class="flex items-center gap-2 select-all">
        <span class="text-amber-500 font-semibold select-none">$</span>
        <span>npm create sola@latest</span>
      </div>
      <button 
        onclick={copyCliCommand}
        aria-label="Copy CLI command" 
        class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-full transition-all cursor-pointer flex items-center gap-1 text-[10px] font-sans font-medium">
        {#if copied}
          <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="text-emerald-600 font-mono">Copied!</span>
        {:else}
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Micro Specs Line -->
  <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-semibold text-slate-500 mb-10 sm:mb-12 px-2">
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 3.2 kB Core</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 0 Dependencies</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Native Intent AST</span>
  </div>

  <!-- The Luxury Interactive Demo Studio -->
  <div class="w-full max-w-5xl mx-auto relative px-2 sm:px-4 overflow-hidden">
    
    <!-- Scenario Selection Tabs Bar -->
    <div class="flex items-center justify-start sm:justify-center gap-2 mb-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 px-1 select-none max-w-full">
      {#each scenarios as sc, i}
        <button 
          onclick={() => selectScenario(i)}
          class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 {activeIndex === i ? 'bg-amber-500/10 text-amber-950 border border-amber-500/30 shadow-xs' : 'bg-white/80 text-slate-500 border border-slate-200/80 hover:bg-white hover:text-slate-800'}">
          <span class="w-1.5 h-1.5 rounded-full {activeIndex === i ? 'bg-amber-500' : 'bg-slate-300'}"></span>
          <span>{sc.tabLabel}</span>
        </button>
      {/each}
    </div>

    <!-- Main Canvas Card -->
    <div class="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] overflow-hidden w-full max-w-full">
      
      <!-- Window Chrome Bar -->
      <div class="h-10 sm:h-12 flex items-center px-4 sm:px-5 gap-2 border-b border-slate-100 bg-slate-50/70">
        <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-300/80"></div>
        <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-300/80"></div>
        <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-300/80"></div>
        <div class="flex-1 flex justify-center">
          <div class="text-[10px] sm:text-[11px] font-mono text-slate-400 tracking-wider font-medium bg-slate-100/80 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full border border-slate-200/60">sola-playground</div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="p-4 sm:p-6 md:p-10">
        
        <!-- Prompt Input Bar -->
        <div class="flex items-center gap-2.5 sm:gap-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl px-3.5 sm:px-5 py-3 sm:py-4 mb-6 sm:mb-8 transition-all duration-300 {isTyping ? 'border-amber-300 shadow-[0_0_0_3px_rgba(245,158,11,0.1)]' : ''}">
          <div class="shrink-0">
            {#if isResolving}
              <div class="w-4 h-4 sm:w-5 sm:h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            {:else}
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            {/if}
          </div>
          <div class="flex-1 text-left text-xs sm:text-[15px] font-medium text-slate-800 min-h-[20px] sm:min-h-[24px] truncate">
            {typedPrompt}
            {#if isTyping}
              <span class="inline-block w-[2px] h-4 sm:h-5 bg-amber-500 ml-0.5 align-middle animate-pulse rounded-full"></span>
            {/if}
          </div>
          {#if isResolving}
            <div class="text-[10px] sm:text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-amber-200 shrink-0">
              Compiling...
            </div>
          {/if}
        </div>

        <!-- Rendered Surface Area -->
        <div class="min-h-[200px] sm:min-h-[220px] relative flex items-center justify-center">
          {#if isTyping}
            <!-- Clean Typing State -->
            <div class="w-full flex flex-col items-center justify-center min-h-[200px] sm:min-h-[220px] p-6 sm:p-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/40 text-center">
              <div class="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Listening to intent stream...</span>
              </div>
            </div>
          {:else if isResolving}
            <!-- Compiling State -->
            <div class="w-full flex flex-col items-center justify-center min-h-[200px] sm:min-h-[220px] gap-3">
              <div class="flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold shadow-xs">
                <div class="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Synthesizing zero-VDOM components...</span>
              </div>
            </div>
          {:else}
            <!-- Rendered Active Scenario Components -->
            <div class="w-full grid gap-4 {scenarios[activeIndex].components.length > 1 ? 'md:grid-cols-2' : ''}">
              {#each scenarios[activeIndex].components as comp}
                <div class="animate-in w-full text-left">
                  {#if comp.type === 'DataCard'}
                    <DataCard config={comp.config} />
                  {:else if comp.type === 'GaugeCard'}
                    <GaugeCard config={comp.config} />
                  {:else if comp.type === 'DynamicForm'}
                    <DynamicForm config={comp.config} onSubmit={() => {}} />
                  {:else if comp.type === 'ListBlock'}
                    <ListBlock config={comp.config} />
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>

      </div>
    </div>
  </div>
</div>

<style>
  @keyframes animate-in-keyframes {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-in {
    animation: animate-in-keyframes 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
