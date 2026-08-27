<script lang="ts">
  import DynamicRenderer from '$lib/components/DynamicRenderer.svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  let intentQuery = $state('');
  let currentPayload = $state<any>(null);
  let isLoading = $state(false);
  let errorMsg = $state('');

  const sampleIntents = [
    "Show Q3 revenue and churn rate for enterprise tier",
    "Build an onboarding form for new engineering hires",
    "List all active deployments with their status"
  ];

  function pickSample(prompt: string) {
    intentQuery = prompt;
    submitIntent();
  }

  async function submitIntent() {
    if (!intentQuery.trim() || isLoading) return;
    
    isLoading = true;
    currentPayload = null;
    errorMsg = '';

    try {
      const apiUrl = '/api/intent';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentQuery })
      });

      const rawText = await res.text();

      if (!res.ok) {
        try {
          const parsedErr = JSON.parse(rawText);
          throw new Error(parsedErr.error || parsedErr.message || 'Intent execution failed');
        } catch {
          throw new Error(rawText || 'Failed to process intent');
        }
      }

      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      currentPayload = JSON.parse(cleanText);
    } catch (e: any) {
      console.error(e);
      errorMsg = e.message || 'An error occurred while generating UI components.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center pt-24 relative overflow-x-hidden selection:bg-sky-200 selection:text-sky-900">
  
  <!-- Subtle Ambient Glows -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-sky-100/50 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

  <!-- Top Navigation Header -->
  <header class="w-full max-w-5xl fixed top-4 z-50 px-4">
    <div class="w-full flex justify-between items-center bg-white/80 backdrop-blur-2xl border border-slate-200/80 px-5 sm:px-7 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <a href="/" class="flex items-center gap-3.5 group cursor-pointer text-decoration-none">
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-1 bg-gradient-to-r from-sky-400 to-violet-500 rounded-full blur-md opacity-25 group-hover:opacity-45 transition duration-300"></div>
          <img src="/logo.png" alt="Sola Logo" class="w-9 h-9 object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-200" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Sola</span>
          <span class="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full">Playground</span>
        </div>
      </a>

      <div class="flex items-center gap-3">
        <a href="https://github.com/Rbm3267/sola#readme" target="_blank" rel="noreferrer" class="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          Documentation
        </a>
        <a href="/" class="text-xs font-bold text-slate-900 border border-slate-200 bg-white/80 px-3.5 py-1.5 rounded-xl hover:bg-white transition-all shadow-xs">
          ← Back to Home
        </a>
      </div>
    </div>
  </header>

  <div class="w-full max-w-4xl flex flex-col gap-8 z-10 mt-8 md:mt-12">
    
    <!-- Title Area -->
    <div class="text-center">
      <h1 class="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-2">
        Ambient Intent Playground
      </h1>
      <p class="text-slate-600 text-sm max-w-lg mx-auto">
        Speak intent to Sola's compiler. Generative components will synthesize and resolve on the fly.
      </p>
    </div>

    <!-- Command Input Box -->
    <div class="max-w-2xl mx-auto w-full bg-white/90 backdrop-blur-3xl border border-slate-200/90 rounded-2xl p-2 shadow-[0_12px_40px_rgba(15,23,42,0.06)] flex flex-col group focus-within:shadow-[0_15px_40px_rgba(14,165,233,0.12)] focus-within:border-sky-400 transition-all duration-300 relative">
      <form class="flex items-center gap-3 w-full relative z-10" onsubmit={(e) => { e.preventDefault(); submitIntent(); }}>
        <div class="pl-4 shrink-0 text-sky-500">
          {#if isLoading}
            <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"/></svg>
          {:else}
            <svg class="w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          {/if}
        </div>
        
        <input 
          type="text" 
          bind:value={intentQuery}
          placeholder="Command Sola... (e.g. 'Show enterprise MRR and churn rate')" 
          class="flex-1 bg-transparent py-4 px-2 text-slate-900 text-base font-medium focus:outline-none placeholder-slate-400"
        />
        
        <button 
          type="submit" 
          disabled={isLoading || !intentQuery.trim()}
          aria-label="Submit intent"
          class="bg-slate-950 text-white w-12 h-12 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.97] disabled:opacity-40 flex items-center justify-center shadow-md shrink-0 cursor-pointer"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>
    </div>

    <!-- Sample Prompts -->
    <div class="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
      <span class="text-xs font-semibold text-slate-400">Suggestions:</span>
      {#each sampleIntents as sample}
        <button 
          onclick={() => pickSample(sample)}
          class="text-xs font-medium text-slate-600 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-lg hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 transition-all cursor-pointer shadow-xs">
          {sample}
        </button>
      {/each}
    </div>

    <!-- Error Message Display -->
    {#if errorMsg}
      <div transition:fly={{ y: -10, duration: 300, easing: cubicOut }} class="mx-auto w-full max-w-lg p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-sm font-medium shadow-sm flex items-start gap-3">
        <svg class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>{errorMsg}</div>
      </div>
    {/if}

    <!-- The Canvas -->
    <div class="w-full bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.04)] relative overflow-hidden min-h-[360px] flex flex-col">
      <div class="relative z-10 w-full h-full flex flex-col gap-6">
        {#if isLoading}
          <div class="w-full flex-1 min-h-[260px] flex flex-col items-center justify-center text-slate-500 gap-3" in:fade={{ duration: 300 }}>
            <div class="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin"></div>
            <span class="text-sm font-semibold text-slate-600 font-mono">Synthesizing Intent & Compiling UI...</span>
          </div>
        {:else if currentPayload}
          {#if Array.isArray(currentPayload)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" in:fade={{ duration: 400 }}>
              {#each currentPayload as block}
                <DynamicRenderer data={block} />
              {/each}
            </div>
          {:else}
            <div in:fade={{ duration: 400 }}>
              <DynamicRenderer data={currentPayload} />
            </div>
          {/if}
        {:else}
          <div class="w-full min-h-[260px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <svg class="w-12 h-12 text-slate-300 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span class="text-sm font-medium">Generated components will synthesize here</span>
          </div>
        {/if}
      </div>
    </div>

  </div>
</div>
