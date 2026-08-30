<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { COMPONENT_CATALOG, type CatalogComponent } from '$lib/data/componentCatalog';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { COMMUNITY_TEMPLATES } from '$lib/data/communityTemplates';

  // --- 1. Universal Canvas Card Data Model ---
  interface StudioCard {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    cols: 1 | 2 | 3;
    value: string | number;
    delta?: string;
    accentColor: string;
    config?: Record<string, any>;
  }

  let arcPromptInput = $state('');
  let isGeneratingArc = $state(false);
  let activeCardId = $state<string | null>(null);
  let exportModalOpen = $state(false);
  let exportTab = $state<'react' | 'svelte' | 'webcomponent'>('react');
  let presetMenuOpen = $state(false);

  // Non-blocking Left Docked Palette State
  let paletteOpen = $state(true);
  let componentSearch = $state('');
  let componentCategory = $state('All');

  // Extract all categories dynamically from catalog
  const catalogCategories = [
    'All',
    'Metrics & KPIs',
    'Controllers & Sliders',
    'Forms & Inputs',
    'Data Display',
    'Navigation',
    'Status & HUD',
    'Overlays & Dialogs',
    'Flows & Cascades',
    'Lists & Feeds',
    'Matrices & Graphs'
  ];

  const filteredCatalog = $derived(
    COMPONENT_CATALOG.filter(c => {
      const matchCat = componentCategory === 'All' || c.category === componentCategory;
      const matchSearch =
        !componentSearch ||
        c.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(componentSearch.toLowerCase()) ||
        c.tagline.toLowerCase().includes(componentSearch.toLowerCase());
      return matchCat && matchSearch;
    })
  );

  let copyNotification = $state(false);

  // Drag-and-Drop & Snap-to-Grid State
  let draggedCardId = $state<string | null>(null);
  let draggedPaletteItem = $state<CatalogComponent | null>(null);
  let dragOverCardId = $state<string | null>(null);

  // Universal Layout Presets
  const samplePresets: Record<string, { label: string; desc: string; cards: StudioCard[] }> = {
    general: {
      label: 'Executive Analytics',
      desc: 'KPI stat tiles, telemetry chart, and event feeds',
      cards: [
        { id: 'c1', type: 'stat', title: 'Primary Metric', subtitle: 'Live aggregated total', cols: 1, value: '$48,500', delta: '+14.2%', accentColor: 'emerald' },
        { id: 'c2', type: 'progress', title: 'Goal Completion', subtitle: 'Target milestone progress', cols: 1, value: 78, delta: '78%', accentColor: 'emerald' },
        { id: 'c3', type: 'slider', title: 'Adjustment Range', subtitle: 'Tactile input controller', cols: 1, value: 65, accentColor: 'emerald' },
        { id: 'c4', type: 'chart', title: 'Signal Throughput', subtitle: 'Real-time 1,000Hz mesh', cols: 2, value: '95 req/s', accentColor: 'emerald' },
        { id: 'c5', type: 'feed', title: 'Activity & Updates', subtitle: 'Recent events log', cols: 1, value: 'Active', accentColor: 'slate' }
      ]
    },
    noc: {
      label: 'Telemetry & Ops NOC',
      desc: 'System health beacons, latency charts, and data tables',
      cards: [
        { id: 'n1', type: 'status', title: 'System Health HUD', subtitle: 'All 24 cluster nodes nominal', cols: 1, value: 'Optimal', accentColor: 'emerald' },
        { id: 'n2', type: 'chart', title: 'P99 Cluster Latency', subtitle: '12ms average across edge', cols: 2, value: '12.4ms', accentColor: 'emerald' },
        { id: 'n3', type: 'table', title: 'Active Ingestion Nodes', subtitle: 'Zero-VDOM stream brokers', cols: 2, value: 'Active', accentColor: 'slate' },
        { id: 'n4', type: 'radial_dial', title: 'CPU Ceiling Dial', subtitle: 'Haptic throttle limiter', cols: 1, value: 64, accentColor: 'emerald' }
      ]
    },
    product: {
      label: 'Sprint & Project Board',
      desc: 'Velocity counters, task backlog table, and date range',
      cards: [
        { id: 'p1', type: 'stat', title: 'Sprint Velocity', subtitle: 'Story points completed', cols: 1, value: '94 pts', delta: '+8.2%', accentColor: 'indigo' },
        { id: 'p2', type: 'progress', title: 'Sprint Progress', subtitle: 'Target: 100 points', cols: 1, value: 86, delta: '86%', accentColor: 'indigo' },
        { id: 'p3', type: 'datepicker', title: 'Sprint Timeline', subtitle: 'Sprint 24 milestone window', cols: 1, value: '2026-08-30', accentColor: 'emerald' },
        { id: 'p4', type: 'table', title: 'Assigned Work Items', subtitle: 'Active deliverables', cols: 2, value: 'Backlog', accentColor: 'slate' },
        { id: 'p5', type: 'code', title: 'Automation Hook', subtitle: 'Zero-VDOM state binding', cols: 1, value: 'TypeScript', accentColor: 'slate' }
      ]
    },
    ecommerce: {
      label: 'Commerce & Funnels',
      desc: 'Revenue waterfall bridges, conversion gauges, and discount sliders',
      cards: [
        { id: 'e1', type: 'stat', title: 'Daily Revenue', subtitle: 'Store orders volume', cols: 1, value: '$24,800', delta: '+22.4%', accentColor: 'emerald' },
        { id: 'e2', type: 'progress', title: 'Checkout Conversion', subtitle: 'Goal: > 3.5%', cols: 1, value: 82, delta: '4.1%', accentColor: 'emerald' },
        { id: 'e3', type: 'slider', title: 'Promo Discount Tier', subtitle: 'Promotional discount level', cols: 1, value: 15, accentColor: 'emerald' },
        { id: 'e4', type: 'waterfall', title: 'Revenue Waterfall', subtitle: 'Gross sales to net payout', cols: 2, value: '$135k', accentColor: 'emerald', config: { bars: [{ name: 'Gross Sales', val: 120, d: '+$120k' }, { name: 'Upsells', val: 30, d: '+$30k' }, { name: 'Refunds', val: -15, d: '-$15k' }, { name: 'Net Settlement', val: 135, d: '$135k' }] } }
      ]
    }
  };

  let cards = $state<StudioCard[]>([...samplePresets.general.cards]);
  let selectedPresetKey = $state('general');

  const activeCard = $derived(cards.find((c) => c.id === activeCardId) || null);

  function loadSample(key: string) {
    selectedPresetKey = key;
    presetMenuOpen = false;
    if (samplePresets[key]) {
      cards = JSON.parse(JSON.stringify(samplePresets[key].cards));
      activeCardId = null;
    } else {
      const communityTemplate = COMMUNITY_TEMPLATES.find(t => t.id === key);
      if (communityTemplate) {
        cards = JSON.parse(JSON.stringify(communityTemplate.cards));
        activeCardId = null;
      }
    }
  }

  // Undo History Stack (Max 30 snapshots)
  let undoStack = $state<StudioCard[][]>([]);

  function pushHistory() {
    undoStack = [...undoStack.slice(-30), JSON.parse(JSON.stringify(cards))];
  }

  function undo() {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1];
      undoStack = undoStack.slice(0, -1);
      cards = previous;
      activeCardId = null;
    }
  }

  onMount(() => {
    const presetParam = page.url.searchParams.get('preset') || page.url.searchParams.get('template');
    if (presetParam) {
      loadSample(presetParam);
    }
    const addParam = page.url.searchParams.get('add') || page.url.searchParams.get('component');
    if (addParam) {
      const found = COMPONENT_CATALOG.find(c => c.id === addParam || c.componentName === addParam);
      if (found) {
        addCatalogComponent(found);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          undo();
        }
      }
      if (e.key === 'Escape') {
        presetMenuOpen = false;
        activeCardId = null;
        exportModalOpen = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  let confirmClearCanvas = $state(false);
  let clearTimer: any = null;

  function clearCanvas() {
    if (!confirmClearCanvas) {
      confirmClearCanvas = true;
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        confirmClearCanvas = false;
      }, 3000);
      return;
    }
    pushHistory();
    confirmClearCanvas = false;
    cards = [];
    activeCardId = null;
    selectedPresetKey = 'blank';
    presetMenuOpen = false;
  }

  // --- Drag and Drop & Snap-to-Grid Handlers ---
  function onDragStart(e: DragEvent, id: string) {
    draggedCardId = id;
    draggedPaletteItem = null;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
  }

  function onPaletteDragStart(e: DragEvent, item: CatalogComponent) {
    draggedPaletteItem = item;
    draggedCardId = null;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', item.id);
    }
  }

  function onDragOver(e: DragEvent, id: string) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = draggedPaletteItem ? 'copy' : 'move';
    if (dragOverCardId !== id) {
      dragOverCardId = id;
    }
  }

  function onDragLeave(id: string) {
    if (dragOverCardId === id) {
      dragOverCardId = null;
    }
  }

  function onDrop(e: DragEvent, targetId?: string) {
    e.preventDefault();

    if (draggedPaletteItem) {
      addCatalogComponent(draggedPaletteItem, targetId);
      draggedPaletteItem = null;
      dragOverCardId = null;
      return;
    }

    if (!draggedCardId || (targetId && draggedCardId === targetId)) {
      draggedCardId = null;
      dragOverCardId = null;
      return;
    }

    const fromIdx = cards.findIndex(c => c.id === draggedCardId);
    const toIdx = targetId ? cards.findIndex(c => c.id === targetId) : cards.length - 1;

    if (fromIdx !== -1 && toIdx !== -1) {
      pushHistory();
      const updated = [...cards];
      const [movedCard] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, movedCard);
      cards = updated;
    }
    draggedCardId = null;
    dragOverCardId = null;
  }

  function onDragEnd() {
    draggedCardId = null;
    draggedPaletteItem = null;
    dragOverCardId = null;
  }

  // --- Component Factory ---
  function createCardFromCatalog(item: CatalogComponent): StudioCard {
    const newId = 'c_' + Math.random().toString(36).substring(2, 8);
    const cat = item.category;
    let cardType = 'stat';
    let cols: 1 | 2 | 3 = 1;

    if (cat === 'Metrics & KPIs') {
      cardType = item.id === 'sola-chart' ? 'chart' : 'stat';
      cols = item.id === 'sola-chart' ? 2 : 1;
    } else if (cat === 'Gauges & Rings') {
      cardType = 'progress';
    } else if (cat === 'Controllers & Sliders') {
      cardType = item.id.includes('dial') ? 'radial_dial' : 'slider';
    } else if (cat === 'Flows & Cascades') {
      cardType = 'waterfall';
      cols = 2;
    } else if (cat === 'Lists & Feeds') {
      cardType = 'feed';
    } else if (cat === 'Matrices & Graphs') {
      cardType = 'node_graph';
      cols = 2;
    } else if (cat === 'Forms & Inputs') {
      cardType = item.id === 'sola-date-picker' ? 'datepicker' : 'form';
      cols = item.id === 'sola-date-picker' ? 1 : 2;
    } else if (cat === 'Data Display') {
      cardType = item.id === 'sola-data-table' ? 'table' : item.id === 'sola-code-block' ? 'code' : 'stat';
      cols = 2;
    } else {
      cardType = 'status';
    }

    return {
      id: newId,
      type: cardType,
      title: item.name,
      subtitle: item.tagline || item.description.slice(0, 45) + '...',
      cols,
      value: item.defaultConfig?.value || (cardType === 'progress' ? 75 : cardType === 'slider' ? 50 : 'Active'),
      delta: item.defaultConfig?.delta || '+12.4%',
      accentColor: 'emerald',
      config: item.defaultConfig
    };
  }

  function addCatalogComponent(item: CatalogComponent, targetId?: string) {
    pushHistory();
    const newCard = createCardFromCatalog(item);

    if (targetId) {
      const idx = cards.findIndex(c => c.id === targetId);
      if (idx !== -1) {
        cards = [...cards.slice(0, idx), newCard, ...cards.slice(idx)];
      } else {
        cards = [...cards, newCard];
      }
    } else {
      cards = [...cards, newCard];
    }
    activeCardId = newCard.id;
  }

  function addComponent(type: StudioCard['type']) {
    const item = COMPONENT_CATALOG.find(c => c.id.includes(type)) || COMPONENT_CATALOG[0];
    addCatalogComponent(item);
  }

  function removeCard(id: string, e?: Event) {
    if (e) e.stopPropagation();
    pushHistory();
    cards = cards.filter((c) => c.id !== id);
    if (activeCardId === id) activeCardId = null;
  }

  function duplicateCard(card: StudioCard, e?: Event) {
    if (e) e.stopPropagation();
    pushHistory();
    const copy: StudioCard = {
      ...JSON.parse(JSON.stringify(card)),
      id: 'c_' + Math.random().toString(36).substring(2, 8),
      title: card.title + ' (Copy)'
    };
    const idx = cards.findIndex((c) => c.id === card.id);
    cards = [...cards.slice(0, idx + 1), copy, ...cards.slice(idx + 1)];
    activeCardId = copy.id;
  }

  function setCols(card: StudioCard, cols: 1 | 2 | 3, e?: Event) {
    if (e) e.stopPropagation();
    pushHistory();
    card.cols = cols;
    cards = [...cards];
  }

  // --- Sola Arc AI Co-Pilot ---
  async function generateWithArc() {
    if (!arcPromptInput.trim()) return;
    isGeneratingArc = true;
    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Generate a responsive studio dashboard canvas containing 4 components based on this request: "${arcPromptInput}". Return JSON format with array of components.` })
      });
      const data = await res.json();
      if (data.components && Array.isArray(data.components) && data.components.length > 0) {
        pushHistory();
        const generated: StudioCard[] = data.components.map((item: any, i: number) => ({
          id: 'arc_' + i + '_' + Math.random().toString(36).substring(2, 6),
          type: item.type || 'stat',
          title: item.title || 'Telemetry Node',
          subtitle: item.subtitle || 'AI Synthesized intent',
          cols: item.cols || (i === 0 ? 2 : 1),
          value: item.value || '$42.8k',
          delta: item.delta || '+18%',
          accentColor: 'emerald',
          config: item.config
        }));
        cards = generated;
        activeCardId = generated[0].id;
      }
    } catch {
      addComponent('stat');
    } finally {
      isGeneratingArc = false;
      arcPromptInput = '';
    }
  }

  // --- Code Exporter ---
  const generatedCode = $derived.by(() => {
    if (exportTab === 'react') {
      return `import React from 'react';
import { DataCard, GaugeCard, FlowWaterfall } from '@sola/ui';

export default function SolaDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#fafafa] dark:bg-[#090d19]">
      ${cards.map(c => `{/* ${c.title} */}
      <div className="${c.cols === 3 ? 'lg:col-span-3 md:col-span-2' : c.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${c.title}</h3>
        <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">${c.value}</p>
      </div>`).join('\n      ')}
    </div>
  );
}`;
    } else if (exportTab === 'svelte') {
      return '<' + 'script lang="ts">\n' +
        '  import { DataCard, GaugeCard, FlowWaterfall } from "@sola/ui";\n' +
        '<' + '/script>\n\n' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#fafafa] dark:bg-[#090d19]">\n' +
        cards.map(c => `  <!-- ${c.title} -->\n  <div class="${c.cols === 3 ? 'lg:col-span-3 md:col-span-2' : c.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm">\n    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${c.title}</h3>\n    <div class="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">${c.value}</div>\n  </div>`).join('\n') +
        '\n</div>';
    } else {
      return '<!-- Native Zero-VDOM .sola Mount -->\n' +
        '<' + 'script type="module" src="https://cdn.sola-air.dev/sola-ui.js"><' + '/script>\n\n' +
        `<sola-canvas cards='${JSON.stringify(cards.map(c => ({ id: c.id, title: c.title, cols: c.cols, value: c.value })))}'></sola-canvas>`;
    }
  });

  function copyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedCode);
      copyNotification = true;
      setTimeout(() => (copyNotification = false), 2000);
    }
  }
</script>

<svelte:head>
  <title>Sola Design Studio — Drag & Drop Canvas Builder</title>
</svelte:head>

<div class="flex flex-col w-full min-h-screen bg-[#fafafa] dark:bg-[#090d19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
  <Navbar />

  <!-- 1. Top Workspace Header -->
  <header class="sticky top-16 z-30 bg-white/80 dark:bg-[#090d19]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 px-4 sm:px-6 py-2.5 shadow-2xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      
      <!-- Left: Studio Title & Palette Toggle -->
      <div class="flex items-center gap-3">
        <button
          onclick={() => (paletteOpen = !paletteOpen)}
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer {paletteOpen ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}"
          title={paletteOpen ? 'Hide Component Palette' : 'Show Component Palette'}>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
          <span class="hidden sm:inline">Palette</span>
          <span class="px-1.5 py-0.2 bg-slate-950/15 rounded-md text-[10px] font-mono">{COMPONENT_CATALOG.length}</span>
        </button>

        <div class="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

        <div class="flex items-center gap-2">
          <span class="font-bold tracking-tight text-slate-900 dark:text-white text-xs whitespace-nowrap">Canvas</span>
          <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </span>
        </div>
      </div>

      <!-- Center / Templates Switcher -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <button
            onclick={() => (presetMenuOpen = !presetMenuOpen)}
            class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer">
            <span>Templates</span>
            <svg class="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {#if presetMenuOpen}
            <div class="absolute right-0 sm:left-0 mt-2 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-50 animate-[fadeSlide_120ms_ease-out]">
              <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Starter Templates
              </div>
              {#each Object.entries(samplePresets) as [key, preset]}
                <button
                  onclick={() => loadSample(key)}
                  class="w-full text-left p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer {selectedPresetKey === key ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-800 dark:text-slate-200'}">
                  <div class="font-bold">{preset.label}</div>
                  <div class="text-[10px] text-slate-400 font-normal">{preset.desc}</div>
                </button>
              {/each}
              <div class="my-1 border-t border-slate-100 dark:border-white/5"></div>
              <button
                onclick={clearCanvas}
                class="w-full text-left px-3 py-2 rounded-xl text-xs {confirmClearCanvas ? 'bg-rose-500 text-white font-bold' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold'} transition-all cursor-pointer">
                {confirmClearCanvas ? 'Tap again to confirm clear' : 'Clear Canvas'}
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Right: Export Button -->
      <div class="flex items-center gap-2">
        <button
          onclick={() => (exportModalOpen = true)}
          class="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-transparent dark:border-white/10 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Export</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 2. Main Studio Workspace Layout -->
  <div class="flex-1 flex w-full relative">
    
    <!-- 2A. Non-Blocking Left Docked Component Palette (56 Primitives) -->
    {#if paletteOpen}
      <aside class="w-80 shrink-0 border-r border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#090d19]/80 backdrop-blur-xl h-[calc(100vh-6.5rem)] sticky top-28 overflow-y-auto flex flex-col z-20 transition-all duration-200">
        
        <!-- Palette Header & Search -->
        <div class="p-4 border-b border-slate-100 dark:border-white/5 space-y-3 sticky top-0 bg-white/95 dark:bg-[#090d19]/95 backdrop-blur-xl z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">Primitives</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Drag & Drop</span>
            </div>
            <button onclick={() => (paletteOpen = false)} class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>

          <div class="relative">
            <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              bind:value={componentSearch}
              placeholder="Search 56 components..."
              class="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {#if componentSearch}
              <button onclick={() => (componentSearch = '')} class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">&times;</button>
            {/if}
          </div>

          <!-- Category Pills -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {#each catalogCategories as cat}
              <button
                onclick={() => (componentCategory = cat)}
                class="px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer {componentCategory === cat ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}">
                {cat}
              </button>
            {/each}
          </div>
        </div>

        <!-- Draggable Primitives List -->
        <div class="p-3 space-y-2 flex-1">
          {#if filteredCatalog.length === 0}
            <div class="py-12 text-center text-xs text-slate-400">
              No components matching "{componentSearch}".
            </div>
          {:else}
            {#each filteredCatalog as item}
              <div
                draggable="true"
                role="button"
                tabindex="0"
                ondragstart={(e) => onPaletteDragStart(e, item)}
                ondragend={onDragEnd}
                class="group flex items-start gap-2.5 p-2.5 bg-white dark:bg-white/[0.03] hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 border border-slate-200/70 dark:border-white/5 hover:border-emerald-500/40 rounded-xl transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-xs">
                
                <!-- Category SVG Icon -->
                <div class="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  {#if item.category === 'Metrics & KPIs'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m7 15 4-6 4 4 6-8"/></svg>
                  {:else if item.category === 'Controllers & Sliders'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="m12 12 4-4"/></svg>
                  {:else if item.category === 'Forms & Inputs'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  {:else if item.category === 'Data Display'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                  {:else if item.category === 'Status & HUD'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  {:else if item.category === 'Lists & Feeds'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  {:else if item.category === 'Matrices & Graphs'}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="6" cy="18" r="3"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="6" y1="9" x2="6" y2="15"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/></svg>
                  {/if}
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</span>
                    <button
                      onclick={() => addCatalogComponent(item)}
                      class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-500/20 cursor-pointer">
                      + Add
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400 truncate">{item.tagline || item.description}</p>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </aside>
    {/if}

    <!-- 2B. Central Interactive Live Canvas -->
    <main
      ondragover={(e) => onDragOver(e, 'canvas-root')}
      ondrop={(e) => onDrop(e)}
      class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      
      <!-- Sola Arc Generative Prompt Bar (Top of Canvas) -->
      <div class="w-full bg-white dark:bg-[#0f172a]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-2xl p-2 sm:p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div class="flex items-center gap-2 px-2 shrink-0">
          <div class="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>
          </div>
          <span class="text-xs font-mono font-bold text-slate-900 dark:text-white">Arc</span>
        </div>

        <input
          type="text"
          bind:value={arcPromptInput}
          onkeydown={(e) => e.key === 'Enter' && generateWithArc()}
          placeholder="Describe any component or layout (e.g. 'Realtime revenue waterfall and p99 latency gauge')..."
          class="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-sans"
        />

        <button
          onclick={generateWithArc}
          disabled={isGeneratingArc || !arcPromptInput.trim()}
          class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs shadow-emerald-500/20">
          {#if isGeneratingArc}
            <span class="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            <span>Synthesizing...</span>
          {:else}
            <span>Generate with Arc</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          {/if}
        </button>
      </div>

      <!-- Canvas Grid State -->
      {#if cards.length === 0}
        <div class="bg-white dark:bg-[#0f172a]/70 backdrop-blur-xl border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Canvas is empty</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">Drag any component from the left palette or type a prompt for Sola Arc.</p>
          <div class="flex items-center gap-2">
            <button
              onclick={() => addComponent('stat')}
              class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
              + Add Metric Tile
            </button>
            <button
              onclick={() => loadSample('general')}
              class="px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
              Load Sample Dashboard
            </button>
          </div>
        </div>
      {:else}
        <!-- Responsive Drag-and-Drop Snap Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {#each cards as card (card.id)}
            <div
              draggable="true"
              role="button"
              tabindex="0"
              ondragstart={(e) => onDragStart(e, card.id)}
              ondragover={(e) => onDragOver(e, card.id)}
              ondragleave={() => onDragLeave(card.id)}
              ondrop={(e) => onDrop(e, card.id)}
              ondragend={onDragEnd}
              onclick={() => (activeCardId = card.id)}
              onkeydown={(e) => e.key === 'Enter' && (activeCardId = card.id)}
              class="{card.cols === 3 ? 'lg:col-span-3 md:col-span-2' : card.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl border transition-all duration-150 p-5 shadow-xs relative group flex flex-col justify-between select-none cursor-pointer {activeCardId === card.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-sm'} {dragOverCardId === card.id ? 'scale-[1.01] border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/20 dark:bg-emerald-500/5' : ''}">
              
              <!-- Card Controls Bar (Header) -->
              <div class="flex items-center justify-between gap-2 mb-3">
                
                <!-- Left Title & Drag Grip -->
                <div class="flex items-center gap-2 min-w-0">
                  <div class="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-emerald-500 p-0.5 rounded transition-colors" title="Drag to snap position">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{card.title}</h4>
                    {#if card.subtitle}
                      <p class="text-[10px] text-slate-400 truncate">{card.subtitle}</p>
                    {/if}
                  </div>
                </div>

                <!-- Right Inline Quick Controls -->
                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <!-- Width Span Pills -->
                  <div class="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/60 dark:border-white/10 text-[9px] font-mono font-bold">
                    <button
                      onclick={(e) => setCols(card, 1, e)}
                      class="px-1.5 py-0.5 rounded {card.cols === 1 ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}">1x</button>
                    <button
                      onclick={(e) => setCols(card, 2, e)}
                      class="px-1.5 py-0.5 rounded {card.cols === 2 ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}">2x</button>
                    <button
                      onclick={(e) => setCols(card, 3, e)}
                      class="px-1.5 py-0.5 rounded {card.cols === 3 ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-2xs' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}">3x</button>
                  </div>

                  <!-- Duplicate -->
                  <button
                    onclick={(e) => duplicateCard(card, e)}
                    class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    title="Duplicate Card">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>

                  <!-- Remove -->
                  <button
                    onclick={(e) => removeCard(card.id, e)}
                    class="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete Card">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              <!-- Card Body / Visual Rendering -->
              <div class="my-2">
                {#if card.type === 'stat'}
                  <div class="flex items-baseline justify-between">
                    <span class="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">{card.value}</span>
                    {#if card.delta}
                      <span class="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">{card.delta}</span>
                    {/if}
                  </div>
                  <div class="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Direct editable value</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold">Zero-VDOM</span>
                  </div>

                {:else if card.type === 'progress'}
                  <div class="flex items-center gap-6 py-2">
                    <div class="relative w-16 h-16 shrink-0">
                      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-100 dark:text-white/5"/>
                        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="{Number(card.value)}, 100" stroke-linecap="round" class="text-emerald-500"/>
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold">{card.value}%</span>
                    </div>
                    <div class="space-y-1.5 flex-1">
                      <div class="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span>Completion</span>
                        <span class="text-emerald-600 dark:text-emerald-400 font-bold">> 70%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        bind:value={card.value}
                        class="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none" />
                    </div>
                  </div>

                {:else if card.type === 'slider'}
                  <div class="space-y-3 py-2">
                    <div class="flex justify-between items-center font-mono">
                      <span class="text-2xl font-black text-slate-900 dark:text-white">{card.value}%</span>
                      <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Live Signal</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={card.value}
                      class="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none" />
                    <div class="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>0% (Min)</span>
                      <span>50% (Mid)</span>
                      <span>100% (Max)</span>
                    </div>
                  </div>

                {:else if card.type === 'radial_dial'}
                  <div class="flex flex-col items-center justify-center py-2 space-y-2">
                    <div class="relative w-24 h-24 flex items-center justify-center">
                      <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="6" class="text-slate-100 dark:text-white/5" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-dasharray="{(Number(card.value) / 100) * 251.2} 251.2" class="text-emerald-500 transition-all duration-75" />
                      </svg>
                      <div class="absolute inset-0 flex flex-col items-center justify-center font-mono">
                        <span class="text-lg font-black text-slate-900 dark:text-white">{card.value}</span>
                        <span class="text-[9px] text-slate-400 font-bold uppercase">Val</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={card.value}
                      class="w-32 accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none" />
                  </div>

                {:else if card.type === 'waterfall'}
                  <div class="space-y-2 py-1">
                    {#if card.config && card.config.bars}
                      {#each card.config.bars as bar}
                        <div class="flex items-center gap-2 text-xs font-mono">
                          <span class="w-24 truncate text-slate-500 dark:text-slate-400">{bar.name}</span>
                          <div class="flex-1 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <div class="bg-emerald-500 rounded-full h-full" style="width: {Math.min(100, Math.max(10, bar.val))}%"></div>
                          </div>
                          <span class="w-12 text-right font-bold {bar.val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}">{bar.d}</span>
                        </div>
                      {/each}
                    {/if}
                  </div>

                {:else if card.type === 'chart'}
                  <div class="space-y-2 py-1">
                    <div class="flex items-baseline justify-between font-mono">
                      <span class="text-2xl font-black text-slate-900 dark:text-white">{card.value}</span>
                      <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10">1,000Hz Direct</span>
                    </div>
                    <div class="h-16 flex items-end gap-1.5 pt-2">
                      {#each [40, 25, 60, 45, 80, 55, 90, 70, 85, 65, 95, 75] as height, idx}
                        <div class="flex-1 bg-emerald-500/20 hover:bg-emerald-500/50 rounded-t transition-all" style="height: {height}%;"></div>
                      {/each}
                    </div>
                  </div>

                {:else if card.type === 'feed'}
                  <div class="space-y-1.5 py-1 text-xs">
                    <div class="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span class="font-semibold text-slate-800 dark:text-slate-200">Cluster Sync</span>
                      <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">12ms ago</span>
                    </div>
                    <div class="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span class="font-semibold text-slate-800 dark:text-slate-200">Edge Ingress P99</span>
                      <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Nominal</span>
                    </div>
                  </div>

                {:else}
                  <div class="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span class="font-bold text-xs text-slate-900 dark:text-white">{card.title}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">Direct fine-grained reactive component instance.</p>
                  </div>
                {/if}
              </div>

            </div>
          {/each}
        </div>
      {/if}
    </main>

    <!-- 2C. Floating Contextual Card Inspector (Figma / Linear Style) -->
    {#if activeCard}
      <aside class="fixed top-28 right-6 z-40 w-80 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-2xl space-y-4 animate-[slideLeft_150ms_ease-out]">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white font-mono">Properties</h3>
          </div>
          <button
            onclick={() => (activeCardId = null)}
            class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs cursor-pointer">
            &times;
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Title -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              bind:value={activeCard.title}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 text-slate-900 dark:text-white outline-none" />
          </div>

          <!-- Subtitle -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subtitle</label>
            <input
              type="text"
              bind:value={activeCard.subtitle}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 text-slate-900 dark:text-white outline-none" />
          </div>

          <!-- Value -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Value</label>
            <input
              type="text"
              bind:value={activeCard.value}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 text-slate-900 dark:text-white outline-none font-mono" />
          </div>

          <!-- Column Span -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Column Width</label>
            <div class="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 font-mono text-xs">
              <button
                onclick={() => activeCard && (activeCard.cols = 1)}
                class="py-1 rounded-lg transition-all {activeCard.cols === 1 ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}">1 Col</button>
              <button
                onclick={() => activeCard && (activeCard.cols = 2)}
                class="py-1 rounded-lg transition-all {activeCard.cols === 2 ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}">2 Col</button>
              <button
                onclick={() => activeCard && (activeCard.cols = 3)}
                class="py-1 rounded-lg transition-all {activeCard.cols === 3 ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}">3 Col</button>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <button
              onclick={() => duplicateCard(activeCard)}
              class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 cursor-pointer">
              Duplicate
            </button>
            <button
              onclick={() => removeCard(activeCard.id)}
              class="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer">
              Delete
            </button>
          </div>
        </div>
      </aside>
    {/if}

  </div>

  <!-- 3. Export Modal -->
  {#if exportModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={() => (exportModalOpen = false)}
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      
      <div
        onclick={(e) => e.stopPropagation()}
        class="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 animate-[scaleUp_150ms_ease-out]">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              &lt;/&gt;
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">Export Sola Canvas</h3>
              <p class="text-[10px] text-slate-400">Zero-VDOM native code generator</p>
            </div>
          </div>
          <button
            onclick={() => (exportModalOpen = false)}
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-500 text-xs flex items-center justify-center cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Framework Tabs -->
        <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onclick={() => (exportTab = 'react')}
            class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {exportTab === 'react' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400'}">
            React 19
          </button>
          <button
            onclick={() => (exportTab = 'svelte')}
            class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {exportTab === 'svelte' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400'}">
            Svelte 5
          </button>
          <button
            onclick={() => (exportTab = 'webcomponent')}
            class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer {exportTab === 'webcomponent' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400'}">
            Native .sola
          </button>
        </div>

        <!-- Code Block -->
        <div class="relative">
          <pre class="bg-slate-950 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72 border border-white/5">{generatedCode}</pre>
          <button
            onclick={copyCode}
            class="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {copyNotification ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'}">
            {copyNotification ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

      </div>
    </div>
  {/if}

</div>
