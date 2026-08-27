<script lang="ts">
  type Field = { name: string; type: string; label: string; required?: boolean };
  let { config, onSubmit } = $props<{ 
    config: { title: string; endpoint: string; fields: Field[] }, 
    onSubmit?: (data: any) => void 
  }>();

  let formData = $state<Record<string, any>>({});
  let submitted = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    submitted = true;
    onSubmit?.(formData);
    setTimeout(() => { submitted = false; }, 2500);
  }
</script>

<div class="group relative bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-6px_rgba(14,165,233,0.12)] hover:border-sky-300/80 transition-all duration-200 overflow-hidden w-full">
  
  <!-- Subtle ambient corner glow -->
  <div class="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-violet-400/10 to-sky-400/10 rounded-full blur-xl pointer-events-none"></div>

  <!-- Header -->
  <div class="flex items-center justify-between mb-5 relative z-10">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">{config.title}</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-mono text-slate-500">
        <span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200/60">POST</span>
        <span class="text-slate-600 font-semibold">{config.endpoint}</span>
      </div>
    </div>

    <div class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    </div>
  </div>

  <!-- Form Fields -->
  <form onsubmit={handleSubmit} class="flex flex-col gap-3.5 relative z-10">
    {#each config.fields as field}
      <div class="flex flex-col gap-1">
        <label for={field.name} class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          {field.label} {#if field.required}<span class="text-rose-500">*</span>{/if}
        </label>
        <div class="relative">
          <input 
            id={field.name}
            type={field.type} 
            required={field.required}
            bind:value={formData[field.name]}
            class="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-3 focus:ring-sky-500/10 transition-all font-medium"
            placeholder="Enter {field.label.toLowerCase()}..."
          />
        </div>
      </div>
    {/each}
    
    <button 
      type="submit" 
      class="mt-2 w-full bg-slate-950 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl hover:bg-slate-800 transition-all shadow-[0_4px_12px_rgba(15,23,42,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2">
      {#if submitted}
        <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="text-emerald-300">Payload Dispatched</span>
      {:else}
        <span>Execute Request</span>
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      {/if}
    </button>
  </form>
</div>
