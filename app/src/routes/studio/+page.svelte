<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  import IncidentTriageMatrix from '$lib/components/IncidentTriageMatrix.svelte';
  import ClusterMatrix from '$lib/components/ClusterMatrix.svelte';
  import DiffAudit from '$lib/components/DiffAudit.svelte';

  // Active Theme: Clean Ivory Light default
  let studioTheme = $state<'ivory' | 'obsidian'>('ivory');

  // Active Canvas Components Model
  interface CanvasItem {
    id: string;
    type: 'DataCard' | 'GaugeCard' | 'FlowWaterfall' | 'TactileDialCard' | 'DynamicForm' | 'ListBlock' | 'IncidentTriageMatrix' | 'ClusterMatrix';
    colSpan: 1 | 2 | 3;
    config: any;
  }

  // Live Signal Telemetry Mesh (Reactively updates all canvas items)
  let liveNodes = $state(16);
  let liveCpu = $state(68);
  let liveMrr = $state(184000);
  let liveLatency = $state(4.2);

  // Default Canvas Items (FinOps & Telemetry Starter)
  let canvasItems = $state<CanvasItem[]>([
    {
      id: 'c-1',
      type: 'DataCard',
      colSpan: 1,
      config: { title: 'Realized MRR', value: '$184,000', trend: '+18.4%', icon: 'trending-up' }
    },
    {
      id: 'c-2',
      type: 'GaugeCard',
      colSpan: 1,
      config: { title: 'Cluster CPU Saturation', value: '68%', percentage: 68, subtext: 'Auto-balanced across 16 nodes', color: 'emerald' }
    },
    {
      id: 'c-3',
      type: 'TactileDialCard',
      colSpan: 1,
      config: { title: 'API Rate Limit Throttle', value: 24, min: 4, max: 64, unit: 'k req/s' }
    },
    {
      id: 'c-4',
      type: 'FlowWaterfall',
      colSpan: 2,
      config: {
        title: 'Monthly Subscription ARR Realization',
        subtitle: 'Real-time deduction pipeline to bank settlement',
        grossVolume: 184000,
        computeExpense: 32000,
        supportExpense: 14000,
        tierDiscount: 6000
      }
    },
    {
      id: 'c-5',
      type: 'IncidentTriageMatrix',
      colSpan: 1,
      config: {
        incidentId: 'INC009481',
        title: 'API Gateway Ingress Spike (EU-West)',
        severity: 'P1 - Critical Outage',
        slaRemainingMin: 9,
        blastRadius: '42,000 Active Sessions',
        playbooks: [
          { id: 'pb-1', title: 'Route53 Edge DNS Failover', action: 'Route53 Failover', automated: true },
          { id: 'pb-2', title: 'Scale Container Workers (x4)', action: 'Auto-Provision', automated: true }
        ]
      }
    }
  ]);

  // Selected item for Inspector
  let selectedItem = $state<CanvasItem | null>(null);

  // Sola Arc Generative Prompt
  let arcPrompt = $state('');
  let isArcSynthesizing = $state(false);

  // Multi-Target Code Export
  let activeExportFormat = $state<'sola' | 'react' | 'svelte' | 'webcomponent'>('sola');
  let isCopied = $state(false);
  let toastMsg = $state<string | null>(null);

  function showToast(msg: string) {
    toastMsg = msg;
    setTimeout(() => { toastMsg = null; }, 3000);
  }

  // --- Hand-Crafted Add Component Actions ---
  function addComponent(type: CanvasItem['type']) {
    const id = 'c-' + Math.random().toString(36).substring(2, 7);
    let newItem: CanvasItem;

    if (type === 'DataCard') {
      newItem = {
        id,
        type: 'DataCard',
        colSpan: 1,
        config: { title: 'New Metric Card', value: '$42,500', trend: '+8.2%', icon: 'trending-up' }
      };
    } else if (type === 'GaugeCard') {
      newItem = {
        id,
        type: 'GaugeCard',
        colSpan: 1,
        config: { title: 'SLA Availability', value: '99.9%', percentage: 99, subtext: 'Zero-Egress Compliant', color: 'emerald' }
      };
    } else if (type === 'TactileDialCard') {
      newItem = {
        id,
        type: 'TactileDialCard',
        colSpan: 1,
        config: { title: 'Worker Node Throttle', value: 16, min: 2, max: 48, unit: 'nodes' }
      };
    } else if (type === 'FlowWaterfall') {
      newItem = {
        id,
        type: 'FlowWaterfall',
        colSpan: 2,
        config: {
          title: 'Financial Realization Waterfall',
          subtitle: 'Gross to net deduction stream',
          grossVolume: 120000,
          computeExpense: 22000,
          supportExpense: 8000,
          tierDiscount: 4000
        }
      };
    } else if (type === 'DynamicForm') {
      newItem = {
        id,
        type: 'DynamicForm',
        colSpan: 1,
        config: {
          title: 'Auto-Binding Configuration Form',
          endpoint: '/api/config',
          fields: [
            { name: 'clusterName', type: 'text', label: 'Cluster Namespace', required: true },
            { name: 'maxNodes', type: 'number', label: 'Max Worker Nodes', required: true }
          ]
        }
      };
    } else if (type === 'ListBlock') {
      newItem = {
        id,
        type: 'ListBlock',
        colSpan: 1,
        config: {
          title: 'Live Telemetry Ingress Nodes',
          items: [
            { label: 'edge-us-east-1a', description: '4.1ms p99 • 24.2k req/s', status: 'Active' },
            { label: 'edge-eu-west-1b', description: '6.8ms p99 • 18.4k req/s', status: 'Active' },
            { label: 'edge-ap-east-1', description: '3.2ms p99 • Synchronized', status: 'Completed' }
          ]
        }
      };
    } else if (type === 'IncidentTriageMatrix') {
      newItem = {
        id,
        type: 'IncidentTriageMatrix',
        colSpan: 2,
        config: {
          incidentId: 'INC009921',
          title: 'Database Connection Pool Exhaustion',
          severity: 'P1 - Critical Outage',
          slaRemainingMin: 12,
          blastRadius: '38,000 Active Sessions',
          playbooks: [
            { id: 'pb-1', title: 'Scale Read Replicas (x3)', action: 'Auto-Provision', automated: true },
            { id: 'pb-2', title: 'Terminate Idle Locks', action: 'Kill Idle Transactions', automated: true }
          ]
        }
      };
    } else {
      newItem = {
        id,
        type: 'ClusterMatrix',
        colSpan: 2,
        config: {
          title: 'High-Density Kubernetes Pod Mesh',
          subtitle: '12 Active Edge Workers',
          regions: [
            { name: 'us-east-1 (Primary)', status: 'Optimal', lagMs: 0, tps: 18400 },
            { name: 'eu-west-1 (Replica)', status: 'Optimal', lagMs: 4, tps: 12100 }
          ]
        }
      };
    }

    canvasItems = [...canvasItems, newItem];
    selectedItem = newItem;
    showToast(`Added ${type} to canvas!`);
  }

  function removeComponent(id: string) {
    canvasItems = canvasItems.filter(i => i.id !== id);
    if (selectedItem?.id === id) selectedItem = null;
    showToast('Component removed');
  }

  function duplicateComponent(item: CanvasItem) {
    const clone: CanvasItem = {
      ...item,
      id: 'c-' + Math.random().toString(36).substring(2, 7),
      config: JSON.parse(JSON.stringify(item.config))
    };
    canvasItems = [...canvasItems, clone];
    selectedItem = clone;
    showToast(`Duplicated ${item.type}`);
  }

  function cycleColSpan(item: CanvasItem) {
    item.colSpan = item.colSpan === 1 ? 2 : item.colSpan === 2 ? 3 : 1;
  }

  // --- Sola Arc Prompt Compilation ---
  async function handleArcSynthesize() {
    if (!arcPrompt.trim() || isArcSynthesizing) return;
    const query = arcPrompt.trim();
    isArcSynthesizing = true;

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: query })
      });

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const generatedItems: CanvasItem[] = data.map((d: any, idx: number) => ({
          id: 'c-arc-' + idx + '-' + Math.random().toString(36).substring(2, 5),
          type: (d.component || 'DataCard') as CanvasItem['type'],
          colSpan: (d.colSpan || 1) as 1 | 2 | 3,
          config: d.config || { title: 'Generated Component', value: 'Active' }
        }));
        canvasItems = generatedItems;
        showToast(`Sola Arc synthesized ${generatedItems.length} components!`);
      } else {
        showToast('Sola Arc updated canvas layout.');
      }
    } catch (e: any) {
      showToast('Sola Arc compiled with fallback defaults.');
    } finally {
      isArcSynthesizing = false;
    }
  }

  // Preset Starters
  function loadPreset(preset: 'finops' | 'telemetry' | 'incident' | 'blank') {
    if (preset === 'blank') {
      canvasItems = [];
      selectedItem = null;
      showToast('Canvas cleared');
      return;
    }
    if (preset === 'finops') {
      canvasItems = [
        { id: 'c-f1', type: 'DataCard', colSpan: 1, config: { title: 'Realized ARR', value: `$${liveMrr.toLocaleString()}`, trend: '+14.2%', icon: 'trending-up' } },
        { id: 'c-f2', type: 'GaugeCard', colSpan: 1, config: { title: 'Gross Churn Rate', value: '1.8%', percentage: 18, subtext: 'Annual churn baseline < 2%', color: 'emerald' } },
        { id: 'c-f3', type: 'TactileDialCard', colSpan: 1, config: { title: 'Customer Expansion Throttle', value: 24, min: 5, max: 50, unit: '%' } },
        { id: 'c-f4', type: 'FlowWaterfall', colSpan: 3, config: { title: 'Enterprise Revenue Realization', grossVolume: liveMrr, computeExpense: 32000, supportExpense: 14000, tierDiscount: 6000 } }
      ];
    } else if (preset === 'telemetry') {
      canvasItems = [
        { id: 'c-t1', type: 'DataCard', colSpan: 1, config: { title: 'Ingress Latency p99', value: `${liveLatency}ms`, trend: '-0.8ms vs baseline', icon: 'trending-up' } },
        { id: 'c-t2', type: 'GaugeCard', colSpan: 1, config: { title: 'Cluster CPU Saturation', value: `${liveCpu}%`, percentage: liveCpu, subtext: `Optimal across ${liveNodes} nodes`, color: 'emerald' } },
        { id: 'c-t3', type: 'TactileDialCard', colSpan: 1, config: { title: 'Auto-Scale Node Multiplier', value: liveNodes, min: 2, max: 48, unit: 'nodes' } },
        { id: 'c-t4', type: 'ClusterMatrix', colSpan: 3, config: { title: 'Global Multi-Region Ingress Grid', regions: [{ name: 'us-east-1 (Primary)', status: 'Optimal', lagMs: 0, tps: 18400 }, { name: 'eu-west-1 (Replica)', status: 'Optimal', lagMs: 4, tps: 12100 }] } }
      ];
    } else if (preset === 'incident') {
      canvasItems = [
        { id: 'c-i1', type: 'IncidentTriageMatrix', colSpan: 2, config: { incidentId: 'INC009481', title: 'API Gateway Ingress Spike (EU-West)', severity: 'P1 - Critical Outage', slaRemainingMin: 9, blastRadius: '42,000 Active Sessions', playbooks: [{ id: 'pb-1', title: 'Route53 Failover', action: 'Route53 Failover', automated: true }, { id: 'pb-2', title: 'Scale Workers', action: 'Auto-Provision', automated: true }] } },
        { id: 'c-i2', type: 'GaugeCard', colSpan: 1, config: { title: 'SLA Countdown Clock', value: '9m Rem', percentage: 38, subtext: 'MTTR Target: 15 mins', color: 'amber' } }
      ];
    }
    showToast(`Loaded ${preset} starter canvas!`);
  }

  // Real-time Export Code Generation
  let generatedCode = $derived.by(() => {
    if (activeExportFormat === 'sola') {
      return `<!-- Sola Ambient Single-File Component Canvas -->
<sola:component name="CustomCanvas">
  <intent:schema version="1.0" signals={["$mrr", "$nodes", "$cpu"]} />

  <layout:grid cols="3" gap="6">
${canvasItems.map(item => `    <${item.type} colSpan="${item.colSpan}" config={${JSON.stringify(item.config)}} />`).join('\n')}
  </layout:grid>
</sola:component>`;
    } else if (activeExportFormat === 'react') {
      return `// React 19 / Next.js Sola Canvas Adapter
import React from 'react';
import { useSolaSignal } from '@sola/react';
import { DataCard, GaugeCard, FlowWaterfall, TactileDialCard } from '@sola/ui';

export default function SolaCustomCanvas() {
  const mrr = useSolaSignal('finance/mrr', ${liveMrr});
  const nodes = useSolaSignal('cluster/nodes', ${liveNodes});

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#fafafa]">
${canvasItems.map(item => `      <div className="col-span-${item.colSpan}">
        <${item.type} {...${JSON.stringify(item.config)}} />
      </div>`).join('\n')}
    </div>
  );
}`;
    } else if (activeExportFormat === 'svelte') {
      return '<' + 'script lang="ts">\n' +
        '  // Svelte 5 Native Rune Canvas\n' +
        "  import { DataCard, GaugeCard, FlowWaterfall, TactileDialCard } from '@sola/ui';\n\n" +
        `  let mrr = $state(${liveMrr});\n` +
        `  let nodes = $state(${liveNodes});\n` +
        '<' + '/script>\n\n' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#fafafa]">\n' +
        canvasItems.map(item => `  <div class="col-span-${item.colSpan}">\n    <${item.type} config={${JSON.stringify(item.config)}} />\n  </div>`).join('\n') +
        '\n</div>';
    } else {
      return '<!-- Web Component Shadow DOM Mount -->\n' +
        '<' + 'script type="module" src="https://cdn.sola-air.dev/sola-ui.js"><' + '/script>\n\n' +
        '<sola-canvas-host>\n' +
        '  <template shadowrootmode="open">\n' +
        '    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 24px; background: #fafafa;">\n' +
        canvasItems.map(item => `      <sola-${item.type.toLowerCase()} style="grid-column: span ${item.colSpan};" data-config='${JSON.stringify(item.config)}'></sola-${item.type.toLowerCase()}>`).join('\n') +
        '\n    </div>\n' +
        '  </template>\n' +
        '</sola-canvas-host>';
    }
  });

  function copyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedCode);
      isCopied = true;
      showToast('Copied code to clipboard!');
      setTimeout(() => { isCopied = false; }, 2000);
    }
  }
