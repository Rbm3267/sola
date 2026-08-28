<script lang="ts">
  export interface TactileDialConfig {
    title: string;
    value?: number; // 0 to 100
    unit?: string;
    subtext?: string;
    color?: 'amber' | 'emerald' | 'sky';
  }

  let { config } = $props<{ config: TactileDialConfig }>();

  let dialValue = $state(74);
  $effect(() => {
    if (config.value !== undefined) dialValue = config.value;
  });
  let isDragging = $state(false);

  function handleTouch(e: TouchEvent | MouseEvent) {
    // Calculate angle relative to center of dial
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Convert radians to degrees (0 to 360)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    // Map 0-360 deg to 0-100 value
    dialValue = Math.min(Math.max(Math.round((angle / 360) * 100), 0), 100);
  }
</script>

<div class="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
  
  <!-- Header -->
  <div class="w-full flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      <h3 class="text-xs font-mono font-black text-slate-900 uppercase tracking-wider">{config.title || 'Rotary Touch Controller'}</h3>
    </div>
    <span class="text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
      1-Thumb Rotary
    </span>
  </div>

  <!-- Interactive Rotary Dial Area -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="relative w-44 h-44 aspect-square shrink-0 my-2 flex items-center justify-center cursor-pointer select-none touch-none group"
    ontouchstart={(e) => { isDragging = true; handleTouch(e); }}
    ontouchmove={(e) => { if (isDragging) handleTouch(e); }}
    ontouchend={() => isDragging = false}
    onmousedown={(e) => { isDragging = true; handleTouch(e); }}
    onmousemove={(e) => { if (isDragging) handleTouch(e); }}
    onmouseup={() => isDragging = false}>
    
    <!-- Outer Arc Track -->
    <svg class="w-full h-full aspect-square -rotate-90" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <!-- Background Track -->
      <circle 
        cx="50" cy="50" r="40" 
        stroke="currentColor" 
        class="text-slate-100" 
        stroke-width="8" 
        fill="none" 
      />
      <!-- Active Progress Arc -->
      <circle 
        cx="50" cy="50" r="40" 
        stroke="url(#dialGradient)" 
        stroke-width="8" 
        stroke-dasharray="251.2"
        stroke-dashoffset={251.2 * (1 - dialValue / 100)}
        stroke-linecap="round"
        fill="none" 
        class="transition-all duration-75"
      />
      <defs>
        <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#ea580c" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Center Display -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-3xl font-black text-slate-950 font-mono tracking-tight">{dialValue}{config.unit || '%'}</span>
      <span class="text-[10px] font-mono text-slate-500 mt-0.5">Drag to adjust</span>
    </div>

  </div>

  <p class="text-xs text-slate-500 mt-2 font-mono">{config.subtext || 'Precision rotary adjustment with 0.2ms microtask reactivity'}</p>

</div>
