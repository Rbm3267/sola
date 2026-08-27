<script lang="ts">
  import { page } from '$app/stores';
  import SolaLogo from './SolaLogo.svelte';
  import AiAssistantModal from './AiAssistantModal.svelte';

  let currentPath = $derived($page.url.pathname);
  let isAiModalOpen = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isAiModalOpen = !isAiModalOpen;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<AiAssistantModal bind:isOpen={isAiModalOpen} />

<header class="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 transition-all">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Brand Mark -->
    <div class="flex items-center gap-8">
      <a href="/" class="flex items-center gap-3 group cursor-pointer">
        <SolaLogo size="sm" spinning={true} showGlow={false} />
        <div class="flex items-center gap-2">
          <span class="text-xl font-black text-slate-950 tracking-tight font-sans">Sola</span>
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-full">v0.2.0</span>
        </div>
      </a>

      <!-- Primary Nav Tabs -->
      <nav class="hidden md:flex items-center gap-1">
        <a 
          href="/" 
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all {currentPath === '/' ? 'text-slate-950 bg-slate-100 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'}">
          Overview
        </a>
        <a 
          href="/components" 
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all {currentPath.startsWith('/components') ? 'text-slate-950 bg-slate-100 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'}">
          Component Library
        </a>
        <a 
          href="/docs" 
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all {currentPath.startsWith('/docs') ? 'text-slate-950 bg-slate-100 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'}">
          Interactive Docs
        </a>
        <a 
          href="/demo" 
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all {currentPath.startsWith('/demo') ? 'text-slate-950 bg-slate-100 font-bold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'}">
          Canvas Playground
        </a>
      </nav>
    </div>

    <!-- Right Utility Area -->
    <div class="flex items-center gap-3">
      <!-- Generous AI Ask Command Bar -->
      <button 
        type="button"
        onclick={() => isAiModalOpen = true}
        class="hidden sm:flex items-center justify-between w-64 md:w-72 h-10 px-4 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md text-xs font-medium text-slate-500 hover:border-amber-400 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-xs group">
        <div class="flex items-center gap-2.5">
          <svg class="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          <span class="font-medium text-slate-600 group-hover:text-slate-900">Ask Sola AI anything...</span>
        </div>
        <kbd class="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500 font-bold group-hover:bg-amber-50 group-hover:text-amber-900 group-hover:border-amber-200 transition-colors">⌘K</kbd>
      </button>

      <!-- GitHub Link -->
      <a 
        href="https://github.com/Rbm3267/sola" 
        target="_blank" 
        rel="noreferrer" 
        class="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all" 
        aria-label="GitHub Repository">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>

      <!-- Playground CTA -->
      <a 
        href="/demo" 
        class="text-xs font-bold text-white bg-slate-950 px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center gap-1.5">
        <span>Launch Canvas</span>
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>
    </div>

  </div>
</header>
