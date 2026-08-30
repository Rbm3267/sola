<script lang="ts">
  let {
    direction = 'horizontal', // 'horizontal' | 'vertical'
    initialSplit = 50, // percentage
    minSplit = 20,
    maxSplit = 80
  } = $props<{
    direction?: 'horizontal' | 'vertical';
    initialSplit?: number;
    minSplit?: number;
    maxSplit?: number;
  }>();

  let splitPercent = $state(initialSplit);
  let isDragging = $state(false);
  let containerEl = $state<HTMLElement | null>(null);

  function startDrag(e: MouseEvent) {
    e.preventDefault();
    isDragging = true;

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging || !containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      let percent: number;
      if (direction === 'horizontal') {
        percent = ((ev.clientX - rect.left) / rect.width) * 100;
      } else {
        percent = ((ev.clientY - rect.top) / rect.height) * 100;
      }
      splitPercent = Math.min(maxSplit, Math.max(minSplit, percent));
    }

    function onMouseUp() {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
</script>

<div
  bind:this={containerEl}
  class="relative w-full h-80 rounded-3xl border border-slate-200/90 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-[#090d19] flex {direction === 'vertical' ? 'flex-col' : 'flex-row'} select-none"
>
  <!-- Pane A -->
  <div
    class="overflow-auto p-4 bg-white dark:bg-[#0f172a]"
    style="{direction === 'horizontal' ? `width: ${splitPercent}%` : `height: ${splitPercent}%`}"
  >
    <div class="flex items-center gap-2 mb-3">
      <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Pane A (Telemetry)</h4>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
      Real-time signal ingestion pipeline. Drag the divider handle to resize panes fluidly.
    </p>
    <div class="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300">
      width: {Math.round(splitPercent)}%
    </div>
  </div>

  <!-- Divider Handle -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onmousedown={startDrag}
    class="relative z-10 flex items-center justify-center transition-colors {direction === 'horizontal' ? 'w-2 hover:w-2 cursor-col-resize' : 'h-2 hover:h-2 cursor-row-resize'} {isDragging ? 'bg-emerald-500 ring-2 ring-emerald-500/40' : 'bg-slate-200 dark:bg-white/10 hover:bg-emerald-400'}"
  >
    <div class="w-1 h-8 rounded-full bg-slate-400 dark:bg-white/30 {direction === 'vertical' ? 'rotate-90' : ''}"></div>
  </div>

  <!-- Pane B -->
  <div
    class="flex-1 overflow-auto p-4 bg-white dark:bg-[#0f172a]"
    style="{direction === 'horizontal' ? `width: ${100 - splitPercent}%` : `height: ${100 - splitPercent}%`}"
  >
    <div class="flex items-center gap-2 mb-3">
      <div class="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Pane B (Inspector)</h4>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
      Active node graph inspection & compiler output stream.
    </p>
    <div class="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300">
      width: {Math.round(100 - splitPercent)}%
    </div>
  </div>
</div>
