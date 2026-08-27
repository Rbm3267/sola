<script lang="ts">
  import DynamicRenderer from '$lib/components/DynamicRenderer.svelte';
  import LivingSolaCore from '$lib/components/LivingSolaCore.svelte';
  import SolaLogo from '$lib/components/SolaLogo.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  interface DashboardWidget {
    id: string;
    component: 'DataCard' | 'GaugeCard' | 'DynamicForm' | 'ListBlock';
    colSpan: 1 | 2 | 3;
    config: any;
  }
  
  let intentQuery = $state('');
  let isLoading = $state(false);
  let errorMsg = $state('');
  let isListening = $state(false);
  let speechSupported = $state(false);
  let recognition: any = null;

  // Active Production Widgets Grid
  let widgets = $state<DashboardWidget[]>([
    {
      id: 'w-1',
      component: 'DataCard',
      colSpan: 1,
      config: { title: 'Daily Volume Moved', value: '14,800 lbs', trend: '+1,200 lbs', icon: 'activity' }
    },
    {
      id: 'w-2',
      component: 'GaugeCard',
      colSpan: 1,
      config: { title: 'Recovery Index', value: '94 / 100', percentage: 94, subtext: 'Readiness: Optimal', color: 'emerald' }
    },
    {
      id: 'w-3',
      component: 'DataCard',
      colSpan: 1,
      config: { title: 'Monthly SaaS MRR', value: '$148,200', trend: '+24.8%', icon: 'trending-up' }
    },
    {
      id: 'w-4',
      component: 'ListBlock',
      colSpan: 2,
      config: {
        title: 'Active Edge Clusters',
        items: [
          { label: 'sola-edge-iad1', description: 'Washington DC • 99.99% Uptime', status: 'Active' },
          { label: 'sola-edge-fra1', description: 'Frankfurt • 99.98% Uptime', status: 'Active' },
          { label: 'sola-edge-syd1', description: 'Sydney • Performing Cache Sync', status: 'Syncing' }
        ]
      }
    },
    {
      id: 'w-5',
      component: 'GaugeCard',
      colSpan: 1,
      config: { title: 'Memory Load', value: '14.2 / 16 GB', percentage: 88, subtext: 'High Density Telemetry', color: 'amber' }
    }
  ]);

  // Quick edit modal state
  let editingWidget = $state<DashboardWidget | null>(null);
  let isExportOpen = $state(false);
  let copiedExport = $state(false);

  const sampleIntents = [
    "Add a CPU temperature gauge with 72% load",
    "Show Q3 revenue and churn rate for enterprise tier",
    "List all active deployments with their status",
    "Add a workout volume card for heavy kettlebells"
  ];

  onMount(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechSupported = true;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => { isListening = true; };
        recognition.onresult = (event: any) => {
          intentQuery = Array.from(event.results).map((result: any) => result[0].transcript).join('');
        };
        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          isListening = false;
        };
        recognition.onend = () => {
          isListening = false;
          if (intentQuery.trim()) submitIntent();
        };
      }
    }
  });

  function toggleSpeech() {
    if (!speechSupported || !recognition) {
      errorMsg = "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.";
      return;
    }
    if (isListening) {
      recognition.stop();
      isListening = false;
    } else {
      errorMsg = '';
      intentQuery = '';
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  }

  function pickSample(prompt: string) {
    intentQuery = prompt;
    submitIntent();
  }

  async function submitIntent() {
    if (!intentQuery.trim() || isLoading) return;
    
    isLoading = true;
    errorMsg = '';

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentQuery })
      });

      const rawText = await res.text();
      if (!res.ok) throw new Error('Intent synthesis failed');

      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      const generated = JSON.parse(cleanText);
      const newItems = Array.isArray(generated) ? generated : [generated];

      // Append new synthesized widgets to the top of the canvas
      const converted: DashboardWidget[] = newItems.map((item: any, idx: number) => ({
        id: `gen-${Date.now()}-${idx}`,
        component: item.component || 'DataCard',
        colSpan: item.component === 'ListBlock' || item.component === 'DynamicForm' ? 2 : 1,
        config: item.config || {}
      }));

      widgets = [...converted, ...widgets];
      intentQuery = '';
    } catch (e: any) {
      console.error(e);
      errorMsg = e.message || 'Failed to synthesize components.';
    } finally {
      isLoading = false;
    }
  }

  // Widget Actions
  function removeWidget(id: string) {
    widgets = widgets.filter(w => w.id !== id);
  }

  function moveWidget(index: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const temp = widgets[index];
    widgets[index] = widgets[targetIndex];
    widgets[targetIndex] = temp;
  }

  function cycleColSpan(widget: DashboardWidget) {
    widget.colSpan = widget.colSpan === 1 ? 2 : widget.colSpan === 2 ? 3 : 1;
  }

  function loadPreset(type: 'fitness' | 'cloud' | 'servicenow' | 'reset') {
    if (type === 'fitness') {
      widgets = [
        { id: 'f-1', component: 'DataCard', colSpan: 1, config: { title: 'Total Volume', value: '18,400 lbs', trend: '+2,400 lbs', icon: 'activity' } },
        { id: 'f-2', component: 'GaugeCard', colSpan: 1, config: { title: 'Athletic Readiness', value: '96 / 100', percentage: 96, subtext: 'Optimal State', color: 'emerald' } },
        { id: 'f-3', component: 'DataCard', colSpan: 1, config: { title: 'Heavy Sets Completed', value: '14 Sets', trend: 'Armor Building Complex', icon: 'trending-up' } },
        { id: 'f-4', component: 'ListBlock', colSpan: 3, config: { title: 'Training Log Sessions', items: [
          { label: 'Clean & Strict Press (2x24kg)', description: '5 sets of 2 reps • RPE 7.5', status: 'Completed' },
          { label: 'Front Squats (2x24kg)', description: '5 sets of 3 reps • Solid depth', status: 'Completed' },
          { label: 'Snatch Interval (24kg)', description: '10 mins EMOM • 100 reps total', status: 'Active' }
        ]} }
      ];
    } else if (type === 'servicenow') {
      widgets = [
        { id: 'sn-1', component: 'DataCard', colSpan: 1, config: { title: 'P1 Critical Incidents', value: '2 Active', trend: '-4 from yesterday', icon: 'activity' } },
        { id: 'sn-2', component: 'GaugeCard', colSpan: 1, config: { title: 'SLA Compliance Rate', value: '98.4%', percentage: 98, subtext: 'MTTR: 14.2 mins (Target: <30m)', color: 'emerald' } },
        { id: 'sn-3', component: 'DataCard', colSpan: 1, config: { title: 'Pending CAB Changes', value: '7 Awaiting', trend: 'Release Window 02:00 UTC', icon: 'check' } },
        { id: 'sn-4', component: 'ListBlock', colSpan: 3, config: { title: 'ServiceNow Live Incident Stream (now/table/incident)', items: [
          { label: 'INC009481 • API Gateway Latency Spike (EU-West)', description: 'Assigned: Tier 3 Platform SRE • SLA Breach in 12m', status: 'Active' },
          { label: 'INC009479 • SSO IdP Certificate Expiring', description: 'Assigned: Identity & SecOps • Fix Deployed to Staging', status: 'Active' },
          { label: 'CHG003410 • Redis Cluster Version 7.2 Upgrade', description: 'CAB Approved • Scheduled for Window #4', status: 'Completed' }
        ]} }
      ];
    } else if (type === 'cloud') {
      widgets = [
        { id: 'c-1', component: 'DataCard', colSpan: 1, config: { title: 'Enterprise ARR', value: '$1,840,000', trend: '+34.2%', icon: 'trending-up' } },
        { id: 'c-2', component: 'GaugeCard', colSpan: 1, config: { title: 'Cluster CPU', value: '68.4%', percentage: 68, subtext: 'Auto-scaled across 3 zones', color: 'sky' } },
        { id: 'c-3', component: 'DataCard', colSpan: 1, config: { title: 'Edge Requests', value: '4.2M / day', trend: '99.99% Uptime', icon: 'check' } }
      ];
    } else {
      widgets = [];
    }
  }

  function exportSolaCode() {
    const code = `<` + `script>
  // Sola Production Dashboard Schema
  const dashboard = $data("sheet://production-telemetry");
</` + `script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
` + widgets.map(w => `  <${w.component} class="col-span-${w.colSpan}" config={${JSON.stringify(w.config)}} />`).join('\n') + `
</div>`;
    navigator.clipboard.writeText(code);
    copiedExport = true;
    setTimeout(() => copiedExport = false, 2000);
  }
