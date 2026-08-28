<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { behavioralObserver, type BehavioralMetrics } from '../../../../packages/behavior/src/index';
  import type { ActionContract, ActionExecutionContext, VisualAffordance } from '../../../../packages/core/src/ActionContract';
  import { fly, fade } from 'svelte/transition';

  let {
    action,
    data = {},
    recordId = 'REC001',
    onExecute
  } = $props<{
    action: ActionContract;
    data?: any;
    recordId?: string;
    onExecute?: (result: any) => void;
  }>();

  let metrics = $state<BehavioralMetrics>({
    typingVelocityCps: 0,
    activeDwellTarget: null,
    dwellDurationMs: 0,
    rageClickCount: 0,
    persona: 'visual_explorer',
    densityMode: 'comfortable'
  });

  let isExecuting = $state(false);
  let executeMessage = $state<string | null>(null);

  // Dual-driver reactive evaluation
  const isSurfaced = $derived(action.isSurfaced(data, metrics));
  const affordance = $derived<VisualAffordance>(action.resolveAffordance(data, metrics));
  const urgency = $derived(action.computeUrgency(data, metrics));

  let unsubscribe: (() => void) | null = null;
  const targetId = $derived(`target-${action.id}`);

  onMount(() => {
    unsubscribe = behavioralObserver.subscribe((m) => {
      metrics = m;
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  async function handleTrigger() {
    if (isExecuting) return;
    isExecuting = true;
    executeMessage = null;

    try {
      const ctx: ActionExecutionContext = {
        sourceId: 'sola-relay',
        recordId,
        data
      };
      const res = await action.execute({}, ctx);
      executeMessage = res.message || 'Playbook executed successfully';
      behavioralObserver.resetUrgency();
      if (onExecute) onExecute(res);
      setTimeout(() => { executeMessage = null; }, 3500);
    } catch (e: any) {
      executeMessage = e.message || 'Execution error';
    } finally {
      isExecuting = false;
    }
  }
</script>

{#if isSurfaced}
  <div 
    class="relative inline-flex flex-col transition-all duration-200"
    onmouseenter={() => behavioralObserver.registerHoverStart(targetId, undefined, 800)}
    onmouseleave={() => behavioralObserver.registerHoverEnd(targetId)}
  >
    
    <!-- CALM STATE: Minimal Ambient Badge -->
    {#if affordance === 'calm'}
      <button 
        onclick={handleTrigger}
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-all text-xs font-mono font-medium cursor-pointer shadow-2xs">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>{action.title}</span>
      </button>

    <!-- DWELL / HESITATION STATE: Inline Smooth Drawer -->
    {:else if affordance === 'expanded_preview'}
      <div 
        transition:fly={{ y: 8, duration: 200 }}
        class="p-4 rounded-2xl bg-white/95 backdrop-blur-2xl text-slate-900 border border-amber-200 shadow-xl flex flex-col gap-2.5 font-mono text-xs max-w-sm">
        <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span class="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            <span>Surfaced via Hover Dwell</span>
          </span>
          <span class="text-[10px] text-slate-400">Urgency: {(urgency * 100).toFixed(0)}%</span>
        </div>
        <div>
          <div class="font-bold text-slate-950 text-xs">{action.title}</div>
          <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{action.description}</p>
        </div>
        <button 
          onclick={handleTrigger}
          disabled={isExecuting}
          class="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5">
          {#if isExecuting}
            <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Executing Action...</span>
          {:else}
            <span>1-Click Run Playbook</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          {/if}
        </button>
      </div>

    <!-- URGENT OVERRIDE: Prominent Emergency Button -->
    {:else if affordance === 'urgent_override'}
      <button 
        onclick={handleTrigger}
        disabled={isExecuting}
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono text-xs font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer animate-pulse active:scale-95">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>{isExecuting ? 'Executing Mitigation...' : `Emergency Action: ${action.title}`}</span>
      </button>
    {/if}

    <!-- Result Feedback Toast -->
    {#if executeMessage}
      <div 
        transition:fade={{ duration: 150 }}
        class="absolute top-full left-0 mt-2 z-30 px-3 py-1.5 rounded-xl bg-emerald-900 text-emerald-100 border border-emerald-700 text-[11px] font-mono shadow-md whitespace-nowrap">
        ✅ {executeMessage}
      </div>
    {/if}

  </div>
{/if}