</script>

<svelte:head>
  <title>Sola Design Studio — Interactive Canvas & Component Builder</title>
</svelte:head>

<!-- Toast -->
{#if toastMsg}
  <div class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-emerald-500/50 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-all">
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
    <span class="text-xs font-mono font-bold tracking-tight">{toastMsg}</span>
  </div>
{/if}

<div class="min-h-screen {studioTheme === 'ivory' ? 'bg-[#fafafa] text-slate-950' : 'bg-[#090d19] text-white'} font-sans selection:bg-amber-500/20 selection:text-amber-900 transition-colors duration-300">
  <Navbar />

  <!-- Top Studio Command Header & Sola Arc Prompt Bar -->
  <header class="border-b {studioTheme === 'ivory' ? 'border-slate-200/90 bg-white/90' : 'border-slate-800/90 bg-slate-900/90'} backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto flex flex-col gap-4">
      
      <!-- Top Row: Branding, Starters, and Theme Switcher -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-black tracking-tight {studioTheme === 'ivory' ? 'text-slate-950' : 'text-white'}">Sola Design Studio</h1>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">Interactive Canvas</span>
            </div>
            <p class="text-[11px] {studioTheme === 'ivory' ? 'text-slate-500' : 'text-slate-400'}">Build custom UI canvas by hand or synthesize with Sola Arc</p>
          </div>
        </div>

        <!-- Preset Starters -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1">Starters:</span>
          <button onclick={() => loadPreset('finops')} class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer">FinOps</button>
          <button onclick={() => loadPreset('telemetry')} class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer">Telemetry</button>
          <button onclick={() => loadPreset('incident')} class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer">P1 Outage</button>
          <button onclick={() => loadPreset('blank')} class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer">Clear</button>
        </div>

        <!-- Canvas Theme Mode Switcher -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onclick={() => studioTheme = 'ivory'}
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {studioTheme === 'ivory' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Ivory Light
          </button>
          <button 
            onclick={() => studioTheme = 'obsidian'}
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer {studioTheme === 'obsidian' ? 'bg-slate-900 text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}">
            Obsidian Dark
          </button>
        </div>
      </div>

      <!-- Sola Arc Generative Prompt Bar -->
      <form 
        onsubmit={(e) => { e.preventDefault(); handleArcSynthesize(); }}
        class="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
        <div class="pl-3 text-emerald-600 flex items-center gap-1.5">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>
          <span class="text-xs font-mono font-bold text-slate-800">Arc:</span>
        </div>
        <input 
          type="text" 
          bind:value={arcPrompt}
          placeholder="Describe your canvas intent (e.g. Add an API latency gauge and MRR realization waterfall)..." 
          class="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans" />
        <button 
          type="submit"
          disabled={isArcSynthesizing || !arcPrompt.trim()}
          class="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
          {#if isArcSynthesizing}
            <span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Synthesizing...</span>
          {:else}
            <span>Synthesize Canvas</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          {/if}
        </button>
      </form>

    </div>
  </header>

  <!-- Studio Main Workspace: Grid & Palette -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
    
    <!-- LEFT PALETTE: Hand-Crafted Component Builder Dock (Cols 3) -->
    <aside class="w-full lg:w-72 shrink-0 flex flex-col gap-5 sticky top-36">
      
      <!-- Add Component Primitives Panel -->
      <div class="bg-white/95 border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <span class="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Add Primitives</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">1-Click</span>
        </div>

        <div class="flex flex-col gap-2">
          <button 
            onclick={() => addComponent('DataCard')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">DataCard</span>
              <span class="text-[10px] text-slate-400 font-mono">KPI Metric</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>

          <button 
            onclick={() => addComponent('GaugeCard')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">GaugeCard</span>
              <span class="text-[10px] text-slate-400 font-mono">Progress Arc</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>

          <button 
            onclick={() => addComponent('TactileDialCard')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">TactileDial</span>
              <span class="text-[10px] text-slate-400 font-mono">Rotary Knob</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>

          <button 
            onclick={() => addComponent('FlowWaterfall')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">FlowWaterfall</span>
              <span class="text-[10px] text-slate-400 font-mono">Realization</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>

          <button 
            onclick={() => addComponent('DynamicForm')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">DynamicForm</span>
              <span class="text-[10px] text-slate-400 font-mono">Auto-Bind</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>

          <button 
            onclick={() => addComponent('ListBlock')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">ListBlock</span>
              <span class="text-[10px] text-slate-400 font-mono">Entity Stream</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>

          <button 
            onclick={() => addComponent('IncidentTriageMatrix')}
            class="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between text-left transition-all cursor-pointer group">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-900">IncidentMatrix</span>
              <span class="text-[10px] text-slate-400 font-mono">P1 Triage</span>
            </div>
            <span class="text-xs font-bold text-emerald-600">+ Add</span>
          </button>
        </div>
      </div>

      <!-- Live Reactive Signal Simulator Sliders -->
      <div class="bg-white/95 border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <span class="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Live Signal Mesh</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-600">$cluster/nodes:</span>
              <strong class="text-slate-900">{liveNodes}</strong>
            </div>
            <input type="range" min="4" max="48" bind:value={liveNodes} class="w-full accent-emerald-500 cursor-pointer" />
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-600">$cluster/cpu:</span>
              <strong class="text-slate-900">{liveCpu}%</strong>
            </div>
            <input type="range" min="10" max="99" bind:value={liveCpu} class="w-full accent-emerald-500 cursor-pointer" />
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-600">$finance/mrr:</span>
              <strong class="text-slate-900">${(liveMrr / 1000).toFixed(0)}k</strong>
            </div>
            <input type="range" min="50000" max="500000" step="5000" bind:value={liveMrr} class="w-full accent-emerald-500 cursor-pointer" />
          </div>
        </div>
      </div>

    </aside>

    <!-- RIGHT STAGE: Live Interactive Canvas Grid (Cols 9) -->
    <div class="flex-1 w-full flex flex-col gap-6">
      
      <!-- Canvas Status & Component Count Header -->
      <div class="flex items-center justify-between border-b border-slate-200/90 pb-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Canvas Grid:</span>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
            {canvasItems.length} {canvasItems.length === 1 ? 'Component' : 'Components'} Mounted
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick={() => { selectedItem = null; }} 
            class="text-xs font-mono text-slate-500 hover:text-slate-900 cursor-pointer">
            Deselect All
          </button>
        </div>
      </div>

      <!-- MAIN CANVAS GRID CONTAINER -->
      {#if canvasItems.length === 0}
        <div class="p-16 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 flex flex-col items-center justify-center text-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Your Canvas is Empty</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm">
              Add component primitives from the left palette or type a prompt for Sola Arc above to synthesize a complete UI.
            </p>
          </div>
          <button 
            onclick={() => loadPreset('finops')} 
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer">
            Load FinOps Template
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {#each canvasItems as item (item.id)}
            <div 
              class="relative rounded-3xl p-5 transition-all duration-200 flex flex-col gap-4 border {selectedItem?.id === item.id ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-xl' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'} {studioTheme === 'ivory' ? 'bg-white/95' : 'bg-slate-900/95'} {item.colSpan === 3 ? 'lg:col-span-3 md:col-span-2' : item.colSpan === 2 ? 'md:col-span-2' : 'col-span-1'}">
              
              <!-- Card Action Bar (Span, Duplicate, Delete) -->
              <div class="flex items-center justify-between border-b {studioTheme === 'ivory' ? 'border-slate-100' : 'border-slate-800'} pb-2 text-[10px] font-mono">
                <span class="font-bold text-slate-400 uppercase">{item.type}</span>
                <div class="flex items-center gap-1.5">
                  <button 
                    onclick={() => cycleColSpan(item)} 
                    class="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors cursor-pointer"
                    title="Change Width">
                    {item.colSpan}x Width
                  </button>
                  <button 
                    onclick={() => duplicateComponent(item)} 
                    class="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors cursor-pointer"
                    title="Duplicate">
                    Clone
                  </button>
                  <button 
                    onclick={() => removeComponent(item.id)} 
                    class="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors cursor-pointer"
                    title="Delete">
                    Remove
                  </button>
                </div>
              </div>

              <!-- Component Live Render -->
              <div>
                {#if item.type === 'DataCard'}
                  <DataCard config={item.config} />
                {:else if item.type === 'GaugeCard'}
                  <GaugeCard config={item.config} />
                {:else if item.type === 'TactileDialCard'}
                  <TactileDialCard config={item.config} />
                {:else if item.type === 'FlowWaterfall'}
                  <FlowWaterfall config={item.config} />
                {:else if item.type === 'DynamicForm'}
                  <DynamicForm config={item.config} />
                {:else if item.type === 'ListBlock'}
                  <ListBlock config={item.config} />
                {:else if item.type === 'IncidentTriageMatrix'}
                  <IncidentTriageMatrix config={item.config} />
                {:else if item.type === 'ClusterMatrix'}
                  <ClusterMatrix config={item.config} />
                {/if}
              </div>

            </div>
          {/each}
        </div>
      {/if}

      <!-- MULTI-TARGET CODE EXPORT ACCORDION -->
      <section class="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col gap-4 mt-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-950">Multi-Target Code Export</h3>
            <p class="text-xs text-slate-500">1-Click export to Zero-VDOM Sola, React 19, Svelte 5, or Web Components</p>
          </div>

          <!-- Format Selector Buttons -->
          <div class="flex items-center gap-1.5">
            <button 
              onclick={() => activeExportFormat = 'sola'}
              class="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer {activeExportFormat === 'sola' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              .sola Native
            </button>
            <button 
              onclick={() => activeExportFormat = 'react'}
              class="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer {activeExportFormat === 'react' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              React 19 / JSX
            </button>
            <button 
              onclick={() => activeExportFormat = 'svelte'}
              class="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer {activeExportFormat === 'svelte' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Svelte 5
            </button>
            <button 
              onclick={() => activeExportFormat = 'webcomponent'}
              class="px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer {activeExportFormat === 'webcomponent' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Web Component
            </button>
          </div>
        </div>

        <!-- Code Block Window -->
        <div class="relative bg-slate-950 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-72">
          <button 
            onclick={copyCode}
            class="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
            {#if isCopied}
              <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span class="text-emerald-400">Copied!</span>
            {:else}
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy Code</span>
            {/if}
          </button>
          <pre><code>{generatedCode}</code></pre>
        </div>
      </section>

    </div>

  </main>
</div>
