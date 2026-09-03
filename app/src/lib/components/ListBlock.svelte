<script lang="ts">
  type Item = { label: string; description: string; status?: string };
  let { config } = $props<{
    config: { title: string; items: Item[] }
  }>();

  function getStatusBadge(status?: string) {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower.includes('active') || lower.includes('healthy') || lower.includes('online')) {
      return { bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' };
    }
    if (lower.includes('degraded') || lower.includes('warn') || lower.includes('maint')) {
      return { bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' };
    }
    return { bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' };
  }
</script>

<div class="group relative bg-white/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-6px_rgba(14,165,233,0.12)] hover:border-sky-300 dark:border-sky-500/30/80 transition-all duration-200 overflow-hidden w-full">
  
  <!-- Header -->
  <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.04] relative z-10">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">{config.title}</span>
    </div>
    <span class="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">{config.items?.length || 0} entities</span>
  </div>

  <!-- Item List -->
  <div class="flex flex-col divide-y divide-slate-100/80 relative z-10">
    {#each config.items as item}
      {@const badge = getStatusBadge(item.status)}
      <div class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group/row hover:bg-slate-50/60 dark:bg-white/[0.04] px-2 -mx-2 rounded-xl transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.08] border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono">{item.label}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</div>
          </div>
        </div>

        {#if badge}
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono border {badge.bg} shrink-0">
            <span class="w-1.5 h-1.5 rounded-full {badge.dot} animate-pulse"></span>
            <span>{item.status}</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
