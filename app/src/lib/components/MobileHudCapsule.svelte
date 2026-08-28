<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  let isExpanded = $state(false);
  let isListening = $state(false);
  let activeTab = $state<'actions' | 'telemetry' | 'intent'>('actions');

  let { onSelectIntent } = $props<{ onSelectIntent?: (intent: string) => void }>();

  const quickIntents = [
    { label: "P1 Incident Triage", prompt: "Show active P1 incidents breaching SLA in 30 mins" },
    { label: "Cloud Node Mesh", prompt: "Display AWS us-east-1 RDS replica topology" },
    { label: "Google Sheets Sync", prompt: "Connect live Google Sheets relay for cash runway & MRR" },
    { label: "Revenue Waterfall", prompt: "Breakdown SaaS gross volume to net payout" }
  ];

  function handleTriggerIntent(prompt: string) {
    if (onSelectIntent) onSelectIntent(prompt);
    isExpanded = false;
  }
</script>

<!-- Mobile Floating Dynamic Island HUD (Visible on mobile screens) -->
<div class="sm:hidden fixed bottom-5 inset-x-4 z-40 flex flex-col items-center pointer-events-none">
  
  <!-- Backdrop Blur overlay when expanded -->
  {#if isExpanded}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div 
      transition:fade={{ duration: 180 }}
      onclick={() => isExpanded = false}
      class="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[-1] pointer-events-auto">
    </div>
  {/if}

  <!-- Tactical HUD Capsule Container -->
  <div 
    class="w-full max-w-sm rounded-[28px] bg-slate-950/95 text-white border border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 pointer-events-auto overflow-hidden {isExpanded ? 'p-5' : 'p-2.5 px-4'}">
    
    {#if !isExpanded}
      <!-- Collapsed Tactile Capsule Bar -->
      <button 
        onclick={() => isExpanded = true}
        class="w-full flex items-center justify-between gap-3 text-left cursor-pointer group">
        
        <!-- Pulsing Quantum Signal Dot -->
        <div class="flex items-center gap-2.5">
          <div class="relative flex items-center justify-center">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute opacity-75"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 relative shadow-sm"></span>
          </div>
          <span class="text-xs font-mono font-black text-slate-200 tracking-tight">Sola Ambient HUD</span>
        </div>

        <!-- Latency Micro-Badge -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700 font-bold">
            0.2ms Native
          </span>
          <svg class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </div>
      </button>

    {:else}
      <!-- Expanded One-Thumb Control Center -->
      <div transition:fly={{ y: 15, duration: 200 }} class="flex flex-col gap-4">
        
        <!-- Top Title Bar & Close Button -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span class="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Mobile Command Surface</span>
          </div>
          <button 
            onclick={() => isExpanded = false}
            class="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Close HUD">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 1-Tap Quick Intent Grid -->
        <div>
          <span class="text-[10px] font-mono text-slate-400 block uppercase mb-2">1-Thumb Intent Triggers</span>
          <div class="grid grid-cols-2 gap-2">
            {#each quickIntents as intent}
              <button 
                onclick={() => handleTriggerIntent(intent.prompt)}
                class="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-left transition-all cursor-pointer group">
                <span class="text-xs font-mono font-bold text-slate-200 group-hover:text-amber-400 block truncate">
                  {intent.label}
                </span>
                <span class="text-[10px] font-mono text-slate-500 truncate block mt-0.5">
                  Tap to synthesize
                </span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Live Runtime Stats Footer -->
        <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800">
          <span>Zero-VDOM Engine</span>
          <span class="text-emerald-400 font-bold">Signal Bus Synchronized</span>
        </div>

      </div>
    {/if}

  </div>
</div>
