<script lang="ts">
  import type { Snippet } from 'svelte';

  type IconType = 'search' | 'inbox' | 'folder' | 'chart' | 'users';

  let {
    title = 'No items found',
    description = 'Get started by creating a new entry or adjusting your filters.',
    icon = 'inbox',
    actionLabel = '',
    onaction = () => {},
    children
  }: {
    title?: string;
    description?: string;
    icon?: IconType;
    actionLabel?: string;
    onaction?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class="flex flex-col items-center justify-center text-center p-8 sm:p-12 font-sans select-none">
  <!-- Icon container -->
  <div class="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-slate-500 mb-4 shadow-sm">
    {#if icon === 'search'}
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
    {:else if icon === 'folder'}
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
      </svg>
    {:else if icon === 'chart'}
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <path d="M3 20h18"/>
      </svg>
    {:else if icon === 'users'}
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    {:else}
      <!-- inbox default -->
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
      </svg>
    {/if}
  </div>

  <!-- Heading -->
  <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
    {title}
  </h3>

  <!-- Description -->
  {#if description}
    <p class="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
      {description}
    </p>
  {/if}

  <!-- Action button / custom snippet -->
  {#if actionLabel}
    <div class="mt-5">
      <button
        type="button"
        onclick={onaction}
        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-blue-400 shadow-sm active:scale-95 transition-all duration-150 cursor-pointer"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>{actionLabel}</span>
      </button>
    </div>
  {/if}

  {@render children?.()}
</div>
