<script lang="ts">
  let svgElement: SVGSVGElement;
  let scale = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isDragging = $state(false);

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomSensitivity = 0.005;
    const delta = -e.deltaY * zoomSensitivity;
    
    // Zoom around cursor
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const newScale = Math.max(0.1, Math.min(10, scale * (1 + delta)));
    const ratio = newScale / scale;

    panX = cx - (cx - panX) * ratio;
    panY = cy - (cy - panY) * ratio;
    scale = newScale;
  }

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    svgElement.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (isDragging) {
      panX += e.movementX;
      panY += e.movementY;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
    svgElement.releasePointerCapture(e.pointerId);
  }
</script>

<div class="w-full h-full min-h-[400px] bg-[#0e1116] rounded-2xl overflow-hidden relative shadow-inner">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    bind:this={svgElement}
    class="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    onwheel={handleWheel}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <defs>
      <!-- Base grid that scales -->
      <pattern id="infinite-grid" width={40 * scale} height={40 * scale} patternUnits="userSpaceOnUse" x={panX} y={panY}>
        <circle cx={20 * scale} cy={20 * scale} r={1.5 * scale} fill="rgba(255,255,255,0.15)" />
        <rect width={40 * scale} height={40 * scale} fill="none" stroke="rgba(255,255,255,0.03)" stroke-width={1 * scale} />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#infinite-grid)" />
    
    <!-- Render some persistent data nodes in the grid -->
    <g transform="translate({panX}, {panY}) scale({scale})">
      <circle cx="200" cy="200" r="20" fill="#10b981" />
      <text x="200" y="240" fill="#10b981" font-size="12" font-family="monospace" text-anchor="middle">NODE-ALPHA</text>
      
      <circle cx="400" cy="150" r="15" fill="#3b82f6" />
      <line x1="200" y1="200" x2="400" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
    </g>
  </svg>
  
  <div class="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono px-3 py-1.5 rounded-lg">
    ZOOM: {(scale * 100).toFixed(0)}%
  </div>
</div>
