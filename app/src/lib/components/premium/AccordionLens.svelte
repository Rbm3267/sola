<script lang="ts">
  import { spring } from 'svelte/motion';

  let svgElement: SVGSVGElement;
  let isHovered = $state(false);

  const lensRadius = spring(0, { stiffness: 0.1, damping: 0.4 });
  const lensX = spring(200, { stiffness: 0.2, damping: 0.6 });
  const lensY = spring(200, { stiffness: 0.2, damping: 0.6 });

  $effect(() => {
    lensRadius.set(isHovered ? 120 : 0);
  });

  function handleMouseMove(e: MouseEvent) {
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    lensX.set(e.clientX - rect.left);
    lensY.set(e.clientY - rect.top);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="w-full min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden relative cursor-crosshair"
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  onmousemove={handleMouseMove}
>
  <svg bind:this={svgElement} class="w-full h-full absolute inset-0">
    <defs>
      <clipPath id="lens-clip">
        <circle cx={$lensX} cy={$lensY} r={$lensRadius} />
      </clipPath>
      
      <!-- Base tiny grid pattern -->
      <pattern id="tiny-grid" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
      </pattern>
      
      <!-- Detailed big grid pattern for lens -->
      <pattern id="detailed-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1" />
        <circle cx="20" cy="20" r="2" fill="#10b981" />
        <text x="5" y="10" fill="rgba(16, 185, 129, 0.5)" font-size="6" font-family="monospace">DAT</text>
      </pattern>
    </defs>

    <!-- Background Layer -->
    <rect width="100%" height="100%" fill="url(#tiny-grid)" />
    
    <!-- Lens Layer (Only visible inside clip-path) -->
    <g clip-path="url(#lens-clip)">
      <rect width="100%" height="100%" fill="#022c22" />
      <!-- Scale up the background to simulate magnification -->
      <g transform="translate({$lensX - $lensX * 1.5}, {$lensY - $lensY * 1.5}) scale(1.5)">
        <rect width="100%" height="100%" fill="url(#detailed-grid)" />
      </g>
      <!-- Lens border -->
      <circle cx={$lensX} cy={$lensY} r={$lensRadius} fill="none" stroke="#10b981" stroke-width="2" />
      <circle cx={$lensX} cy={$lensY} r={$lensRadius - 4} fill="none" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
    </g>
  </svg>
  
  {#if !isHovered}
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span class="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-widest uppercase">Hover to magnify</span>
    </div>
  {/if}
</div>
