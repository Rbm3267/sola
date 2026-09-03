<script lang="ts">
  let {
    title = 'Sola Architecture',
    description = 'Zero-VDOM, direct reactive graph bindings with no diffing between a signal write and the DOM.',
    handle = '@sola-engine',
    avatarText = 'SO'
  } = $props<{
    title?: string;
    description?: string;
    handle?: string;
    avatarText?: string;
  }>();

  let isHovered = $state(false);
  let timer: any;

  function handleMouseEnter() {
    clearTimeout(timer);
    isHovered = true;
  }

  function handleMouseLeave() {
    timer = setTimeout(() => {
      isHovered = false;
    }, 150);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative inline-block" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
  <button type="button" class="text-sm font-semibold text-blue-600 dark:text-blue-400 underline decoration-dotted underline-offset-4 cursor-pointer">
    {handle}
  </button>

  {#if isHovered}
    <div class="absolute z-50 bottom-full left-0 mb-2 w-72 p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl animate-[fadeSlide_150ms_ease-out]">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0">
          {avatarText}
        </div>
        <div class="min-w-0">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{handle}</p>
        </div>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
        {description}
      </p>
      <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
        <span>Signal Status</span>
        <span class="text-blue-500 font-bold">Signal Mesh</span>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
