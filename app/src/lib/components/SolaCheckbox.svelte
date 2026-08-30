<script lang="ts">
  let {
    checked = false,
    indeterminate = false,
    label = '',
    disabled = false,
    onchange = (_v: boolean) => {}
  } = $props<{
    checked?: boolean;
    indeterminate?: boolean;
    label?: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  }>();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    indeterminate = false;
    onchange(checked);
  }
</script>

<label class="inline-flex items-center gap-2.5 cursor-pointer select-none group {disabled ? 'opacity-50 pointer-events-none' : ''}">
  <button
    type="button"
    role="checkbox"
    aria-checked={indeterminate ? 'mixed' : checked}
    class="relative w-[18px] h-[18px] rounded-md border-2 transition-all duration-150 flex items-center justify-center shrink-0
      focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-1 outline-none
      {checked || indeterminate
        ? 'bg-emerald-500 border-emerald-500'
        : 'border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 group-hover:border-slate-400 dark:group-hover:border-white/30'}"
    onclick={toggle}
    {disabled}
  >
    {#if checked}
      <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    {:else if indeterminate}
      <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
        <path d="M5 12h14"/>
      </svg>
    {/if}
  </button>
  {#if label}
    <span class="text-sm text-slate-700 dark:text-slate-300">{label}</span>
  {/if}
</label>
