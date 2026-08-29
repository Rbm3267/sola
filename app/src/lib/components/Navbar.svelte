<script lang="ts">
  import Button from '$lib/components/primitives/Button.svelte';
  import Badge from '$lib/components/primitives/Badge.svelte';
  import { page } from '$app/stores';
  import SolaLogo from './SolaLogo.svelte';
  import AiAssistantModal from './AiAssistantModal.svelte';
  import { theme } from '$lib/stores/theme.svelte';

  let currentPath = $derived($page.url.pathname);
  let isAiModalOpen = $state(false);
  let isMobileMenuOpen = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isAiModalOpen = !isAiModalOpen;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<AiAssistantModal bind:isOpen={isAiModalOpen} />

<header class="w-full sticky top-0 z-50 bg-white dark:bg-white/[0.02] backdrop-blur-2xl border-b border-slate-200 dark:border-white/[0.04] transition-all">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Brand Mark -->
    <div class="flex items-center gap-6 sm:gap-8">
      <a href="/" class="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-decoration-none">
        <SolaLogo size="sm" spinning={true} showGlow={false} />
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="text-xl font-black text-slate-950 dark:text-slate-50 dark:text-white tracking-tight font-sans">Sola</span>
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700  bg-slate-100 dark:bg-white/[0.08] dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] px-2 py-0.5 rounded-full">v0.9</span>
        </div>
      </a>

      <!-- Desktop Primary Nav Tabs -->
      <nav class="hidden md:flex items-center gap-1.5">
        <a 
          href="/" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath === '/' ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-50 dark:bg-white/[0.04] border border-transparent'}">
          Overview
        </a>
        <a 
          href="/studio" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/studio') ? 'text-emerald-950 dark:text-emerald-400 bg-emerald-500/10 font-bold border border-emerald-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-50 dark:bg-white/[0.04] border border-transparent'}">
          Studio
        </a>
        <a 
          href="/community" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/community') ? 'text-violet-950 dark:text-violet-400 bg-violet-500/10 font-bold border border-violet-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-50 dark:bg-white/[0.04] border border-transparent'}">
          Community
        </a>
        <a 
          href="/components" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/components') ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-50 dark:bg-white/[0.04] border border-transparent'}">
          Components
        </a>
        <a 
          href="/preview" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/preview') ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-50 dark:bg-white/[0.04] border border-transparent'}">
          View in My UI
        </a>
        <a 
          href="/docs" 
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/docs') ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-50 dark:bg-white/[0.04] border border-transparent'}">
          Docs
        </a>
      </nav>
    </div>

    <!-- Right Utility Area -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- AI Ask Command Button -->
      <Button 
        type="button"
        onclick={() => isAiModalOpen = true}
        class="flex items-center justify-between w-auto sm:w-60 md:w-64 h-9 sm:h-10 px-3 sm:px-4 rounded-2xl border border-slate-200 dark:border-white/[0.04] bg-white dark:bg-white/[0.02] backdrop-blur-md text-xs font-medium text-slate-500  hover:border-amber-400 hover:bg-white dark:bg-white/[0.02] hover:text-slate-900 dark:text-white transition-all cursor-pointer shadow-xs group">
        <div class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 dark:hover:text-emerald-400 dark:text-emerald-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><circle cx="12" cy="12" r="9" stroke-dasharray="4 4"/></svg>
          <span class="font-medium text-slate-700  hidden sm:inline">Ask Sola Arc...</span>
          <span class="font-medium text-slate-700  sm:hidden">Arc</span>
        </div>
        <kbd class="hidden sm:inline text-[10px] font-mono bg-slate-100 dark:bg-white/[0.08] dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] px-1.5 py-0.5 rounded text-slate-500  font-bold group-hover:bg-emerald-50 dark:bg-emerald-500/10 group-hover:text-emerald-900 dark:hover:text-emerald-300 group-hover:border-emerald-200 dark:border-emerald-500/20 transition-colors">⌘K</kbd>
      </Button>

      <!-- Theme Toggle -->
      <Button 
        type="button"
        onclick={() => theme.toggle()}
        class="p-2 text-slate-500  hover:text-slate-950 dark:text-slate-50 dark:hover:text-white hover:bg-slate-100 dark:bg-white/[0.08] dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer" 
        aria-label="Toggle Theme">
        {#if theme.isDark}
          <!-- Sun Icon -->
          <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
        {:else}
          <!-- Moon Icon -->
          <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        {/if}
      </Button>

      <!-- GitHub Link -->
      <a 
        href="https://github.com/Rbm3267/sola" 
        target="_blank" 
        rel="noreferrer" 
        class="p-2 text-slate-500  hover:text-slate-950 dark:text-slate-50 dark:text-white hover:bg-slate-100 dark:bg-white/[0.08] dark:bg-white/[0.08] rounded-xl transition-all" 
        aria-label="GitHub Repository">
        <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>

      <!-- Mobile Hamburger Button -->
      <Button 
        type="button"
        onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
        class="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:text-white hover:bg-slate-100 dark:bg-white/[0.08] dark:bg-white/[0.08] rounded-xl transition-all cursor-pointer"
        aria-label="Toggle mobile menu">
        {#if isMobileMenuOpen}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        {/if}
      </Button>
    </div>

  </div>

  <!-- Mobile Dropdown Navigation Drawer -->
  {#if isMobileMenuOpen}
    <div class="md:hidden border-t border-slate-200 dark:border-white/[0.04] bg-white dark:bg-white/[0.02] backdrop-blur-2xl px-4 py-3 space-y-1 shadow-lg animate-in">
      <a 
        href="/" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath === '/' ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 dark:bg-white/[0.04]'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
        <span>Overview</span>
      </a>
      <a 
        href="/studio" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/studio') ? 'text-emerald-950 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 dark:bg-white/[0.04]'}">
        <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span>Design Studio</span>
      </a>
      <a 
        href="/community" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/community') ? 'text-violet-950 dark:text-violet-400 bg-violet-500/10 border border-violet-500/25' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 dark:bg-white/[0.04]'}">
        <svg class="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        <span>Community Registry</span>
      </a>
      <a 
        href="/components" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/components') ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 dark:bg-white/[0.04]'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Component Library</span>
      </a>
      <a 
        href="/preview" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/preview') ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 dark:bg-white/[0.04]'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <span>View in My UI</span>
      </a>
      <a 
        href="/docs" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/docs') ? 'text-amber-950 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5 dark:bg-white/[0.04]'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
        <span>Interactive Docs</span>
      </a>
    </div>
  {/if}
</header>
