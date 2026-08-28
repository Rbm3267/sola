<script lang="ts">
  import DataCard from './DataCard.svelte';
  import DynamicForm from './DynamicForm.svelte';
  import ListBlock from './ListBlock.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import { onMount } from 'svelte';

  interface Scenario {
    id: string;
    tabLabel: string;
    prompt: string;
    components: Array<{
      type: 'DataCard' | 'DynamicForm' | 'ListBlock' | 'GaugeCard';
      config: any;
    }>;
  }

  const scenarios: Scenario[] = [
    {
      id: 'deployments',
      tabLabel: 'Active Deployments',
      prompt: 'List all active edge clusters with their health and latency',
      components: [
        {
          type: 'ListBlock',
          config: {
            title: 'Active Deployments',
            items: [
              { label: 'api-gateway-v3.2', description: 'us-east-1 • 2 min ago', status: 'Active' },
              { label: 'auth-service-v1.8', description: 'eu-west-2 • 14 min ago', status: 'Active' },
              { label: 'ml-pipeline-v0.9', description: 'us-west-2 • 1 hr ago • Latency optimal', status: 'Completed' }
            ]
          }
        }
      ]
    },
    {
      id: 'revenue',
      tabLabel: 'Enterprise ARR',
      prompt: 'Show enterprise revenue velocity and conversion rate',
      components: [
        {
          type: 'DataCard',
          config: {
            title: 'Enterprise ARR',
            value: '$1,840,000',
            trend: '+34.2% YoY',
            icon: 'trending-up'
          }
        },
        {
          type: 'GaugeCard',
          config: {
            title: 'SLA Compliance',
            value: '99.98%',
            percentage: 99,
            subtext: 'Target: >99.90%',
            color: 'emerald'
          }
        }
      ]
    },
    {
      id: 'latency',
      tabLabel: 'Edge Telemetry',
      prompt: 'Monitor edge CDN request volume and p99 global latency',
      components: [
        {
          type: 'DataCard',
          config: {
            title: 'Global Edge Requests',
            value: '42.8M / hr',
            trend: '+12.4% vs baseline',
            icon: 'activity'
          }
        },
        {
          type: 'GaugeCard',
          config: {
            title: 'p99 Global Latency',
            value: '18.4 ms',
            percentage: 92,
            subtext: 'Optimal Edge Routing',
            color: 'emerald'
          }
        }
      ]
    },
    {
      id: 'database',
      tabLabel: 'PostgreSQL Relay',
      prompt: 'Provision zero-knowledge database connection modal',
      components: [
        {
          type: 'DynamicForm',
          config: {
            title: 'Connect Managed Database',
            endpoint: '/api/database/connect',
            fields: [
              { name: 'db_host', label: 'Database Host URI', type: 'text', required: true },
              { name: 'db_name', label: 'Database Name', type: 'text', required: true }
            ]
          }
        }
      ]
    }
  ];

  let activeIndex = $state(0);
  let typedPrompt = $state(scenarios[0].prompt);
  let isResolving = $state(false);
  let isTyping = $state(false);
  let typingTimer: any = null;

  async function selectScenario(index: number) {
    if (index === activeIndex && !isResolving) return;
    if (typingTimer) clearTimeout(typingTimer);

    activeIndex = index;
    const targetPrompt = scenarios[index].prompt;
    
    // Clear and animate typing cleanly
    typedPrompt = "";
    isTyping = true;
    isResolving = false;

    let charIdx = 0;
    const typeStep = () => {
      if (charIdx <= targetPrompt.length) {
        typedPrompt = targetPrompt.slice(0, charIdx);
        charIdx++;
        typingTimer = setTimeout(typeStep, 20);
      } else {
        isTyping = false;
        isResolving = true;
        typingTimer = setTimeout(() => {
          isResolving = false;
        }, 400);
      }
    };

    typeStep();
  }

  let copied = $state(false);
  function copyCliCommand() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('npm create sola@latest');
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    }
  }
</script>

