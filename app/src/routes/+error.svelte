<script lang="ts">
  import { page } from '$app/state';
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
  <title>Page Not Found • Sola</title>
</svelte:head>

<div class="min-h-screen bg-white dark:bg-[#090d19] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
  <Navbar />

  <!-- Soft Ambient Glow -->
  <div class="absolute top-0 inset-x-0 h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.06),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.1),rgba(9,13,25,0))] pointer-events-none"></div>

  <main class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-xl mx-auto space-y-6">
    
    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-mono text-xs font-bold">
      <span>Error {page.status || 404}</span>
    </div>

    <h1 class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
      {page.status === 404 ? 'Page Not Found' : 'Something went wrong'}
    </h1>

    <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
      {page.error?.message || "The reactive component or route you requested could not be located in the Sola runtime."}
    </p>

    <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
      <a
        href="/"
        class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
        ← Return Home
      </a>
      <a
        href="/studio"
        class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer">
        Launch Studio Canvas
      </a>
      <a
        href="/docs"
        class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
        Explore Documentation
      </a>
    </div>

  </main>
</div>
