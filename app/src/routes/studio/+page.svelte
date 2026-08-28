<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';

  // --- 1. Universal Reactive Signal Engine ---
  let signals = $state({
    primaryValue: 42850,
    progressPercentage: 74,
    adjustmentLevel: 65,
    simulating: true
  });

  // Dynamic live signal simulation (demonstrating reactive data binding)
  $effect(() => {
    if (!signals.simulating) return;
    const interval = setInterval(() => {
      signals.primaryValue = Math.round(42000 + Math.sin(Date.now() / 2000) * 4500);
      signals.progressPercentage = Math.min(100, Math.max(10, Math.round(70 + Math.sin(Date.now() / 1500) * 25)));
      signals.adjustmentLevel = Math.min(100, Math.max(0, Math.round(60 + Math.cos(Date.now() / 1800) * 30)));
    }, 1200);

    return () => clearInterval(interval);
  });

  // --- 2. Universal Canvas Card Model ---
  interface StudioCard {
    id: string;
    type: 'metric' | 'gauge' | 'waterfall' | 'dial' | 'form' | 'feed' | 'status';
    title: string;
    subtitle?: string;
    cols: 1 | 2 | 3;
    signalBinding?: 'primaryValue' | 'progressPercentage' | 'adjustmentLevel';
    customValue?: string | number;
    accentColor: string;
    config?: Record<string, any>;
  }

  let arcPromptInput = $state('');
  let isGeneratingArc = $state(false);
  let activeCardId = $state<string | null>(null);
  let sampleDropdownOpen = $state(false);
  let exportModalOpen = $state(false);
  let exportTab = $state<'svelte' | 'react' | 'webcomponent'>('react');
  let copyNotification = $state(false);

  // Diverse Sample Canvas Presets
  const samplePresets: Record<string, { label: string; category: string; cards: StudioCard[] }> = {
    general: {
      label: 'General Dashboard',
      category: 'Universal',
      cards: [
        {
          id: 'u1',
          type: 'metric',
          title: 'Primary Key Metric',
          subtitle: 'Real-time aggregated value',
          cols: 1,
          signalBinding: 'primaryValue',
          accentColor: 'emerald'
        },
        {
          id: 'u2',
          type: 'gauge',
          title: 'Goal Completion Rate',
          subtitle: 'Active milestone progress',
          cols: 1,
          signalBinding: 'progressPercentage',
          accentColor: 'emerald'
        },
        {
          id: 'u3',
          type: 'dial',
          title: 'Adjustment Controller',
          subtitle: 'Customizable range slider',
          cols: 1,
          customValue: 65,
          signalBinding: 'adjustmentLevel',
          accentColor: 'emerald'
        },
        {
          id: 'u4',
          type: 'waterfall',
          title: 'Step Progression Breakdown',
          subtitle: 'Starting value to net total calculation',
          cols: 2,
          accentColor: 'emerald',
          config: {
            bars: [
              { name: 'Initial', value: 100, delta: '+100', type: 'pos' },
              { name: 'Additions', value: 45, delta: '+45', type: 'pos' },
              { name: 'Deductions', value: -25, delta: '-25', type: 'neg' },
              { name: 'Final Total', value: 120, delta: '120', type: 'total' }
            ]
          }
        },
        {
          id: 'u5',
          type: 'feed',
          title: 'Recent Activity & Updates',
          subtitle: 'Live synchronized event stream',
          cols: 1,
          accentColor: 'slate'
        }
      ]
    },
    ecommerce: {
      label: 'E-Commerce & Store',
      category: 'Commerce',
      cards: [
        { id: 'e1', type: 'metric', title: 'Daily Store Sales', subtitle: 'Processed via Stripe / Shopify', cols: 1, signalBinding: 'primaryValue', accentColor: 'emerald' },
        { id: 'e2', type: 'gauge', title: 'Checkout Conversion Rate', subtitle: 'Target > 3.5%', cols: 1, customValue: '3.8%', accentColor: 'emerald' },
        { id: 'e3', type: 'dial', title: 'Discount Threshold', subtitle: 'Promotional tier multiplier', cols: 1, customValue: 15, accentColor: 'emerald' },
        { id: 'e4', type: 'waterfall', title: 'Gross Merchandise Value Waterfall', subtitle: 'Orders to Net Settlement', cols: 2, accentColor: 'emerald', config: { bars: [{ name: 'Gross Orders', value: 140, delta: '+$140k', type: 'pos' }, { name: 'Upsells', value: 30, delta: '+$30k', type: 'pos' }, { name: 'Refunds', value: -12, delta: '-$12k', type: 'neg' }, { name: 'Net Payout', value: 158, delta: '$158k', type: 'total' }] } }
      ]
    },
    project: {
      label: 'Product & Tasks',
      category: 'Productivity',
      cards: [
        { id: 'p1', type: 'metric', title: 'Sprint Velocity', subtitle: 'Completed story points', cols: 1, customValue: '84 pts', accentColor: 'indigo' },
        { id: 'p2', type: 'gauge', title: 'Milestone Progress', subtitle: 'Sprint 24 completion', cols: 1, signalBinding: 'progressPercentage', accentColor: 'emerald' },
        { id: 'p3', type: 'status', title: 'Release Candidate Readiness', subtitle: '3 of 3 checks passing', cols: 1, accentColor: 'emerald' },
        { id: 'p4', type: 'form', title: 'Quick Task Dispatch', subtitle: 'Create and assign work item', cols: 2, accentColor: 'slate' }
      ]
    },
    habits: {
      label: 'Habits & Personal Goals',
      category: 'Personal',
      cards: [
        { id: 'h1', type: 'metric', title: 'Weekly Focus Hours', subtitle: 'Deep work tracker', cols: 1, customValue: '38.5 hrs', accentColor: 'indigo' },
        { id: 'h2', type: 'gauge', title: 'Daily Habit Streak', subtitle: '18 consecutive days', cols: 1, customValue: 92, accentColor: 'emerald' },
        { id: 'h3', type: 'dial', title: 'Weekly Target Goal', subtitle: 'Adjust hours target', cols: 1, customValue: 40, accentColor: 'emerald' },
        { id: 'h4', type: 'feed', title: 'Completed Milestones', subtitle: 'Today’s accomplishments', cols: 2, accentColor: 'slate' }
      ]
    }
  };

  let cards = $state<StudioCard[]>([...samplePresets.general.cards]);
  const activeCard = $derived(cards.find((c) => c.id === activeCardId) || null);

  function loadSample(key: string) {
    if (samplePresets[key]) {
      cards = JSON.parse(JSON.stringify(samplePresets[key].cards));
      activeCardId = null;
      sampleDropdownOpen = false;
    }
  }

  function clearCanvas() {
    cards = [];
    activeCardId = null;
  }

  // 1-Click Universal Component Adders
  function addComponent(type: StudioCard['type']) {
    const newId = 'card_' + Math.random().toString(36).substring(2, 9);
    let newCard: StudioCard;

    if (type === 'metric') {
      newCard = {
        id: newId,
        type: 'metric',
        title: 'New Metric Tile',
        subtitle: 'Stat or KPI summary',
        cols: 1,
        signalBinding: 'primaryValue',
        accentColor: 'emerald'
      };
    } else if (type === 'gauge') {
      newCard = {
        id: newId,
        type: 'gauge',
        title: 'Progress Ring',
        subtitle: 'Percentage or capacity',
        cols: 1,
        signalBinding: 'progressPercentage',
        accentColor: 'emerald'
      };
    } else if (type === 'waterfall') {
      newCard = {
        id: newId,
        type: 'waterfall',
        title: 'Step Progression Waterfall',
        subtitle: 'Value breakdown flow',
        cols: 2,
        accentColor: 'emerald',
        config: {
          bars: [
            { name: 'Stage 1', value: 80, delta: '+80', type: 'pos' },
            { name: 'Stage 2', value: 40, delta: '+40', type: 'pos' },
            { name: 'Deduction', value: -20, delta: '-20', type: 'neg' },
            { name: 'Net', value: 100, delta: '100', type: 'total' }
          ]
        }
      };
    } else if (type === 'dial') {
      newCard = {
        id: newId,
        type: 'dial',
        title: 'Adjustment Controller',
        subtitle: 'Tactile slider / level input',
        cols: 1,
        customValue: 50,
        signalBinding: 'adjustmentLevel',
        accentColor: 'emerald'
      };
    } else if (type === 'form') {
      newCard = {
        id: newId,
        type: 'form',
        title: 'Interactive Form',
        subtitle: 'Dynamic input schema',
        cols: 2,
        accentColor: 'slate'
      };
    } else if (type === 'feed') {
      newCard = {
        id: newId,
        type: 'feed',
        title: 'Activity Feed',
        subtitle: 'Real-time event stream',
        cols: 1,
        accentColor: 'slate'
      };
    } else {
      newCard = {
        id: newId,
        type: 'status',
        title: 'Status & State Card',
        subtitle: 'Operational badge indicator',
        cols: 1,
        accentColor: 'emerald'
      };
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
      id: 'card_' + Math.random().toString(36).substring(2, 9),
      title: card.title + ' (Copy)'
    };
    const idx = cards.findIndex((c) => c.id === card.id);
    cards = [...cards.slice(0, idx + 1), copy, ...cards.slice(idx + 1)];
    activeCardId = copy.id;
  }

  function updateCols(cardId: string, cols: 1 | 2 | 3, e?: Event) {
    if (e) e.stopPropagation();
    cards = cards.map((c) => (c.id === cardId ? { ...c, cols } : c));
  }

  // Open-Ended Arc AI Generative Synthesis
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
        const synthesized: StudioCard[] = data.map((item: any, idx: number) => {
          const typeMap: Record<string, StudioCard['type']> = {
            DataCard: 'metric',
            GaugeCard: 'gauge',
            FlowWaterfall: 'waterfall',
            TactileDialCard: 'dial',
            DynamicForm: 'form',
            ListBlock: 'feed',
            IncidentTriageMatrix: 'status',
            ClusterMatrix: 'metric'
          };
          const cardType = typeMap[item.component] || 'metric';
          return {
            id: 'arc_' + idx + '_' + Math.random().toString(36).substring(2, 7),
            type: cardType,
            title: item.config?.title || 'Custom Component',
            subtitle: item.config?.subtitle || 'Synthesized by Sola Arc',
            cols: (item.colSpan || 1) as 1 | 2 | 3,
            signalBinding: cardType === 'gauge' ? 'progressPercentage' : cardType === 'metric' ? 'primaryValue' : undefined,
            customValue: item.config?.value || 'Active',
            accentColor: 'emerald',
            config: item.config
          };
        });
        cards = synthesized;
        activeCardId = synthesized[0].id;
      }
    } catch {
      // Clean fallback
      const p = query.toLowerCase();
      if (p.includes('waterfall') || p.includes('funnel') || p.includes('breakdown')) addComponent('waterfall');
      else if (p.includes('gauge') || p.includes('ring') || p.includes('progress') || p.includes('percent')) addComponent('gauge');
      else if (p.includes('slider') || p.includes('dial') || p.includes('control')) addComponent('dial');
      else if (p.includes('form') || p.includes('input') || p.includes('submit')) addComponent('form');
      else addComponent('metric');
    } finally {
      isGeneratingArc = false;
      arcPromptInput = '';
    }
  }

  // Multi-Target Code Exporter Logic
  const generatedCode = $derived.by(() => {
    if (exportTab === 'svelte') {
      return '<' + 'script lang="ts">\n' +
        '  // Sola Generated Canvas (Svelte 5 Runes)\n' +
        '  let signals = $state({\n' +
        `    primaryValue: ${signals.primaryValue},\n` +
        `    progressPercentage: ${signals.progressPercentage},\n` +
        `    adjustmentLevel: ${signals.adjustmentLevel}\n` +
        '  });\n' +
        '<' + '/script>\n\n' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-[#fafafa] min-h-screen">\n' +
        cards.map(c => `  <!-- ${c.title} -->\n  <div class="col-span-${c.cols} bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">\n    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">${c.title}</h3>\n    <div class="text-3xl font-bold font-mono text-slate-900 mt-2">\n      {${c.signalBinding ? `signals.${c.signalBinding}` : JSON.stringify(c.customValue || 'Active')}}\n    </div>\n  </div>`).join('\n') +
        '\n</div>';
    } else if (exportTab === 'react') {
      return `import React, { useState } from 'react';

export default function SolaCustomCanvas() {
  const [signals] = useState({
    primaryValue: ${signals.primaryValue},
    progressPercentage: ${signals.progressPercentage},
    adjustmentLevel: ${signals.adjustmentLevel}
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-[#fafafa] min-h-screen">
      ${cards.map(c => `{/* ${c.title} */}
      <div className="col-span-${c.cols} bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">${c.title}</h3>
        <p class="text-3xl font-bold font-mono text-slate-900 mt-2">
          {signals.${c.signalBinding || 'primaryValue'}}
        </p>
      </div>`).join('\n      ')}
    </div>
  );
}`;
    } else {
      return '<!-- Web Component Shadow DOM Mount -->\n' +
        '<' + 'script type="module" src="https://cdn.sola-air.dev/sola-ui.js"><' + '/script>\n\n' +
        `<sola-canvas cards='${JSON.stringify(cards.map((c) => ({ id: c.id, title: c.title, cols: c.cols })))}'></sola-canvas>`;
    }
  });

  function copyToClipboard() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedCode);
      copyNotification = true;
      setTimeout(() => (copyNotification = false), 2000);
    }
  }
