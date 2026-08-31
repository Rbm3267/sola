<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import { COMMUNITY_TEMPLATES, type SolaTemplate } from '$lib/data/communityTemplates';

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
      setTimeout(() => { copiedId = null; }, 2000);
    }
  }

  function getGradient(accent: string): string {
    const map: Record<string, string> = {
      emerald: 'from-blue-500 via-indigo-500 to-blue-700',
      violet: 'from-violet-500 via-purple-600 to-violet-700',
      sky: 'from-sky-400 via-cyan-500 to-sky-600',
      amber: 'from-amber-400 via-orange-500 to-amber-600',
      slate: 'from-slate-600 via-slate-700 to-slate-800'
    };
    return map[accent] ?? 'from-blue-500 via-indigo-500 to-blue-700';
  }

  function getHoverBorder(accent: string): string {
    const map: Record<string, string> = {
      emerald: 'hover:border-blue-400/60',
      violet: 'hover:border-violet-400/60',
      sky: 'hover:border-sky-400/60',
      amber: 'hover:border-amber-400/60',
      slate: 'hover:border-slate-400/60'
    };
    return map[accent] ?? 'hover:border-blue-400/60';
  }

  function getBadgeBg(accent: string): string {
    const map: Record<string, string> = {
      emerald: 'bg-blue-500/20 text-blue-100 border-blue-400/30',
      violet: 'bg-violet-500/20 text-violet-100 border-violet-400/30',
      sky: 'bg-sky-500/20 text-sky-100 border-sky-400/30',
      amber: 'bg-amber-500/20 text-amber-100 border-amber-400/30',
      slate: 'bg-white/10 text-white/80 border-white/20'
    };
    return map[accent] ?? 'bg-blue-500/20 text-blue-100 border-blue-400/30';
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Autonomous AI & Agents': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 2" opacity="0.4"/></svg>`,
      'Edge & Neural Systems': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/><circle cx="6" cy="5" r="0.8" fill="currentColor"/><circle cx="6" cy="12" r="0.8" fill="currentColor"/><circle cx="6" cy="19" r="0.8" fill="currentColor"/></svg>`,
      'Robotics & Spatial': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V5a3 3 0 0 1 3-3z"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><path d="M9 16h6"/></svg>`,
      'SaaS & Analytics': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 20h18"/><path d="M5 20V14"/><path d="M9 20V9"/><path d="M13 20V12"/><path d="M17 20V5"/><path d="M3 9l6-4 4 3 8-5" opacity="0.5"/></svg>`,
      'Commerce & Retail': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      'Productivity & Tasks': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/><path d="M9 7h6M9 17h3" opacity="0.5"/></svg>`,
      'Operations & Health': `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
    };
    return icons[category] ?? icons['SaaS & Analytics'];
  }

  // Per-template decorative sparklines (SVG polyline points)
  const sparklines: Record<string, string> = {
    'ai-agent-swarm-mesh':     '0,32 30,24 60,28 90,14 120,18 150,8 180,12 210,4 240,8',
    'llm-streaming-token-hud': '0,35 30,28 60,15 90,22 120,10 150,18 180,6 210,14 240,3',
    'edge-wasm-sandbox':       '0,38 40,34 80,20 120,16 160,8 200,4 240,2',
    'zkp-verification-pipeline':'0,30 40,22 80,28 120,10 160,18 200,6 240,14',
    'robotics-actuator-telemetry': '0,20 20,8 40,32 60,6 80,28 100,4 120,26 140,8 160,22 180,6 200,18',
    'spatial-audio-haptics':   '0,20 30,5 60,35 90,5 120,35 150,5 180,35 210,5 240,20',
    'saas-revenue-waterfall':  '0,38 40,32 80,26 120,18 160,10 200,6 240,2',
    'conversion-funnel-matrix':'0,36 50,30 100,22 150,14 200,8 240,4',
    'global-payout-velocity':  '0,34 40,28 80,22 120,16 160,10 200,6 240,3',
    'ecommerce-order-flow':    '0,30 30,22 60,28 90,16 120,20 150,10 180,14 210,6 240,8',
    'inventory-stock-matrix':  '0,24 60,22 120,20 180,18 240,16',
    'sprint-velocity-tracker': '0,38 40,32 80,24 120,18 160,12 200,8 240,4',
    'habit-streak-matrix':     '0,35 40,28 80,22 120,16 160,10 200,6 240,2',
    'multi-region-cluster-mesh':'0,10 60,8 120,6 180,7 240,5'
  };
</script>

