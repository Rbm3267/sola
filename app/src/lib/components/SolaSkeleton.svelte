<script lang="ts">
  let {
    variant = 'line',
    width = 'full',
    height = 'default',
    count = 1,
    animate = true
  } = $props<{
    variant?: 'line' | 'circle' | 'card' | 'text';
    width?: 'full' | '3/4' | '1/2' | '1/4';
    height?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
    count?: number;
    animate?: boolean;
  }>();

  const widthMap: Record<string, string> = {
    'full': 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4'
  };

  const heightMap: Record<string, string> = {
    xs: 'h-3',
    sm: 'h-4',
    default: 'h-5',
    lg: 'h-8',
    xl: 'h-12'
  };
</script>

<div class="flex flex-col gap-3" role="status" aria-label="Loading">
  {#each Array(count) as _, i}
    {#if variant === 'circle'}
      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 {animate ? 'animate-pulse' : ''}"></div>
    {:else if variant === 'card'}
      <div class="w-full rounded-2xl bg-slate-200 dark:bg-white/10 {animate ? 'animate-pulse' : ''} p-5 space-y-3">
        <div class="h-4 w-1/3 rounded-lg bg-slate-300 dark:bg-white/10"></div>
        <div class="h-3 w-full rounded-lg bg-slate-300 dark:bg-white/10"></div>
        <div class="h-3 w-2/3 rounded-lg bg-slate-300 dark:bg-white/10"></div>
      </div>
    {:else if variant === 'text'}
      <div class="space-y-2">
        <div class="h-4 w-full rounded bg-slate-200 dark:bg-white/10 {animate ? 'animate-pulse' : ''}"></div>
        <div class="h-4 w-5/6 rounded bg-slate-200 dark:bg-white/10 {animate ? 'animate-pulse' : ''}"></div>
        <div class="h-4 w-4/6 rounded bg-slate-200 dark:bg-white/10 {animate ? 'animate-pulse' : ''}"></div>
      </div>
    {:else}
      <div class="{widthMap[width]} {heightMap[height]} rounded-lg bg-slate-200 dark:bg-white/10 {animate ? 'animate-pulse' : ''}"></div>
    {/if}
  {/each}
</div>
