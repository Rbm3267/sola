<script lang="ts">
  import { spring } from 'svelte/motion';

  let { value = $bindable(50), min = 0, max = 100 } = $props();

  let isDragging = $state(false);
  let svgElement: SVGSVGElement;

  // Springs for the physical geometry of the scrubber
  const heightStr = spring(8, { stiffness: 0.1, damping: 0.4 });
  const playheadRadius = spring(6, { stiffness: 0.2, damping: 0.5 });
  const glowOpacity = spring(0, { stiffness: 0.1, damping: 0.5 });

  function updateValueFromMouse(clientX: number) {
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    value = min + percentage * (max - min);
  }

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    svgElement.setPointerCapture(e.pointerId);
    updateValueFromMouse(e.clientX);
    
    // Expand geometry for precise scrubbing
    heightStr.set(32);
    playheadRadius.set(12);
    glowOpacity.set(1);
  }

  function handlePointerMove(e: PointerEvent) {
    if (isDragging) {
      updateValueFromMouse(e.clientX);
    }
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
    svgElement.releasePointerCapture(e.pointerId);
    
    // Collapse geometry back to compact mode
    heightStr.set(8);
    playheadRadius.set(6);
    glowOpacity.set(0);
  }

  let percentage = $derived((value - min) / (max - min));
</script>

<div class="w-full flex flex-col gap-2">
  <div class="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
    <span>{min}</span>
    <span class="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-white/[0.08] px-2 py-0.5 rounded-md shadow-xs">
      {value.toFixed(1)}
    </span>
    <span>{max}</span>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    bind:this={svgElement}
    class="w-full overflow-visible touch-none cursor-ew-resize"
    style="height: {$heightStr}px;"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <defs>
      <filter id="scrubber-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background Track -->
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      rx={$heightStr / 2}
      fill="#e2e8f0"
    />

    <!-- Fill Track -->
    <rect
      x="0"
      y="0"
      width="{percentage * 100}%"
      height="100%"
      rx={$heightStr / 2}
      fill="#10b981"
      opacity="0.9"
    />

    <!-- Ambient Micro-Timeline Markers (only visible when expanded) -->
    <g opacity={$glowOpacity * 0.5}>
      {#each Array(10) as _, i}
        <line
          x1="{i * 10}%"
          y1="25%"
          x2="{i * 10}%"
          y2="75%"
          stroke="#fff"
          stroke-width="1"
          stroke-linecap="round"
        />
      {/each}
    </g>

    <!-- Playhead -->
    <circle
      cx="{percentage * 100}%"
      cy="50%"
      r={$playheadRadius}
      fill="#fff"
      stroke="#10b981"
      stroke-width="2"
      filter="url(#scrubber-glow)"
    />
  </svg>
</div>
