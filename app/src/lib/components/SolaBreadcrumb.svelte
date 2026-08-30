<script lang="ts">
  type BreadcrumbItem = {
    label: string;
    href?: string;
    onclick?: (e?: MouseEvent) => void;
  };

  let {
    items = []
  } = $props<{
    items?: BreadcrumbItem[];
  }>();

  let popoverOpen = $state(false);
  let buttonEl: HTMLButtonElement | null = $state(null);
  let popoverEl: HTMLDivElement | null = $state(null);

  function handleWindowClick(e: MouseEvent) {
    if (popoverOpen && popoverEl && buttonEl) {
      if (!popoverEl.contains(e.target as Node) && !buttonEl.contains(e.target as Node)) {
        popoverOpen = false;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && popoverOpen) {
      popoverOpen = false;
      buttonEl?.focus();
    }
  }

  const shouldTruncate = $derived(items.length > 4);
  const firstItem = $derived(items[0]);
  const hiddenItems = $derived(shouldTruncate ? items.slice(1, items.length - 2) : []);
  const secondToLastItem = $derived(shouldTruncate ? items[items.length - 2] : null);
  const lastItem = $derived(items[items.length - 1]);
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<nav aria-label="Breadcrumb" class="flex items-center text-sm font-medium">
  <ol class="flex items-center flex-wrap gap-1.5 sm:gap-2">
    {#if !shouldTruncate}
      <!-- Render all items directly if <= 4 -->
      {#each items as item, index}
        {@const isLast = index === items.length - 1}
        <li class="flex items-center gap-1.5 sm:gap-2">
          {#if isLast}
            <span
              class="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
              aria-current="page"
            >
              {item.label}
            </span>
          {:else}
            {#if item.href}
              <a
                href={item.href}
                onclick={item.onclick}
                class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </a>
            {:else}
              <button
                type="button"
                onclick={item.onclick}
                class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[150px] cursor-pointer"
              >
                {item.label}
              </button>
            {/if}
            <!-- Chevron separator -->
            <svg
              class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          {/if}
        </li>
      {/each}
    {:else}
      <!-- Truncated items view (> 4 items) -->
      <!-- 1. First Item -->
      {#if firstItem}
        <li class="flex items-center gap-1.5 sm:gap-2">
          {#if firstItem.href}
            <a
              href={firstItem.href}
              onclick={firstItem.onclick}
              class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[150px]"
            >
              {firstItem.label}
            </a>
          {:else}
            <button
              type="button"
              onclick={firstItem.onclick}
              class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[150px] cursor-pointer"
            >
              {firstItem.label}
            </button>
          {/if}
          <!-- Chevron -->
          <svg
            class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </li>
      {/if}

      <!-- 2. Ellipsis popover button -->
      <li class="relative flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          bind:this={buttonEl}
          onclick={() => (popoverOpen = !popoverOpen)}
          class="flex items-center justify-center w-6 h-6 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
          aria-expanded={popoverOpen}
          aria-haspopup="true"
          aria-label="Show hidden breadcrumbs"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>

        {#if popoverOpen}
          <div
            bind:this={popoverEl}
            class="absolute left-0 top-full mt-1.5 z-30 min-w-[180px] py-1.5 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl backdrop-blur-md"
            role="menu"
          >
            {#each hiddenItems as item}
              {#if item.href}
                <a
                  href={item.href}
                  onclick={(e) => {
                    popoverOpen = false;
                    item.onclick?.(e);
                  }}
                  class="flex items-center px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  role="menuitem"
                >
                  {item.label}
                </a>
              {:else}
                <button
                  type="button"
                  onclick={(e) => {
                    popoverOpen = false;
                    item.onclick?.(e);
                  }}
                  class="w-full text-left flex items-center px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  {item.label}
                </button>
              {/if}
            {/each}
          </div>
        {/if}

        <!-- Chevron -->
        <svg
          class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </li>

      <!-- 3. Second-to-last Item -->
      {#if secondToLastItem}
        <li class="flex items-center gap-1.5 sm:gap-2">
          {#if secondToLastItem.href}
            <a
              href={secondToLastItem.href}
              onclick={secondToLastItem.onclick}
              class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[150px]"
            >
              {secondToLastItem.label}
            </a>
          {:else}
            <button
              type="button"
              onclick={secondToLastItem.onclick}
              class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[150px] cursor-pointer"
            >
              {secondToLastItem.label}
            </button>
          {/if}
          <!-- Chevron -->
          <svg
            class="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </li>
      {/if}

      <!-- 4. Last Item (current page) -->
      {#if lastItem}
        <li class="flex items-center">
          <span
            class="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
            aria-current="page"
          >
            {lastItem.label}
          </span>
        </li>
      {/if}
    {/if}
  </ol>
</nav>
