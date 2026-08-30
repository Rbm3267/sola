<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { COMPONENT_CATALOG, type CatalogComponent } from '$lib/data/componentCatalog';

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

  // Component Drawer State
  let componentDrawerOpen = $state(false);
  let componentSearch = $state('');
  let componentCategory = $state('All');

  // Extract all categories dynamically from catalog
  const catalogCategories = ['All', 'Metrics & KPIs', 'Controllers & Sliders', 'Forms & Inputs', 'Data Display', 'Navigation', 'Status & HUD', 'Overlays & Dialogs', 'Flows & Cascades', 'Lists & Feeds', 'Matrices & Graphs'];

  const filteredCatalog = $derived(
    COMPONENT_CATALOG.filter(c => {
      const matchCat = componentCategory === 'All' || c.category === componentCategory;
      const matchSearch = !componentSearch || c.name.toLowerCase().includes(componentSearch.toLowerCase()) || c.description.toLowerCase().includes(componentSearch.toLowerCase()) || c.tagline.toLowerCase().includes(componentSearch.toLowerCase());
      return matchCat && matchSearch;
    })
  );

  let copyNotification = $state(false);

  // Drag-and-Drop & Snap-to-Grid State
  let draggedCardId = $state<string | null>(null);
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

  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { COMMUNITY_TEMPLATES } from '$lib/data/communityTemplates';

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

  onMount(() => {
    const presetParam = page.url.searchParams.get('preset') || page.url.searchParams.get('template');
    if (presetParam) {
      loadSample(presetParam);
    }
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
    confirmClearCanvas = false;
    cards = [];
    activeCardId = null;
    selectedPresetKey = 'blank';
    presetMenuOpen = false;
  }

  // --- Drag and Drop & Snap-to-Grid Handlers ---
  function onDragStart(e: DragEvent, id: string) {
    draggedCardId = id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
  }

  function onDragOver(e: DragEvent, id: string) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    if (dragOverCardId !== id) {
      dragOverCardId = id;
    }
  }

  function onDragLeave(id: string) {
    if (dragOverCardId === id) {
      dragOverCardId = null;
    }
  }

  function onDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === targetId) {
      draggedCardId = null;
      dragOverCardId = null;
      return;
    }

    const fromIdx = cards.findIndex(c => c.id === draggedCardId);
    const toIdx = cards.findIndex(c => c.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
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
    dragOverCardId = null;
  }

  // --- 1-Click Component Adders ---
  function addComponent(type: StudioCard['type']) {
    const newId = 'c_' + Math.random().toString(36).substring(2, 8);
    let newCard: StudioCard;

    if (type === 'stat') {
      newCard = { id: newId, type: 'stat', title: 'New Metric Tile', subtitle: 'Live stat summary', cols: 1, value: '$12,400', delta: '+8.4%', accentColor: 'emerald' };
    } else if (type === 'progress') {
      newCard = { id: newId, type: 'progress', title: 'Progress Ring', subtitle: 'Target completion rate', cols: 1, value: 72, delta: '72%', accentColor: 'emerald' };
    } else if (type === 'waterfall') {
      newCard = {
        id: newId,
        type: 'waterfall',
        title: 'Step Progression Breakdown',
        subtitle: 'Value distribution flow',
        cols: 2,
        value: '$100k',
        accentColor: 'emerald',
        config: { bars: [{ name: 'Stage 1', val: 70, d: '+70' }, { name: 'Stage 2', val: 35, d: '+35' }, { name: 'Deductions', val: -15, d: '-15' }, { name: 'Total', val: 90, d: '90' }] }
      };
    } else if (type === 'chart') {
      newCard = { id: newId, type: 'chart', title: 'Telemetry Stream', subtitle: 'Signal ingestion rate', cols: 2, value: '88 req/s', accentColor: 'emerald' };
    } else if (type === 'slider') {
      newCard = { id: newId, type: 'slider', title: 'Control Slider', subtitle: 'Tactile adjustment input', cols: 1, value: 50, accentColor: 'emerald' };
    } else if (type === 'radial_dial') {
      newCard = { id: newId, type: 'radial_dial', title: 'Haptic Radial Dial', subtitle: 'Magnetic rotation control', cols: 1, value: 50, accentColor: 'emerald' };
    } else if (type === 'table') {
      newCard = { id: newId, type: 'table', title: 'Records Table', subtitle: 'Structured schema records', cols: 2, value: 'Records', accentColor: 'slate' };
    } else if (type === 'datepicker') {
      newCard = { id: newId, type: 'datepicker', title: 'Target Horizon', subtitle: 'Calendar date filter', cols: 1, value: '2026-08-30', accentColor: 'emerald' };
    } else if (type === 'code') {
      newCard = { id: newId, type: 'code', title: 'Signal Pipeline Code', subtitle: 'Zero-VDOM reactive binding', cols: 2, value: 'TypeScript', accentColor: 'slate' };
    } else if (type === 'form') {
      newCard = { id: newId, type: 'form', title: 'Interactive Form', subtitle: 'Dynamic input schema', cols: 2, value: 'Form', accentColor: 'slate' };
    } else if (type === 'feed') {
      newCard = { id: newId, type: 'feed', title: 'Activity Stream', subtitle: 'Real-time event feed', cols: 1, value: 'Active', accentColor: 'slate' };
    } else if (type === 'node_graph') {
      newCard = { id: newId, type: 'node_graph', title: 'Kinetic Node Graph', subtitle: 'Auto-clustering data nodes', cols: 2, value: 'Graph', accentColor: 'emerald' };
    } else {
      newCard = { id: newId, type: 'status', title: 'Status & State Card', subtitle: 'Operational condition banner', cols: 1, value: 'Optimal', accentColor: 'emerald' };
    }

    cards = [...cards, newCard];
    activeCardId = newId;
    componentDrawerOpen = false;
  }

  function addCatalogComponent(item: CatalogComponent) {
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

    const newCard: StudioCard = {
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

    cards = [...cards, newCard];
    activeCardId = newId;
    componentDrawerOpen = false;
  }

  function removeCard(id: string, e?: Event) {
    if (e) e.stopPropagation();
    cards = cards.filter((c) => c.id !== id);
    if (activeCardId === id) activeCardId = null;
  }

  function duplicateCard(card: StudioCard, e?: Event) {
    if (e) e.stopPropagation();
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
    card.cols = cols;
    cards = [...cards];
  }

  // --- Sola Arc AI Generation ---
  async function runArcPrompt() {
    if (!arcPromptInput.trim() || isGeneratingArc) return;
    isGeneratingArc = true;
    const query = arcPromptInput.trim();

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: query })
      });

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const generated: StudioCard[] = data.map((item: any, idx: number) => ({
          id: 'arc_' + idx + '_' + Math.random().toString(36).substring(2, 7),
          type: item.component === 'GaugeCard' ? 'progress' : item.component === 'FlowWaterfall' ? 'waterfall' : item.component === 'TactileDialCard' ? 'slider' : item.component === 'DynamicForm' ? 'form' : item.component === 'ListBlock' ? 'feed' : 'stat',
          title: item.config?.title || 'Custom Component',
          subtitle: item.config?.subtitle || 'Designed with Sola Arc',
          cols: (item.colSpan || 1) as 1 | 2 | 3,
          value: item.config?.value || (item.component === 'GaugeCard' ? 75 : '$45,000'),
          delta: item.config?.trend || '+12.5%',
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

export default function SolaCustomCanvas() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#fafafa] dark:bg-[#090d19]">
      ${cards.map(c => `{/* ${c.title} */}
      <div className="${c.cols === 3 ? 'lg:col-span-3 md:col-span-2' : c.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${c.title}</h3>
        <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">${c.value}</p>
      </div>`).join('\n      ')}
    </div>
  );
}`;
    } else if (exportTab === 'svelte') {
      return '<' + 'script lang="ts">\n' +
        '  // Sola Canvas (Svelte 5 Runes)\n' +
        '<' + '/script>\n\n' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#fafafa] dark:bg-[#090d19]">\n' +
        cards.map(c => `  <!-- ${c.title} -->\n  <div class="${c.cols === 3 ? 'lg:col-span-3 md:col-span-2' : c.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm">\n    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${c.title}</h3>\n    <div class="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">${c.value}</div>\n  </div>`).join('\n') +
        '\n</div>';
    } else {
      return '<!-- Web Component Mount -->\n' +
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

  <!-- 1. Top Navigation Bar -->
  <header class="sticky top-16 z-30 bg-white/80 dark:bg-[#090d19]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      
      <!-- Left: Studio Branding & Component Count -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-2xs shrink-0">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-black tracking-tight text-slate-900 dark:text-white text-sm whitespace-nowrap">Studio Canvas</span>
          <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
            {cards.length} {cards.length === 1 ? 'node' : 'nodes'}
          </span>
        </div>
      </div>

      <!-- Center / Actions: Add Component + Presets -->
      <div class="flex items-center gap-2">
        <!-- + Add Component Button (Opens Full 56-Component Drawer) -->
        <button
          onclick={() => (componentDrawerOpen = true)}
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs shadow-emerald-500/20 transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Add Component</span>
          <span class="px-1.5 py-0.2 bg-slate-950/15 rounded-md text-[10px] font-mono">{COMPONENT_CATALOG.length}</span>
        </button>

        <!-- Presets Menu Dropdown -->
        <div class="relative">
          <button
            onclick={() => (presetMenuOpen = !presetMenuOpen)}
            class="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer">
            <span>Templates</span>
            <svg class="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {#if presetMenuOpen}
            <div class="absolute left-0 mt-2 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-50 animate-[fadeSlide_120ms_ease-out]">
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

      <!-- Right: Export Action -->
      <div class="flex items-center gap-2">
        <button
          onclick={() => (exportModalOpen = true)}
          class="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-transparent dark:border-white/10 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Export Code</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 2. Slide-Over Component Drawer (All 56 Foundational Components) -->
  {#if componentDrawerOpen}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={() => (componentDrawerOpen = false)}
      class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-start">
      
      <!-- Drawer Body -->
      <div
        onclick={(e) => e.stopPropagation()}
        class="w-full max-w-xl bg-white dark:bg-[#0c1222] h-full shadow-2xl border-r border-slate-200 dark:border-white/10 flex flex-col animate-[slideRight_200ms_cubic-bezier(0.16,1,0.3,1)]">
        
        <!-- Drawer Header -->
        <div class="p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Component Palette</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Click any of the {COMPONENT_CATALOG.length} primitives to mount on canvas</p>
            </div>
          </div>
          <button
            onclick={() => (componentDrawerOpen = false)}
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Search Bar -->
        <div class="p-4 border-b border-slate-100 dark:border-white/5 space-y-3">
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              bind:value={componentSearch}
              placeholder="Search all 56 components (e.g. chart, date, table, modal, dial)..."
              class="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
            />
            {#if componentSearch}
              <button onclick={() => (componentSearch = '')} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">&times;</button>
            {/if}
          </div>

          <!-- Category Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {#each catalogCategories as cat}
              <button
                onclick={() => (componentCategory = cat)}
                class="px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer {componentCategory === cat ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}">
                {cat}
              </button>
            {/each}
          </div>
        </div>

        <!-- Scrollable Component Cards List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          {#if filteredCatalog.length === 0}
            <div class="py-12 text-center text-xs text-slate-400">
              No components found matching "{componentSearch}".
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {#each filteredCatalog as item}
                <button
                  type="button"
                  onclick={() => addCatalogComponent(item)}
                  class="group flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/[0.03] hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 border border-slate-200/70 dark:border-white/5 hover:border-emerald-500/40 rounded-2xl text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs">
                  <div class="w-8 h-8 rounded-xl bg-white dark:bg-white/10 border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    {#if item.category === 'Metrics & KPIs'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m7 15 4-6 4 4 6-8"/></svg>
                    {:else if item.category === 'Controllers & Sliders'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="m12 12 4-4"/></svg>
                    {:else if item.category === 'Forms & Inputs'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    {:else if item.category === 'Data Display'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                    {:else if item.category === 'Status & HUD'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {:else if item.category === 'Lists & Feeds'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    {:else if item.category === 'Matrices & Graphs'}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="6" cy="18" r="3"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="6" y1="9" x2="6" y2="15"/></svg>
                    {:else}
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/></svg>
                    {/if}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">{item.name}</span>
                      <span class="text-[9px] font-mono text-emerald-600 font-bold shrink-0">+ Add</span>
                    </div>
                    <p class="text-[10px] text-slate-400 truncate mt-0.5">{item.tagline || item.description}</p>
                    <span class="inline-block mt-1 text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-white/5 text-slate-500">{item.category}</span>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- 3. Main Live Canvas (Drag-and-Drop & Snap-to-Grid) -->
  <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
    
    <!-- Canvas Grid Area -->
    <main class="flex-1 w-full">
      {#if cards.length === 0}
        <div class="bg-white dark:bg-[#0f172a]/70 backdrop-blur-xl border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Canvas is empty</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">Click any component from the top ribbon or type a prompt for Sola Arc.</p>
          <div class="flex items-center gap-2">
            <button
              onclick={() => addComponent('stat')}
              class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer">
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
        <!-- Responsive Snap Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {#each cards as card (card.id)}
            <div
              draggable="true"
              ondragstart={(e) => onDragStart(e, card.id)}
              ondragover={(e) => onDragOver(e, card.id)}
              ondragleave={() => onDragLeave(card.id)}
              ondrop={(e) => onDrop(e, card.id)}
              ondragend={onDragEnd}
              onclick={() => (activeCardId = card.id)}
              class="group relative bg-white dark:bg-[#0f172a]/70 backdrop-blur-xl rounded-3xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md select-none {card.cols === 3 ? 'lg:col-span-3 md:col-span-2' : card.cols === 2 ? 'md:col-span-2' : 'col-span-1'} {activeCardId === card.id ? 'ring-2 ring-emerald-500 border-transparent shadow-emerald-500/20' : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'} {draggedCardId === card.id ? 'opacity-40 scale-[0.98]' : ''} {dragOverCardId === card.id ? 'ring-2 ring-emerald-500 border-dashed border-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10' : ''}">
              
              <!-- Card Action & Drag Header -->
              <div class="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                <!-- Grab Handle & Title -->
                <div class="flex items-center gap-2 min-w-0">
                  <div class="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10" title="Drag to move card">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <div class="min-w-0">
                    <input 
                      type="text" 
                      bind:value={card.title} 
                      onclick={(e) => e.stopPropagation()}
                      class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-[#0f172a] focus:outline-emerald-500 rounded px-1 -ml-1 truncate w-full max-w-[140px] sm:max-w-[200px]" />
                    {#if card.subtitle}
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 ml-1 truncate">{card.subtitle}</p>
                    {/if}
                  </div>
                </div>

                <!-- Width Snap & Card Actions -->
                <div class="flex items-center gap-1.5 shrink-0" onclick={(e) => e.stopPropagation()}>
                  <!-- Snap Width Controls -->
                  <div class="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-lg p-0.5">
                    <button
                      onclick={(e) => setCols(card, 1, e)}
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all {card.cols === 1 ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
                      title="1 Column">
                      1x
                    </button>
                    <button
                      onclick={(e) => setCols(card, 2, e)}
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all {card.cols === 2 ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
                      title="2 Columns">
                      2x
                    </button>
                    <button
                      onclick={(e) => setCols(card, 3, e)}
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all {card.cols === 3 ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
                      title="Full Width">
                      3x
                    </button>
                  </div>

                  <!-- Clone -->
                  <button
                    onclick={(e) => duplicateCard(card, e)}
                    class="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                    title="Duplicate">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>

                  <!-- Delete -->
                  <button
                    onclick={(e) => removeCard(card.id, e)}
                    class="p-1 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                    title="Delete">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              <!-- Card Dynamic Body -->
              <div class="p-5">
                <!-- TYPE: STAT METRIC -->
                {#if card.type === 'stat'}
                  <div class="flex items-baseline justify-between">
                    <input 
                      type="text" 
                      bind:value={card.value} 
                      onclick={(e) => e.stopPropagation()}
                      class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-[#0f172a] focus:outline-emerald-500 rounded px-1 -ml-1 w-48" />
                    {#if card.delta}
                      <span class="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 font-mono">
                        {card.delta}
                      </span>
                    {/if}
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Direct editable value</span>
                    <span class="font-medium text-slate-600 dark:text-slate-400">Zero-VDOM</span>
                  </div>

                <!-- TYPE: PROGRESS RING -->
                {:else if card.type === 'progress'}
                  {@const val = typeof card.value === 'number' ? card.value : 75}
                  <div class="flex items-center justify-between gap-6 py-2">
                    <div class="relative w-22 h-22 flex items-center justify-center shrink-0">
                      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          class="text-slate-100 dark:text-white/10"
                          stroke-width="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path
                          class="text-emerald-600 dark:text-emerald-400 transition-all duration-500 ease-out"
                          stroke-dasharray="{val}, 100"
                          stroke-width="3.5"
                          stroke-linecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-xl font-bold font-mono text-slate-900 dark:text-white">{val}%</span>
                      </div>
                    </div>
                    <div class="flex-1 space-y-2">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-500 dark:text-slate-400">Completion Target</span>
                        <span class="font-semibold text-slate-800 dark:text-slate-200">&gt; 70%</span>
                      </div>
                      <div class="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-500" style="width: {val}%"></div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        bind:value={card.value} 
                        onclick={(e) => e.stopPropagation()}
                        class="w-full accent-emerald-600 h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg cursor-pointer" />
                    </div>
                  </div>

                <!-- TYPE: WATERFALL / STEP BREAKDOWN -->
                {:else if card.type === 'waterfall'}
                  <div class="space-y-3 py-1">
                    <div class="flex items-end gap-3 h-28 pt-2">
                      {#each card.config?.bars || [
                        { name: 'Stage 1', val: 70, d: '+70' },
                        { name: 'Stage 2', val: 35, d: '+35' },
                        { name: 'Deductions', val: -15, d: '-15' },
                        { name: 'Total', val: 90, d: '90' }
                      ] as bar}
                        <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span class="text-[10px] font-bold font-mono {bar.val < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}">
                            {bar.d}
                          </span>
                          <div
                            class="w-full rounded-t-lg transition-all duration-500 {bar.val < 0 ? 'bg-rose-500 dark:bg-rose-400' : 'bg-emerald-500 dark:bg-emerald-400'}"
                            style="height: {Math.min(100, Math.max(15, Math.abs(bar.val)))}%"></div>
                          <span class="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate w-full text-center">{bar.name}</span>
                        </div>
                      {/each}
                    </div>
                  </div>

                <!-- TYPE: RANGE SLIDER / DIAL -->
                {:else if card.type === 'slider'}
                  <div class="py-2 flex flex-col items-center text-center">
                    <div class="text-2xl font-black font-mono text-slate-900 dark:text-white mb-1">{card.value}%</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={card.value}
                      onclick={(e) => e.stopPropagation()}
                      class="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 dark:bg-white/10 rounded-lg" />
                    <div class="w-full flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 font-mono">
                      <span>0% (Min)</span>
                      <span>50% (Mid)</span>
                      <span>100% (Max)</span>
                    </div>
                  </div>

                <!-- TYPE: STATUS & ALERT -->
                {:else if card.type === 'status'}
                  <div class="flex flex-col gap-2 py-1">
                    <div class="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <div>
                        <div class="text-xs font-bold text-emerald-950 dark:text-emerald-400">{card.title}</div>
                        <div class="text-[11px] text-emerald-700 dark:text-emerald-300">{card.subtitle || 'Operating within nominal bounds'}</div>
                      </div>
                    </div>
                  </div>

                <!-- TYPE: INPUT FORM -->
                {:else if card.type === 'form'}
                  <div class="space-y-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Configuration Field</label>
                      <input
                        type="text"
                        value="sample-input-value"
                        onclick={(e) => e.stopPropagation()}
                        class="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200" />
                    </div>
                    <div class="flex items-center justify-between pt-1">
                      <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Active Switch</span>
                      <input type="checkbox" checked class="accent-emerald-600 rounded w-4 h-4 cursor-pointer" onclick={(e) => e.stopPropagation()} />
                    </div>
                  </div>

                <!-- TYPE: TELEMETRY CHART -->
                {:else if card.type === 'chart'}
                  <div class="space-y-2 py-1">
                    <div class="flex items-center justify-between">
                      <span class="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{card.value}</span>
                      <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 font-mono">1,000Hz Direct</span>
                    </div>
                    <div class="h-20 flex items-end gap-1.5 pt-2">
                      {#each [40, 65, 30, 85, 45, 95, 75, 60, 90, 100, 70, 88] as val, i}
                        <div class="flex-1 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-t-md hover:bg-emerald-500 transition-all cursor-pointer group relative" style="height: {val}%">
                          <div class="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[9px] font-mono px-1 py-0.5 rounded">{val}</div>
                        </div>
                      {/each}
                    </div>
                  </div>

                <!-- TYPE: DATA TABLE -->
                {:else if card.type === 'table'}
                  <div class="overflow-x-auto text-xs py-1">
                    <table class="w-full text-left">
                      <thead>
                        <tr class="border-b border-slate-100 dark:border-white/5 text-[10px] text-slate-400 font-mono">
                          <th class="pb-1.5 font-bold">Node</th>
                          <th class="pb-1.5 font-bold">Signal</th>
                          <th class="pb-1.5 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                        <tr>
                          <td class="py-2 font-mono font-bold text-slate-800 dark:text-slate-200">alpha-west</td>
                          <td class="py-2 text-slate-500">1,240 msg/s</td>
                          <td class="py-2"><span class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">Active</span></td>
                        </tr>
                        <tr>
                          <td class="py-2 font-mono font-bold text-slate-800 dark:text-slate-200">delta-east</td>
                          <td class="py-2 text-slate-500">890 msg/s</td>
                          <td class="py-2"><span class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">Active</span></td>
                        </tr>
                        <tr>
                          <td class="py-2 font-mono font-bold text-slate-800 dark:text-slate-200">gamma-eu</td>
                          <td class="py-2 text-slate-500">410 msg/s</td>
                          <td class="py-2"><span class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-white/10 text-slate-400">Idle</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                <!-- TYPE: DATE PICKER -->
                {:else if card.type === 'datepicker'}
                  <div class="space-y-3 py-1 text-xs">
                    <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10">
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span class="font-mono font-bold text-slate-900 dark:text-white">{card.value}</span>
                      </div>
                      <span class="text-[10px] font-bold text-emerald-600">Active Range</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                      {#each [25, 26, 27, 28, 29, 30, 31] as d}
                        <span class="p-1 rounded {d === 30 ? 'bg-emerald-500 text-slate-950 font-bold' : ''}">{d}</span>
                      {/each}
                    </div>
                  </div>

                <!-- TYPE: CODE BLOCK -->
                {:else if card.type === 'code'}
                  <div class="bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-slate-200 border border-slate-800 space-y-1">
                    <div class="text-slate-500">// Direct Signal Binding</div>
                    <div><span class="text-violet-400">const</span> <span class="text-emerald-400">mesh</span> = <span class="text-sky-400">createSignal</span>(0);</div>
                    <div><span class="text-emerald-400">mesh</span>.<span class="text-amber-400">subscribe</span>((val) =&gt; patch(val));</div>
                  </div>

                <!-- TYPE: HAPTIC RADIAL DIAL -->
                {:else if card.type === 'radial_dial'}
                  {@const valNum = Math.min(Math.max(0, Number(card.value) || 0), 100)}
                  {@const circumference = 251.2}
                  {@const strokeDash = (valNum / 100) * circumference}
                  {@const strokeRest = circumference - strokeDash}
                  {@const rotationAngle = (valNum / 100) * 360}
                  <div class="py-2 flex flex-col items-center text-center">
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" class="text-slate-100 dark:text-white/10" stroke-width="8"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="8" stroke-dasharray="{strokeDash} {strokeRest}" stroke-linecap="round" transform="rotate(-90 50 50)"/>
                      <circle cx="50" cy="50" r="5" fill="#10b981"/>
                      <line x1="50" y1="50" x2="50" y2="20" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" transform="rotate({rotationAngle} 50 50)"/>
                    </svg>
                    <div class="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">{valNum}%</div>
                  </div>

                <!-- TYPE: NODE GRAPH -->
                {:else if card.type === 'node_graph'}
                  <div class="h-24 flex items-center justify-around py-1">
                    <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center font-mono font-bold text-xs text-emerald-600">N1</div>
                    <div class="h-0.5 flex-1 bg-emerald-500/30"></div>
                    <div class="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-500/10 border-2 border-sky-500 flex items-center justify-center font-mono font-bold text-xs text-sky-600">Hub</div>
                    <div class="h-0.5 flex-1 bg-sky-500/30"></div>
                    <div class="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border-2 border-violet-500 flex items-center justify-center font-mono font-bold text-xs text-violet-600">N2</div>
                  </div>
                {/if}
              </div>

            </div>
          {/each}
        </div>
      {/if}
    </main>

    <!-- 4. Slide-over Property Inspector for Active Card -->
    {#if activeCard}
      <aside class="w-full lg:w-80 shrink-0 bg-white dark:bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 shadow-sm space-y-4 lg:sticky lg:top-24 mb-40 lg:mb-0">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">Card Inspector</h3>
          </div>
          <button onclick={() => (activeCardId = null)} class="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs cursor-pointer">
            &times;
          </button>
        </div>

        <div class="space-y-3.5 text-xs">
          <!-- Title Edit -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title Label</label>
            <input
              type="text"
              bind:value={activeCard.title}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:border-emerald-500 text-slate-800 dark:text-slate-200 outline-none font-sans" />
          </div>

          <!-- Subtitle Edit -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subtitle</label>
            <input
              type="text"
              bind:value={activeCard.subtitle}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:border-emerald-500 text-slate-800 dark:text-slate-200 outline-none font-sans" />
          </div>

          <!-- Value Edit -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Value</label>
            <input
              type="text"
              bind:value={activeCard.value}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:bg-white dark:focus:bg-[#0f172a] focus:border-emerald-500 text-slate-800 dark:text-slate-200 outline-none font-sans font-mono" />
          </div>

          <!-- Column Width Snap -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Grid Column Span</label>
            <div class="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
              <button
                onclick={() => activeCard && (activeCard.cols = 1)}
                class="py-1 rounded-lg font-mono text-xs cursor-pointer transition-all {activeCard.cols === 1 ? 'bg-white dark:bg-emerald-500 shadow-xs text-slate-900 dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                1 Col
              </button>
              <button
                onclick={() => activeCard && (activeCard.cols = 2)}
                class="py-1 rounded-lg font-mono text-xs cursor-pointer transition-all {activeCard.cols === 2 ? 'bg-white dark:bg-emerald-500 shadow-xs text-slate-900 dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                2 Col
              </button>
              <button
                onclick={() => activeCard && (activeCard.cols = 3)}
                class="py-1 rounded-lg font-mono text-xs cursor-pointer transition-all {activeCard.cols === 3 ? 'bg-white dark:bg-emerald-500 shadow-xs text-slate-900 dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                3 Col
              </button>
            </div>
          </div>

          <!-- JSON Config Editor -->
          {#if activeCard.config}
            <div class="pt-3 border-t border-slate-100 dark:border-white/5">
              <label class="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Component Data (JSON)</label>
              <textarea
                value={JSON.stringify(activeCard.config, null, 2)}
                onchange={(e) => {
                  try {
                    activeCard.config = JSON.parse(e.currentTarget.value);
                  } catch (err) {
                    // Ignore invalid JSON parsing while typing
                  }
                }}
                class="w-full h-32 p-3 font-mono text-[10px] bg-slate-900 dark:bg-black/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border border-slate-800 dark:border-white/10"
              ></textarea>
            </div>
          {/if}

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <button
              onclick={() => duplicateCard(activeCard)}
              class="px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all cursor-pointer">
              Duplicate
            </button>
            <button
              onclick={() => removeCard(activeCard.id)}
              class="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl font-medium transition-all cursor-pointer">
              Delete
            </button>
          </div>
        </div>
      </aside>
    {/if}
  </div>

  <!-- 5. Code Export Modal -->
  {#if exportModalOpen}
    <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-[#0f172a] w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Export Canvas Code</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clean, production-ready component code.</p>
          </div>
          <button
            onclick={() => (exportModalOpen = false)}
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Export Tabs -->
        <div class="px-6 pt-3 flex items-center gap-2 bg-slate-50 dark:bg-[#090d19] border-b border-slate-100 dark:border-white/5">
          <button
            onclick={() => (exportTab = 'react')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'react' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}">
            React 19 (JSX)
          </button>
          <button
            onclick={() => (exportTab = 'svelte')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'svelte' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}">
            Svelte 5 (Runes)
          </button>
          <button
            onclick={() => (exportTab = 'webcomponent')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'webcomponent' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}">
            HTML / Web Component
          </button>
        </div>

        <!-- Code Preview Viewport -->
        <div class="p-6 flex-1 overflow-auto bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
          <pre><code>{generatedCode}</code></pre>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-[#090d19] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {#if copyNotification}
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Copied to clipboard!
              </span>
            {:else}
              Ready to import into your project.
            {/if}
          </span>
          <div class="flex items-center gap-2">
            <button
              onclick={copyCode}
              class="px-4 py-2 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
              Copy Code
            </button>
            <button
              onclick={() => (exportModalOpen = false)}
              class="px-4 py-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Floating Arc Copilot -->
  <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none">
    <div class="pointer-events-auto bg-white/90 dark:bg-[#090d19]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 ring-1 ring-slate-900/5">
      <form
        onsubmit={(e) => {
          e.preventDefault();
          runArcPrompt();
        }}
        class="relative flex items-center w-full">
        <div class="absolute left-3 text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a2.25 2.25 0 014.5 0v3m-3-4.5h-2.25a2.25 2.25 0 01-2.25-2.25V6.75m0 8.25v-1.5a2.25 2.25 0 00-2.25-2.25H6.75m0 8.25v-1.5a2.25 2.25 0 012.25-2.25h1.5m-1.5-8.25h1.5a2.25 2.25 0 002.25-2.25V6.75m0-3v3m0 0h3m-3 0h-3m12 0h-3m3 0v3m0-3v-3" />
          </svg>
        </div>
        <input
          type="text"
          bind:value={arcPromptInput}
          placeholder="Ask Sola Arc to build a layout or component..."
          class="w-full pl-11 pr-36 py-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-sans" />
        <button
          type="submit"
          disabled={isGeneratingArc || !arcPromptInput.trim()}
          class="absolute right-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:disabled:opacity-40 dark:text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed">
          {#if isGeneratingArc}
            <div class="w-3.5 h-3.5 border-2 border-white/30 dark:border-slate-950/30 border-t-white dark:border-t-slate-950 rounded-full animate-spin"></div>
            <span>Generating...</span>
          {:else}
            <span>Build with Arc</span>
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
