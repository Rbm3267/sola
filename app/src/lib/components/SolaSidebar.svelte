<script lang="ts">
  type NavItem = {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    badge?: string | number;
    active?: boolean;
    disabled?: boolean;
  };

  type NavGroup = {
    title?: string;
    items: NavItem[];
  };

  let {
    groups = [
      {
        title: 'Core Platform',
        items: [
          { id: 'dashboard', label: 'Dashboard', active: true, badge: 'Live' },
          { id: 'analytics', label: 'Analytics', active: false },
          { id: 'signals', label: 'Signal Bus', active: false, badge: 3 }
        ]
      },
      {
        title: 'Workspaces',
        items: [
          { id: 'studio', label: 'Design Studio', active: false },
          { id: 'deployments', label: 'Deployments', active: false },
          { id: 'settings', label: 'Settings', active: false }
        ]
      }
    ],
    collapsed = false,
    activeId = 'dashboard',
    onselect = (_item: NavItem) => {}
  } = $props<{
    groups?: NavGroup[];
    collapsed?: boolean;
    activeId?: string;
    onselect?: (item: NavItem) => void;
  }>();

  function selectItem(item: NavItem) {
    if (item.disabled) return;
    activeId = item.id;
    onselect(item);
  }
</script>

<aside
  class="h-full flex flex-col justify-between bg-white dark:bg-[#090d19] border-r border-slate-200/80 dark:border-white/10 transition-all duration-300 select-none {collapsed ? 'w-16' : 'w-64'}"
>
  <!-- Top: Brand / Header -->
  <div>
    <div class="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5">
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
        </div>
        {#if !collapsed}
          <div class="truncate">
            <h2 class="text-sm font-black text-slate-900 dark:text-white tracking-tight">Sola Core</h2>
            <p class="text-[10px] text-slate-400 font-mono">Enterprise v1.0</p>
          </div>
        {/if}
      </div>

      <button
        onclick={() => (collapsed = !collapsed)}
        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <svg class="w-4 h-4 transition-transform duration-200 {collapsed ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
    </div>

    <!-- Nav Items -->
    <div class="p-3 space-y-5 overflow-y-auto">
      {#each groups as group}
        <div>
          {#if group.title && !collapsed}
            <div class="px-3 pb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
              {group.title}
            </div>
          {/if}
          <div class="space-y-1">
            {#each group.items as item}
              {@const isSelected = activeId === item.id}
              <button
                type="button"
                onclick={() => selectItem(item)}
                class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer {item.disabled ? 'opacity-40 pointer-events-none' : ''} {isSelected ? 'bg-emerald-500 text-slate-950 shadow-xs shadow-emerald-500/20 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}"
                title={collapsed ? item.label : undefined}
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-4 h-4 shrink-0 flex items-center justify-center {isSelected ? 'text-slate-950' : 'text-slate-400'}">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </div>
                  {#if !collapsed}
                    <span class="truncate">{item.label}</span>
                  {/if}
                </div>

                {#if item.badge && !collapsed}
                  <span class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md {isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'}">
                    {item.badge}
                  </span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Bottom: Profile Footer -->
  <div class="p-3 border-t border-slate-100 dark:border-white/5">
    <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer overflow-hidden">
      <div class="w-8 h-8 rounded-full bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
        SA
      </div>
      {#if !collapsed}
        <div class="truncate min-w-0">
          <p class="text-xs font-bold text-slate-900 dark:text-white truncate">Sola Admin</p>
          <p class="text-[10px] text-slate-400 truncate">admin@sola-air.dev</p>
        </div>
      {/if}
    </div>
  </div>
</aside>
