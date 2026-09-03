<script lang="ts">
  type DataPoint = { label: string; value: number };

  let {
    data = [
      { label: 'Jan', value: 34 },
      { label: 'Feb', value: 45 },
      { label: 'Mar', value: 31 },
      { label: 'Apr', value: 68 },
      { label: 'May', value: 52 },
      { label: 'Jun', value: 89 },
      { label: 'Jul', value: 74 },
      { label: 'Aug', value: 95 }
    ],
    type = 'area', // 'area' | 'line' | 'bar'
    title = 'Signal Telemetry',
    subtitle = 'Real-time throughput metrics',
    color = 'emerald', // 'emerald' | 'sky' | 'indigo' | 'amber' | 'rose'
    height = 200,
    showGrid = true,
    showPoints = true
  } = $props<{
    data?: DataPoint[];
    type?: 'area' | 'line' | 'bar';
    title?: string;
    subtitle?: string;
    color?: 'emerald' | 'sky' | 'indigo' | 'amber' | 'rose';
    height?: number;
    showGrid?: boolean;
    showPoints?: boolean;
  }>();

  let hoveredIndex = $state<number | null>(null);

  const colorMap = {
    emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)', bg: 'bg-blue-500' },
    sky: { stroke: '#0ea5e9', fill: 'rgba(14, 165, 233, 0.2)', bg: 'bg-sky-500' },
    indigo: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.2)', bg: 'bg-indigo-500' },
    amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)', bg: 'bg-amber-500' },
    rose: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.2)', bg: 'bg-rose-500' }
  };

  const activeColor = $derived(colorMap[color] || colorMap.emerald);

  const values = $derived(data.map(d => d.value));
  const maxVal = $derived(Math.max(...values, 100));
  const minVal = $derived(Math.min(...values, 0));

  const svgWidth = 600;
  const svgHeight = $derived(height);
  const paddingX = 40;
  const paddingY = 24;

  const innerWidth = $derived(svgWidth - paddingX * 2);
  const innerHeight = $derived(svgHeight - paddingY * 2);

  function getX(index: number) {
    if (data.length <= 1) return paddingX + innerWidth / 2;
    return paddingX + (index / (data.length - 1)) * innerWidth;
  }

  function getY(val: number) {
    const norm = (val - minVal) / (maxVal - minVal || 1);
    return paddingY + innerHeight - norm * innerHeight;
  }

  const pathPoints = $derived(
    data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ')
  );

  const areaPath = $derived(
    `M ${getX(0)},${paddingY + innerHeight} ` +
    data.map((d, i) => `L ${getX(i)},${getY(d.value)}`).join(' ') +
    ` L ${getX(data.length - 1)},${paddingY + innerHeight} Z`
  );

  const linePath = $derived(
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ')
  );
</script>

<div class="w-full bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-white/10 rounded-3xl p-5 shadow-xs select-none">
  <!-- Header -->
  <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
    <div>
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-[68ch]">{subtitle}</p>
    </div>
    {#if hoveredIndex !== null && data[hoveredIndex]}
      <div class="flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-xl">
        <span class="text-xs text-slate-500 dark:text-slate-400">{data[hoveredIndex].label}:</span>
        <span class="text-xs font-semibold font-mono text-slate-900 dark:text-white">{data[hoveredIndex].value}</span>
      </div>
    {/if}
  </div>

  <!-- SVG Viewport -->
  <div class="relative w-full overflow-hidden" style="height: {height}px;">
    <svg viewBox="0 0 {svgWidth} {svgHeight}" class="w-full h-full overflow-visible">
      <!-- Gridlines -->
      {#if showGrid}
        {#each [0, 0.25, 0.5, 0.75, 1] as tick}
          {@const y = paddingY + innerHeight * (1 - tick)}
          <line
            x1={paddingX}
            y1={y}
            x2={svgWidth - paddingX}
            y2={y}
            stroke="currentColor"
            class="text-slate-100 dark:text-white/[0.04]"
            stroke-dasharray="3 3"
          />
        {/each}
      {/if}

      <!-- Area Gradient -->
      {#if type === 'area'}
        <defs>
          <linearGradient id="chartGradient-{color}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color={activeColor.stroke} stop-opacity="0.3"/>
            <stop offset="100%" stop-color={activeColor.stroke} stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGradient-{color})" />
      {/if}

      <!-- Line -->
      {#if type === 'area' || type === 'line'}
        <path
          d={linePath}
          fill="none"
          stroke={activeColor.stroke}
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}

      <!-- Bar Chart -->
      {#if type === 'bar'}
        {#each data as d, i}
          {@const x = getX(i) - 14}
          {@const y = getY(d.value)}
          {@const barH = paddingY + innerHeight - y}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <rect
            {x}
            {y}
            width="28"
            height={barH}
            rx="6"
            fill={activeColor.stroke}
            class="transition-all duration-200 cursor-pointer hover:opacity-80 {hoveredIndex === i ? 'brightness-125' : ''}"
            onmouseenter={() => (hoveredIndex = i)}
            onmouseleave={() => (hoveredIndex = null)}
          />
        {/each}
      {/if}

      <!-- Interactive Points -->
      {#if showPoints && type !== 'bar'}
        {#each data as d, i}
          {@const x = getX(i)}
          {@const y = getY(d.value)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            class="cursor-pointer"
            onmouseenter={() => (hoveredIndex = i)}
            onmouseleave={() => (hoveredIndex = null)}
          >
            <circle
              cx={x}
              cy={y}
              r={hoveredIndex === i ? 6 : 4}
              fill="#fff"
              stroke={activeColor.stroke}
              stroke-width={hoveredIndex === i ? 3 : 2}
              class="transition-all duration-150"
            />
          </g>
        {/each}
      {/if}
    </svg>
  </div>

  <!-- X-Axis Labels -->
  <div class="flex justify-between items-center px-4 pt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
    {#each data as d, i}
      <span class={hoveredIndex === i ? 'text-blue-500 font-bold' : ''}>{d.label}</span>
    {/each}
  </div>
</div>
