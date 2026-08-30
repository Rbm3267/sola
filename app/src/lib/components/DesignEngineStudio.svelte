<script lang="ts">
  import SolaButton from './SolaButton.svelte';
  import SolaDatePicker from './SolaDatePicker.svelte';
  import SolaChart from './SolaChart.svelte';
  import SolaKbd from './SolaKbd.svelte';
  import SolaTabs from './SolaTabs.svelte';

  let activeTab = $state<'components' | 'telemetry' | 'tokens'>('components');
  let selectedFramework = $state<'sola' | 'react' | 'svelte' | 'html'>('sola');

  // Interactive Live State
  let buttonCount = $state(12);
  let sliderVal = $state(74);
  let toggleState = $state(true);
  let dateRange = $state({ start: '2026-08-01', end: '2026-08-30' });

  const frameworkSnippets = {
    sola: `<script>\n  let count = $state(12);\n  let health = $derived(count > 10 ? "Optimal" : "Degraded");\n<\/script>\n\n<SolaButton variant="primary" onclick={() => count++}>\n  Trigger Signal ({count})\n</SolaButton>\n<SolaChart type="area" color="emerald" data={signalStream} />`,
    react: `import { SolaButton, SolaChart } from '@sola/react';\n\nexport function TelemetryHUD() {\n  const [count, setCount] = useState(12);\n  return (\n    <div className="flex flex-col gap-4">\n      <SolaButton variant="primary" onClick={() => setCount(c => c + 1)}>\n        Trigger Signal ({count})\n      </SolaButton>\n      <SolaChart type="area" color="emerald" data={stream} />\n    </div>\n  );\n}`,
    svelte: `<script lang="ts">\n  import { SolaButton, SolaChart } from '@sola/ui';\n  let count = $state(12);\n<\/script>\n\n<SolaButton variant="primary" onclick={() => count++}>\n  Trigger Signal ({count})\n</SolaButton>\n<SolaChart type="area" color="emerald" data={signalStream} />`,
    html: `<!-- Web Component Mount (Zero-VDOM) -->\n<script type="module" src="https://cdn.sola-air.dev/sola-ui.js"><\/script>\n\n<sola-button variant="primary">Trigger Signal</sola-button>\n<sola-chart type="area" color="emerald"></sola-chart>`
  };
</script>

