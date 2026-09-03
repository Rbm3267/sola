<script lang="ts">
  import { spring } from 'svelte/motion';

  // The PIP window coordinates
  const pipX = spring(50, { stiffness: 0.1, damping: 0.4 });
  const pipY = spring(50, { stiffness: 0.1, damping: 0.4 });
  
  // Data anomalies on the background canvas
  const anomalies = [
    { x: 300, y: 100, severity: 0.8 },
    { x: 150, y: 300, severity: 0.5 },
    { x: 500, y: 200, severity: 0.9 }
  ];

  let containerElement: HTMLDivElement;

  function handleMouseMove(e: MouseEvent) {
    if (!containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Magnetic pull to anomalies if cursor is near them
    let targetX = mx;
    let targetY = my;
    
    for (const anomaly of anomalies) {
      const dx = anomaly.x - mx;
      const dy = anomaly.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        // Magnetize PIP to the anomaly
        targetX = anomaly.x + 20;
        targetY = anomaly.y - 20;
        break;
      }
    }
    
    pipX.set(targetX);
    pipY.set(targetY);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  bind:this={containerElement}
  class="w-full h-full min-h-[400px] bg-slate-100 dark:bg-white/[0.08] rounded-2xl overflow-hidden relative cursor-default border border-slate-200 dark:border-white/[0.04]"
  onmousemove={handleMouseMove}
>
  <!-- Background anomalies -->
  <svg class="absolute inset-0 w-full h-full pointer-events-none">
    {#each anomalies as a}
      <circle cx={a.x} cy={a.y} r={a.severity * 20} fill="#rose-500" opacity="0.2" />
      <circle cx={a.x} cy={a.y} r="4" fill="#e11d48" />
      <text x={a.x + 10} y={a.y + 4} fill="#e11d48" font-size="10" font-family="monospace">ANOMALY_DETECTED</text>
    {/each}
  </svg>

  <!-- Glassmorphic PIP -->
  <div 
    class="absolute w-48 h-32 rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-3 flex flex-col justify-between pointer-events-none"
    style="
      left: {$pipX}px; 
      top: {$pipY}px;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    "
  >
    <div class="flex justify-between items-center">
      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Telemetry PIP</span>
      <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
    </div>
    <div class="text-xs font-mono text-slate-600 dark:text-slate-400">
      Tracking X: {Math.round($pipX)}<br/>
      Tracking Y: {Math.round($pipY)}
    </div>
  </div>
</div>
