<script lang="ts">
  import { spring } from 'svelte/motion';

  interface DockItem {
    id: string;
    icon: string;
    color: string;
  }

  let { items = [] }: { items?: DockItem[] } = $props();

  const defaultItems = [
    { id: '1', icon: 'M3 12h18 M3 6h18 M3 18h18', color: '#3b82f6' },
    { id: '2', icon: 'M12 2v20 M2 12h20', color: '#10b981' },
    { id: '3', icon: 'M12 2l10 20H2L12 2z', color: '#f59e0b' },
    { id: '4', icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', color: '#ec4899' }
  ];

  const displayItems = items.length ? items : defaultItems;
  
  // Track hover state for Mac OS style magnification
  let hoveredIndex = $state<number | null>(null);

</script>

<div class="w-full flex items-center justify-center min-h-[150px] relative">
  <svg width="0" height="0" class="absolute">
    <defs>
      <!-- The magic Liquid Dock filter -->
      <filter id="liquid-dock">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="
          1 0 0 0 0  
          0 1 0 0 0  
          0 0 1 0 0  
          0 0 0 20 -9" result="liquid" />
        <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
      </filter>
    </defs>
  </svg>

  <div 
    class="flex items-end justify-center gap-4 bg-slate-200/50 backdrop-blur-md px-6 py-3 rounded-3xl"
    style="filter: url(#liquid-dock);"
  >
    {#each displayItems as item, i}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 origin-bottom cursor-pointer"
        style="
          background-color: {item.color};
          transform: scale({hoveredIndex === i ? 1.5 : hoveredIndex === i - 1 || hoveredIndex === i + 1 ? 1.2 : 1});
          margin: 0 {hoveredIndex === i ? '12px' : hoveredIndex === i - 1 || hoveredIndex === i + 1 ? '6px' : '0'};
        "
        onmouseenter={() => hoveredIndex = i}
        onmouseleave={() => hoveredIndex = null}
      >
        <svg class="w-6 h-6 text-white transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
             style="transform: scale({hoveredIndex === i ? 0.8 : 1});">
          <path d={item.icon} />
        </svg>
      </div>
    {/each}
  </div>
</div>
