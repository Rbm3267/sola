<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { COMMUNITY_TEMPLATES, type SolaTemplate } from '$lib/data/communityTemplates';
  import SolaButton from '$lib/components/SolaButton.svelte';

  let selectedCategory = $state<string>('All');
  let searchQuery = $state<string>('');
  let activeTemplateModal = $state<SolaTemplate | null>(null);
  let copiedId = $state<string | null>(null);

  const categories = [
    'All',
    'Autonomous AI & Agents',
    'Edge & Neural Systems',
    'Robotics & Spatial',
    'SaaS & Analytics',
    'Commerce & Retail',
    'Productivity & Tasks',
    'Operations & Health'
  ];

  const filteredTemplates = $derived(
    COMMUNITY_TEMPLATES.filter((t) => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.signals.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchSearch;
    })
  );

  function copySolaCode(template: SolaTemplate, e?: Event) {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(template.solaCode);
      copiedId = template.id;
      setTimeout(() => {
        copiedId = null;
      }, 2000);
    }
  }
</script>

<div class="flex flex-col w-full bg-white dark:bg-[#090d19] text-slate-900 dark:text-white transition-colors duration-300 min-h-screen">
  <Navbar />

  <!-- Soft Ambient Glow -->
  <div class="absolute top-0 inset-x-0 h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.06),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.1),rgba(9,13,25,0))] pointer-events-none"></div>

  <main class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
    
    <!-- Page Header -->
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold shadow-2xs">
        <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>
        <span>Community Presets & Starter Kits</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
        Pre-Built Layouts & Starter Kits
      </h1>
      <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
        Handcrafted, zero-VDOM templates for analytics, developer tooling, commerce, and personal workflows. 1-click open in Studio or export to native .sola.
      </p>
    </div>

    <!-- Controls Bar: Search & Category Pills -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search templates (e.g. revenue, funnel, dial, sprint, telemetry)..."
            class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-sans shadow-2xs"
          />
          {#if searchQuery}
            <button
              onclick={() => (searchQuery = '')}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">&times;</button>
          {/if}
        </div>

        <!-- Submit Template CTA -->
        <a
          href="/studio"
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Build Custom in Studio</span>
        </a>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {#each categories as cat}
          <button
            onclick={() => (selectedCategory = cat)}
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {selectedCategory === cat ? 'bg-slate-900 text-white dark:bg-blue-500 dark:text-white font-bold shadow-xs' : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}">
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <!-- Templates Grid -->
    {#if filteredTemplates.length === 0}
      <div class="py-20 text-center space-y-3 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200/80 dark:border-white/5">
        <p class="text-sm text-slate-500 font-medium">No templates match "{searchQuery}" in category "{selectedCategory}".</p>
        <button
          onclick={() => { searchQuery = ''; selectedCategory = 'All'; }}
          class="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer">
          Reset Filters
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each filteredTemplates as item}
          <div
            class="group p-6 sm:p-7 bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-xs hover:shadow-xl hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between gap-5 relative">
            
            <!-- Top Card Header -->
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20">
                  {item.badge}
                </span>
                <span class="text-[11px] font-mono text-slate-400">
                  {item.cards.length} Primitives
                </span>
              </div>

              <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.name}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                {item.tagline}
              </p>
            </div>

            <!-- Mini Live Layout Blueprint -->
            <div class="p-3.5 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl space-y-2">
              <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Composed Blueprint:</div>
              <div class="grid grid-cols-3 gap-2">
                {#each item.cards as card}
                  <div class="p-2 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl {card.cols === 2 ? 'col-span-2' : 'col-span-1'} shadow-2xs">
                    <span class="block text-[9px] font-mono text-slate-400 truncate">{card.title}</span>
                    <span class="block text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5 truncate">{card.value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Signal Badges -->
            <div class="flex flex-wrap items-center gap-1.5">
              {#each item.signals as sig}
                <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                  {sig}
                </span>
              {/each}
            </div>

            <!-- Actions Row -->
            <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <!-- Copy .sola Code -->
                <button
                  onclick={(e) => copySolaCode(item, e)}
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  {#if copiedId === item.id}
                    <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span class="text-blue-600 dark:text-blue-400 font-bold">Copied!</span>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span>.sola Code</span>
                  {/if}
                </button>

                <!-- Inspect Details -->
                <button
                  onclick={() => (activeTemplateModal = item)}
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Inspect
                </button>
              </div>

              <!-- Open in Studio -->
              <a
                href="/studio?preset={item.id}"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-all shadow-xs shadow-blue-500/20 cursor-pointer">
                <span>Open in Studio</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>

          </div>
        {/each}
      </div>
    {/if}

  </main>

  <!-- Template Details Modal -->
  {#if activeTemplateModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={() => (activeTemplateModal = null)}
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <div
        onclick={(e) => e.stopPropagation()}
        class="w-full max-w-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
        
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              {activeTemplateModal.category}
            </span>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white mt-2">{activeTemplateModal.name}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeTemplateModal.description}</p>
          </div>
          <button
            onclick={() => (activeTemplateModal = null)}
            class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Code Preview -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
            <span>Template .sola Source</span>
            <button
              onclick={() => copySolaCode(activeTemplateModal!)}
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer">
              {copiedId === activeTemplateModal.id ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre class="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed"><code>{activeTemplateModal.solaCode}</code></pre>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            onclick={() => (activeTemplateModal = null)}
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
            Close
          </button>
          <a
            href="/studio?preset={activeTemplateModal.id}"
            class="px-5 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer">
            Open in Studio Canvas
          </a>
        </div>

      </div>
    </div>
  {/if}
</div>
