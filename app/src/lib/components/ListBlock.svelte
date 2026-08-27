<script lang="ts">
  let { config } = $props<{
    config: {
      title: string;
      items: Array<{ label: string; description: string; status?: string }>;
    }
  }>();
</script>

<div class="bg-white border border-slate-200/80 rounded-2xl p-5 w-full hover:border-slate-300 transition-colors duration-150">
  <span class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{config.title}</span>

  <div class="flex flex-col mt-4 -mx-1">
    {#each config.items as item, i}
      <div class="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors duration-100 {i < config.items.length - 1 ? 'border-b border-slate-100' : ''}">
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-semibold text-sm text-slate-800 truncate">{item.label}</span>
          <span class="text-xs text-slate-400">{item.description}</span>
        </div>
        {#if item.status}
          <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shrink-0 ml-3 {
            item.status.toLowerCase() === 'active' || item.status.toLowerCase() === 'healthy'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : item.status.toLowerCase() === 'degraded'
            ? 'bg-amber-50 text-amber-600 border border-amber-100'
            : 'bg-slate-50 text-slate-500 border border-slate-200'
          }">
            {item.status}
          </span>
        {/if}
      </div>
    {/each}
  </div>
</div>
