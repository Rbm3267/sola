<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';

  // --- 1. Signal & Reactive State Engine ---
  let signals = $state({
    mrr: 128450,
    cpuUsage: 42,
    p99Latency: 84,
    errorRate: 0.12,
    activeIncidents: 2,
    simulating: true
  });

  // Dynamic live signal simulator effect
  $effect(() => {
    if (!signals.simulating) return;
    const interval = setInterval(() => {
      signals.mrr = Math.round(128000 + Math.sin(Date.now() / 2000) * 3500);
      signals.cpuUsage = Math.min(99, Math.max(12, Math.round(45 + Math.sin(Date.now() / 1500) * 28)));
      signals.p99Latency = Math.max(24, Math.round(80 + Math.cos(Date.now() / 1800) * 35));
      signals.errorRate = Number((0.1 + Math.abs(Math.sin(Date.now() / 3000)) * 0.45).toFixed(2));
    }, 1200);

    return () => clearInterval(interval);
  });

  // --- 2. Canvas Cards Data Model ---
  interface StudioCard {
    id: string;
    type: 'metric' | 'gauge' | 'waterfall' | 'dial' | 'triage' | 'form' | 'activity';
    title: string;
    subtitle?: string;
    cols: 1 | 2 | 3;
    signalBinding?: keyof typeof signals;
    customValue?: string | number;
    accentColor: string;
    config?: Record<string, any>;
  }

  let selectedTemplate = $state('finops');
  let arcPromptInput = $state('');
  let isGeneratingArc = $state(false);
  let activeCardId = $state<string | null>(null);
  let exportModalOpen = $state(false);
  let exportTab = $state<'svelte' | 'react' | 'webcomponent'>('svelte');
  let copyNotification = $state(false);

  // Pre-built templates
  const templates: Record<string, { name: string; description: string; cards: StudioCard[] }> = {
    finops: {
      name: 'FinOps & Cloud Economy',
      description: 'Real-time billing, waterfall revenue analytics, and compute budget burn rates.',
      cards: [
        {
          id: 'c1',
          type: 'metric',
          title: 'Monthly Recurring Revenue',
          subtitle: 'Live Stripe & billing gateway signal',
          cols: 1,
          signalBinding: 'mrr',
          accentColor: 'indigo'
        },
        {
          id: 'c2',
          type: 'gauge',
          title: 'Cluster CPU Saturation',
          subtitle: 'Production node workers pool',
          cols: 1,
          signalBinding: 'cpuUsage',
          accentColor: 'blue'
        },
        {
          id: 'c3',
          type: 'dial',
          title: 'Auto-Scaler Governor',
          subtitle: 'Throttle limit: 0 to 100%',
          cols: 1,
          customValue: 68,
          accentColor: 'emerald'
        },
        {
          id: 'c4',
          type: 'waterfall',
          title: 'Quarterly Revenue & COGS Waterfall',
          subtitle: 'Gross Margin: 78.4% ($98.2k net)',
          cols: 2,
          accentColor: 'violet',
          config: {
            bars: [
              { name: 'Base MRR', value: 120, delta: '+12%', type: 'pos' },
              { name: 'Expansions', value: 34, delta: '+8%', type: 'pos' },
              { name: 'Infra Cost', value: -22, delta: '-4%', type: 'neg' },
              { name: 'Net EOY', value: 132, delta: '+16%', type: 'total' }
            ]
          }
        },
        {
          id: 'c5',
          type: 'activity',
          title: 'Live Telemetry Relay Feed',
          subtitle: 'Zero-egress signal stream sync',
          cols: 1,
          accentColor: 'slate'
        }
      ]
    },
    incident: {
      name: 'P1 Incident Command',
      description: 'Real-time triage, p99 latency watchdog, and on-call escalation loop.',
      cards: [
        {
          id: 'i1',
          type: 'triage',
          title: 'Active Incident Response Hub',
          subtitle: '2 active Sev-1 / Sev-2 alerts',
          cols: 2,
          accentColor: 'rose'
        },
        {
          id: 'i2',
          type: 'gauge',
          title: 'Edge Gateway P99 Latency',
          subtitle: 'Threshold: 120ms',
          cols: 1,
          signalBinding: 'p99Latency',
          accentColor: 'amber'
        },
        {
          id: 'i3',
          type: 'metric',
          title: 'Error Ingestion Rate',
          subtitle: '5xx status / total requests',
          cols: 1,
          signalBinding: 'errorRate',
          accentColor: 'rose'
        },
        {
          id: 'i4',
          type: 'form',
          title: '1-Click Incident Dispatch',
          subtitle: 'Trigger DNS failover, Slack, & Statuspage',
          cols: 2,
          accentColor: 'slate'
        }
      ]
    },
    blank: {
      name: 'Blank Canvas',
      description: 'Start from scratch or prompt Arc to compose your canvas.',
      cards: []
    }
  };

  let cards = $state<StudioCard[]>([...templates.finops.cards]);
  const activeCard = $derived(cards.find((c) => c.id === activeCardId) || null);

  function switchTemplate(tplKey: string) {
    selectedTemplate = tplKey;
    cards = JSON.parse(JSON.stringify(templates[tplKey].cards));
    activeCardId = null;
  }

  // 1-Click Component Shelf Dispatchers
  function addComponent(type: StudioCard['type']) {
    const newId = 'card_' + Math.random().toString(36).substring(2, 9);
    const defaultMap: Record<StudioCard['type'], Partial<StudioCard>> = {
      metric: {
        title: 'Active Node Count',
        subtitle: 'Autoscaling cluster',
        cols: 1,
        signalBinding: 'cpuUsage',
        accentColor: 'indigo'
      },
      gauge: {
        title: 'Memory Utilization',
        subtitle: 'Target < 85%',
        cols: 1,
        signalBinding: 'cpuUsage',
        accentColor: 'blue'
      },
      waterfall: {
        title: 'Cost Distribution Breakdown',
        subtitle: 'Compute vs Storage vs Network',
        cols: 2,
        accentColor: 'violet',
        config: {
          bars: [
            { name: 'Compute', value: 85, delta: '60%', type: 'pos' },
            { name: 'Storage', value: 35, delta: '25%', type: 'pos' },
            { name: 'Egress', value: -18, delta: '15%', type: 'neg' },
            { name: 'Net', value: 102, delta: 'Total', type: 'total' }
          ]
        }
      },
      dial: {
        title: 'Throughput Governor',
        subtitle: 'Rate limit RPS throttle',
        cols: 1,
        customValue: 50,
        accentColor: 'emerald'
      },
      triage: {
        title: 'Incident Queue',
        subtitle: 'Live triage matrix',
        cols: 2,
        accentColor: 'rose'
      },
      form: {
        title: 'Dynamic Configuration Form',
        subtitle: 'Runtime environment variables',
        cols: 2,
        accentColor: 'slate'
      },
      activity: {
        title: 'Audit & Telemetry Stream',
        subtitle: 'Zero-latency event log',
        cols: 1,
        accentColor: 'slate'
      }
    };

    const templateData = defaultMap[type];
    const card: StudioCard = {
      id: newId,
      type,
      title: templateData.title || 'New Component',
      subtitle: templateData.subtitle,
      cols: templateData.cols || 1,
      signalBinding: templateData.signalBinding,
      customValue: templateData.customValue,
      accentColor: templateData.accentColor || 'indigo',
      config: templateData.config
    };

    cards = [...cards, card];
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

  // Arc AI Natural Language Synthesis
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
            ListBlock: 'activity',
            IncidentTriageMatrix: 'triage',
            ClusterMatrix: 'metric'
          };
          const cardType = typeMap[item.component] || 'metric';
          return {
            id: 'arc_' + idx + '_' + Math.random().toString(36).substring(2, 7),
            type: cardType,
            title: item.config?.title || 'Synthesized Component',
            subtitle: item.config?.subtitle || 'Generated by Sola Arc',
            cols: (item.colSpan || 1) as 1 | 2 | 3,
            signalBinding: cardType === 'gauge' ? 'cpuUsage' : cardType === 'metric' ? 'mrr' : undefined,
            customValue: item.config?.value || 'Active',
            accentColor: 'indigo',
            config: item.config
          };
        });
        cards = synthesized;
        activeCardId = synthesized[0].id;
      }
    } catch {
      // Fallback composition
      const p = query.toLowerCase();
      if (p.includes('waterfall') || p.includes('revenue')) addComponent('waterfall');
      else if (p.includes('cpu') || p.includes('gauge') || p.includes('latency')) addComponent('gauge');
      else if (p.includes('incident') || p.includes('triage')) addComponent('triage');
      else if (p.includes('dial') || p.includes('knob')) addComponent('dial');
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
        '  // Exported Sola Canvas (Svelte 5 Runes)\n' +
        '  let signals = $state({\n' +
        `    mrr: ${signals.mrr},\n` +
        `    cpuUsage: ${signals.cpuUsage},\n` +
        `    p99Latency: ${signals.p99Latency},\n` +
        `    errorRate: ${signals.errorRate}\n` +
        '  });\n' +
        '<' + '/script>\n\n' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-[#fafafa] min-h-screen">\n' +
        cards.map(c => `  <!-- ${c.title} -->\n  <div class="col-span-${c.cols} bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">\n    <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">${c.title}</h3>\n    <div class="text-3xl font-bold tracking-tight text-slate-900 mt-2">\n      {${c.signalBinding ? `signals.${c.signalBinding}` : JSON.stringify(c.customValue || 'N/A')}}\n    </div>\n  </div>`).join('\n') +
        '\n</div>';
    } else if (exportTab === 'react') {
      return `import React, { useState } from 'react';

export default function SolaExportedDashboard() {
  const [signals] = useState({
    mrr: ${signals.mrr},
    cpuUsage: ${signals.cpuUsage},
    p99Latency: ${signals.p99Latency}
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-[#fafafa] min-h-screen">
      ${cards.map(c => `{/* ${c.title} */}
      <div className="col-span-${c.cols} bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">${c.title}</h3>
        <p class="text-3xl font-bold tracking-tight text-slate-900 mt-2">
          {signals.${c.signalBinding || 'mrr'}}
        </p>
      </div>`).join('\n      ')}
    </div>
  );
}`;
    } else {
      return '<!-- Web Component Shadow DOM Mount -->\n' +
        '<' + 'script type="module" src="https://cdn.sola-air.dev/sola-ui.js"><' + '/script>\n\n' +
        `<sola-dashboard mrr="${signals.mrr}" cpu="${signals.cpuUsage}" cards='${JSON.stringify(cards.map((c) => ({ id: c.id, title: c.title, cols: c.cols })))}'></sola-dashboard>`;
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
  <title>Sola Design Studio — Interactive Canvas Builder</title>
</svelte:head>

<!-- Outer Container: Pure Light Ivory Theme -->
<div class="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
  <Navbar />

  <!-- 1. Top Global Workspace Navigation Bar -->
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
      
      <!-- Left: Brand + Template Switcher -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-black tracking-tight text-slate-950 text-sm">Studio Canvas</span>
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">Interactive</span>
            </div>
          </div>
        </div>

        <div class="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <!-- Template Switcher Pills -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600">
          <button
            onclick={() => switchTemplate('finops')}
            class="px-3 py-1 rounded-lg transition-all cursor-pointer {selectedTemplate === 'finops' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-900'}">
            FinOps
          </button>
          <button
            onclick={() => switchTemplate('incident')}
            class="px-3 py-1 rounded-lg transition-all cursor-pointer {selectedTemplate === 'incident' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-900'}">
            Incident Response
          </button>
          <button
            onclick={() => switchTemplate('blank')}
            class="px-3 py-1 rounded-lg transition-all cursor-pointer {selectedTemplate === 'blank' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-900'}">
            Blank
          </button>
        </div>
      </div>

      <!-- Center: Arc Natural Language Co-Pilot Bar -->
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
            placeholder="Describe what to build (e.g. 'Add a revenue waterfall and node CPU gauge')..."
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
          class="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Export Code</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 2. Horizontal Component Shelf / Tool Ribbon (Figma Style) -->
  <div class="bg-white border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-2.5">
    <div class="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-3 py-0.5 no-scrollbar">
      <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] pl-1">Insert:</span>
        
        <button
          onclick={() => addComponent('metric')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span>+ Metric Card</span>
        </button>

        <button
          onclick={() => addComponent('gauge')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>+ Progress Gauge</span>
        </button>

        <button
          onclick={() => addComponent('waterfall')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          <span>+ Revenue Waterfall</span>
        </button>

        <button
          onclick={() => addComponent('dial')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/></svg>
          <span>+ Rotary Dial</span>
        </button>

        <button
          onclick={() => addComponent('triage')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-950 hover:border-emerald-300 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>+ Incident Triage</span>
        </button>

        <button
          onclick={() => addComponent('form')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>+ Input Form</span>
        </button>

        <button
          onclick={() => addComponent('activity')}
          class="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs">
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>+ Activity Feed</span>
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
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1">Canvas is empty</h3>
          <p class="text-xs text-slate-500 max-w-sm mb-5">Click a component from the top ribbon or ask Sola Arc above.</p>
          <button
            onclick={() => switchTemplate('finops')}
            class="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer">
            Load FinOps Starter
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
                      {#if card.signalBinding === 'mrr'}
                        ${signals.mrr.toLocaleString()}
                      {:else if card.signalBinding === 'errorRate'}
                        {signals.errorRate}%
                      {:else if card.signalBinding === 'cpuUsage'}
                        {signals.cpuUsage}%
                      {:else}
                        {card.customValue ?? '$128,450'}
                      {/if}
                    </div>
                    <div class="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-mono">
                      <span>+14.2%</span>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Live signal stream</span>
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
                        <span class="text-xl font-bold font-mono text-slate-900">{val}{card.signalBinding === 'p99Latency' ? 'ms' : '%'}</span>
                      </div>
                    </div>
                    <div class="flex-1 space-y-2">
                      <div class="flex justify-between text-xs">
                        <span class="text-slate-500">Nominal Baseline</span>
                        <span class="font-semibold text-slate-800">&lt; 80%</span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-emerald-600 h-full rounded-full transition-all duration-500" style="width: {val}%"></div>
                      </div>
                      <p class="text-[11px] text-slate-400">Reactive telemetry indicator</p>
                    </div>
                  </div>

                <!-- TYPE: REVENUE WATERFALL -->
                {:else if card.type === 'waterfall'}
                  <div class="space-y-3 py-1">
                    <div class="flex items-end gap-3 h-28 pt-2">
                      {#each card.config?.bars || [
                        { name: 'MRR', value: 120, delta: '+12%', type: 'pos' },
                        { name: 'Expansion', value: 40, delta: '+8%', type: 'pos' },
                        { name: 'COGS', value: -25, delta: '-4%', type: 'neg' },
                        { name: 'Net EOY', value: 135, delta: '+16%', type: 'total' }
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
                    <div class="text-2xl font-black font-mono text-slate-900 mb-1">{card.customValue ?? 68}%</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      bind:value={card.customValue}
                      class="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg" />
                    <div class="w-full flex justify-between text-[10px] font-semibold text-slate-400 mt-2">
                      <span>0% (Standby)</span>
                      <span>50% (Nominal)</span>
                      <span>100% (Turbo)</span>
                    </div>
                  </div>

                <!-- TYPE: INCIDENT TRIAGE -->
                {:else if card.type === 'triage'}
                  <div class="divide-y divide-slate-100 -mx-5 -mb-5">
                    <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-all">
                      <div class="flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <div>
                          <div class="text-xs font-semibold text-slate-900">INC-8492: Edge SSL Handshake Surge</div>
                          <div class="text-[10px] text-slate-400">Origin: Cloud Gateway EU-West &bull; 4m ago</div>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">Sev-1</span>
                    </div>
                    <div class="px-5 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-all">
                      <div class="flex items-center gap-3">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                        <div>
                          <div class="text-xs font-semibold text-slate-900">INC-8490: DB Read Replica IOPS Spike</div>
                          <div class="text-[10px] text-slate-400">Origin: Postgres Pool &bull; 18m ago</div>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">Sev-2</span>
                    </div>
                  </div>

                <!-- TYPE: INPUT FORM -->
                {:else if card.type === 'form'}
                  <div class="space-y-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-600 mb-1">Target Cluster Namespace</label>
                      <input
                        type="text"
                        value="production-east-gateway"
                        class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        readonly />
                    </div>
                    <div class="flex items-center justify-between pt-1">
                      <span class="text-xs font-medium text-slate-600">Auto-Remediation Relay</span>
                      <input type="checkbox" checked class="accent-emerald-600 rounded w-4 h-4 cursor-pointer" />
                    </div>
                  </div>

                <!-- TYPE: ACTIVITY FEED -->
                {:else if card.type === 'activity'}
                  <div class="space-y-3 text-xs">
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">SN</div>
                      <div>
                        <p class="text-slate-800 font-medium text-[11px]">ServiceNow Ticket #4102 Synced</p>
                        <span class="text-[10px] text-slate-400">2 min ago</span>
                      </div>
                    </div>
                    <div class="flex items-start gap-2.5">
                      <div class="w-5 h-5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0">DD</div>
                      <div>
                        <p class="text-slate-800 font-medium text-[11px]">Datadog Latency Metric Bound</p>
                        <span class="text-[10px] text-slate-400">8 min ago</span>
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
            <label class="block font-semibold text-slate-700 mb-1">Subtitle / Context</label>
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
              <option value="mrr">MRR ($finance/mrr)</option>
              <option value="cpuUsage">Node CPU ($cluster/cpu)</option>
              <option value="p99Latency">P99 Latency ($telemetry/latency)</option>
              <option value="errorRate">5xx Error Rate ($ingress/errors)</option>
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

  <!-- 5. Bottom Live Signal Simulation Playground Ribbon -->
  <footer class="bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sticky bottom-0 z-20 shadow-xs">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Live Signal Playground:</span>
        <span class="text-xs text-slate-400 hidden sm:inline">Drag sliders to test canvas reactivity</span>
      </div>

      <!-- Signal Sliders -->
      <div class="flex items-center gap-6 flex-1 max-w-2xl">
        <!-- MRR Simulator -->
        <div class="flex-1 flex items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">MRR</span>
          <input
            type="range"
            min="50000"
            max="250000"
            bind:value={signals.mrr}
            class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          <span class="text-[11px] font-mono font-bold text-slate-900 w-14 text-right">${(signals.mrr / 1000).toFixed(0)}k</span>
        </div>

        <!-- CPU Simulator -->
        <div class="flex-1 flex items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">CPU</span>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={signals.cpuUsage}
            class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          <span class="text-[11px] font-mono font-bold text-slate-900 w-10 text-right">{signals.cpuUsage}%</span>
        </div>

        <!-- Latency Simulator -->
        <div class="flex-1 flex items-center gap-2">
          <span class="text-[11px] font-semibold text-slate-600 shrink-0 font-mono">P99</span>
          <input
            type="range"
            min="10"
            max="300"
            bind:value={signals.p99Latency}
            class="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer" />
          <span class="text-[11px] font-mono font-bold text-slate-900 w-12 text-right">{signals.p99Latency}ms</span>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 font-mono font-medium hidden md:inline">
        Sub-millisecond reactivity &bull; Zero-VDOM
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
            <p class="text-xs text-slate-500 mt-0.5">Clean, zero-runtime, fully typed UI component.</p>
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
            onclick={() => (exportTab = 'svelte')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'svelte' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}">
            Svelte 5 (Runes)
          </button>
          <button
            onclick={() => (exportTab = 'react')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'react' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}">
            React 19 (JSX)
          </button>
          <button
            onclick={() => (exportTab = 'webcomponent')}
            class="px-4 py-2 border-b-2 font-semibold text-xs transition-all cursor-pointer {exportTab === 'webcomponent' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}">
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
              Ready to paste into your codebase
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
