<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';

  // --- 1. Universal Canvas Card Data Model ---
  interface StudioCard {
    id: string;
    type: 'stat' | 'progress' | 'waterfall' | 'slider' | 'form' | 'feed' | 'status';
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
  let copyNotification = $state(false);

  // Drag-and-Drop & Snap-to-Grid State
  let draggedCardId = $state<string | null>(null);
  let dragOverCardId = $state<string | null>(null);

  // Sample Starters (Universal Variety)
  const samplePresets: Record<string, { label: string; cards: StudioCard[] }> = {
    general: {
      label: 'Standard Dashboard',
      cards: [
        { id: 'c1', type: 'stat', title: 'Primary Metric', subtitle: 'Live aggregated total', cols: 1, value: '$48,500', delta: '+14.2%', accentColor: 'emerald' },
        { id: 'c2', type: 'progress', title: 'Goal Completion', subtitle: 'Target milestone progress', cols: 1, value: 78, delta: '78%', accentColor: 'emerald' },
        { id: 'c3', type: 'slider', title: 'Adjustment Range', subtitle: 'Tactile input controller', cols: 1, value: 65, accentColor: 'emerald' },
        { id: 'c4', type: 'waterfall', title: 'Step Distribution Flow', subtitle: 'Sequential progression breakdown', cols: 2, value: '$120k', accentColor: 'emerald', config: { bars: [{ name: 'Initial', val: 80, d: '+80' }, { name: 'Additions', val: 40, d: '+40' }, { name: 'Deductions', val: -20, d: '-20' }, { name: 'Total', val: 100, d: '100' }] } },
        { id: 'c5', type: 'feed', title: 'Activity & Updates', subtitle: 'Recent events log', cols: 1, value: 'Active', accentColor: 'slate' }
      ]
    },
    product: {
      label: 'Project & Task Tracker',
      cards: [
        { id: 'p1', type: 'stat', title: 'Sprint Velocity', subtitle: 'Story points completed', cols: 1, value: '94 pts', delta: '+8.2%', accentColor: 'indigo' },
        { id: 'p2', type: 'progress', title: 'Sprint 24 Progress', subtitle: 'Target: 100 points', cols: 1, value: 86, delta: '86%', accentColor: 'indigo' },
        { id: 'p3', type: 'status', title: 'Deployment Health', subtitle: 'All integration tests passing', cols: 1, value: 'Passing', accentColor: 'emerald' },
        { id: 'p4', type: 'form', title: 'Create Work Item', subtitle: 'Quick task assigner', cols: 2, value: 'Form', accentColor: 'slate' }
      ]
    },
    ecommerce: {
      label: 'E-Commerce Store',
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
    if (samplePresets[key]) {
      cards = JSON.parse(JSON.stringify(samplePresets[key].cards));
      activeCardId = null;
    }
  }

  function clearCanvas() {
    cards = [];
    activeCardId = null;
    selectedPresetKey = 'blank';
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
    } else if (type === 'slider') {
      newCard = { id: newId, type: 'slider', title: 'Control Slider', subtitle: 'Tactile adjustment input', cols: 1, value: 50, accentColor: 'emerald' };
    } else if (type === 'form') {
      newCard = { id: newId, type: 'form', title: 'Interactive Form', subtitle: 'Dynamic input schema', cols: 2, value: 'Form', accentColor: 'slate' };
    } else if (type === 'feed') {
      newCard = { id: newId, type: 'feed', title: 'Activity Stream', subtitle: 'Real-time event feed', cols: 1, value: 'Active', accentColor: 'slate' };
    } else {
      newCard = { id: newId, type: 'status', title: 'Status & State Card', subtitle: 'Operational condition banner', cols: 1, value: 'Optimal', accentColor: 'emerald' };
    }

    cards = [...cards, newCard];
    activeCardId = newId;
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
      // Fallback
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#fafafa]">
      ${cards.map(c => `{/* ${c.title} */}
      <div className="${c.cols === 3 ? 'lg:col-span-3 md:col-span-2' : c.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">${c.title}</h3>
        <p className="text-3xl font-bold font-mono text-slate-900 mt-2">${c.value}</p>
      </div>`).join('\n      ')}
    </div>
  );
}`;
    } else if (exportTab === 'svelte') {
      return '<' + 'script lang="ts">\n' +
        '  // Sola Canvas (Svelte 5 Runes)\n' +
        '<' + '/script>\n\n' +
        '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#fafafa]">\n' +
        cards.map(c => `  <!-- ${c.title} -->\n  <div class="${c.cols === 3 ? 'lg:col-span-3 md:col-span-2' : c.cols === 2 ? 'md:col-span-2' : 'col-span-1'} bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">\n    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">${c.title}</h3>\n    <div class="text-3xl font-bold font-mono text-slate-900 mt-2">${c.value}</div>\n  </div>`).join('\n') +
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

