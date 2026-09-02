<script lang="ts">
  import type { Snippet } from 'svelte';

  export type Column = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
  };

  const defaultSampleColumns: Column[] = [
    { key: 'name', label: 'Operator / Entity', sortable: true },
    { key: 'role', label: 'System Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'latency', label: 'Latency', sortable: true, align: 'right' },
    { key: 'throughput', label: 'Throughput', sortable: true, align: 'right' },
    { key: 'lastActive', label: 'Last Active', sortable: true }
  ];

  const defaultSampleRows: Record<string, any>[] = [
    { id: '1', name: 'Aria Sterling', role: 'Lead Architect', status: 'Active', latency: '12ms', throughput: '1.4 GB/s', lastActive: 'Just now' },
    { id: '2', name: 'Marcus Vance', role: 'Kernel Engineer', status: 'Active', latency: '18ms', throughput: '920 MB/s', lastActive: '2m ago' },
    { id: '3', name: 'Elena Rostova', role: 'Security Ops', status: 'Auditing', latency: '45ms', throughput: '450 MB/s', lastActive: '14m ago' },
    { id: '4', name: 'Tariq Chen', role: 'Quant Analyst', status: 'Active', latency: '8ms', throughput: '3.2 GB/s', lastActive: '45m ago' },
    { id: '5', name: 'Sofia Alvarez', role: 'Data Strategist', status: 'Idle', latency: '120ms', throughput: '110 MB/s', lastActive: '1h ago' },
    { id: '6', name: 'Devon Kim', role: 'Interface Engineer', status: 'Active', latency: '24ms', throughput: '780 MB/s', lastActive: '3h ago' },
    { id: '7', name: 'Leila Farooq', role: 'Mesh Sentinel', status: 'Auditing', latency: '62ms', throughput: '340 MB/s', lastActive: '5h ago' },
    { id: '8', name: 'Caleb Thorne', role: 'Infrastructure Tech', status: 'Offline', latency: '—', throughput: '0 KB/s', lastActive: '1d ago' }
  ];

  let {
    columns = defaultSampleColumns,
    rows = defaultSampleRows,
    selectable = false,
    striped = false,
    compact = false,
    emptyMessage = 'No matching records found',
    searchable = true,
    searchPlaceholder = 'Filter records...',
    selectedRows = $bindable([]),
    onRowClick = (_row: Record<string, any>) => {},
    children
  }: {
    columns?: Column[];
    rows?: Record<string, any>[];
    selectable?: boolean;
    striped?: boolean;
    compact?: boolean;
    emptyMessage?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    selectedRows?: Record<string, any>[];
    onRowClick?: (row: Record<string, any>) => void;
    children?: Snippet;
  } = $props();

  let sortKey = $state<string | null>(null);
  let sortDirection = $state<'asc' | 'desc' | null>(null);
  let filterQuery = $state('');

  function getRowId(row: Record<string, any>): string {
    return row.id !== undefined ? String(row.id) : JSON.stringify(row);
  }

  function handleSort(key: string, isSortable?: boolean) {
    if (isSortable === false) return;
    if (sortKey !== key) {
      sortKey = key;
      sortDirection = 'asc';
    } else if (sortDirection === 'asc') {
      sortDirection = 'desc';
    } else if (sortDirection === 'desc') {
      sortDirection = null;
      sortKey = null;
    } else {
      sortDirection = 'asc';
    }
  }

  let filteredRows = $derived.by(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      })
    );
  });

  let sortedRows = $derived.by(() => {
    if (!sortKey || !sortDirection) return filteredRows;
    const key = sortKey;
    const dir = sortDirection === 'asc' ? 1 : -1;

    return [...filteredRows].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      // Numeric comparison
      const numA = typeof valA === 'number' ? valA : parseFloat(String(valA).replace(/[^0-9.-]+/g, ''));
      const numB = typeof valB === 'number' ? valB : parseFloat(String(valB).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(numA) && !isNaN(numB) && !String(valA).includes('/') && !String(valB).includes('/')) {
        return (numA - numB) * dir;
      }

      return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * dir;
    });
  });

  let selectedIdSet = $derived(new Set(selectedRows.map(getRowId)));

  let allVisibleSelected = $derived(
    sortedRows.length > 0 && sortedRows.every((r) => selectedIdSet.has(getRowId(r)))
  );

  let isSomeVisibleSelected = $derived(
    !allVisibleSelected && sortedRows.some((r) => selectedIdSet.has(getRowId(r)))
  );

  function toggleSelectAll() {
    if (allVisibleSelected) {
      const visibleIds = new Set(sortedRows.map(getRowId));
      selectedRows = selectedRows.filter((r) => !visibleIds.has(getRowId(r)));
    } else {
      const currentSelectedMap = new Map(selectedRows.map((r) => [getRowId(r), r]));
      for (const row of sortedRows) {
        currentSelectedMap.set(getRowId(row), row);
      }
      selectedRows = Array.from(currentSelectedMap.values());
    }
  }

  function toggleRowSelection(row: Record<string, any>, e: MouseEvent) {
    e.stopPropagation();
    const id = getRowId(row);
    if (selectedIdSet.has(id)) {
      selectedRows = selectedRows.filter((r) => getRowId(r) !== id);
    } else {
      selectedRows = [...selectedRows, row];
    }
  }

  function isRowSelected(row: Record<string, any>): boolean {
    return selectedIdSet.has(getRowId(row));
  }

  const alignClassMap: Record<string, string> = {
    left: 'text-left justify-start',
    center: 'text-center justify-center',
    right: 'text-right justify-end'
  };
