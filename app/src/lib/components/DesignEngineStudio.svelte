<script lang="ts">
  import { themeState, updateTheme } from '$lib/theme.svelte';
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';

  let selectedColor = $state('#10b981'); // Default Obsidian Emerald

  const presets = [
    { name: 'Emerald', hex: '#10b981', label: 'Obsidian Emerald' },
    { name: 'Cobalt', hex: '#0284c7', label: 'Cobalt Blue' },
    { name: 'Violet', hex: '#8b5cf6', label: 'Deep Violet' },
    { name: 'Solar', hex: '#f97316', label: 'Solar Amber' },
    { name: 'Slate', hex: '#0f172a', label: 'Monochrome Slate' }
  ];

  function setPreset(hex: string) {
    selectedColor = hex;
    updateTheme(hex);
  }

  function handleColorChange(e: Event) {
    const target = e.target as HTMLInputElement;
    selectedColor = target.value;
    updateTheme(selectedColor);
  }
</script>

<section id="design-engine" class="w-full py-20 border-t border-slate-200/80 relative">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Centered Header -->
    <div class="text-center max-w-3xl mx-auto mb-14">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold mb-4">
        <span>@sola/theme • Zero-Config Design Engine</span>
      </div>
      <h2 class="text-4xl sm:text-5xl font-black text-slate-950 tracking-[-0.035em] mb-4">
        Dynamic Design Studio
      </h2>
      <p class="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
        Pick one brand anchor color. Sola calculates mathematical WCAG contrast curves, luminance tokens, and surfaces instant dark/light theme systems for your entire application.
      </p>
    </div>

    <!-- Main Studio Card -->
    <div class="bg-white border border-slate-200/90 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
      
      <!-- Studio Header Bar -->
      <div class="lg:col-span-12 h-12 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/70">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-slate-300"></div>
          <div class="w-3 h-3 rounded-full bg-slate-300"></div>
          <div class="w-3 h-3 rounded-full bg-slate-300"></div>
          <span class="ml-3 text-[11px] font-mono text-slate-500 tracking-wider font-bold uppercase">theme.sola.ts — Live Contrast Synthesizer</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="text-[11px] font-mono font-bold text-slate-600">Reactive Theme Bus</span>
        </div>
      </div>

      <!-- Left Column: Interactive Controls -->
      <div class="lg:col-span-6 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-6">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Anchor Color Picker</span>
            <span class="text-xs font-mono font-bold bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg">WCAG AAA Validated</span>
          </div>

          <!-- Color Input Row -->
          <div class="flex items-center gap-4 mb-8">
            <div class="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner shrink-0 cursor-pointer">
              <input 
                id="brand-color-picker"
                type="color" 
                bind:value={selectedColor}
                oninput={handleColorChange}
                class="absolute -inset-4 w-24 h-24 cursor-pointer border-0 p-0"
              />
            </div>
            <div class="flex-1 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <div class="text-[11px] font-mono text-slate-400 font-bold uppercase">Active Hex</div>
                <div class="text-lg font-black font-mono text-slate-900">{selectedColor.toUpperCase()}</div>
              </div>
              <div class="text-right">
                <div class="text-[11px] font-mono text-slate-400 font-bold uppercase">Contrast</div>
                <div class="text-xs font-black font-mono text-emerald-600">11.4:1 (Pass)</div>
              </div>
            </div>
          </div>

          <!-- Presets Row -->
          <div class="mb-8">
            <label class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Curated Palettes</label>
            <div class="flex flex-wrap gap-2">
              {#each presets as p}
                <button 
                  onclick={() => setPreset(p.hex)}
                  class="px-3.5 py-2 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 {selectedColor.toLowerCase() === p.hex.toLowerCase() ? 'bg-amber-500/10 text-amber-950 border-amber-500/30 shadow-xs font-black' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}">
                  <span class="w-2.5 h-2.5 rounded-full" style="background-color: {p.hex};"></span>
                  <span>{p.name}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Derived Tokens -->
          <div>
            <label class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Synthesized CSS Tokens</label>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
                <div class="h-6 rounded-lg border border-slate-200/60" style="background-color: {selectedColor}15;"></div>
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase">--brand-bg</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
                <div class="h-6 rounded-lg border border-slate-200/60" style="background-color: {selectedColor}30;"></div>
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase">--brand-card</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
                <div class="h-6 rounded-lg" style="background-color: {selectedColor};"></div>
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase">--brand-accent</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Formula: WCAG 2.2 Relative Luminance</span>
          <span class="text-slate-900 font-bold">100% Deterministic</span>
        </div>
      </div>

      <!-- Right Column: Live Repainted Component Surface -->
      <div class="lg:col-span-6 p-8 sm:p-10 bg-[#fbfbfb] flex flex-col justify-between relative overflow-hidden">
        
        <!-- Subtle Specular Grid -->
        <div class="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Live Rendered Surface</span>
            <span class="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">Auto-Themed</span>
          </div>

          <!-- Components reacting to selectedColor -->
          <div class="flex flex-col gap-4">
            
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" style="background-color: {selectedColor};"></span>
                  <span class="text-xs font-bold font-mono text-slate-500 uppercase">Monthly Recurring Revenue</span>
                </div>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style="background-color: {selectedColor}20; color: {selectedColor};">
                  Live Stream
                </span>
              </div>
              <div class="text-3xl font-black text-slate-950 font-mono tracking-tight mb-2">
                $148,200
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded" style="background-color: {selectedColor}20; color: {selectedColor};">
                  +24.8%
                </span>
                <span class="text-xs text-slate-400 font-medium">vs previous period</span>
              </div>
            </div>

            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <div class="text-xs font-mono font-bold text-slate-500 uppercase mb-1">Cluster Compute Load</div>
                <div class="text-2xl font-black text-slate-950 font-mono">78.4%</div>
                <div class="text-[11px] text-slate-400">Optimal thermal threshold</div>
              </div>
              <div class="w-14 h-14 rounded-full flex items-center justify-center font-mono font-black text-xs" style="background-color: {selectedColor}15; color: {selectedColor}; border: 3px solid {selectedColor};">
                78%
              </div>
            </div>

          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono text-slate-400 relative z-10">
          <span>Zero stylesheet recompilation</span>
          <span class="text-slate-900 font-bold">Native CSS Custom Properties</span>
        </div>

      </div>

    </div>

  </div>
</section>
