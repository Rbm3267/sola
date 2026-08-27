<script lang="ts">
  import { onMount } from 'svelte';
  import DataCard from './DataCard.svelte';
  import DynamicForm from './DynamicForm.svelte';
  import ListBlock from './ListBlock.svelte';

  const scenarios = [
    {
      prompt: "Show Q3 revenue and churn rate for enterprise tier",
      components: [
        {
          type: "DataCard",
          config: { title: "Enterprise MRR", value: "$2.4M", trend: "+18.3%", icon: "trending-up" }
        },
        {
          type: "DataCard", 
          config: { title: "Churn Rate", value: "1.2%", trend: "-0.4%", icon: "check-circle" }
        }
      ]
    },
    {
      prompt: "Build an onboarding form for new engineering hires",
      components: [
        {
          type: "DynamicForm",
          config: {
            title: "Engineering Onboarding",
            endpoint: "/api/onboard",
            fields: [
              { name: "name", type: "text", label: "Full Name", required: true },
              { name: "team", type: "text", label: "Team Assignment", required: true },
              { name: "level", type: "text", label: "Engineering Level", required: true }
            ]
          }
        }
      ]
    },
    {
      prompt: "List all active deployments with their status",
      components: [
        {
          type: "ListBlock",
          config: {
            title: "Active Deployments",
            items: [
              { label: "api-gateway-v3.2", description: "us-east-1 • 2 min ago", status: "Healthy" },
              { label: "auth-service-v1.8", description: "eu-west-2 • 14 min ago", status: "Healthy" },
              { label: "ml-pipeline-v0.9", description: "us-west-2 • 1 hr ago", status: "Degraded" }
            ]
          }
        }
      ]
    }
  ];

  let currentIndex = $state(0);
  let typedText = $state("");
  let phase = $state<'idle' | 'typing' | 'resolving' | 'rendered'>('idle');
  let visibleComponents = $state(0);

  onMount(() => {
    runLoop();
  });

  async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function runLoop() {
    while (true) {
      const scenario = scenarios[currentIndex];
      
      // Reset
      typedText = "";
      phase = 'idle';
      visibleComponents = 0;
      await sleep(800);

      // Type
      phase = 'typing';
      for (let i = 0; i <= scenario.prompt.length; i++) {
        typedText = scenario.prompt.substring(0, i);
        await sleep(30 + Math.random() * 25);
      }

      // Resolve
      phase = 'resolving';
      await sleep(900);

      // Render components one by one
      phase = 'rendered';
      for (let i = 0; i < scenario.components.length; i++) {
        visibleComponents = i + 1;
        await sleep(400);
      }

      await sleep(4500);
      currentIndex = (currentIndex + 1) % scenarios.length;
    }
  }
</script>

