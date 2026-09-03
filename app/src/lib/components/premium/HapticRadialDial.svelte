<script lang="ts">
  import { spring } from 'svelte/motion';

  let { value = $bindable(0), min = 0, max = 100 } = $props();

  let svgElement: SVGSVGElement;
  let isDragging = $state(false);

  // Springs for the physical geometry
  const dialRadius = spring(40, { stiffness: 0.1, damping: 0.4 });
  const indicatorLength = spring(15, { stiffness: 0.2, damping: 0.5 });
  const activeAngle = spring((value / max) * 360, { stiffness: 0.1, damping: 0.6 });

  $effect(() => {
    if (!isDragging) {
      activeAngle.set((value / max) * 360);
    }
  });

  function updateAngleFromMouse(clientX: number, clientY: number) {
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    
    const dx = clientX - rect.left - cx;
    const dy = clientY - rect.top - cy;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    // Magnetic snap points at 0, 90, 180, 270
    const snapMargin = 5;
    if (Math.abs(angle - 0) < snapMargin || Math.abs(angle - 360) < snapMargin) angle = 0;
    if (Math.abs(angle - 90) < snapMargin) angle = 90;
    if (Math.abs(angle - 180) < snapMargin) angle = 180;
    if (Math.abs(angle - 270) < snapMargin) angle = 270;

    activeAngle.set(angle, { hard: true });
    value = min + (angle / 360) * (max - min);
  }

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    svgElement.setPointerCapture(e.pointerId);
    updateAngleFromMouse(e.clientX, e.clientY);
    
    dialRadius.set(45);
    indicatorLength.set(25);
  }

  function handlePointerMove(e: PointerEvent) {
    if (isDragging) {
      updateAngleFromMouse(e.clientX, e.clientY);
    }
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
    svgElement.releasePointerCapture(e.pointerId);
    
    dialRadius.set(40);
    indicatorLength.set(15);
  }
</script>

<div class="w-full h-full min-h-[200px] flex items-center justify-center relative">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    bind:this={svgElement}
    class="w-48 h-48 touch-none cursor-pointer overflow-visible"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <defs>
      <filter id="dial-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Outer track -->
    <circle cx="50%" cy="50%" r="50" fill="none" stroke="#e2e8f0" stroke-width="4" stroke-dasharray="2 4" />
    
    <!-- Magnetic snapping notches -->
    <g stroke="#cbd5e1" stroke-width="2">
      <line x1="50%" y1="0%" x2="50%" y2="10%" />
      <line x1="50%" y1="90%" x2="50%" y2="100%" />
      <line x1="0%" y1="50%" x2="10%" y2="50%" />
      <line x1="90%" y1="50%" x2="100%" y2="50%" />
    </g>

    <!-- Main Dial Body -->
    <circle 
      cx="50%" 
      cy="50%" 
      r={$dialRadius} 
      fill="#fff" 
      stroke="#slate-200" 
      stroke-width="1"
      class="shadow-lg"
      style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));"
    />

    <!-- Indicator Line (Rotates) -->
    <g transform="rotate({$activeAngle} 96 96)">
      <line 
        x1="96" 
        y1="{96 - $dialRadius}" 
        x2="96" 
        y2="{96 - $dialRadius + $indicatorLength}" 
        stroke="#10b981" 
        stroke-width="4" 
        stroke-linecap="round"
        filter="url(#dial-glow)"
      />
    </g>
    
    <text x="50%" y="55%" text-anchor="middle" class="font-mono text-sm font-semibold fill-slate-700 pointer-events-none">
      {Math.round(value)}
    </text>
  </svg>
</div>
