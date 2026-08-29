<script lang="ts">
  import { spring } from 'svelte/motion';

  let containerElement: HTMLDivElement;
  let isHovered = $state(false);
  
  const rotX = spring(0, { stiffness: 0.1, damping: 0.4 });
  const rotY = spring(0, { stiffness: 0.1, damping: 0.4 });
  const lightX = spring(50, { stiffness: 0.1, damping: 0.4 });
  const lightY = spring(50, { stiffness: 0.1, damping: 0.4 });

  $effect(() => {
    if (!isHovered) {
      rotX.set(0);
      rotY.set(0);
      lightX.set(50);
      lightY.set(50);
    }
  });

  function handleMouseMove(e: MouseEvent) {
    if (!containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    // Calculate rotation (-15 to +15 deg)
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    
    rotX.set(-dy * 15);
    rotY.set(dx * 15);
    
    // Light source opposite to mouse
    lightX.set(50 - dx * 20);
    lightY.set(50 - dy * 20);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-900 rounded-2xl relative"
  onmousemove={handleMouseMove}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <div 
    bind:this={containerElement}
    class="w-64 h-40 relative rounded-xl border border-slate-700/50 shadow-2xl preserve-3d transition-transform duration-75"
    style="transform: perspective(1000px) rotateX({$rotX}deg) rotateY({$rotY}deg);"
  >
    <!-- Background layer -->
    <div class="absolute inset-0 bg-slate-800 rounded-xl overflow-hidden">
      <!-- Ambient light reflection -->
      <div 
        class="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none"
        style="left: {$lightX}%; top: {$lightY}%; transform: translate(-50%, -50%);"
      ></div>
    </div>
    
    <!-- Floating SVG Data Layer (Parallax Z-translation) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" style="transform: translateZ(30px);">
      <circle cx="40" cy="40" r="15" fill="none" stroke="#10b981" stroke-width="3" />
      <circle cx="40" cy="40" r="8" fill="#10b981" />
      <text x="70" y="45" fill="#fff" font-family="monospace" font-size="14" font-weight="bold">84% HEALTH</text>
      
      <line x1="20" y1="90" x2="236" y2="90" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="4 4" />
      
      <!-- Sparkline -->
      <path d="M 20 120 L 60 110 L 100 130 L 140 100 L 180 115 L 230 90" fill="none" stroke="#3b82f6" stroke-width="2" />
    </svg>
  </div>
</div>

<style>
  .preserve-3d {
    transform-style: preserve-3d;
  }
</style>