</script>

<svelte:head>
  <title>Sola Design Studio — Universal UI Canvas Builder</title>
</svelte:head>

<!-- Outer Container: Pure Light Ivory Theme -->
<div class="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
  <Navbar />

  <!-- 1. Top Global Workspace Navigation Bar -->
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
      
      <!-- Left: Studio Canvas Identity & Clean Action Controls -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black tracking-tight text-slate-950 text-sm">Studio Canvas</span>
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-full">Universal UI</span>
            </div>
          </div>
        </div>

        <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <!-- Sample Canvases Dropdown (Universal Variety) -->
        <div class="relative">
          <button 
            onclick={() => sampleDropdownOpen = !sampleDropdownOpen}
            class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all">
            <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
            <span>Sample Canvases ▾</span>
          </button>

          {#if sampleDropdownOpen}
            <div class="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1">
              <div class="px-2 py-1 text-[10px] font-mono font-bold uppercase text-slate-400">Choose a Starting Layout</div>
              {#each Object.entries(samplePresets) as [key, sample]}
                <button 
                  onclick={() => loadSample(key)}
                  class="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-50 flex flex-col transition-all cursor-pointer">
                  <span class="text-xs font-bold text-slate-900">{sample.label}</span>
                  <span class="text-[10px] text-slate-400">{sample.category} template</span>
                </button>
              {/each}
              <div class="border-t border-slate-100 my-1"></div>
              <button 
                onclick={() => { clearCanvas(); sampleDropdownOpen = false; }}
                class="w-full px-3 py-1.5 rounded-xl text-left hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all cursor-pointer">
                Clear to Blank Canvas
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Center: Open-Ended Sola Arc Prompt Bar (For ANY domain/UI) -->
      <div class="flex-1 max-w-lg min-w-[280px]">
        <form
          onsubmit={(e) => {
            e.preventDefault();
            runArcPrompt();
          }}
          class="relative flex items-center">
          <div class="absolute left-3 text-emerald-600">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2a10 10 0 0 1 10 10M12 12m-3 0a3 3 0 1 0 6 0" />
            </svg>
          </div>
          <input
            type="text"
            bind:value={arcPromptInput}
            placeholder="Describe any UI (e.g. 'Customer summary with progress ring', 'Habit tracker', 'Pricing table')..."
            class="w-full pl-9 pr-28 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-sans" />
          <button
            type="submit"
            disabled={isGeneratingArc || !arcPromptInput.trim()}
            class="absolute right-1 px-3 py-1 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
            {#if isGeneratingArc}
              <div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Generating...</span>
            {:else}
              <span>Build with Arc</span>
            {/if}
          </button>
        </form>
      </div>

      <!-- Right: Actions & Export -->
      <div class="flex items-center gap-2">
        <button
          onclick={() => (signals.simulating = !signals.simulating)}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-xs transition-all cursor-pointer">
          <span class="w-2 h-2 rounded-full {signals.simulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}"></span>
          <span>{signals.simulating ? 'Live Signals On' : 'Paused'}</span>
        </button>

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
      <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] pl-1">Insert Component:</span>
        
        <button
          onclick={() => addComponent('metric')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span>+ Metric Tile</span>
        </button>

        <button
          onclick={() => addComponent('gauge')}
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
          onclick={() => addComponent('dial')}
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
          <span>+ Feed List</span>
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

  <!-- 3. Main Live Canvas & Inspector Layout -->
  <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">
    
    <!-- Canvas Grid Area -->
    <main class="flex-1 w-full">
      {#if cards.length === 0}
        <div class="min-h-[380px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center bg-white/70">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1">Canvas is empty</h3>
          <p class="text-xs text-slate-500 max-w-sm mb-5">Click any component from the top ribbon or describe what you want to create above.</p>
          <button
            onclick={() => loadSample('general')}
            class="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
            Load Default Template
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          {#each cards as card (card.id)}
            <div
              onclick={() => (activeCardId = card.id)}
              class="group relative bg-white rounded-3xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md {card.cols === 3 ? 'md:col-span-3' : card.cols === 2 ? 'md:col-span-2' : 'md:col-span-1'} {activeCardId === card.id ? 'ring-2 ring-emerald-500 border-transparent shadow-emerald-100/50' : 'border-slate-200/90 hover:border-slate-300'}">
              
              <!-- Floating Hover Controls (Figma Style) -->
              <div class="absolute -top-3.5 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded-xl p-1 text-[11px] font-medium text-slate-600">
                <!-- Width Selector -->
                <div class="flex items-center bg-slate-100 rounded-lg p-0.5 mr-1">
                  <button
                    onclick={(e) => updateCols(card.id, 1, e)}
                    class="px-1.5 py-0.5 rounded cursor-pointer {card.cols === 1 ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}"
                    title="1 Column">
                    1c
                  </button>
                  <button
                    onclick={(e) => updateCols(card.id, 2, e)}
                    class="px-1.5 py-0.5 rounded cursor-pointer {card.cols === 2 ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}"
                    title="2 Columns">
                    2c
                  </button>
                  <button
                    onclick={(e) => updateCols(card.id, 3, e)}
                    class="px-1.5 py-0.5 rounded cursor-pointer {card.cols === 3 ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}"
                    title="Full Row">
                    3c
                  </button>
                </div>

                <!-- Duplicate -->
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

              <!-- Card Header -->
              <div class="px-5 pt-5 pb-3 flex items-start justify-between border-b border-slate-100">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    {card.title}
                    {#if card.signalBinding}
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {/if}
                  </h4>
                  {#if card.subtitle}
                    <p class="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>
                  {/if}
                </div>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {card.type}
                </span>
              </div>

              <!-- Card Dynamic Body -->
              <div class="p-5">
                <!-- TYPE: METRIC -->
                {#if card.type === 'metric'}
                  <div class="flex items-baseline justify-between">
                    <div class="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                      {#if card.signalBinding === 'primaryValue'}
                        ${signals.primaryValue.toLocaleString()}
                      {:else}
                        {card.customValue ?? '$42,850'}
                      {/if}
                    </div>
                    <div class="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-mono">
                      <span>+12.4%</span>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Synchronized signal</span>
                    <span class="font-medium text-slate-600">Zero-VDOM</span>
                  </div>

                <!-- TYPE: PROGRESS GAUGE -->
                {:else if card.type === 'gauge'}
                  {@const val = card.signalBinding ? signals[card.signalBinding] : Number(card.customValue || 75)}
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
                        <span class="text-slate-500">Target Range</span>
                        <span class="font-semibold text-slate-800">&gt; 70%</span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-emerald-600 h-full rounded-full transition-all duration-500" style="width: {val}%"></div>
                      </div>
                      <p class="text-[11px] text-slate-400">Dynamic completion tracker</p>
                    </div>
                  </div>

                <!-- TYPE: WATERFALL / STEP BREAKDOWN -->
                {:else if card.type === 'waterfall'}
                  <div class="space-y-3 py-1">
                    <div class="flex items-end gap-3 h-28 pt-2">
                      {#each card.config?.bars || [
                        { name: 'Initial', value: 100, delta: '+100', type: 'pos' },
                        { name: 'Additions', value: 45, delta: '+45', type: 'pos' },
                        { name: 'Deductions', value: -25, delta: '-25', type: 'neg' },
                        { name: 'Final Total', value: 120, delta: '120', type: 'total' }
                      ] as bar}
                        <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span class="text-[10px] font-bold font-mono {bar.type === 'neg' ? 'text-rose-600' : bar.type === 'total' ? 'text-emerald-700 font-extrabold' : 'text-emerald-600'}">
                            {bar.delta}
                          </span>
                          <div
                            class="w-full rounded-t-lg transition-all duration-500 {bar.type === 'neg' ? 'bg-rose-400' : bar.type === 'total' ? 'bg-emerald-600' : 'bg-slate-200 hover:bg-slate-300'}"
                            style="height: {Math.min(100, Math.max(15, Math.abs(bar.value)))}%"></div>
                          <span class="text-[10px] font-medium text-slate-500 truncate w-full text-center">{bar.name}</span>
                        </div>
                      {/each}
                    </div>
                  </div>

                <!-- TYPE: ROTARY DIAL / SLIDER -->
                {:else if card.type === 'dial'}
                  <div class="py-2 flex flex-col items-center text-center">
                    <div class="text-2xl font-black font-mono text-slate-900 mb-1">
                      {card.signalBinding ? signals[card.signalBinding] : (card.customValue ?? 65)}%
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={signals.adjustmentLevel}
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
                        <div class="text-xs font-bold text-emerald-950">All Systems Nominal</div>
                        <div class="text-[11px] text-emerald-700">0 blocking alerts detected</div>
                      </div>
                    </div>
                  </div>

                <!-- TYPE: INPUT FORM -->
                {:else if card.type === 'form'}
                  <div class="space-y-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-600 mb-1">Configuration Parameter</label>
                      <input
                        type="text"
                        value="default-namespace-value"
                        class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        readonly />
                    </div>
                    <div class="flex items-center justify-between pt-1">
                      <span class="text-xs font-medium text-slate-600">Enable Reactive Sync</span>
                      <input type="checkbox" checked class="accent-emerald-600 rounded w-4 h-4 cursor-pointer" />
                    </div>
                  </div>

                <!-- TYPE: FEED LIST -->
                {:else if card.type === 'feed'}
                  <div class="space-y-3 text-xs">
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</div>
                      <div>
                        <p class="text-slate-800 font-medium text-[11px]">Primary dataset updated</p>
                        <span class="text-[10px] text-slate-400">Just now</span>
                      </div>
                    </div>
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</div>
                      <div>
                        <p class="text-slate-800 font-medium text-[11px]">Signal telemetry synchronized</p>
                        <span class="text-[10px] text-slate-400">4 min ago</span>
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
      <aside class="w-80 shrink-0 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 sticky top-24">
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
            <label class="block font-semibold text-slate-700 mb-1">Subtitle / Description</label>
            <input
              type="text"
              bind:value={activeCard.subtitle}
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-sans" />
          </div>

          <!-- Column Width -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Grid Column Span</label>
            <div class="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onclick={() => (activeCard.cols = 1)}
                class="py-1 rounded-lg font-medium cursor-pointer {activeCard.cols === 1 ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500'}">
                1 Col
              </button>
              <button
                onclick={() => (activeCard.cols = 2)}
                class="py-1 rounded-lg font-medium cursor-pointer {activeCard.cols === 2 ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500'}">
                2 Col
              </button>
              <button
                onclick={() => (activeCard.cols = 3)}
                class="py-1 rounded-lg font-medium cursor-pointer {activeCard.cols === 3 ? 'bg-white shadow-xs text-slate-950 font-bold' : 'text-slate-500'}">
                3 Col
              </button>
            </div>
          </div>

          <!-- Reactive Signal Binding -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Reactive Signal Relay</label>
            <select
              bind:value={activeCard.signalBinding}
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none font-sans cursor-pointer">
              <option value={undefined}>No Signal (Static Mock)</option>
              <option value="primaryValue">Primary Metric ($signal('value'))</option>
              <option value="progressPercentage">Progress Ring ($signal('progress'))</option>
              <option value="adjustmentLevel">Slider Level ($signal('level'))</option>
            </select>
          </div>

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

  <!-- 5. Bottom Universal Signal Simulation Playground Ribbon -->
  <footer class="bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sticky bottom-0 z-20 shadow-xs">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Reactive Data Simulator:</span>
        <span class="text-xs text-slate-400 hidden sm:inline">Drag sliders to test real-time reactivity</span>
      </div>

      <!-- Universal Signal Sliders -->
      <div class="flex items-center gap-6 flex-1 max-w-2xl">
        <!-- Variable 1 -->
        <div class="flex-1 flex items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">Value</span>
          <input
            type="range"
            min="10000"
            max="100000"
            bind:value={signals.primaryValue}
            class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          <span class="text-[11px] font-mono font-bold text-slate-900 w-14 text-right">${(signals.primaryValue / 1000).toFixed(0)}k</span>
        </div>

        <!-- Variable 2 -->
        <div class="flex-1 flex items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">Progress</span>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={signals.progressPercentage}
            class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          <span class="text-[11px] font-mono font-bold text-slate-900 w-10 text-right">{signals.progressPercentage}%</span>
        </div>

        <!-- Variable 3 -->
        <div class="flex-1 flex items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">Level</span>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={signals.adjustmentLevel}
            class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          <span class="text-[11px] font-mono font-bold text-slate-900 w-10 text-right">{signals.adjustmentLevel}%</span>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 font-mono font-medium hidden md:inline">
        Universal Zero-VDOM Reactive Engine
      </div>
    </div>
  </footer>

  <!-- 6. Code Export Modal -->
  {#if exportModalOpen}
    <div class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Export Canvas Code</h3>
            <p class="text-xs text-slate-500 mt-0.5">Clean, zero-runtime UI component ready to use.</p>
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
              onclick={copyToClipboard}
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
</div>