<!-- Outer Container: Pure Light Ivory Theme -->
<div class="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
  <Navbar />

  <!-- 1. Top Navigation Bar -->
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      <!-- Studio Canvas Branding & Layout Presets -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <div class="flex items-center gap-2 shrink-0">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-xs shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-black tracking-tight text-slate-950 text-sm whitespace-nowrap">Studio Canvas</span>
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-full whitespace-nowrap">Drag & Drop</span>
          </div>
        </div>

        <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <!-- Sample Layout Selector -->
        <div class="flex items-center overflow-x-auto w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600 no-scrollbar">
          <button
            onclick={() => loadSample('general')}
            class="px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap {selectedPresetKey === 'general' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-900'}">
            Dashboard
          </button>
          <button
            onclick={() => loadSample('product')}
            class="px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap {selectedPresetKey === 'product' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-900'}">
            Tasks
          </button>
          <button
            onclick={() => loadSample('ecommerce')}
            class="px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap {selectedPresetKey === 'ecommerce' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-900'}">
            E-Commerce
          </button>
          <button
            onclick={clearCanvas}
            class="px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-50 transition-all cursor-pointer whitespace-nowrap {selectedPresetKey === 'blank' ? 'bg-white text-rose-800 shadow-xs font-bold' : ''}">
            Clear
          </button>
        </div>
      </div>

      <!-- Center Spacer -->
      <div class="flex-1"></div>

      <!-- Right: Export Action -->
      <div class="flex items-center gap-2">
        <button
          onclick={() => (exportModalOpen = true)}
          class="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Export Code</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 2. Universal Horizontal Component Shelf (Figma Style) -->
  <div class="bg-white border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-2.5">
    <div class="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-3 py-0.5 no-scrollbar">
      <div class="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap w-full">
        <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] pl-1">Insert to Canvas:</span>
        
        <button
          onclick={() => addComponent('stat')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span>+ Metric Tile</span>
        </button>

        <button
          onclick={() => addComponent('progress')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>+ Progress Ring</span>
        </button>

        <button
          onclick={() => addComponent('waterfall')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          <span>+ Step Breakdown</span>
        </button>

        <button
          onclick={() => addComponent('slider')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/></svg>
          <span>+ Control Slider</span>
        </button>

        <button
          onclick={() => addComponent('form')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>+ Input Form</span>
        </button>

        <button
          onclick={() => addComponent('feed')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>+ Activity Feed</span>
        </button>

        <button
          onclick={() => addComponent('status')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>+ Status Card</span>
        </button>
      </div>

      <div class="text-[11px] text-slate-400 font-mono font-medium whitespace-nowrap">
        {cards.length} {cards.length === 1 ? 'component' : 'components'} active
      </div>
    </div>
  </div>

  <!-- 3. Main Live Canvas (Drag-and-Drop & Snap-to-Grid) -->
  <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
    
    <!-- Canvas Grid Area -->
    <main class="flex-1 w-full">
      {#if cards.length === 0}
        <div class="min-h-[420px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center bg-white/70">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1">Canvas is empty</h3>
          <p class="text-xs text-slate-500 max-w-sm mb-5">Click any component from the top ribbon or type a prompt for Sola Arc.</p>
          <div class="flex items-center gap-2">
            <button
              onclick={() => addComponent('stat')}
              class="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
              + Add Metric Tile
            </button>
            <button
              onclick={() => loadSample('general')}
              class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
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
              class="group relative bg-white rounded-3xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md select-none {card.cols === 3 ? 'lg:col-span-3 md:col-span-2' : card.cols === 2 ? 'md:col-span-2' : 'col-span-1'} {activeCardId === card.id ? 'ring-2 ring-emerald-500 border-transparent shadow-emerald-100/50' : 'border-slate-200/90 hover:border-slate-300'} {draggedCardId === card.id ? 'opacity-40 scale-[0.98]' : ''} {dragOverCardId === card.id ? 'ring-2 ring-emerald-500 border-dashed border-emerald-400 bg-emerald-50/20' : ''}">
              
              <!-- Card Action & Drag Header -->
              <div class="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
                <!-- Grab Handle & Title -->
                <div class="flex items-center gap-2">
                  <div class="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100" title="Drag to move card">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      bind:value={card.title} 
                      onclick={(e) => e.stopPropagation()}
                      class="text-xs font-bold uppercase tracking-wider text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-emerald-500 rounded px-1 -ml-1" />
                    {#if card.subtitle}
                      <p class="text-[11px] text-slate-400 mt-0.5 ml-1">{card.subtitle}</p>
                    {/if}
                  </div>
                </div>

                <!-- Width Snap & Card Actions -->
                <div class="flex items-center gap-1.5" onclick={(e) => e.stopPropagation()}>
                  <!-- Snap Width Controls -->
                  <div class="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      onclick={(e) => setCols(card, 1, e)}
                      class="px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer {card.cols === 1 ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}"
                      title="1 Column">
                      1x
                    </button>
                    <button
                      onclick={(e) => setCols(card, 2, e)}
                      class="px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer {card.cols === 2 ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}"
                      title="2 Columns">
                      2x
                    </button>
                    <button
                      onclick={(e) => setCols(card, 3, e)}
                      class="px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer {card.cols === 3 ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}"
                      title="Full Width">
                      3x
                    </button>
                  </div>

                  <!-- Clone -->
                  <button
                    onclick={(e) => duplicateCard(card, e)}
                    class="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                    title="Duplicate">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>

                  <!-- Delete -->
                  <button
                    onclick={(e) => removeCard(card.id, e)}
                    class="p-1 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer"
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
                      class="text-3xl font-extrabold tracking-tight text-slate-900 font-mono bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-emerald-500 rounded px-1 -ml-1 w-48" />
                    {#if card.delta}
                      <span class="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-mono">
                        {card.delta}
                      </span>
                    {/if}
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Direct editable value</span>
                    <span class="font-medium text-slate-600">Zero-VDOM</span>
                  </div>

                <!-- TYPE: PROGRESS RING -->
                {:else if card.type === 'progress'}
                  {@const val = typeof card.value === 'number' ? card.value : 75}
                  <div class="flex items-center justify-between gap-6 py-2">
                    <div class="relative w-22 h-22 flex items-center justify-center">
                      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          class="text-slate-100"
                          stroke-width="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path
                          class="text-emerald-600 transition-all duration-500 ease-out"
                          stroke-dasharray="{val}, 100"
                          stroke-width="3.5"
                          stroke-linecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-xl font-bold font-mono text-slate-900">{val}%</span>
                      </div>
                    </div>
                    <div class="flex-1 space-y-2">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-500">Completion Target</span>
                        <span class="font-semibold text-slate-800">&gt; 70%</span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-emerald-600 h-full rounded-full transition-all duration-500" style="width: {val}%"></div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        bind:value={card.value} 
                        onclick={(e) => e.stopPropagation()}
                        class="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer" />
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
                          <span class="text-[10px] font-bold font-mono {bar.val < 0 ? 'text-rose-600' : 'text-emerald-700'}">
                            {bar.d}
                          </span>
                          <div
                            class="w-full rounded-t-lg transition-all duration-500 {bar.val < 0 ? 'bg-rose-400' : 'bg-emerald-600'}"
                            style="height: {Math.min(100, Math.max(15, Math.abs(bar.val)))}%"></div>
                          <span class="text-[10px] font-medium text-slate-500 truncate w-full text-center">{bar.name}</span>
                        </div>
                      {/each}
                    </div>
                  </div>

                <!-- TYPE: RANGE SLIDER / DIAL -->
                {:else if card.type === 'slider'}
                  <div class="py-2 flex flex-col items-center text-center">
                    <div class="text-2xl font-black font-mono text-slate-900 mb-1">{card.value}%</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={card.value}
                      onclick={(e) => e.stopPropagation()}
                      class="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg" />
                    <div class="w-full flex justify-between text-[10px] font-semibold text-slate-400 mt-2 font-mono">
                      <span>0% (Min)</span>
                      <span>50% (Mid)</span>
                      <span>100% (Max)</span>
                    </div>
                  </div>

                <!-- TYPE: STATUS & ALERT -->
                {:else if card.type === 'status'}
                  <div class="flex flex-col gap-2 py-1">
                    <div class="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <div>
                        <div class="text-xs font-bold text-emerald-950">{card.title}</div>
                        <div class="text-[11px] text-emerald-700">{card.subtitle || 'Operating within nominal bounds'}</div>
                      </div>
                    </div>
                  </div>

                <!-- TYPE: INPUT FORM -->
                {:else if card.type === 'form'}
                  <div class="space-y-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-600 mb-1">Configuration Field</label>
                      <input
                        type="text"
                        value="sample-input-value"
                        onclick={(e) => e.stopPropagation()}
                        class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800" />
                    </div>
                    <div class="flex items-center justify-between pt-1">
                      <span class="text-xs font-medium text-slate-600">Active Switch</span>
                      <input type="checkbox" checked class="accent-emerald-600 rounded w-4 h-4 cursor-pointer" onclick={(e) => e.stopPropagation()} />
                    </div>
                  </div>

                <!-- TYPE: FEED LIST -->
                {:else if card.type === 'feed'}
                  <div class="space-y-3 text-xs">
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</div>
                      <div>
                        <p class="text-slate-800 font-medium text-[11px]">Primary event registered</p>
                        <span class="text-[10px] text-slate-400">Just now</span>
                      </div>
                    </div>
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</div>
                      <div>
                        <p class="text-slate-800 font-medium text-[11px]">State update acknowledged</p>
                        <span class="text-[10px] text-slate-400">3 min ago</span>
                      </div>
                    </div>
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
      <aside class="w-full lg:w-80 shrink-0 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 lg:sticky lg:top-24 mb-40 lg:mb-0">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-900">Card Inspector</h3>
          </div>
          <button onclick={() => (activeCardId = null)} class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer">
            &times;
          </button>
        </div>

        <div class="space-y-3.5 text-xs">
          <!-- Title Edit -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Title Label</label>
            <input
              type="text"
              bind:value={activeCard.title}
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-sans" />
          </div>

          <!-- Subtitle Edit -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              bind:value={activeCard.subtitle}
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-sans" />
          </div>

          <!-- Value Edit -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Primary Value</label>
            <input
              type="text"
              bind:value={activeCard.value}
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-sans font-mono" />
          </div>

          <!-- Column Width Snap -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Grid Column Span</label>
            <div class="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onclick={() => activeCard && (activeCard.cols = 1)}
                class="py-1 rounded-lg font-medium cursor-pointer {activeCard.cols === 1 ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500'}">
                1 Col
              </button>
              <button
                onclick={() => activeCard && (activeCard.cols = 2)}
                class="py-1 rounded-lg font-medium cursor-pointer {activeCard.cols === 2 ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500'}">
                2 Col
              </button>
              <button
                onclick={() => activeCard && (activeCard.cols = 3)}
                class="py-1 rounded-lg font-medium cursor-pointer {activeCard.cols === 3 ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500'}">
                3 Col
              </button>
            </div>
          </div>

          <!-- JSON Config Editor -->
          {#if activeCard.config}
            <div class="pt-3 border-t border-slate-100">
              <label class="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">Component Data (JSON)</label>
              <textarea
                value={JSON.stringify(activeCard.config, null, 2)}
                onchange={(e) => {
                  try {
                    activeCard.config = JSON.parse(e.currentTarget.value);
                  } catch (err) {
                    // Ignore invalid JSON parsing while typing
                  }
                }}
                class="w-full h-32 p-3 font-mono text-[10px] bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              ></textarea>
            </div>
          {/if}

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onclick={() => duplicateCard(activeCard)}
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all cursor-pointer">
              Duplicate
            </button>
            <button
              onclick={() => removeCard(activeCard.id)}
              class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-medium transition-all cursor-pointer">
              Delete
            </button>
          </div>
        </div>
      </aside>
    {/if}
  </div>

  <!-- 5. Code Export Modal -->
  {#if exportModalOpen}
    <div class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Export Canvas Code</h3>
            <p class="text-xs text-slate-500 mt-0.5">Clean, production-ready component code.</p>
          </div>
          <button
            onclick={() => (exportModalOpen = false)}
            class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Framework Selector Tabs -->
        <div class="px-6 pt-3 flex items-center gap-2 bg-slate-50 border-b border-slate-100">
          <button
            onclick={() => (exportTab = 'react')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'react' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}">
            React 19 (JSX)
          </button>
          <button
            onclick={() => (exportTab = 'svelte')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'svelte' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}">
            Svelte 5 (Runes)
          </button>
          <button
            onclick={() => (exportTab = 'webcomponent')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'webcomponent' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}">
            HTML / Web Component
          </button>
        </div>

        <!-- Code Box -->
        <div class="p-6 flex-1 overflow-auto bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
          <pre><code>{generatedCode}</code></pre>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-500">
            {#if copyNotification}
              <span class="text-emerald-600 font-semibold flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Copied to clipboard!
              </span>
            {:else}
              Ready to paste into any project
            {/if}
          </span>
          <div class="flex items-center gap-2">
            <button
              onclick={copyCode}
              class="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
              Copy Code
            </button>
            <button
              onclick={() => (exportModalOpen = false)}
              class="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Floating Arc Copilot -->
  <div class="fixed bottom-28 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none">
    <div class="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-slate-200/50 p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-2 ring-1 ring-slate-900/5">
      <form
        onsubmit={(e) => {
          e.preventDefault();
          runArcPrompt();
        }}
        class="relative flex items-center w-full">
        <div class="absolute left-3 text-emerald-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a2.25 2.25 0 014.5 0v3m-3-4.5h-2.25a2.25 2.25 0 01-2.25-2.25V6.75m0 8.25v-1.5a2.25 2.25 0 00-2.25-2.25H6.75m0 8.25v-1.5a2.25 2.25 0 012.25-2.25h1.5m-1.5-8.25h1.5a2.25 2.25 0 002.25-2.25V6.75m0-3v3m0 0h3m-3 0h-3m12 0h-3m3 0v3m0-3v-3" />
          </svg>
        </div>
        <input
          type="text"
          bind:value={arcPromptInput}
          placeholder="Ask Sola Arc to build a layout or component..."
          class="w-full pl-11 pr-32 py-3 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-sans" />
        <button
          type="submit"
          disabled={isGeneratingArc || !arcPromptInput.trim()}
          class="absolute right-1 px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer">
          {#if isGeneratingArc}
            <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Building Component AST...</span>
          {:else}
            <span>Build with Arc</span>
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
