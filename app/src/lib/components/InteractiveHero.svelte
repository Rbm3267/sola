<script lang="ts">
  import SolaButton from './SolaButton.svelte';
  import SolaChart from './SolaChart.svelte';
  import SolaDatePicker from './SolaDatePicker.svelte';
  import SolaKbd from './SolaKbd.svelte';

  let activeTab = $state<'telemetry' | 'primitives' | 'signals'>('telemetry');
  let copied = $state(false);
  let liveCounter = $state(184200);
  let dialAngle = $state(64);
  let isSimulating = $state(false);

  function triggerSignalPulse() {
    isSimulating = true;
    liveCounter += Math.floor(Math.random() * 2400) + 600;
    setTimeout(() => {
      isSimulating = false;
    }, 400);
  }

  function copyCliCommand() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('npm create sola@latest');
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    }
  }
</script>

<!-- Ambient Luminous Hero Section -->
<div class="flex flex-col items-center text-center max-w-5xl mx-auto pt-6 md:pt-12 pb-16 relative w-full">
  
  <!-- Floating Luminous Announcement Badge -->
  <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold mb-6 shadow-2xs">
    <span class="flex h-2 w-2 relative">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span>Sola AIR v1.0.1 • Zero-VDOM Intent Engine</span>
    <span class="text-emerald-400/80">/</span>
    <span class="text-slate-500 dark:text-slate-400 font-normal">56 Primitives</span>
  </div>

  <!-- Main Headline (Airy, Crisp, Modern) -->
  <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.06] mb-6 max-w-4xl">
    Build beautiful interfaces from <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">pure intent</span>.
  </h1>

  <!-- Subheadline -->
  <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-normal">
    A zero-VDOM UI engine and design system that compiles declarative intent into fine-grained reactive DOM signals — zero virtual DOM overhead, multi-framework portability, and 56 handcrafted primitives.
  </p>

  <!-- Clean Action Bar (CTAs + CLI) -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10 w-full sm:w-auto justify-center">
    <!-- Primary CTA -->
    <a 
      href="/studio" 
      class="px-6 py-3 rounded-2xl font-bold transition-all duration-200 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 shadow-md shadow-slate-900/10 dark:shadow-emerald-500/20 hover:-translate-y-0.5 text-center text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer">
      <span>Launch Studio Canvas</span>
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </a>

    <!-- Secondary CTA -->
    <a 
      href="/components" 
      class="px-6 py-3 rounded-2xl font-bold transition-all duration-200 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-xs hover:-translate-y-0.5 text-center text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer">
      <span>Browse 56 Components</span>
    </a>
    
    <!-- Inline CLI Pill -->
    <div class="px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md text-slate-800 dark:text-slate-200 font-mono text-xs flex items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center gap-2 select-all">
        <span class="text-emerald-500 font-bold select-none">$</span>
        <span>npm create sola@latest</span>
      </div>
      <button 
        onclick={copyCliCommand}
        aria-label="Copy CLI command" 
        class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all cursor-pointer">
        {#if copied}
          <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {:else}
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Micro Technical Attributes Line -->
  <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-semibold text-slate-400 dark:text-slate-400 mb-12">
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 3.2 kB Core Runtime</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span> 0 Virtual DOM Diffing</span>
    <span>•</span>
    <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Multi-Framework Export</span>
  </div>

  <!-- Interactive Live Canvas Stage -->
  <div class="w-full max-w-4xl mx-auto text-left">
    
    <!-- Stage Window -->
    <div class="bg-white/95 dark:bg-[#0c1222] border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
      
      <!-- Stage Nav Header -->
      <div class="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <!-- Window Indicator & Mode Label -->
        <div class="flex items-center gap-2.5">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20"></div>
          </div>
          <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
            Live Reactive Canvas Stage
          </span>
        </div>

        <!-- Interactive Scenario Switcher Tabs -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onclick={() => (activeTab = 'telemetry')}
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'telemetry' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
            Telemetry Stream
          </button>
          <button
            onclick={() => (activeTab = 'primitives')}
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'primitives' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
            Tactile Controls
          </button>
          <button
            onclick={() => (activeTab = 'signals')}
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'signals' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
            Signal Cascade
          </button>
        </div>
      </div>

      <!-- Stage Body Container -->
      <div class="p-6 sm:p-8 space-y-6">
        
        {#if activeTab === 'telemetry'}
          <!-- 1. Executive Telemetry Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <!-- Metric Card 1 -->
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex flex-col justify-between">
              <div class="flex items-center justify-between text-slate-400 text-xs font-mono font-bold">
                <span>INGESTION STREAM</span>
                <span class="text-emerald-600 font-bold">+18.4%</span>
              </div>
              <div class="my-3">
                <div class="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  ${liveCounter.toLocaleString()}
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time throughput</div>
              </div>
              <button
                onclick={triggerSignalPulse}
                class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs">
                <span>Inject Signal Pulse</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </button>
            </div>

            <!-- Metric Card 2 (SVG Chart) -->
            <div class="sm:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex flex-col justify-between">
              <div class="flex items-center justify-between text-slate-400 text-xs font-mono font-bold mb-2">
                <span>1,000Hz SIGNAL RUNTIME</span>
                <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px]">Zero GC</span>
              </div>
              <SolaChart
                type="area"
                color="emerald"
                title="Direct Text Node Mutation"
                subtitle="O(1) DOM patching with zero garbage collection"
                height={120}
              />
            </div>
          </div>

        {:else if activeTab === 'primitives'}
          <!-- 2. Tactile Controls & Physics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Rotary / Slider -->
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-4">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-700 dark:text-slate-300">Tactile Signal Dial</span>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{dialAngle}° / 100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                bind:value={dialAngle}
                class="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
              />
              <div class="flex items-center gap-2">
                <SolaButton variant="primary" label="Primary Action" />
                <SolaButton variant="secondary" label="Secondary" />
                <SolaButton variant="ghost" label="Ghost" />
              </div>
            </div>

            <!-- Date Picker & Kbd -->
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
              <SolaDatePicker label="Calendar" />
              <div class="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 dark:border-white/5">
                <span>Shortcuts:</span>
                <div class="flex items-center gap-1.5">
                  <SolaKbd keys={['⌘', 'K']} size="sm" />
                  <SolaKbd keys={['ESC']} size="sm" />
                </div>
              </div>
            </div>
          </div>

        {:else}
          <!-- 3. Signal Cascade Code -->
          <div class="p-6 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed space-y-3">
            <div class="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span>App.sola • Native Single-File Component</span>
              <span class="text-emerald-400 font-bold">Compiled Zero-VDOM</span>
            </div>
            <pre><code>{`<script>
  let metrics = $state({ count: ${liveCounter}, latency: 14.2 });
  let status = $derived(metrics.latency < 20 ? "Optimal" : "Degraded");
<\/script>

<div class="telemetry-hud">
  <h1>Ingestion: {metrics.count}</h1>
  <SolaChart type="area" data={metrics} />
</div>`}</code></pre>
          </div>
        {/if}
      </div>

      <!-- Stage Footer / Multi-Framework Bar -->
      <div class="px-6 py-3.5 bg-slate-50/90 dark:bg-[#0c1222]/90 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="font-medium text-slate-700 dark:text-slate-300">Live signal bus connected</span>
        </div>
        <div class="flex items-center gap-3 font-mono text-[11px]">
          <span>React 19</span>
          <span>•</span>
          <span>Svelte 5</span>
          <span>•</span>
          <span>Web Components</span>
        </div>
      </div>

    </div>
  </div>
</div>