<!-- Centered, High-Impact Hero -->
<div class="flex flex-col items-center text-center max-w-4xl mx-auto pt-4 md:pt-8 pb-12 relative">

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
  <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-[-0.04em] leading-[1.05] mb-6 max-w-3xl">
    UI that synthesizes from <span class="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">intent</span>.
  </h1>

  <!-- Subheadline -->
  <p class="text-base sm:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed font-normal">
    The zero-VDOM ambient runtime for the agentic web. Single-file declarative components that compile natural language into fine-grained native DOM signals with 0 kB framework bloat.
  </p>

  <!-- CTA Buttons -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8 w-full sm:w-auto justify-center">
    <a 
      href="/demo" 
      style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
      class="px-8 py-4 rounded-2xl font-bold transition-all duration-200 shadow-[0_6px_24px_rgba(245,158,11,0.35)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 text-center text-[15px] flex items-center justify-center gap-2.5 cursor-pointer">
      <span class="text-white font-bold">Open Playground</span>
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </a>
    
    <!-- Interactive CLI Copy Box -->
    <div class="px-5 py-3.5 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md text-slate-800 font-mono text-sm flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all">
      <div class="flex items-center gap-2 select-all">
        <span class="text-amber-500 font-bold select-none">$</span>
        <span>npm create sola@latest</span>
      </div>
      <button 
        onclick={copyCliCommand}
        aria-label="Copy CLI command" 
        class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-sans font-semibold">
        {#if copied}
          <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="text-emerald-600 font-mono">Copied!</span>
        {:else}
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Micro Specs Line -->
  <div class="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-12">
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 3.2 kB Core</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 0 Dependencies</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Native AI Intent</span>
  </div>

  <!-- The Luxury Interactive Demo Studio -->
  <div class="w-full max-w-5xl mx-auto relative px-2 sm:px-4">
    
    <!-- Scenario Selection Tabs Bar -->
    <div class="flex items-center justify-start sm:justify-center gap-2 mb-4 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 px-1 select-none">
      {#each scenarios as sc, i}
        <button 
          onclick={() => selectScenario(i)}
          class="px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 {activeIndex === i ? 'bg-amber-500/10 text-amber-950 border border-amber-500/30 shadow-xs font-black' : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-white hover:text-slate-900'}">
          <span class="w-2 h-2 rounded-full {activeIndex === i ? 'bg-amber-500' : 'bg-slate-300'}"></span>
          <span>{sc.tabLabel}</span>
        </button>
      {/each}
    </div>

    <!-- Main Canvas Card -->
    <div class="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] overflow-hidden">
      
      <!-- Window Chrome Bar -->
      <div class="h-12 flex items-center px-5 gap-2 border-b border-slate-100 bg-slate-50/70">
        <div class="w-3 h-3 rounded-full bg-red-300/80"></div>
        <div class="w-3 h-3 rounded-full bg-amber-300/80"></div>
        <div class="w-3 h-3 rounded-full bg-green-300/80"></div>
        <div class="flex-1 flex justify-center">
          <div class="text-[11px] font-mono text-slate-400 tracking-wider font-medium bg-slate-100/80 px-4 py-1 rounded-full border border-slate-200/60">sola-playground</div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="p-6 md:p-10">
        
        <!-- Prompt Input Bar -->
        <div class="flex items-center gap-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl px-5 py-4 mb-8 transition-all duration-300 {isTyping ? 'border-amber-300 shadow-[0_0_0_3px_rgba(245,158,11,0.1)]' : ''}">
          <div class="shrink-0">
            {#if isResolving}
              <div class="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            {:else}
              <svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
            {/if}
          </div>
          <div class="flex-1 text-left text-[15px] font-medium text-slate-800 min-h-[24px]">
            {typedPrompt}
            {#if isTyping}
              <span class="inline-block w-[2px] h-5 bg-amber-500 ml-0.5 align-middle animate-pulse rounded-full"></span>
            {/if}
          </div>
          {#if isResolving}
            <div class="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
              Compiling...
            </div>
          {/if}
        </div>

        <!-- Rendered Surface Area -->
        <div class="min-h-[220px] relative flex items-center justify-center">
          {#if isTyping}
            <!-- Clean Typing State -->
            <div class="w-full flex flex-col items-center justify-center min-h-[220px] p-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/40 text-center">
              <div class="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Listening to intent stream...</span>
              </div>
            </div>
          {:else if isResolving}
            <!-- Compiling State -->
            <div class="w-full flex flex-col items-center justify-center min-h-[220px] gap-3">
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
