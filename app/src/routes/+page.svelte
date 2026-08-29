<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import InteractiveHero from '$lib/components/InteractiveHero.svelte';
  import SheetsDemo from '$lib/components/SheetsDemo.svelte';
  import DesignEngineStudio from '$lib/components/DesignEngineStudio.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  import GaugeCard from '$lib/components/GaugeCard.svelte';
  import TactileDialCard from '$lib/components/TactileDialCard.svelte';
  import FlowWaterfall from '$lib/components/FlowWaterfall.svelte';
</script>

<div class="flex flex-col w-full">
  <Navbar />
  
  <!-- Precision Monochromatic Grid Texture -->
  <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>
  
  <div class="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col pt-4 w-full max-w-full overflow-x-hidden">

    <!-- Universal Interactive Hero -->
    <InteractiveHero />

    <!-- THE 3 CORE PILLARS SECTION -->
    <section class="w-full py-16 relative">
      <div class="text-center max-w-3xl mx-auto mb-14">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold mb-3">
          <span>The Sola Ecosystem</span>
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-4">
          From Idea to Live Browser Overlay Production in Seconds
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Three interconnected pillars built to design, preview, and share zero-VDOM reactive components across personal projects and global enterprise platforms.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Pillar 1: Sola Design Studio -->
        <div class="p-7 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-6 group">
          <div class="flex flex-col gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 dark:hover:text-emerald-400 dark:text-emerald-400 transition-colors">
              Sola Design Studio
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generative AI engine that builds complete UIs from natural language prompts, raw CSV/JSON datasets, or legacy code. Test live signals and export to .sola, React 19, or Svelte 5.
            </p>
          </div>
          <a href="/studio" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 group-hover:translate-x-1 transition-all">
            <span>Launch Studio</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Pillar 2: Chrome Browser Extension -->
        <div class="p-7 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] shadow-sm hover:shadow-xl hover:border-sky-500/40 transition-all flex flex-col justify-between gap-6 group">
          <div class="flex flex-col gap-3">
            <div class="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-950 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 dark:hover:text-sky-400 dark:text-sky-400 transition-colors">
              "View in My UI" Extension
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manifest V3 Chrome extension that injects a closed Shadow DOM sandbox on any active web app. Preview the "art of the possible" directly on your live tools with zero CSS collisions.
            </p>
          </div>
          <a href="/preview" class="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 group-hover:translate-x-1 transition-all">
            <span>Try in Simulator</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

        <!-- Pillar 3: Sola Design Community -->
        <div class="p-7 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] shadow-sm hover:shadow-xl hover:border-violet-500/40 transition-all flex flex-col justify-between gap-6 group">
          <div class="flex flex-col gap-3">
            <div class="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-950 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 dark:hover:text-violet-400 dark:text-violet-400 transition-colors">
              Sola Design Community
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Open component registry and preset showcase across 5 universal tiers (Personal, SaaS, FinOps, Telemetry, Operations). 1-click fork into Studio or push to your browser extension.
            </p>
          </div>
          <a href="/community" class="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-400 hover:text-violet-900 dark:hover:text-violet-300 group-hover:translate-x-1 transition-all">
            <span>Explore Community</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>

      </div>
    </section>

    <!-- Google Sheets & Data Relay Interactive Section -->
    <SheetsDemo />

    <!-- Centered Full-Width Dynamic Design Studio -->
    <DesignEngineStudio />

    <!-- Handcrafted Architecture Section -->
    <section class="w-full pb-32 relative z-10">

      <!-- Components Showcase -->
      <div id="architecture" class="flex flex-col justify-center px-2 md:px-4 mt-20 lg:col-span-2">
        <div class="text-center mb-14">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20/60 text-sky-700 dark:text-sky-400 text-xs font-mono font-bold mb-4">
            <span>@sola/ui • Native Component Primitives</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-4">Handcrafted UI Architecture</h2>
          <p class="text-lg text-slate-600 dark:text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            Sola primitives compile directly into reactive vanilla DOM nodes with scoped styles and zero virtual DOM diffing.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          <!-- Data Card Demo -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span class="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">DataCard.sola</span>
              <span class="text-[10px] font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded font-bold border border-sky-100">Compiled DOM</span>
            </div>
            <div class="flex flex-col gap-3.5">
              <DataCard config={{ title: "Realized MRR", value: "$184,200", trend: "+14.2%", icon: "activity" }} />
              <DataCard config={{ title: "Net Retention", value: "138%", trend: "+6.2%", icon: "trending-up" }} />
            </div>
          </div>

          <!-- Dynamic Form Demo -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span class="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">DynamicForm.sola</span>
              <span class="text-[10px] font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded font-bold border border-violet-100">Live Schema</span>
            </div>
            <div>
              <DynamicForm config={{ 
                title: "Scale Connection Pool", 
                endpoint: "/api/provision", 
                fields: [
                  { name: "cluster", label: "Cluster Name", type: "text", required: true },
                  { name: "capacity", label: "Max Capacity (Nodes)", type: "number", required: true }
                ] 
              }} />
            </div>
          </div>

          <!-- List Block Demo -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span class="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">ListBlock.sola</span>
              <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-100">Signal List</span>
            </div>
            <div>
              <ListBlock config={{ 
                title: "Active Clusters", 
                items: [
                  { label: "cluster-us-east-1", description: "32 Nodes • Optimal", status: "Active" },
                  { label: "postgres-primary", description: "Lag: 0ms • Synchronized", status: "Active" },
                  { label: "edge-cdn-pop", description: "p99 Latency: 4.2ms", status: "Completed" }
                ] 
              }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</div>
