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

<!-- Hero -->
<div class="w-full mx-auto flex flex-col items-center text-center mt-16 md:mt-28 relative">
  
  <!-- Badge -->
  <div class="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-sky-200/80 bg-white text-sky-600 text-[13px] font-semibold shadow-sm backdrop-blur-md mb-8">
    <div class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
    <span class="tracking-wide">Ambient Intent Runtime</span>
  </div>
  
  <!-- Headline -->
  <h1 class="text-5xl sm:text-6xl md:text-[5.5rem] font-extrabold tracking-[-0.04em] text-slate-900 leading-[1] mb-6 max-w-4xl">
    Software that<br/>
    <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500">builds itself.</span>
  </h1>
  
  <!-- Subtitle -->
  <p class="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium mb-10 px-4">
    Sola compiles <code class="text-[15px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">.sola</code> files into zero-dependency vanilla DOM. 
    Native <code class="text-[15px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">$intent</code> signals resolve AI state at the framework level.
  </p>

  <!-- CTA Row -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-20">
    <a href="/demo" class="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all duration-150 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center text-[15px]">
      Try the Playground
    </a>
    <div class="px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-mono text-sm flex items-center gap-4 shadow-sm">
      <div><span class="text-sky-500 font-bold select-none">$</span> npm create sola@latest</div>
      <button aria-label="Copy command" class="text-slate-300 hover:text-slate-600 transition-colors duration-150 cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </div>
  </div>

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
