<script lang="ts">
  import { themeState, updateTheme } from '$lib/theme.svelte';
  import InteractiveHero from '$lib/components/InteractiveHero.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
  
  let selectedColor = $state('#0ea5e9'); // Default Sky

  function handleColorChange(e: Event) {
    const target = e.target as HTMLInputElement;
    selectedColor = target.value;
    updateTheme(selectedColor);
  }
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900 overflow-x-hidden relative">
  
  <!-- Ambient Glow -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-b from-sky-100/40 to-transparent blur-[100px] rounded-full pointer-events-none"></div>
  
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-6 md:pt-10">
    
    <!-- Header / Nav -->
    <header class="w-full flex justify-between items-center mb-8 md:mb-16 bg-white/70 backdrop-blur-xl border border-slate-200/60 px-6 py-4 rounded-2xl shadow-sm">
      <div class="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter"><img src="/logo.png" alt="Sola Logo" class="w-12 h-12 object-contain drop-shadow-md -ml-1" /></div>
      
      <div class="hidden md:flex items-center gap-8">
        <a href="https://github.com" class="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors duration-150">Documentation</a>
        <a href="/demo" class="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors duration-150">Playground</a>
      </div>
      
      <div class="flex items-center gap-4">
        <a href="/demo" class="text-sm font-bold text-white bg-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors duration-150 flex items-center gap-2 shadow-md">
          Try Sola
        </a>
      </div>
    </header>

    <InteractiveHero />

    <!-- Interactive Demo section -->
    <section class="w-full mt-32 md:mt-48 grid lg:grid-cols-2 gap-16 pb-32 items-center relative z-10">
      
      <!-- Theme Generator Card -->
      <div class="bg-white border border-slate-200/60 rounded-3xl shadow-lg overflow-hidden flex flex-col group">
        <!-- Window Header -->
        <div class="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50/50">
          <div class="w-3.5 h-3.5 rounded-full bg-slate-300 group-hover:bg-red-400 transition-colors duration-150"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-slate-300 group-hover:bg-yellow-400 transition-colors duration-150"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-slate-300 group-hover:bg-green-400 transition-colors duration-150"></div>
          <div class="ml-4 text-[11px] font-mono text-slate-400 tracking-widest font-semibold uppercase">theme.sola.ts</div>
        </div>

        <div class="p-8 md:p-12">
          <h2 class="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Design Engine</h2>
          <p class="text-slate-500 text-base leading-relaxed mb-10 font-medium">
            Pick a single brand color. Sola's <code class="text-slate-700 font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-md border border-slate-200 font-bold">chroma-js</code> engine calculates WCAG-safe contrasts, generating high-density, enterprise-grade data surfaces on the fly.
          </p>

          <div class="flex flex-col gap-4">
            <label for="brand-color" class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Brand Color</label>
            <div class="flex items-center gap-5">
              <input 
                id="brand-color"
                type="color" 
                bind:value={selectedColor}
                oninput={handleColorChange}
                class="w-16 h-16 rounded-xl cursor-pointer border border-slate-200 bg-white p-1.5 shadow-sm" 
              />
              <div class="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <span class="text-slate-800 font-mono text-lg font-bold">{selectedColor.toUpperCase()}</span>
                <span class="text-xs font-bold bg-white text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">WCAG AA</span>
              </div>
            </div>
          </div>
          
          <!-- Color Palette Preview -->
          <div class="mt-10 grid grid-cols-3 gap-6">
            <div class="flex flex-col gap-3">
              <div class="h-12 rounded-xl bg-brand-bg border border-slate-200"></div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Background</span>
            </div>
            <div class="flex flex-col gap-3">
              <div class="h-12 rounded-xl bg-brand-card border border-slate-200 shadow-sm"></div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Surface</span>
            </div>
            <div class="flex flex-col gap-3">
              <div class="h-12 rounded-xl bg-brand-accent border border-slate-200 shadow-sm"></div>
              <span class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Accent</span>
            </div>
          </div>
        </div>
      </div>

            <!-- Components Showcase -->
      <div class="flex flex-col justify-center px-2 md:px-8 mt-16 md:mt-0 lg:col-span-2">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">World-Class UI Primitives</h2>
          <p class="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Sola ships with an incredibly polished, handcrafted design system. These primitives compile to zero-dependency vanilla DOM — no runtime overhead.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          
          <!-- Data Card Demo -->
          <div class="flex flex-col gap-4">
            <h3 class="font-bold text-slate-400 uppercase tracking-widest text-xs pl-2">DataCard.sola</h3>
            <div class="pointer-events-none">
              <DataCard config={{ title: "Total Users", value: "84,320", trend: "+12.5%", icon: "activity" }} />
            </div>
            <div class="pointer-events-none mt-2">
              <DataCard config={{ title: "Conversion Rate", value: "4.2%", trend: "-1.1%", icon: "laptop" }} />
            </div>
          </div>

          <!-- Dynamic Form Demo -->
          <div class="flex flex-col gap-4">
            <h3 class="font-bold text-slate-400 uppercase tracking-widest text-xs pl-2">DynamicForm.sola</h3>
            <div class="pointer-events-none">
              <DynamicForm config={{ 
                title: "Provision Database", 
                endpoint: "/api/provision", 
                fields: [
                  { name: "cluster", label: "Cluster Name", type: "text", required: true },
                  { name: "region", label: "Region (e.g. us-east)", type: "text", required: true }
                ] 
              }} />
            </div>
          </div>

          <!-- List Block Demo -->
          <div class="flex flex-col gap-4">
            <h3 class="font-bold text-slate-400 uppercase tracking-widest text-xs pl-2">ListBlock.sola</h3>
            <div class="pointer-events-none">
              <ListBlock config={{ 
                title: "Recent Deployments", 
                items: [
                  { label: "Sola-web-v2.1", description: "Deployed 2 mins ago", status: "Active" },
                  { label: "postgres-cluster", description: "Provisioned 1 hr ago", status: "Active" },
                  { label: "redis-cache", description: "Maintenance mode", status: "Offline" }
                ] 
              }} />
            </div>
          </div>

        </div>
      </div></section>
  </div>
</div>