<!-- Centered, High-Impact Hero -->
<div class="flex flex-col items-center text-center max-w-4xl mx-auto pt-4 md:pt-8 pb-12 relative">

  <!-- Floating Announcement Pill -->
  <a href="https://github.com/Rbm3267/sola" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-8 hover:border-sky-300 hover:shadow-[0_4px_12px_rgba(14,165,233,0.1)] transition-all duration-200 group cursor-pointer text-decoration-none">
    <span class="flex h-2 w-2 relative">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span class="text-xs font-semibold text-slate-700 group-hover:text-slate-950 transition-colors">Introducing Sola v0.2.0 • The Ambient Runtime</span>
    <svg class="w-3 h-3 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  </a>

  <!-- Headline -->
  <h1 class="text-5xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] mb-6">
    Software that <br />
    <span class="bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 bg-clip-text text-transparent drop-shadow-xs">builds itself.</span>
  </h1>

  <!-- Subheading -->
  <p class="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
    Sola compiles <code class="text-[14px] font-semibold font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">.sola</code> components into zero-dependency DOM. 
    Native <code class="text-[14px] font-semibold font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200/60">$intent</code> signals resolve generative UI at the framework level.
  </p>

  <!-- CTA Row -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8 w-full sm:w-auto justify-center">
    <a href="/demo" class="bg-slate-950 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all duration-150 shadow-[0_4px_16px_rgba(15,23,42,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 text-center text-[15px] flex items-center justify-center gap-2">
      <span>Try the Playground</span>
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </a>
    
    <!-- Interactive CLI Copy Box -->
    <div class="px-5 py-3.5 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md text-slate-700 font-mono text-sm flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all">
      <div class="flex items-center gap-2 select-all">
        <span class="text-sky-500 font-bold select-none">$</span>
        <span>npm create sola@latest</span>
      </div>
      <button 
        onclick={copyCliCommand}
        aria-label="Copy CLI command" 
        class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-sans font-semibold">
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
  <div class="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-16">
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> 3.2 kB Core</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-violet-400"></span> 0 Dependencies</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Native AI Intent</span>
  </div></div>

  <!-- The Demo Canvas -->
  <div class="w-full max-w-5xl mx-auto relative px-4">
    
    <!-- Ambient glow behind canvas -->
    <div class="absolute -inset-8 bg-gradient-to-br from-sky-200/30 via-blue-100/20 to-violet-200/30 blur-[60px] rounded-[40px] pointer-events-none"></div>
    
    <!-- Main canvas -->
    <div class="relative bg-white/80 backdrop-blur-2xl border border-slate-200/70 rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden">
      
      <!-- Window chrome -->
      <div class="h-12 flex items-center px-5 gap-2 border-b border-slate-100 bg-slate-50/60">
        <div class="w-3 h-3 rounded-full bg-red-300/80"></div>
        <div class="w-3 h-3 rounded-full bg-amber-300/80"></div>
        <div class="w-3 h-3 rounded-full bg-green-300/80"></div>
        <div class="flex-1 flex justify-center">
          <div class="text-[11px] font-mono text-slate-400 tracking-wider font-medium bg-slate-100/80 px-4 py-1 rounded-md">sola-playground</div>
        </div>
      </div>

      <!-- Content area -->
      <div class="p-6 md:p-10">
        
        <!-- Prompt input bar -->
        <div class="flex items-center gap-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl px-5 py-4 mb-8 transition-all duration-300 {phase === 'typing' ? 'border-sky-300 shadow-[0_0_0_3px_rgba(14,165,233,0.08)]' : ''}">
          <div class="shrink-0">
            {#if phase === 'resolving'}
              <svg class="w-5 h-5 text-sky-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"/></svg>
            {:else}
              <svg class="w-5 h-5 {phase === 'typing' ? 'text-sky-500' : 'text-slate-400'} transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
            {/if}
          </div>
          <div class="flex-1 text-left text-[15px] font-medium text-slate-700 min-h-[24px]">
            {#if typedText}
              {typedText}
            {:else}
              <span class="text-slate-400">Describe what you need...</span>
            {/if}
            {#if phase === 'typing'}
              <span class="inline-block w-[2px] h-5 bg-sky-500 ml-0.5 align-middle animate-pulse rounded-full"></span>
            {/if}
          </div>
          {#if phase === 'resolving'}
            <div class="text-xs font-semibold text-sky-500 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 shrink-0 animate-pulse">
              Resolving intent...
            </div>
          {/if}
        </div>

        <!-- Rendered output -->
        <div class="min-h-[220px] relative">
          {#if phase === 'rendered' && visibleComponents > 0}
            <div class="grid gap-4 {scenarios[currentIndex].components.length > 1 ? 'md:grid-cols-2' : ''}">
              {#each scenarios[currentIndex].components as comp, i}
                {#if i < visibleComponents}
                  <div class="animate-in" style="animation-delay: {i * 100}ms">
                    {#if comp.type === 'DataCard'}
                      <DataCard config={comp.config} />
                    {:else if comp.type === 'DynamicForm'}
                      <DynamicForm config={comp.config} onSubmit={() => {}} />
                    {:else if comp.type === 'ListBlock'}
                      <ListBlock config={comp.config} />
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          {:else if phase === 'resolving'}
            <div class="flex flex-col items-center justify-center h-[220px] gap-3">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-sky-400 animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm text-slate-400 font-medium">Compiling intent to components...</span>
            </div>
          {:else}
            <div class="flex items-center justify-center h-[220px]">
              <div class="text-center">
                <div class="text-slate-300 mb-2">
                  <svg class="w-10 h-10 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 3v18"/></svg>
                </div>
                <span class="text-sm text-slate-400">Components will render here</span>
              </div>
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
      transform: translateY(12px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .animate-in {
    animation: animate-in-keyframes 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
</style>
