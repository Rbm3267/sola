<script lang="ts">
  let { config = { title: 'Live Event Stream', events: [] } } = $props<{
    config: {
      title: string;
      events?: Array<{ id: string; message: string; timestamp: string; type?: 'info' | 'success' | 'warning' }>;
    };
  }>();

  const defaultEvents = [
    { id: '1', message: 'Sola runtime attached to DOM root', timestamp: '00:01.02', type: 'success' },
    { id: '2', message: 'Fine-grained signal effect registered', timestamp: '00:01.18', type: 'info' },
    { id: '3', message: 'Zero-VDOM batch flush completed (0.4ms)', timestamp: '00:01.45', type: 'info' }
  ];

  const events = $derived(config.events && config.events.length > 0 ? config.events : defaultEvents);
</script>

<div class="bg-white/95 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-3xl p-6 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.04)] w-full">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-3 mb-4">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
      <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{config.title || 'Live Stream'}</span>
    </div>
    <span class="text-[10px] font-mono bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.04]">
      0 ms Latency
    </span>
  </div>

  <!-- Event Log Stream -->
  <div class="flex flex-col gap-2">
    {#each events as ev}
      <div class="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.04] text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full {ev.type === 'success' ? 'bg-blue-500' : ev.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'}"></span>
          <span class="text-slate-800 dark:text-slate-200 font-medium">{ev.message}</span>
        </div>
        <span class="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>
      </div>
    {/each}
  </div>
</div>
