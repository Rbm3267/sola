<script lang="ts">
  let {
    keys = ['⌘', 'K'],
    size = 'md' // 'sm' | 'md' | 'lg'
  } = $props<{
    keys?: string[];
    size?: 'sm' | 'md' | 'lg';
  }>();

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] min-w-[18px]',
    md: 'px-2 py-1 text-xs min-w-[22px]',
    lg: 'px-2.5 py-1.5 text-sm min-w-[28px]'
  };
</script>

<div class="inline-flex items-center gap-1">
  {#each keys as key}
    <kbd
      class="inline-flex items-center justify-center font-mono font-bold rounded-lg border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 shadow-[0_2px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_2px_0_0_rgba(255,255,255,0.05)] {sizeClasses[size]}"
    >
      {key}
    </kbd>
  {/each}
</div>
