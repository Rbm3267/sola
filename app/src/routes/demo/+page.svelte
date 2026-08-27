<script lang="ts">
  import DynamicRenderer from '$lib/components/DynamicRenderer.svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  let intentQuery = $state('');
  let currentPayload = $state<any>(null);
  let isLoading = $state(false);
  let errorMsg = $state('');

  async function submitIntent() {
    if (!intentQuery.trim()) return;
    
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

      if (!res.ok) throw new Error(await res.text());

      const rawText = await res.text();
      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      currentPayload = JSON.parse(cleanText);
    } catch (e: any) {
      console.error(e);
      errorMsg = e.message || 'An error occurred. Check server connection.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center pt-24 relative overflow-x-hidden selection:bg-sky-200 selection:text-sky-900">
  
  <!-- Subtle Glowing Orbs -->
  <div class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-sky-100/50 blur-[120px] rounded-full pointer-events-none"></div>

  <a href="/" class="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3 hover:opacity-80 transition-opacity z-20">
    <div class="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter"><img src="/logo.png" alt="Sola Logo" class="w-12 h-12 object-contain drop-shadow-md -ml-1" /></div>
  </a>

  <div class="w-full max-w-4xl flex flex-col gap-10 z-10 mt-12 md:mt-16">
    
    <!-- Command Input -->
    <div class="max-w-2xl mx-auto w-full bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col group focus-within:shadow-[0_15px_40px_rgba(14,165,233,0.1)] focus-within:border-sky-300 transition-all duration-300 ease-out relative">
      <!-- Inner subtle glow -->
      <div class="absolute inset-0 rounded-full bg-gradient-to-b from-sky-50 to-transparent pointer-events-none"></div>
      
      <form class="flex items-center gap-3 w-full relative z-10" onsubmit={(e) => { e.preventDefault(); submitIntent(); }}>
        <div class="pl-6 shrink-0">
          {#if isLoading}
            <div class="i-lucide-loader-2 text-sky-500 text-2xl animate-spin"></div>
          {:else}
            <div class="i-lucide-sparkles text-slate-500 text-2xl group-focus-within:text-sky-500 transition-colors duration-500"></div>
          {/if}
        </div>
        
        <input 
          type="text" 
          bind:value={intentQuery}
          placeholder="Command Sola..." 
          class="flex-1 bg-transparent py-5 px-2 text-slate-800 text-xl font-medium focus:outline-none focus:ring-0 border-0 outline-none appearance-none placeholder-slate-400 shadow-none"
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          aria-label="Submit intent"
          class="bg-slate-900 text-white w-14 h-14 rounded-full font-bold hover:bg-slate-800 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center mr-1 shadow-md shrink-0"
        >
          <div class="i-lucide-arrow-up text-2xl"></div>
        </button>
      </form>
    </div>

    {#if errorMsg}
      <div transition:fly={{ y: -10, duration: 400, easing: cubicOut }} class="mx-auto w-full max-w-lg p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-sm font-medium shadow-sm break-words">
        {errorMsg}
      </div>
    {/if}

    <!-- The Canvas -->
    {#if currentPayload || isLoading}
      <div 
        transition:fly={{ y: 40, duration: 800, easing: cubicOut }}
        class="w-full bg-white/40 backdrop-blur-2xl border border-slate-200/60 rounded-[32px] p-6 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.03)] relative overflow-hidden min-h-[400px] flex flex-col"
      >
        <!-- Canvas Grid Background -->
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdib3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjAzKSIvPjwvc3ZnPg==')] opacity-60 pointer-events-none mask-image-gradient"></div>
        <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-50 to-transparent pointer-events-none"></div>

        <div class="relative z-10 w-full h-full flex flex-col gap-8">
          {#if isLoading}
             <div class="w-full flex-1 flex flex-col items-center justify-center text-slate-500 gap-4" in:fade={{ duration: 400, delay: 200 }}>
               <div class="i-lucide-sparkles text-3xl animate-pulse text-sky-500/50"></div>
               <span class="text-sm font-medium tracking-wide">Synthesizing UI...</span>
             </div>
          {:else if currentPayload}
            {#if Array.isArray(currentPayload)}
              {#each currentPayload as payload, i}
                <div in:fly={{ y: 30, duration: 700, delay: i * 150, easing: cubicOut }}>
                  <DynamicRenderer intentPayload={payload} />
                </div>
              {/each}
            {:else}
              <div in:fly={{ y: 30, duration: 700, easing: cubicOut }}>
                <DynamicRenderer intentPayload={currentPayload} />
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/if}

  </div>
</div>
<style>
  .mask-image-gradient {
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
    mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
  }
</style>




