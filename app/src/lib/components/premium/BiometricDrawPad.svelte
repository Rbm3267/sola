<script lang="ts">
  interface Point {
    x: number;
    y: number;
    pressure: number;
    speed: number;
  }

  let svgElement: SVGSVGElement;
  let points = $state<Point[]>([]);
  let isDrawing = false;
  let lastTime = 0;
  
  // Calculate a smooth Catmull-Rom or variable width line
  // For zero dependencies, we use simple variable-radius circles or a path with stroke-width
  // But true variable width SVG paths need outline geometry. 
  // We will simulate it using hundreds of overlapping circles connected by thick lines,
  // where the radius maps to speed/pressure.

  function getStrokeWidth(speed: number, pressure: number) {
    // Faster speed = thinner line, higher pressure = thicker line
    const base = pressure > 0 ? pressure * 8 : 4;
    return Math.max(1, base - speed * 0.1);
  }

  function handlePointerDown(e: PointerEvent) {
    isDrawing = true;
    svgElement.setPointerCapture(e.pointerId);
    points = [];
    lastTime = Date.now();
    addPoint(e);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing) return;
    addPoint(e);
  }

  function handlePointerUp(e: PointerEvent) {
    isDrawing = false;
    svgElement.releasePointerCapture(e.pointerId);
  }

  function addPoint(e: PointerEvent) {
    const rect = svgElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const now = Date.now();
    const dt = Math.max(1, now - lastTime);
    lastTime = now;

    let speed = 0;
    if (points.length > 0) {
      const last = points[points.length - 1];
      const dx = x - last.x;
      const dy = y - last.y;
      speed = Math.sqrt(dx*dx + dy*dy) / dt;
    }

    // e.pressure is available on pen/stylus, default 0.5 for mouse
    const pressure = e.pressure > 0 ? e.pressure : 0.5;

    points = [...points, { x, y, pressure, speed }];
  }

  function clear() {
    points = [];
  }
</script>

<div class="w-full flex flex-col gap-2">
  <div class="flex justify-between items-center px-1">
    <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Signature Pad</span>
    <button onclick={clear} class="text-xs text-slate-400 hover:text-slate-700 dark:text-slate-300 font-mono uppercase cursor-pointer">Clear</button>
  </div>

  <div class="w-full h-[200px] bg-slate-50 dark:bg-white/[0.04] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.04] overflow-hidden relative">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <svg
      bind:this={svgElement}
      class="absolute inset-0 w-full h-full touch-none cursor-crosshair"
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
    >
      <!-- Fluid ink effect -->
      <defs>
        <filter id="ink-bleed">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feColorMatrix mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -5" />
        </filter>
      </defs>

      <g filter="url(#ink-bleed)" fill="#0f172a" stroke="#0f172a">
        {#if points.length > 0}
          {#each points as pt, i}
            {#if i > 0}
              <line 
                x1={points[i-1].x} 
                y1={points[i-1].y} 
                x2={pt.x} 
                y2={pt.y} 
                stroke-width={getStrokeWidth(pt.speed, pt.pressure)}
                stroke-linecap="round"
              />
            {/if}
            <circle cx={pt.x} cy={pt.y} r={getStrokeWidth(pt.speed, pt.pressure) / 2} />
          {/each}
        {/if}
      </g>
    </svg>
  </div>
</div>
