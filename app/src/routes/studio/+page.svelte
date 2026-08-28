<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  import DiffAudit from '$lib/components/DiffAudit.svelte';
  import SolaLogo from '$lib/components/SolaLogo.svelte';

  // Active Input Mode for Generative Engine
  let inputMode = $state<'prompt' | 'data' | 'code'>('prompt');
  let activeTheme = $state<'obsidian' | 'ivory'>('obsidian');

  // Input states
  let promptText = $state('Create a high-density FinOps dashboard with gross margin waterfall, active dunning triage triggers, and subscription churn gauge.');
  let dataInput = $state(`[
  { "month": "Jan", "revenue": 125000, "cogs": 32000, "opex": 41000, "net": 52000 },
  { "month": "Feb", "revenue": 142000, "cogs": 34000, "opex": 42000, "net": 66000 },
  { "month": "Mar", "revenue": 168000, "cogs": 38000, "opex": 45000, "net": 85000 }
]`);
  let codeInput = $state(`<div className="p-6 bg-slate-900 text-white rounded-lg">
  <h2>Cluster Telemetry</h2>
  <div className="grid grid-cols-2 gap-4">
    <div>CPU Load: 78%</div>
    <div>Worker Nodes: 12 Active</div>
  </div>
</div>`);

  // Generative status
  let isCompiling = $state(false);
  let compileProgress = $state(0);
  let compileMessage = $state('');

  // Live Reactive Signals in Studio Mesh
  let clusterNodes = $state(12);
  let clusterCpu = $state(74);
  let mrrValue = $state(168400);
  let churnRate = $state(2.1);
  let habitStreak = $state(18);

  // Active Export Code Format
  let exportFormat = $state<'sola' | 'react' | 'svelte' | 'webcomponent'>('sola');
  let copied = $state(false);

  // Generated Component Tree
  let generatedPreset = $state<'finops' | 'fitness' | 'telemetry' | 'custom'>('finops');

  function handleGenerate() {
    isCompiling = true;
    compileProgress = 15;
    compileMessage = 'Profiling data schema & intent vectors...';

    const interval = setInterval(() => {
      compileProgress += 25;
      if (compileProgress === 40) {
        compileMessage = 'Synthesizing Zod-validated JSON AST...';
      } else if (compileProgress === 65) {
        compileMessage = 'Mounting Zero-VDOM reactive signal bindings...';
      } else if (compileProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          isCompiling = false;
          if (inputMode === 'prompt') {
            if (promptText.toLowerCase().includes('workout') || promptText.toLowerCase().includes('habit') || promptText.toLowerCase().includes('fitness')) {
              generatedPreset = 'fitness';
            } else if (promptText.toLowerCase().includes('telemetry') || promptText.toLowerCase().includes('cluster') || promptText.toLowerCase().includes('cpu')) {
              generatedPreset = 'telemetry';
            } else {
              generatedPreset = 'finops';
            }
          } else if (inputMode === 'data') {
            generatedPreset = 'finops';
          } else {
            generatedPreset = 'telemetry';
          }
        }, 150);
      }
    }, 120);
  }

  let exportedCode = $derived.by(() => {
    if (exportFormat === 'sola') {
      return '<!-- Sola Zero-VDOM Native Template -->\n' +
'<script>\n' +
'  import { DataCard, GaugeCard, FlowWaterfall, TactileDialCard } from \'@sola/ui\';\n' +
'  import { createSignal } from \'@sola/core\';\n\n' +
'  const [nodes, setNodes] = createSignal(' + clusterNodes + ');\n' +
'  const [load, setLoad] = createSignal(' + clusterCpu + ');\n' +
'</' + 'script>\n\n' +
'<div class="sola-grid grid-cols-1 md:grid-cols-3 gap-4">\n' +
'  <DataCard title="Realized MRR" value="$' + mrrValue.toLocaleString() + '" trend="+14.2%" sparkline={[120, 135, 142, 168]} />\n' +
'  <GaugeCard title="Cluster Load" value={load()} max={100} unit="%" />\n' +
'  <TactileDialCard title="Worker Auto-Scaler" value={nodes()} min={1} max={32} on:change={(e) => setNodes(e.detail)} />\n' +
'</div>';
    } else if (exportFormat === 'react') {
      return '// React 19 / Next.js Component with @sola/ui\n' +
'import React, { useState } from \'react\';\n' +
'import { SolaBoundary, DataCard, GaugeCard, FlowWaterfall } from \'@sola/react\';\n\n' +
'export default function SolaDashboard() {\n' +
'  const [nodes, setNodes] = useState(' + clusterNodes + ');\n\n' +
'  return (\n' +
'    <SolaBoundary theme="' + activeTheme + '">\n' +
'      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">\n' +
'        <DataCard title="Realized MRR" value="$' + mrrValue.toLocaleString() + '" trend="+14.2%" />\n' +
'        <GaugeCard title="Churn Risk" value={' + churnRate + '} max={10} unit="%" />\n' +
'        <FlowWaterfall title="Revenue Waterfall" grossVolume={' + mrrValue + '} />\n' +
'      </div>\n' +
'    </SolaBoundary>\n' +
'  );\n' +
'}';
    } else if (exportFormat === 'svelte') {
      return '<' + 'script lang="ts">\n' +
'  // Svelte 5 Native Runes with Sola\n' +
'  import { DataCard, GaugeCard, FlowWaterfall } from \'@sola/ui\';\n\n' +
'  let nodes = $state(' + clusterNodes + ');\n' +
'  let mrr = $state(' + mrrValue + ');\n' +
'</' + 'script>\n\n' +
'<div class="grid grid-cols-1 md:grid-cols-3 gap-4">\n' +
'  <DataCard title="Realized MRR" value={`$' + mrrValue.toLocaleString() + '`} trend="+14.2%" />\n' +
'  <GaugeCard title="Cluster Load" value={' + clusterCpu + '} max={100} unit="%" />\n' +
'  <FlowWaterfall title="Revenue Waterfall" grossVolume={mrr} />\n' +
'</div>';
    } else {
      return '<!-- Sola Web Component (Shadow DOM Isolated) -->\n' +
'<' + 'script type="module" src="https://cdn.sola-air.dev/sola-elements.js"></' + 'script>\n\n' +
'<sola-dashboard theme="' + activeTheme + '">\n' +
'  <sola-data-card title="Realized MRR" value="$' + mrrValue.toLocaleString() + '" trend="+14.2%"></sola-data-card>\n' +
'  <sola-gauge-card title="Cluster Load" value="' + clusterCpu + '" max="100" unit="%"></sola-gauge-card>\n' +
'  <sola-flow-waterfall title="Revenue Realization" gross-volume="' + mrrValue + '"></sola-flow-waterfall>\n' +
'</sola-dashboard>';
    }
  });

  function copyExportCode() {
    navigator.clipboard?.writeText(exportedCode);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<svelte:head>
  <title>Sola Design Studio — Generative UI & Component Studio</title>
</svelte:head>

<div class="min-h-screen bg-[#070a13] text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
  <Navbar />

  <!-- Studio Header Banner -->
  <header class="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <SolaLogo size="sm" spinning={isCompiling} />
          <h1 class="text-xl font-black tracking-tight text-white">Sola Design Studio</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Generative UI Engine
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">
          Build and synthesize zero-VDOM luxury UI components from prompts, datasets, or legacy code.
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-2">
        <a 
          href="/preview"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-all">
          View on My UI →
        </a>
        <a 
          href="/community"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-all">
          Community Registry
        </a>
      </div>
    </div>
  </header>

  <!-- Studio Workspace Grid -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    <!-- LEFT PANEL: Generative Input & Signal Mesh Control (Cols 4) -->
    <div class="lg:col-span-4 flex flex-col gap-5">
      
      <!-- Input Mode Switcher -->
      <div class="p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex gap-1">
        <button 
          onclick={() => inputMode = 'prompt'}
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all {inputMode === 'prompt' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}">
          Prompt
        </button>
        <button 
          onclick={() => inputMode = 'data'}
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all {inputMode === 'data' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}">
          Data Drop
        </button>
        <button 
          onclick={() => inputMode = 'code'}
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all {inputMode === 'code' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}">
          Code Drop
        </button>
      </div>

      <!-- Mode 1: Natural Language Prompt -->
      {#if inputMode === 'prompt'}
        <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-3">
          <label for="prompt-input" class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Natural Language UI Intent
          </label>
          <textarea 
            id="prompt-input"
            bind:value={promptText}
            rows="4"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono resize-none leading-relaxed"
            placeholder="Describe your desired UI, metrics, and workflow..."></textarea>
          
          <!-- Example Prompts -->
          <div class="flex flex-wrap gap-1.5">
            <button 
              onclick={() => promptText = 'Create a high-density FinOps dashboard with gross margin waterfall and churn gauge.'}
              class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750">
              FinOps & MRR
            </button>
            <button 
              onclick={() => promptText = 'Create a personal habit and workout log with rotary dials and streak counters.'}
              class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750">
              Fitness & Habits
            </button>
            <button 
              onclick={() => promptText = 'Create a live cloud cluster telemetry HUD with worker auto-scaling rotary dials.'}
              class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750">
              Cluster Telemetry
            </button>
          </div>
        </div>
      {/if}

      <!-- Mode 2: Dataset / Schema Drop -->
      {#if inputMode === 'data'}
        <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-3">
          <label for="data-input" class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Paste JSON, CSV, or Sheet Schema
          </label>
          <textarea 
            id="data-input"
            bind:value={dataInput}
            rows="6"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono resize-none leading-relaxed"
            placeholder="Paste raw JSON or CSV data..."></textarea>
          <span class="text-[11px] text-slate-500">
            Sola Data Profiler auto-detects cardinality, time-series, and numerical metrics to pick optimal cards.
          </span>
        </div>
      {/if}

      <!-- Mode 3: Legacy Code Translation -->
      {#if inputMode === 'code'}
        <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-3">
          <label for="code-input" class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Paste Legacy React / HTML Code
          </label>
          <textarea 
            id="code-input"
            bind:value={codeInput}
            rows="6"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-sky-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono resize-none leading-relaxed"
            placeholder="Paste legacy JSX, HTML, or Tailwind markup..."></textarea>
          <span class="text-[11px] text-slate-500">
            Decompiles monolithic layouts into modular, zero-VDOM @sola/ui primitives.
          </span>
        </div>
      {/if}

      <!-- Synthesize Trigger Button -->
      <button 
        onclick={handleGenerate}
        disabled={isCompiling}
        class="w-full py-3 rounded-xl font-bold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 {isCompiling ? 'bg-emerald-500/20 text-emerald-400 cursor-wait' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'}">
        {#if isCompiling}
          <span class="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
          <span>{compileMessage} ({compileProgress}%)</span>
        {:else}
          <span>Synthesize UI with Sola</span>
        {/if}
      </button>

      <!-- LIVE SIGNAL MESH CONTROL PANEL -->
      <div class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Signal Mesh Controller
          </span>
          <span class="text-[10px] font-mono text-slate-500">Live @sola/core bus</span>
        </div>

        <!-- Signal 1: Nodes Dial/Slider -->
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400 font-mono">$signal('cluster/nodes')</span>
            <span class="font-bold text-emerald-400 font-mono">{clusterNodes} Nodes</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="32" 
            bind:value={clusterNodes}
            class="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-full cursor-pointer" />
        </div>

        <!-- Signal 2: CPU Saturation Slider -->
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400 font-mono">$signal('cluster/cpu')</span>
            <span class="font-bold text-sky-400 font-mono">{clusterCpu}%</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            bind:value={clusterCpu}
            class="w-full accent-sky-500 bg-slate-950 h-1.5 rounded-full cursor-pointer" />
        </div>

        <!-- Signal 3: MRR Value Slider -->
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400 font-mono">$signal('finance/mrr')</span>
            <span class="font-bold text-violet-400 font-mono">${mrrValue.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="50000" 
            max="500000" 
            step="5000"
            bind:value={mrrValue}
            class="w-full accent-violet-500 bg-slate-950 h-1.5 rounded-full cursor-pointer" />
        </div>
      </div>

    </div>

    <!-- RIGHT PANEL: Live Interactive Stage & Code Exporter (Cols 8) -->
    <div class="lg:col-span-8 flex flex-col gap-5">
      
      <!-- Stage Header & Viewport Controls -->
      <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold font-mono text-slate-400 uppercase">Stage Canvas:</span>
          <span class="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {generatedPreset === 'fitness' ? 'Personal Fitness & Habit Log' : (generatedPreset === 'telemetry' ? 'APM & Telemetry HUD' : 'FinOps & Revenue Studio')}
          </span>
        </div>

        <!-- Theme Mode Toggle -->
        <div class="flex items-center gap-1.5">
          <button 
            onclick={() => activeTheme = 'obsidian'}
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all {activeTheme === 'obsidian' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}">
            Obsidian Dark
          </button>
          <button 
            onclick={() => activeTheme = 'ivory'}
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all {activeTheme === 'ivory' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-300'}">
            Ivory Light
          </button>
        </div>
      </div>

      <!-- LIVE INTERACTIVE STAGE CANVAS -->
      <div class="p-6 rounded-3xl border transition-all {activeTheme === 'obsidian' ? 'bg-[#090d19] border-slate-800/80 shadow-2xl' : 'bg-slate-50 border-slate-300 text-slate-950 shadow-xl'} min-h-[420px] flex flex-col gap-6">
        
        {#if generatedPreset === 'finops'}
          <!-- FinOps Preset Primitives -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DataCard config={{ title: "Realized MRR", value: `$${mrrValue.toLocaleString()}`, trend: "+14.2%", icon: "trending-up" }} />
            <GaugeCard config={{ title: "Churn Rate", value: churnRate, max: 10, unit: "%", icon: "activity" }} />
            <DataCard config={{ title: "Gross Margin", value: "84.2%", trend: "+2.1%", icon: "check-circle" }} />
          </div>

          <FlowWaterfall 
            title="Monthly FinOps ARR Realization" 
            grossVolume={mrrValue} 
            computeExpense={Math.round(mrrValue * 0.18)}
            supportExpense={Math.round(mrrValue * 0.08)}
            tierDiscount={Math.round(mrrValue * 0.04)} />

        {:else if generatedPreset === 'fitness'}
          <!-- Personal Creator / Fitness Preset -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DataCard config={{ title: "Habit Streak", value: `${habitStreak} Days`, trend: "+3 this week", icon: "zap" }} />
            <GaugeCard config={{ title: "Daily Volume Goal", value: 85, max: 100, unit: "%", icon: "activity" }} />
            <DataCard config={{ title: "Total Workouts", value: "48 Sessions", trend: "On Track", icon: "award" }} />
          </div>

          <TactileDialCard 
            title="Workout Weight & Reps Throttle" 
            value={clusterNodes * 2} 
            min={8} 
            max={64} 
            unit="kg" />

        {:else}
          <!-- Systems Telemetry Preset -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DataCard config={{ title: "Cluster Nodes", value: `${clusterNodes} Active`, trend: "Optimal", icon: "server" }} />
            <GaugeCard config={{ title: "CPU Saturation", value: clusterCpu, max: 100, unit: "%", icon: "cpu" }} />
            <DataCard config={{ title: "Event Velocity", value: "14.8k /s", trend: "+8.4%", icon: "activity" }} />
          </div>

          <TactileDialCard 
            title="Worker Node Auto-Scaler" 
            value={clusterNodes} 
            min={1} 
            max={32} 
            unit="nodes" />
        {/if}

      </div>

      <!-- CODE EXPORTER ACCORDION / TABS -->
      <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Export Production Code:
            </span>
            <div class="flex gap-1">
              <button 
                onclick={() => exportFormat = 'sola'}
                class="px-2 py-0.5 rounded text-[11px] font-mono font-bold {exportFormat === 'sola' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}">
                .sola Native
              </button>
              <button 
                onclick={() => exportFormat = 'react'}
                class="px-2 py-0.5 rounded text-[11px] font-mono font-bold {exportFormat === 'react' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}">
                React 19
              </button>
              <button 
                onclick={() => exportFormat = 'svelte'}
                class="px-2 py-0.5 rounded text-[11px] font-mono font-bold {exportFormat === 'svelte' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}">
                Svelte 5
              </button>
              <button 
                onclick={() => exportFormat = 'webcomponent'}
                class="px-2 py-0.5 rounded text-[11px] font-mono font-bold {exportFormat === 'webcomponent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}">
                Web Component
              </button>
            </div>
          </div>

          <button 
            onclick={copyExportCode}
            class="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer">
            {copied ? 'Copied Code!' : 'Copy Code'}
          </button>
        </div>

        <pre class="w-full bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400/90 overflow-x-auto border border-slate-800/80 leading-relaxed max-h-60"><code>{exportedCode}</code></pre>
      </div>

    </div>

  </main>
</div>
