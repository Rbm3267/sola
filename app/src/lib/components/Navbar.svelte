<script lang="ts">
  import { page } from '$app/stores';
  import SolaLogo from './SolaLogo.svelte';
  import AiAssistantModal from './AiAssistantModal.svelte';

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

<header class="w-full sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 transition-all">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Brand Mark -->
    <div class="flex items-center gap-6 sm:gap-8">
      <a href="/" class="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-decoration-none">
        <SolaLogo size="sm" spinning={true} showGlow={false} />
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="text-xl font-black text-slate-950 tracking-tight font-sans">Sola</span>
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-full">v0.9</span>
        </div>
      </a>

      <!-- Desktop Primary Nav Tabs -->
      <nav class="hidden md:flex items-center gap-1.5">
        <a 
          href="/" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath === '/' ? 'text-amber-950 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}">
          Overview
        </a>
        <a 
          href="/components" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/components') ? 'text-amber-950 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}">
          Component Library
        </a>
        <a 
          href="/docs" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/docs') ? 'text-amber-950 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}">
          Interactive Docs
        </a>
        <a 
          href="/preview" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/preview') ? 'text-amber-950 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}">
          View on My UI
        </a>
        <a 
          href="/demo" 
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all {currentPath.startsWith('/demo') ? 'text-amber-950 bg-amber-500/10 font-bold border border-amber-500/25 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}">
          Studio Playground
        </a>
      </nav>
    </div>

    <!-- Right Utility Area -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- AI Ask Command Button -->
      <button 
        type="button"
        onclick={() => isAiModalOpen = true}
        class="flex items-center justify-between w-auto sm:w-60 md:w-64 h-9 sm:h-10 px-3 sm:px-4 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md text-xs font-medium text-slate-500 hover:border-amber-400 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-xs group">
        <div class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          <span class="font-medium text-slate-700 hidden sm:inline">Ask Sola AI...</span>
          <span class="font-medium text-slate-700 sm:hidden">Ask AI</span>
        </div>
        <kbd class="hidden sm:inline text-[10px] font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold group-hover:bg-amber-50 group-hover:text-amber-900 group-hover:border-amber-200 transition-colors">⌘K</kbd>
      </button>

      <!-- GitHub Link -->
      <a 
        href="https://github.com/Rbm3267/sola" 
        target="_blank" 
        rel="noreferrer" 
        class="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all" 
        aria-label="GitHub Repository">
        <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>

      <!-- Mobile Hamburger Button -->
      <button 
        type="button"
        onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
        class="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
        aria-label="Toggle mobile menu">
        {#if isMobileMenuOpen}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        {/if}
      </button>
    </div>

  </div>

  <!-- Mobile Dropdown Navigation Drawer -->
  {#if isMobileMenuOpen}
    <div class="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-2xl px-4 py-3 space-y-1 shadow-lg animate-in">
      <a 
        href="/" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath === '/' ? 'text-amber-950 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
        <span>Overview</span>
      </a>
      <a 
        href="/components" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/components') ? 'text-amber-950 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Component Library</span>
      </a>
      <a 
        href="/docs" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/docs') ? 'text-amber-950 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
        <span>Interactive Docs</span>
      </a>
      <a 
        href="/preview" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/preview') ? 'text-amber-950 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <span>View on My UI</span>
      </a>
      <a 
        href="/demo" 
        onclick={() => isMobileMenuOpen = false}
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all {currentPath.startsWith('/demo') ? 'text-amber-950 bg-amber-500/10 border border-amber-500/25' : 'text-slate-700 hover:bg-slate-50'}">
        <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Studio Playground</span>
      </a>
    </div>
  {/if}
</header>
