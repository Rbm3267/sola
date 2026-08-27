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

<div class="bg-white border border-slate-200/80 rounded-2xl p-5 w-full hover:border-slate-300 transition-colors duration-150">
  <div class="flex justify-between items-center mb-4">
    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{config.title}</span>
    {#if config.icon}
      <div class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <div class="i-lucide-{config.icon} text-sm"></div>
      </div>
    {/if}
  </div>

  <div class="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
    {config.value}
  </div>

  {#if config.trend}
    <div class="flex items-center gap-1.5 text-[13px] font-semibold {isPositive ? 'text-emerald-600' : 'text-rose-500'}">
      {#if isPositive}
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l5-5 5 5"/></svg>
      {:else}
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l5 5 5-5"/></svg>
      {/if}
      <span>{config.trend}</span>
      <span class="text-slate-400 font-medium text-xs ml-0.5">vs last month</span>
    </div>
  {/if}
</div>