</script>

<div class="min-h-screen bg-[#fafafa] text-slate-950 font-sans selection:bg-slate-200 selection:text-slate-900 pb-24">
  <Navbar />
  
  <!-- Precision Monochromatic Grid Texture -->
  <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>

  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 z-10 relative">
    
    <!-- Title Area -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold mb-3">
        <span>Sola Ambient Studio • Live Production Canvas</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-[-0.035em] mb-2">
        Ambient Intent Playground
      </h1>
      <p class="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
        Speak or type any intent. Generated cards live in a <strong>fully configurable production grid</strong> with real-time resizing, reordering, and live parameter editing.
      </p>
    </div>

    <!-- Luxury Command & Voice Input Bar -->
    <div class="max-w-2xl mx-auto w-full bg-white/95 backdrop-blur-3xl border {isListening ? 'border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.25)]' : 'border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.06)]'} rounded-2xl p-2 transition-all duration-300 relative">
      <form class="flex items-center gap-2 sm:gap-3 w-full relative z-10" onsubmit={(e) => { e.preventDefault(); submitIntent(); }}>
        
        <!-- Left Sparkle / Active Status -->
        <div class="pl-3 sm:pl-4 shrink-0 text-amber-500">
          {#if isLoading}
            <svg class="w-5 h-5 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"/></svg>
          {:else if isListening}
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span class="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            </div>
          {:else}
            <svg class="w-5 h-5 text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          {/if}
        </div>
        
        <!-- Clean Input Box with Zero Default Focus Border/Outline -->
        <input 
          type="text" 
          bind:value={intentQuery}
          placeholder={isListening ? "Listening... speak now" : "Speak or type intent (e.g. 'Add CPU gauge at 84%')"} 
          style="outline: none !important; box-shadow: none !important; border: none !important;"
          class="flex-1 bg-transparent py-4 px-2 text-slate-900 text-sm sm:text-base font-medium placeholder-slate-400 border-0 outline-none focus:outline-none focus:ring-0 appearance-none"
        />
        
        <!-- Voice Input Microphone Button -->
        <button 
          type="button"
          onclick={toggleSpeech}
          aria-label="Voice intent recognition"
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all flex items-center justify-center cursor-pointer {isListening ? 'bg-rose-500 text-white shadow-md animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          title={isListening ? "Stop listening" : "Speak intent via microphone"}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>

        <!-- Submit Button (High Contrast & Always Visible) -->
        <!-- Submit Button (Fluid Luminous Amber Gradient) -->
        <button 
          type="submit" 
          disabled={isLoading || !intentQuery.trim()}
          aria-label="Submit intent"
          style={!isLoading && intentQuery.trim() ? "background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;" : ""}
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl font-bold transition-all active:scale-[0.97] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md shrink-0 cursor-pointer"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>
    </div>

    <!-- Suggestions Row -->
    <div class="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
      <span class="text-xs font-semibold text-slate-400">Suggestions:</span>
      {#each sampleIntents as sample}
        <button 
          onclick={() => pickSample(sample)}
          class="text-xs bg-white/95 border border-slate-200/90 text-slate-700 px-3.5 py-2 rounded-2xl hover:border-amber-400 hover:text-amber-900 hover:bg-amber-50/50 transition-all cursor-pointer shadow-xs">
          {sample}
        </button>
      {/each}
    </div>

    <!-- Production Dashboard Studio Controls Bar -->
    <div class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-mono font-bold text-slate-900">Live Production Canvas</span>
        </div>
        <span class="text-slate-300">•</span>
        <span class="text-xs font-mono text-slate-500">{widgets.length} Active Widgets</span>
      </div>

      <!-- Actions: Presets + Code Export -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-mono font-bold text-slate-400 uppercase mr-1">Presets:</span>
        <button 
          onclick={() => loadPreset('servicenow')}
          class="text-xs font-mono font-bold px-3.5 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1.5">
          <span>⚡ ServiceNow ITSM</span>
        </button>
        <button 
          onclick={() => loadPreset('fitness')}
          class="text-xs font-mono font-bold px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">
          🏋️ Training
        </button>
        <button 
          onclick={() => loadPreset('cloud')}
          class="text-xs font-mono font-bold px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer">
          ☁️ SaaS Cloud
        </button>
        <button 
          onclick={exportSolaCode}
          style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
          class="text-xs font-mono font-bold px-4 py-2 rounded-2xl text-white shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.35)] transition-all cursor-pointer flex items-center gap-1.5">
          {#if copiedExport}
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="text-white font-bold">Copied .sola!</span>
          {:else}
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            <span class="text-white font-bold">Export Code</span>
          {/if}
        </button>
      </div>
    </div>

    <!-- Active Synthesizing Living Core Banner -->
    {#if isLoading}
      <div 
        transition:fly={{ y: 20, duration: 300 }}
        class="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
        <LivingSolaCore state="synthesizing" size={180} showTelemetry={true} />
      </div>
    {/if}

    <!-- Active Interactive Production Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {#each widgets as widget, index (widget.id)}
        <div 
          class="group/widget relative flex flex-col transition-all duration-300 {widget.colSpan === 3 ? 'md:col-span-3' : widget.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'}"
          transition:fly={{ y: 20, duration: 250 }}
        >
          <!-- Floating Card Action Toolbar (Reorder, Span, Edit, Delete) -->
          <div class="absolute -top-3.5 right-4 z-20 opacity-0 group-hover/widget:opacity-100 transition-all duration-150 flex items-center gap-1 bg-slate-950 text-white px-2 py-1 rounded-xl shadow-lg border border-slate-800 text-[11px] font-mono">
            
            <!-- Move Left / Up -->
            <button 
              onclick={() => moveWidget(index, 'left')}
              disabled={index === 0}
              title="Move left"
              class="p-1 hover:text-amber-300 disabled:opacity-30 cursor-pointer">
              ←
            </button>

            <!-- Move Right / Down -->
            <button 
              onclick={() => moveWidget(index, 'right')}
              disabled={index === widgets.length - 1}
              title="Move right"
              class="p-1 hover:text-amber-300 disabled:opacity-30 cursor-pointer">
              →
            </button>

            <span class="text-slate-700">|</span>

            <!-- Column Span Toggle -->
            <button 
              onclick={() => cycleColSpan(widget)}
              title="Toggle width (1x / 2x / 3x)"
              class="px-1.5 py-0.5 hover:text-sky-300 font-bold cursor-pointer">
              {widget.colSpan}x
            </button>

            <span class="text-slate-700">|</span>

            <!-- Quick Edit Config -->
            <button 
              onclick={() => editingWidget = widget}
              title="Configure widget data"
              class="p-1 hover:text-emerald-300 cursor-pointer">
              ⚙️
            </button>

            <!-- Delete -->
            <button 
              onclick={() => removeWidget(widget.id)}
              title="Remove widget"
              class="p-1 hover:text-rose-400 cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Component Render Surface -->
          <div class="w-full">
            <DynamicRenderer data={{ component: widget.component, config: widget.config }} />
          </div>
        </div>
      {/each}
    </div>

    <!-- Empty State -->
    {#if widgets.length === 0}
      <div class="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm">
        <div class="text-3xl mb-3">☀️</div>
        <h3 class="text-base font-black text-slate-950 font-mono mb-1">Canvas is Clean</h3>
        <p class="text-xs text-slate-500 mb-6">Speak your intent or load a starter preset to begin constructing your dashboard.</p>
        <button 
          onclick={() => loadPreset('fitness')}
          class="bg-slate-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
          Load Starter Preset
        </button>
      </div>
    {/if}

  </div>
</div>

<!-- Live Widget Config Modal -->
{#if editingWidget}
  <div 
    transition:fade={{ duration: 150 }}
    onclick={() => editingWidget = null}
    class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div 
      transition:fly={{ y: 20, duration: 200 }}
      onclick={(e) => e.stopPropagation()}
      class="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 class="font-black text-slate-950 font-mono text-base flex items-center gap-2">
          <span>Configure {editingWidget.component}</span>
        </h3>
        <button onclick={() => editingWidget = null} class="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Title</label>
          <input 
            type="text" 
            bind:value={editingWidget.config.title}
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
          />
        </div>

        {#if editingWidget.config.value !== undefined}
          <div>
            <label class="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Primary Value</label>
            <input 
              type="text" 
              bind:value={editingWidget.config.value}
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />
          </div>
        {/if}

        {#if editingWidget.config.trend !== undefined}
          <div>
            <label class="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Trend Badge</label>
            <input 
              type="text" 
              bind:value={editingWidget.config.trend}
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-950 focus:outline-none"
            />
          </div>
        {/if}

        {#if editingWidget.config.percentage !== undefined}
          <div>
            <div class="flex justify-between text-xs font-mono font-bold text-slate-500 uppercase mb-1">
              <span>Gauge Progress</span>
              <span>{editingWidget.config.percentage}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              bind:value={editingWidget.config.percentage}
              class="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        {/if}
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button 
          onclick={() => editingWidget = null}
          class="bg-slate-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
          Done
        </button>
      </div>
    </div>
  </div>
{/if}
