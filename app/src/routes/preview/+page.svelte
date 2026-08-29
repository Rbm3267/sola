<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { fade, slide } from 'svelte/transition';

  let currentStep = $state(1);
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#090d19] dark:via-[#0f172a] dark:to-[#090d19] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
  <Navbar />

  <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-16 lg:gap-24">
    
    <!-- Hero Section -->
    <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
      
      <!-- Text Content -->
      <div class="flex-1 flex flex-col items-start text-left max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold mb-6 shadow-xs">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Sola Extension v0.9.0
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Preview Zero-VDOM components on your <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">live UI.</span>
        </h1>
        
        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
          The Sola Chrome Extension uses a lightweight Manifest V3 architecture to programmatically inject 
          interactive Sola UI components directly over any active web application via isolated Shadow DOM. No broad permissions required.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a href="#" class="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 group cursor-pointer text-sm">
            <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            Install Extension
          </a>
          <a href="https://github.com/Rbm3267/sola/tree/main/packages/sola-extension" target="_blank" class="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-[#0f172a] dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 rounded-2xl font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            View Source
          </a>
        </div>
      </div>

      <!-- Hero Visual (Interactive Step Graphic) -->
      <div class="flex-1 w-full max-w-lg relative perspective-1000">
        <div class="relative bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 overflow-hidden">
          <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500"></div>
          
          <h3 class="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Installation Guide</h3>
          
          <div class="space-y-4">
            <!-- Step 1 -->
            <button onclick={() => currentStep = 1} class="w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all border {currentStep === 1 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'} cursor-pointer">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 {currentStep === 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">1</div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Add to Chrome</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Click the button above to securely install the official Sola extension directly from the Chrome Web Store.</p>
              </div>
            </button>
            
            <!-- Step 2 -->
            <button onclick={() => currentStep = 2} class="w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all border {currentStep === 2 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'} cursor-pointer">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 {currentStep === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">2</div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Open Target Web App</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Navigate to your localhost environment, preview deployment, or a live SaaS dashboard.</p>
              </div>
            </button>
            
            <!-- Step 3 -->
            <button onclick={() => currentStep = 3} class="w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all border {currentStep === 3 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'} cursor-pointer">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 {currentStep === 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">3</div>
              <div>
                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm">Inject via Sidepanel</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Click the Sola extension icon in your browser toolbar to mount the ambient widgets.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Testing Ground (Replaces the Mock UI frames) -->
    <div class="flex flex-col gap-6 pt-10 border-t border-slate-200 dark:border-white/10">
      <div class="text-center max-w-2xl mx-auto mb-4">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Test the Extension Right Here.</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Once you have installed the Chrome extension, simply click the Sola sun icon in your browser's toolbar while viewing this page. 
          The extension will programmatically inject the Sola HUD overlay directly into this generic dashboard below.
        </p>
      </div>

      <!-- Generic Dashboard Container -->
      <div class="relative bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <!-- Dashboard Header -->
        <div class="h-14 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50 dark:bg-[#090d19]">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">GD</div>
            <span class="font-bold text-sm text-slate-800 dark:text-slate-200">Generic Dashboard App</span>
          </div>
          <div class="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span class="hidden sm:inline">Analytics</span>
            <span class="hidden sm:inline">Settings</span>
            <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div class="flex-1 p-6 sm:p-10 bg-slate-100/50 dark:bg-[#0b1021]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Fake Stat Card 1 -->
            <div class="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Total Monthly Active Users</div>
              <div class="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">1.24M</div>
            </div>
            <!-- Fake Stat Card 2 -->
            <div class="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Platform Revenue</div>
              <div class="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">$842.1K</div>
            </div>
            <!-- Fake Stat Card 3 -->
            <div class="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">API Error Rate</div>
              <div class="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">2.4%</div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 rounded-2xl p-6 min-h-[250px] shadow-sm flex flex-col items-center justify-center text-center">
            <svg class="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-1">Waiting for Extension Injection</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Click the Sola Chrome Extension button in your toolbar to see the live Shadow DOM widgets instantly appear inside this application view.
            </p>
          </div>
        </div>
      </div>
    </div>

  </main>
</div>
