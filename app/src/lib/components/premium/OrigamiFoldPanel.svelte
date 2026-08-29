<script lang="ts">
  import { spring } from 'svelte/motion';

  let { isOpen = $bindable(false) } = $props();

  // 0 = flat open, 90 = folded up completely
  const foldAngle = spring(isOpen ? 0 : 90, { stiffness: 0.05, damping: 0.6 });

  $effect(() => {
    foldAngle.set(isOpen ? 0 : 90);
  });
</script>

<div class="w-full flex flex-col perspective-1000 items-center justify-center p-8">
  <button 
    onclick={() => isOpen = !isOpen}
    class="mb-4 bg-slate-900 text-white px-6 py-2 rounded-xl font-mono text-xs uppercase tracking-wider hover:bg-emerald-600 transition-colors"
  >
    Toggle Origami Fold
  </button>

  <div class="relative w-80 h-80" style="perspective: 1000px;">
    <!-- Top Half (Folds upward) -->
    <div 
      class="absolute top-0 left-0 w-full h-1/2 bg-slate-100 dark:bg-white/[0.08] border border-slate-300 rounded-t-2xl shadow-sm origin-bottom overflow-hidden flex flex-col justify-end p-4"
      style="transform: rotateX({$foldAngle}deg); backface-visibility: hidden; filter: brightness({1 - ($foldAngle / 90) * 0.5});"
    >
      <div class="text-xl font-black text-slate-800 dark:text-slate-200">Origami Data</div>
      <div class="text-xs text-slate-500 dark:text-slate-400">Top section of the folding panel.</div>
    </div>

    <!-- Bottom Half (Folds downward) -->
    <div 
      class="absolute bottom-0 left-0 w-full h-1/2 bg-slate-50 dark:bg-white/[0.04] border border-slate-300 rounded-b-2xl shadow-sm origin-top overflow-hidden flex flex-col justify-start p-4"
      style="transform: rotateX(-{$foldAngle}deg); backface-visibility: hidden; filter: brightness({1 - ($foldAngle / 90) * 0.5});"
    >
      <div class="w-full h-2 bg-emerald-500 rounded-full mb-2"></div>
      <div class="w-2/3 h-2 bg-slate-300 rounded-full mb-2"></div>
      <div class="w-1/2 h-2 bg-slate-300 rounded-full"></div>
    </div>
    
    <!-- SVG Shadow projection (ambient intent) -->
    <svg class="absolute -bottom-10 left-0 w-full h-10 pointer-events-none opacity-50" preserveAspectRatio="none" viewBox="0 0 100 10">
      <ellipse cx="50" cy="5" rx={40 - ($foldAngle / 90) * 30} ry={3 - ($foldAngle / 90) * 2} fill="rgba(0,0,0,0.2)" filter="blur(4px)" />
    </svg>
  </div>
</div>
