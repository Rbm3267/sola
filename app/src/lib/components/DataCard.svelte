<script lang="ts">
  let { config } = $props<{
    config: {
      title: string;
      value: string;
      trend?: string;
      icon?: string;
    }
  }>();

  const isPositive = $derived(config.trend && !config.trend.startsWith('-'));
</script>

<div class="group relative bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-6px_rgba(14,165,233,0.12)] hover:border-sky-300/80 transition-all duration-200 overflow-hidden">
  
  <!-- Subtle ambient corner glow -->
  <div class="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-sky-400/10 to-violet-400/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-300 pointer-events-none"></div>

  <!-- Header: Title & Icon -->
  <div class="flex justify-between items-center mb-3.5 relative z-10">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full {isPositive ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
      <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">{config.title}</span>
    </div>
    
    <div class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:text-sky-600 group-hover:bg-sky-50 group-hover:border-sky-200 transition-colors">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if config.icon === 'activity' || config.icon === 'trending-up'}
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        {:else if config.icon === 'check-circle' || config.icon === 'check'}
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        {:else if config.icon === 'heart'}
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        {:else}
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        {/if}
      </svg>
    </div>
  </div>

  <!-- Metric Value & Sparkline Area -->
  <div class="flex items-baseline justify-between mb-2 relative z-10">
    <div class="text-3xl font-black text-slate-900 tracking-tight font-sans">
      {config.value}
    </div>

    <!-- Mini SVG sparkline chart -->
    <div class="w-20 h-7 opacity-75 group-hover:opacity-100 transition-opacity">
      {#if isPositive}
        <svg viewBox="0 0 80 28" class="w-full h-full stroke-emerald-500 fill-none" stroke-width="2" stroke-linecap="round">
          <path d="M2 24 Q 20 18, 35 20 T 55 10 T 78 4"/>
          <circle cx="78" cy="4" r="2.5" class="fill-emerald-500"/>
        </svg>
      {:else}
        <svg viewBox="0 0 80 28" class="w-full h-full stroke-rose-400 fill-none" stroke-width="2" stroke-linecap="round">
          <path d="M2 4 Q 20 10, 35 8 T 55 18 T 78 24"/>
          <circle cx="78" cy="24" r="2.5" class="fill-rose-500"/>
        </svg>
      {/if}
    </div>
  </div>

  <!-- Trend Footer Pill -->
  {#if config.trend}
    <div class="flex items-center gap-2 pt-1 border-t border-slate-100 relative z-10">
      <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono {isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'}">
        {#if isPositive}
          <svg class="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
        {:else}
          <svg class="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
        {/if}
        <span>{config.trend}</span>
      </div>
      <span class="text-slate-400 text-[11px] font-medium">vs last period</span>
    </div>
  {/if}
</div>
