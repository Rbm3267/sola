<script lang="ts">
  type Field = { name: string; type: string; label: string; required?: boolean };
  let { config, onSubmit } = $props<{ 
    config: { title: string; endpoint: string; fields: Field[] }, 
    onSubmit?: (data: any) => void 
  }>();

  let formData = $state<Record<string, any>>({});

  function handleSubmit(e: Event) {
    e.preventDefault();
    onSubmit?.(formData);
  }
</script>

<div class="bg-white border border-slate-200/80 rounded-2xl p-5 w-full hover:border-slate-300 transition-colors duration-150">
  <div class="mb-4">
    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{config.title}</span>
    <div class="text-xs font-mono text-sky-600 mt-1.5">POST {config.endpoint}</div>
  </div>

  <form onsubmit={handleSubmit} class="flex flex-col gap-3">
    {#each config.fields as field}
      <div class="flex flex-col gap-1.5">
        <label for={field.name} class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">{field.label}</label>
        <input 
          id={field.name}
          type={field.type} 
          required={field.required}
          bind:value={formData[field.name]}
          class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-50 transition-all duration-150"
          placeholder="Enter {field.label.toLowerCase()}..."
        />
      </div>
    {/each}
    
    <button type="submit" class="mt-2 bg-slate-900 text-white font-semibold text-sm py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors duration-150 active:scale-[0.98]">
      Submit
    </button>
  </form>
</div>