</script>

<div class="w-full flex flex-col gap-3 font-sans">
  {#if searchable}
    <div class="flex items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="text"
          bind:value={filterQuery}
          placeholder={searchPlaceholder}
          class="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-blue-500/20 transition-all"
        />
        {#if filterQuery}
          <button
            type="button"
            onclick={() => (filterQuery = '')}
            class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear filter"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        {/if}
      </div>

      {#if selectable && selectedRows.length > 0}
        <div class="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 animate-[fadeIn_150ms_ease-out]">
          <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            {selectedRows.length} selected
          </span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Table Card Wrapper -->
  <div class="relative w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#090d19] overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <!-- Header -->
        <thead class="bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 select-none">
          <tr>
            {#if selectable}
              <th scope="col" class="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  indeterminate={isSomeVisibleSelected}
                  onchange={toggleSelectAll}
                  aria-label="Select all rows"
                  class="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-blue-500 dark:bg-white/5 cursor-pointer accent-blue-500"
                />
              </th>
            {/if}
            {#each columns as col}
              <th
                scope="col"
                style={col.width ? `width: ${col.width}` : undefined}
                class="px-4 {compact ? 'py-2.5' : 'py-3.5'} text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 {col.sortable !== false ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors' : ''}"
                onclick={() => handleSort(col.key, col.sortable)}
              >
                <div class="inline-flex items-center gap-1.5 {alignClassMap[col.align || 'left']}">
                  <span>{col.label}</span>
                  {#if col.sortable !== false}
                    <span class="inline-flex flex-col items-center justify-center shrink-0 w-3 h-3 text-slate-300 dark:text-slate-600">
                      {#if sortKey === col.key}
                        {#if sortDirection === 'asc'}
                          <svg class="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="18 15 12 9 6 15"/>
                          </svg>
                        {:else if sortDirection === 'desc'}
                          <svg class="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        {/if}
                      {:else}
                        <svg class="w-2.5 h-2.5 opacity-40 hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="7 15 12 20 17 15"/>
                          <polyline points="7 9 12 4 17 9"/>
                        </svg>
                      {/if}
                    </span>
                  {/if}
                </div>
              </th>
            {/each}
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200 font-normal">
          {#if sortedRows.length === 0}
            <tr>
              <td colspan={columns.length + (selectable ? 1 : 0)} class="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                <div class="flex flex-col items-center justify-center gap-2">
                  <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          {:else}
            {#each sortedRows as row, i}
              {@const selected = isRowSelected(row)}
              <tr
                onclick={() => onRowClick(row)}
                class="transition-colors duration-100 cursor-pointer
                  {striped && i % 2 === 1 ? 'bg-slate-50/50 dark:bg-white/[0.015]' : ''}
                  {selected
                    ? 'bg-blue-500/10 dark:bg-blue-500/15'
                    : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.03]'}"
              >
                {#if selectable}
                  <td class="w-10 px-3 py-3 text-center" onclick={(e) => toggleRowSelection(row, e)}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onchange={(e) => toggleRowSelection(row, e as unknown as MouseEvent)}
                      aria-label="Select row"
                      class="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-blue-500 dark:bg-white/5 cursor-pointer accent-blue-500"
                    />
                  </td>
                {/if}
                {#each columns as col}
                  <td
                    class="px-4 {compact ? 'py-2 text-xs' : 'py-3.5 text-sm'} {col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}"
                  >
                    {#if col.key === 'status'}
                      {@const st = String(row[col.key] ?? '')}
                      <span
                        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold
                          {st.toLowerCase() === 'active'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20'
                            : st.toLowerCase() === 'auditing' || st.toLowerCase() === 'in review'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10'}"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full {st.toLowerCase() === 'active'
                            ? 'bg-blue-500'
                            : st.toLowerCase() === 'auditing' || st.toLowerCase() === 'in review'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'}"
                        ></span>
                        {st}
                      </span>
                    {:else}
                      {row[col.key] ?? '—'}
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  {@render children?.()}
</div>
