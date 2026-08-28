<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { behavioralObserver, type BehavioralMetrics } from '../../../../packages/behavior/src/index';
  import type { ActionContract, ActionExecutionContext, VisualAffordance, IntentRecord } from '../../../../packages/core/src/ActionContract';
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
  let syncFailedMessage = $state<string | null>(null);

  // Staging state
  let pendingIntent = $state<IntentRecord | null>(null);
  let isUndoVisible = $state(false);
  let undoProgress = $state(100);
  let undoInterval: any = null;

  // Drawer (Tier 2) state
  let isDrawerOpen = $state(false);
  let swipeProgress = $state(0); // 0 to 100%
  let isDragging = $state(false);
  let startX = 0;

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
    clearInterval(undoInterval);
  });

  // Base Execution Router based on Staging Tier
  async function handleTrigger() {
    if (isExecuting) return;
    syncFailedMessage = null;

    try {
      const ctx: ActionExecutionContext = {
        sourceId: 'sola-relay',
        recordId,
        data
      };

      // Call stage method to register the intent
      const intent = await action.stage({}, ctx);
      pendingIntent = intent;

      if (action.tier === 1) {
        // Tier 1: Optimistic write with 5-second undo
        startUndoTimer();
      } else {
        // Tier 2: Open Bottom Sheet approval drawer
        isDrawerOpen = true;
        swipeProgress = 0;
      }
    } catch (e: any) {
      syncFailedMessage = e.message || 'Staging failed';
    }
  }

  // Tier 1: Optimistic Undo Flow
  function startUndoTimer() {
    isUndoVisible = true;
    undoProgress = 100;
    const duration = 5000; // 5 seconds
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    clearInterval(undoInterval);
    undoInterval = setInterval(async () => {
      undoProgress -= step;
      if (undoProgress <= 0) {
        clearInterval(undoInterval);
        await commitIntent();
      }
    }, intervalTime);
  }

  async function handleUndo() {
    clearInterval(undoInterval);
    isUndoVisible = false;
    if (pendingIntent && action.rollback) {
      try {
        const res = await action.rollback(pendingIntent.id);
        executeMessage = `Undone: ${res.message}`;
        setTimeout(() => { executeMessage = null; pendingIntent = null; }, 3000);
      } catch (e: any) {
        syncFailedMessage = `Rollback Failed: ${e.message}`;
      }
    } else {
      pendingIntent = null;
    }
  }

  // Commit Staged Action to Source System
  async function commitIntent() {
    isUndoVisible = false;
    isDrawerOpen = false;
    if (!pendingIntent) return;

    isExecuting = true;
    try {
      const res = await action.commit(pendingIntent.id);
      executeMessage = res.message || 'Playbook executed successfully';
      behavioralObserver.resetUrgency();
      if (onExecute) onExecute(res);
      setTimeout(() => { executeMessage = null; pendingIntent = null; }, 3500);
    } catch (e: any) {
      syncFailedMessage = `Sync failed: ${e.message || 'API Timeout'}`;
    } finally {
      isExecuting = false;
    }
  }

  // Swipe handle touch/mouse drag controllers for Tier 2 drawer
  function startDrag(e: MouseEvent | TouchEvent) {
    isDragging = true;
    startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  function handleDrag(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = currentX - startX;
    const maxSlide = 160; // Max horizontal track limit
    const percent = Math.max(0, Math.min(100, (delta / maxSlide) * 100));
    swipeProgress = percent;

    if (swipeProgress >= 95) {
      isDragging = false;
      swipeProgress = 100;
      commitIntent();
    }
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    if (swipeProgress < 95) {
      swipeProgress = 0; // Snap back to start
    }
  }
</script>

{#if isSurfaced}
  <div 
    class="relative inline-flex flex-col transition-all duration-200"
    onmouseenter={() => behavioralObserver.registerHoverStart(targetId, undefined, 800)}
    onmouseleave={() => behavioralObserver.registerHoverEnd(targetId)}
    ontouchstart={() => behavioralObserver.registerTouchStart(targetId, undefined, 800)}
    ontouchmove={() => behavioralObserver.registerTouchMove()}
    ontouchend={() => behavioralObserver.registerTouchEnd(targetId)}
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
            <span>Staging Action...</span>
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
        class="absolute top-full right-0 mt-2 z-30 px-3 py-1.5 rounded-xl bg-emerald-900 text-emerald-100 border border-emerald-700 text-[11px] font-mono shadow-md whitespace-nowrap">
        ✅ {executeMessage}
      </div>
    {/if}

    <!-- Persistent Sync Failure State on Card -->
    {#if syncFailedMessage}
      <div 
        transition:fade={{ duration: 150 }}
        class="absolute top-full right-0 mt-2 z-30 p-3 rounded-2xl bg-rose-50 text-rose-950 border border-rose-200 text-[11px] font-mono shadow-md flex flex-col gap-2 min-w-[200px]">
        <div class="flex items-center gap-1.5 font-bold text-rose-800">
          <svg class="w-3.5 h-3.5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          <span>Sync failed</span>
        </div>
        <p class="text-[10px] text-slate-500 leading-normal">{syncFailedMessage}</p>
        <div class="flex items-center gap-2 mt-1">
          <button 
            onclick={commitIntent}
            class="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all cursor-pointer">
            Retry
          </button>
          <button 
            onclick={() => { syncFailedMessage = null; pendingIntent = null; }}
            class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">
            Discard
          </button>
        </div>
      </div>
    {/if}

  </div>
{/if}

<!-- Tier 1: Optimistic Undo Toast (Bottom Screen Floating) -->
{#if isUndoVisible}
  <div 
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 text-xs font-mono min-w-[320px] max-w-[90vw]"
    transition:fly={{ y: 24, duration: 250 }}
  >
    <div class="flex-1 flex flex-col gap-1">
      <span class="font-bold text-white">Staging: {action.title}</span>
      <!-- Progress Bar Timer -->
      <div class="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-amber-500 transition-all duration-75" style="width: {undoProgress}%"></div>
      </div>
    </div>
    
    <button 
      onclick={handleUndo}
      class="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all cursor-pointer active:scale-95">
      Undo
    </button>
  </div>
{/if}

<!-- Tier 2: Bottom Sheet Drawer with Swipe-to-Confirm -->
{#if isDrawerOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div 
    onclick={() => isDrawerOpen = false} 
    transition:fade={{ duration: 150 }} 
    class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40"
  ></div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    transition:fly={{ y: 300, duration: 300 }}
    class="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl z-50 p-6 font-mono text-xs flex flex-col gap-4"
  >
    <!-- Handle bar indicator -->
    <div class="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-1"></div>

    <div class="flex items-start justify-between">
      <div>
        <span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 font-bold text-[9px] uppercase tracking-wider">
          Tier 2 hard mutation
        </span>
        <h3 class="text-sm font-bold text-slate-950 mt-1">{action.title}</h3>
      </div>
      <button 
        onclick={() => isDrawerOpen = false}
        class="text-slate-400 hover:text-slate-600 text-sm">
        ✕
      </button>
    </div>

    <!-- Details -->
    <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
      <div class="text-[10px] uppercase font-bold text-slate-400">Estimated blast radius impact</div>
      <p class="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
        {action.blastRadiusMessage || 'Direct system change requested. Please review payload before commit.'}
      </p>
    </div>

    <!-- Swipe-to-Confirm Slider Track -->
    <div class="relative w-full h-12 bg-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center select-none">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
        {swipeProgress > 20 ? '' : 'Swipe right to execute'}
      </span>

      <!-- Track fill -->
      <div class="absolute left-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none" style="width: {swipeProgress}%"></div>

      <!-- Handle -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onmousedown={startDrag}
        onmousemove={handleDrag}
        onmouseup={stopDrag}
        onmouseleave={stopDrag}
        ontouchstart={startDrag}
        ontouchmove={handleDrag}
        ontouchend={stopDrag}
        class="absolute left-1 top-1 bottom-1 w-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow"
        style="transform: translateX({(swipeProgress / 100) * 160}px)"
      >
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>

    <button 
      onclick={() => isDrawerOpen = false}
      class="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer">
      Cancel & Abort
    </button>
  </div>
{/if}
