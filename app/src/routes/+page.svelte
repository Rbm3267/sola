<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import InteractiveHero from '$lib/components/InteractiveHero.svelte';
  import SheetsDemo from '$lib/components/SheetsDemo.svelte';
  import DesignEngineStudio from '$lib/components/DesignEngineStudio.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import DynamicForm from '$lib/components/DynamicForm.svelte';
  import ListBlock from '$lib/components/ListBlock.svelte';
</script>

<div class="min-h-screen bg-[#fafafa] text-slate-950 font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden relative">
  <Navbar />
  
  <!-- Precision Monochromatic Grid Texture -->
  <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>
  
  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pt-4">

    <InteractiveHero />

    <!-- Google Sheets & Data Relay Interactive Section -->
    <SheetsDemo />

    <!-- Centered Full-Width Dynamic Design Studio -->
    <DesignEngineStudio />

    <!-- Handcrafted Architecture Section -->
    <section class="w-full pb-32 relative z-10">

      <!-- Components Showcase -->
      <div id="architecture" class="flex flex-col justify-center px-2 md:px-4 mt-20 lg:col-span-2">
        <div class="text-center mb-14">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-sky-700 text-xs font-mono font-bold mb-4">
            <span>@sola/ui • Native Component Primitives</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-slate-950 tracking-tight mb-4">Handcrafted UI Architecture</h2>
          <p class="text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Sola primitives compile directly into reactive vanilla DOM nodes with scoped styles and zero virtual DOM diffing.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          <!-- Data Card Demo -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span class="font-mono text-xs font-bold text-slate-500">DataCard.sola</span>
              <span class="text-[10px] font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded font-bold border border-sky-100">Compiled DOM</span>
            </div>
            <div class="flex flex-col gap-3.5">
              <DataCard config={{ title: "Total Users", value: "84,320", trend: "+12.5%", icon: "activity" }} />
              <DataCard config={{ title: "Conversion Rate", value: "4.2%", trend: "-1.1%", icon: "trending-up" }} />
            </div>
          </div>

          <!-- Dynamic Form Demo -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span class="font-mono text-xs font-bold text-slate-500">DynamicForm.sola</span>
              <span class="text-[10px] font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-bold border border-violet-100">Live Intent</span>
            </div>
            <div>
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
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-2">
              <span class="font-mono text-xs font-bold text-slate-500">ListBlock.sola</span>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">Signal List</span>
            </div>
            <div>
              <ListBlock config={{ 
                title: "Active Clusters", 
                items: [
                  { label: "sola-core-v2.1", description: "us-east-1 • 2 mins ago", status: "Active" },
                  { label: "postgres-primary", description: "us-west-2 • 1 hr ago", status: "Active" },
                  { label: "redis-cache-eu", description: "eu-central-1 • Maintenance", status: "Offline" }
                ] 
              }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</div>