<div class="flex flex-col w-full bg-slate-50 dark:bg-[#080c1a] text-slate-900 dark:text-white transition-colors duration-300 min-h-screen">
  <Navbar />

  <!-- Ambient glow -->
  <div class="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)] pointer-events-none"></div>

  <main class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">

    <!-- Page Header -->
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold shadow-2xs">
        <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>
        Community Presets & Starter Kits
      </div>
      <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
        Pre-Built Layouts & Starter Kits
      </h1>
      <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
        Handcrafted, zero-VDOM templates for analytics, developer tooling, commerce, and personal workflows. 1-click open in Studio or export to native .sola.
      </p>
    </div>

    <!-- Controls Bar -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="relative flex-1 max-w-md">
          <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search templates (e.g. revenue, funnel, dial, sprint, telemetry)..."
            class="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-sans shadow-2xs" />
          {#if searchQuery}
            <button onclick={() => (searchQuery = '')} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">&times;</button>
          {/if}
        </div>
        <a
          href="/studio"
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white text-xs font-bold transition-all shadow-xs shrink-0">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Build Custom in Studio
        </a>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {#each categories as cat}
          <button
            onclick={() => (selectedCategory = cat)}
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer {selectedCategory === cat ? 'bg-slate-900 text-white dark:bg-blue-500 dark:text-white font-bold shadow-xs' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10'}">
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <!-- Templates Grid -->
    {#if filteredTemplates.length === 0}
      <div class="py-20 text-center space-y-3 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200/80 dark:border-white/5">
        <p class="text-sm text-slate-500 font-medium">No templates match "{searchQuery}" in "{selectedCategory}".</p>
        <button
          onclick={() => { searchQuery = ''; selectedCategory = 'All'; }}
          class="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer">
          Reset Filters
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {#each filteredTemplates as item}
          {@const accent = item.cards[0]?.accentColor ?? 'slate'}
          {@const primaryCard = item.cards[0]}
          {@const gradient = getGradient(accent)}
          {@const hoverBorder = getHoverBorder(accent)}
          {@const spark = sparklines[item.id] ?? '0,30 60,20 120,24 180,10 240,14'}

          <div class="group flex flex-col rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0d1222] shadow-sm {hoverBorder} hover:shadow-xl transition-all duration-200">

            <!-- Gradient Hero Header -->
            <div class="relative bg-gradient-to-br {gradient} p-6 pb-8 overflow-hidden">

              <!-- Category icon, top-right -->
              <div class="absolute top-4 right-4 text-white/30">
                {@html getCategoryIcon(item.category)}
              </div>

              <!-- Badge row -->
              <div class="flex items-center gap-2 mb-4">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border {getBadgeBg(accent)}">
                  {item.badge}
                </span>
                <span class="text-[10px] font-mono text-white/50">
                  {item.cards.length} Primitives
                </span>
              </div>

              <!-- Hero metric -->
              <div class="text-white">
                <div class="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none">
                  {primaryCard?.value ?? '—'}
                </div>
                {#if primaryCard?.delta}
                  <div class="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-white/70">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    {primaryCard.delta}
                  </div>
                {/if}
                <div class="text-[10px] font-mono text-white/50 mt-1">{primaryCard?.title}</div>
              </div>

              <!-- Decorative sparkline -->
              <svg
                viewBox="0 0 240 44"
                preserveAspectRatio="none"
                class="absolute bottom-0 left-0 right-0 w-full h-11 opacity-20"
                aria-hidden="true">
                <polyline
                  points={spark}
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>

            <!-- Card Body -->
            <div class="flex flex-col flex-1 p-5 gap-4">

              <!-- Name & tagline -->
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {item.tagline}
                </p>
              </div>

              <!-- Signal chips -->
              <div class="flex flex-wrap gap-1.5">
                {#each item.signals as sig}
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/[0.06]">
                    {sig}
                  </span>
                {/each}
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] mt-auto">
                <div class="flex items-center gap-1.5">
                  <button
                    onclick={(e) => copySolaCode(item, e)}
                    class="px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    {#if copiedId === item.id}
                      <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span class="text-blue-500 font-bold">Copied!</span>
                    {:else}
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      .sola Code
                    {/if}
                  </button>
                  <button
                    onclick={() => (activeTemplateModal = item)}
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                    Inspect
                  </button>
                </div>
                <a
                  href="/studio?preset={item.id}"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm shadow-blue-600/20 cursor-pointer">
                  Open in Studio
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <!-- Template Details Modal -->
  {#if activeTemplateModal}
    {@const accent = activeTemplateModal.cards[0]?.accentColor ?? 'slate'}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={() => (activeTemplateModal = null)}
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        onclick={(e) => e.stopPropagation()}
        class="w-full max-w-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

        <!-- Modal gradient header -->
        <div class="bg-gradient-to-br {getGradient(accent)} px-6 py-5 relative overflow-hidden">
          <svg viewBox="0 0 240 44" preserveAspectRatio="none" class="absolute bottom-0 left-0 right-0 w-full h-10 opacity-15" aria-hidden="true">
            <polyline points={sparklines[activeTemplateModal.id] ?? '0,30 120,15 240,10'} fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div class="flex items-start justify-between gap-4 relative z-10">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border {getBadgeBg(accent)}">
                {activeTemplateModal.category}
              </span>
              <h2 class="text-xl font-black text-white mt-2 leading-snug">{activeTemplateModal.name}</h2>
              <p class="text-xs text-white/60 mt-1">{activeTemplateModal.description}</p>
            </div>
            <button
              onclick={() => (activeTemplateModal = null)}
              class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors text-lg leading-none">
              &times;
            </button>
          </div>
        </div>

        <!-- Code body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
            <span>Template .sola Source</span>
            <button
              onclick={() => copySolaCode(activeTemplateModal!)}
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer">
              {copiedId === activeTemplateModal.id ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre class="p-4 bg-slate-950 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed"><code>{activeTemplateModal.solaCode}</code></pre>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5">
          <button onclick={() => (activeTemplateModal = null)} class="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors">
            Close
          </button>
          <a
            href="/studio?preset={activeTemplateModal.id}"
            class="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-all shadow-xs cursor-pointer">
            Open in Studio Canvas
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>
