<script lang="ts">
  import { page } from '$app/state';
  import { theme } from '$lib/stores/theme.svelte';
  import SolaLogo from './SolaLogo.svelte';
  import AiAssistantModal from './AiAssistantModal.svelte';

  let isAiModalOpen = $state(false);
  let isMobileMenuOpen = $state(false);

  let currentPath = $derived(page.url.pathname);
</script>

<svelte:window onkeydown={(e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    isAiModalOpen = true;
  }
}} />

<header class="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#090d19]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-colors duration-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
    
    <!-- Logo & Version -->
    <div class="flex items-center gap-6">
      <a href="/" class="flex items-center gap-2.5 group">
        <SolaLogo size={30} animated={false} />
        <div class="flex items-center gap-2">
          <span class="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">Sola</span>
          <span class="text-[10px] font-mono font-bold tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">v0.9</span>
        </div>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-1">
        <a 
          href="/" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath === '/' ? 'bg-amber-500/10 text-amber-900 dark:text-amber-400 font-bold border border-amber-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent'}">
          Overview
        </a>
        <a 
          href="/studio" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/studio') ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent'}">
          Studio
        </a>
        <a 
          href="/community" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/community') ? 'bg-violet-500/10 text-violet-900 dark:text-violet-400 font-bold border border-violet-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent'}">
          Community
        </a>
        <a 
          href="/components" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/components') ? 'bg-amber-500/10 text-amber-900 dark:text-amber-400 font-bold border border-amber-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent'}">
          Components
        </a>
        <a 
          href="/preview" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/preview') ? 'bg-sky-500/10 text-sky-900 dark:text-sky-400 font-bold border border-sky-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent'}">
          Extension
        </a>
        <a 
          href="/docs" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/docs') ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent'}">
          Docs
        </a>
      </nav>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Arc Search Trigger -->
      <button 
        type="button"
        onclick={() => isAiModalOpen = true}
        class="flex items-center justify-between w-auto sm:w-56 h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs group">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" stroke-dasharray="4 4"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
          <span class="font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">Ask Sola Arc...</span>
          <span class="font-medium text-slate-700 dark:text-slate-300 sm:hidden">Arc</span>
        </div>
        <kbd class="hidden sm:inline text-[10px] font-mono bg-slate-200/60 dark:bg-white/10 border border-slate-300/60 dark:border-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold">⌘K</kbd>
      </button>

      <!-- Theme Toggle -->
      <button 
        type="button"
        onclick={() => theme.toggle()}
        class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer" 
        aria-label="Toggle Theme">
        {#if theme.isDark}
          <!-- Sun -->
          <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
        {:else}
          <!-- Moon -->
          <svg class="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        {/if}
      </button>

      <!-- GitHub -->
      <a 
        href="https://github.com/Rbm3267/sola" 
        target="_blank" 
        rel="noreferrer" 
        class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all" 
        aria-label="GitHub Repository">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>

      <!-- Mobile Menu Toggle -->
      <button 
        type="button"
        onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
        class="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer"
        aria-label="Toggle mobile menu">
        {#if isMobileMenuOpen}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Drawer -->
  {#if isMobileMenuOpen}
    <div class="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#090d19]/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-lg">
      <a 
        href="/" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath === '/' ? 'bg-amber-500/10 text-amber-900 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
        <span>Overview</span>
      </a>
      <a 
        href="/studio" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/studio') ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
        <span>Studio</span>
      </a>
      <a 
        href="/community" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/community') ? 'bg-violet-500/10 text-violet-900 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
        <span>Community</span>
      </a>
      <a 
        href="/components" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/components') ? 'bg-amber-500/10 text-amber-900 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
        <span>Components</span>
      </a>
      <a 
        href="/preview" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/preview') ? 'bg-sky-500/10 text-sky-900 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
        <span>Extension</span>
      </a>
      <a 
        href="/docs" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/docs') ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}">
        <span>Documentation</span>
      </a>
    </div>
  {/if}
</header>

<AiAssistantModal bind:isOpen={isAiModalOpen} />
