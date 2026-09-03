<script lang="ts">
  type ContextMenuItem = {
    label?: string;
    icon?: string;
    shortcut?: string;
    action?: () => void;
    divider?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'destructive';
  };

  let {
    items = [
      { label: 'Inspect Signal', shortcut: '⌥⌘I' },
      { label: 'Duplicate Node', shortcut: '⌘D' },
      { label: 'Copy Target Path', shortcut: '⇧⌘C' },
      { divider: true },
      { label: 'Mute Telemetry', shortcut: '⌘M' },
      { label: 'Detach from Mesh', variant: 'destructive', shortcut: '⌫' }
    ]
  } = $props<{
    items?: ContextMenuItem[];
  }>();

  let isOpen = $state(false);
  let menuX = $state(0);
  let menuY = $state(0);

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    menuX = e.clientX;
    menuY = e.clientY;
    isOpen = true;
  }

  function close() {
    isOpen = false;
  }
</script>

<svelte:window onclick={close} onkeydown={(e) => e.key === 'Escape' && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  oncontextmenu={handleContextMenu}
  class="w-full h-44 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center cursor-context-menu hover:border-blue-500/50 transition-colors select-none bg-slate-50/50 dark:bg-white/[0.02]"
>
  <div class="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 3h6v6"/>
      <path d="M10 14 21 3"/>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    </svg>
  </div>
  <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">Right-Click Anywhere Inside</p>
  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Triggers Sola Context Menu with keyboard shortcuts</p>
</div>

{#if isOpen}
  <div
    style="left: {menuX}px; top: {menuY}px;"
    class="fixed z-50 min-w-56 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 animate-[fadeSlide_120ms_ease-out]"
  >
    {#each items as item}
      {#if item.divider}
        <div class="my-1 border-t border-slate-100 dark:border-white/5"></div>
      {:else}
        <button
          type="button"
          onclick={() => { item.action?.(); close(); }}
          class="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer {item.disabled ? 'opacity-40 pointer-events-none' : ''} {item.variant === 'destructive' ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white'}"
        >
          <span class="font-medium">{item.label}</span>
          {#if item.shortcut}
            <span class="text-xs font-mono opacity-50">{item.shortcut}</span>
          {/if}
        </button>
      {/if}
    {/each}
  </div>
{/if}

<style>
  @keyframes fadeSlide {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