<section id="design-system" class="w-full py-20 border-t border-slate-200/80 dark:border-white/[0.04] relative">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Section Header -->
    <div class="text-center max-w-3xl mx-auto mb-12">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold mb-3">
        <span>@sola/ui • Foundational Design System</span>
      </div>
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-4">
        56 Zero-VDOM Primitives. Multi-Framework Portability.
      </h2>
      <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
        From foundation buttons and date pickers to high-frequency telemetry charts and resizable NOC splitters — handcrafted with spring physics and zero virtual DOM diffing.
      </p>
    </div>

    <!-- Main Interactive Design Studio Surface -->
    <div class="bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
      
      <!-- Studio Header / Mode Tabs -->
      <div class="h-14 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 bg-slate-50/70 dark:bg-white/[0.02] gap-2 py-2 sm:py-0">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 mr-2">
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/20"></div>
          </div>
          <span class="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sola Design System Inspector
          </span>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onclick={() => (activeTab = 'components')}
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'components' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}">
            Interactive Primitives
          </button>
          <button
            onclick={() => (activeTab = 'telemetry')}
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'telemetry' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}">
            Telemetry & Charts
          </button>
          <button
            onclick={() => (activeTab = 'tokens')}
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'tokens' ? 'bg-white dark:bg-emerald-500 text-slate-900 dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}">
            Tokens & Signals
          </button>
        </div>
      </div>

      <!-- Main Stage Split -->
      <div class="grid grid-cols-1 lg:grid-cols-12">
        
        <!-- Left: Live Interactive Components Sandbox (7 Cols) -->
        <div class="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5 space-y-6">
          {#if activeTab === 'components'}
            <!-- Primitives Showcase -->
            <div class="space-y-5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Tactile Buttons & Actions</span>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">Spring Physics</span>
              </div>

              <!-- Buttons Row -->
              <div class="flex flex-wrap items-center gap-3">
                <SolaButton variant="primary" label="Primary Action ({buttonCount})" onclick={() => buttonCount++} />
                <SolaButton variant="secondary" label="Secondary" />
                <SolaButton variant="ghost" label="Ghost" />
                <SolaButton variant="destructive" label="Destructive" />
              </div>

              <!-- Date Picker & Kbd Row -->
              <div class="pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <SolaDatePicker range={true} rangeValue={dateRange} label="Date Range Primitive" />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Keyboard Shortcuts</label>
                  <div class="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div class="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Palette:</span>
                      <SolaKbd keys={['⌘', 'K']} size="sm" />
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Save:</span>
                      <SolaKbd keys={['⌘', 'S']} size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Slider & Toggles -->
              <div class="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-700 dark:text-slate-300">Signal Resistance Slider</span>
                  <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{sliderVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  bind:value={sliderVal}
                  class="w-full accent-emerald-500 h-2 bg-slate-100 dark:bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

          {:else if activeTab === 'telemetry'}
            <!-- Telemetry & Visualizations -->
            <div class="space-y-4">
              <SolaChart
                type="area"
                color="emerald"
                title="1,000Hz Ingestion Mesh"
                subtitle="O(1) direct text-node DOM mutation with zero garbage collection"
                height={170}
              />
              <div class="grid grid-cols-2 gap-3 text-xs font-mono">
                <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
                  <span class="text-slate-400 text-[10px] block">Frame Time</span>
                  <span class="text-base font-extrabold text-emerald-600 dark:text-emerald-400">0.32ms</span>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10">
                  <span class="text-slate-400 text-[10px] block">VDOM Diffing Overhead</span>
                  <span class="text-base font-extrabold text-slate-900 dark:text-white">0.00ms</span>
                </div>
              </div>
            </div>

          {:else}
            <!-- Tokens & Theme Systems -->
            <div class="space-y-4">
              <div class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Core Design System Tokens</div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-1">
                  <span class="text-[10px] font-mono text-slate-400 block">Obsidian Dark</span>
                  <span class="text-xs font-bold font-mono text-emerald-400">#090D19</span>
                </div>
                <div class="p-3 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 space-y-1">
                  <span class="text-[10px] font-mono text-slate-500 block">Clean Ivory</span>
                  <span class="text-xs font-bold font-mono text-slate-900">#FAFAFA</span>
                </div>
                <div class="p-3 bg-emerald-500 text-slate-950 rounded-2xl space-y-1">
                  <span class="text-[10px] font-mono text-slate-950/70 block">Neon Emerald</span>
                  <span class="text-xs font-bold font-mono text-slate-950">#10B981</span>
                </div>
                <div class="p-3 bg-sky-500 text-slate-950 rounded-2xl space-y-1">
                  <span class="text-[10px] font-mono text-slate-950/70 block">Signal Sky</span>
                  <span class="text-xs font-bold font-mono text-slate-950">#0EA5E9</span>
                </div>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pre-calculated WCAG AAA mathematical luminance curves ensure pixel-perfect legibility and optical contrast across all 56 components.
              </p>
            </div>
          {/if}
        </div>

        <!-- Right: Multi-Framework Code Exporter (5 Cols) -->
        <div class="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-slate-950 text-slate-100 font-mono text-xs">
          <div>
            <!-- Framework Selector Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Multi-Target Output</span>
              <div class="flex items-center gap-1">
                <button
                  onclick={() => (selectedFramework = 'sola')}
                  class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors {selectedFramework === 'sola' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}">
                  .sola
                </button>
                <button
                  onclick={() => (selectedFramework = 'react')}
                  class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors {selectedFramework === 'react' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}">
                  React 19
                </button>
                <button
                  onclick={() => (selectedFramework = 'svelte')}
                  class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors {selectedFramework === 'svelte' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}">
                  Svelte 5
                </button>
                <button
                  onclick={() => (selectedFramework = 'html')}
                  class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors {selectedFramework === 'html' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}">
                  HTML
                </button>
              </div>
            </div>

            <!-- Code Snippet -->
            <div class="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
              <pre><code>{frameworkSnippets[selectedFramework]}</code></pre>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <span class="text-[10px] text-slate-400">Zero runtime overhead</span>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="/components"
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-xs">
                <span>View All 56 Primitives</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
