<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  let { isOpen = $bindable(false) } = $props<{ isOpen?: boolean }>();

  let prompt = $state('');
  let messages = $state<Array<{ role: 'user' | 'assistant'; text: string; code?: string; timestamp?: string }>>([
    {
      role: 'assistant',
      text: "I am **Sola Arc**, your autonomous UI & Systems Solutions Intelligence.\n\nAsk me how to embed Sola into your tech stack (**React 19, Next.js, Svelte 5, Vue 3, or Web Components**), connect live data signals (**Postgres, Stripe, WebSockets**), or build zero-VDOM applications with sub-millisecond patch speeds.",
      timestamp: 'Just now'
    }
  ]);
  let isLoading = $state(false);
  let copiedIndex = $state<number | null>(null);
  let messageContainer = $state<HTMLDivElement | null>(null);

  const quickPrompts = [
    "How would Sola work in my existing UI?",
    "Embed Sola in React 19 / Next.js",
    "Zero-VDOM signals vs React State",
    "Show a .sola Single-File Component",
    "Connect live WebSocket signal stream",
    "How does Sola achieve 1,000Hz ticks?"
  ];

  function formatTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function parseFormattedText(text: string): string {
    if (!text) return '';
    // Simple, clean markdown-to-html converter
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-white/10 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">$1</code>');
    // Line breaks
    html = html.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');

    return html;
  }

  async function sendMessage() {
    if (!prompt.trim() || isLoading) return;

    const userText = prompt.trim();
    messages = [...messages, { role: 'user', text: userText, timestamp: formatTimestamp() }];
    prompt = '';
    isLoading = true;

    // Scroll to bottom
    setTimeout(() => {
      if (messageContainer) messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 50);

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'architect',
          query: userText 
        })
      });

      const data = await res.json();
      let reply = '';
      if (data.reply) {
        reply = data.reply;
      } else if (typeof data === 'string') {
        reply = data;
      } else if (data.components) {
        reply = "```typescript\n// Generated Sola Architecture Specification\n" + JSON.stringify(data.components, null, 2) + "\n```";
      } else {
        reply = JSON.stringify(data, null, 2);
      }

      messages = [...messages, { role: 'assistant', text: reply, timestamp: formatTimestamp() }];
    } catch (e: any) {
      messages = [...messages, { 
        role: 'assistant', 
        text: "Sola primitives compile directly into native reactive DOM nodes via `@sola/compiler`. Use `createSignal()` for local state, and import components from `@sola/ui` for zero-VDOM mounting inside any host container (React, Svelte, Vue, or vanilla HTML).",
        timestamp: formatTimestamp()
      }];
    } finally {
      isLoading = false;
      setTimeout(() => {
        if (messageContainer) messageContainer.scrollTop = messageContainer.scrollHeight;
      }, 50);
    }
  }

  function pickPrompt(text: string) {
    prompt = text;
    sendMessage();
  }

  function copyMessage(index: number, text: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      copiedIndex = index;
      setTimeout(() => { copiedIndex = null; }, 2000);
    }
  }

  onMount(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen = !isOpen;
      }
      if (e.key === 'Escape' && isOpen) {
        isOpen = false;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

{#if isOpen}
  <!-- Backdrop Overlay -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    transition:fade={{ duration: 150 }}
    onclick={() => (isOpen = false)}
    class="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
    
    <!-- Sola Arc Floating Intelligence Modal -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      transition:fly={{ y: 24, duration: 250, easing: cubicOut }}
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arc-title"
      class="w-full sm:max-w-2xl bg-white dark:bg-[#090d19] border-t sm:border border-slate-200/90 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[85vh] relative animate-[fadeSlide_150ms_ease-out]">
      
      <!-- Top Arc Header Bar -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-[#0c1222]/80 backdrop-blur-xl">
        <div class="flex items-center gap-3">
          <!-- Solar Arc Radiant Emblem -->
          <div class="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-sky-500/20 to-violet-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" stroke-width="2.5"/>
            </svg>
            <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#090d19]"></span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h2 id="arc-title" class="text-sm font-black text-slate-900 dark:text-white tracking-tight">Sola Arc</h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] font-bold">
                Solutions Intelligence
              </span>
              <span class="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Mesh</span>
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Autonomous UI & Systems Architecture Consultant</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <kbd class="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-slate-400">
            ESC
          </kbd>
          <button 
            type="button"
            onclick={() => (isOpen = false)}
            aria-label="Close modal"
            class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Message Stream (Scrollable) -->
      <div 
        bind:this={messageContainer}
        class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm bg-white dark:bg-[#090d19] min-h-[300px]">
        {#each messages as msg, idx}
          <div class="flex flex-col gap-1.5 {msg.role === 'user' ? 'items-end' : 'items-start'}">
            
            <div class="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-400 font-bold uppercase">
              <span>{msg.role === 'user' ? 'You' : 'Sola Arc'}</span>
              {#if msg.timestamp}
                <span class="text-slate-300 dark:text-slate-600 font-normal">· {msg.timestamp}</span>
              {/if}
            </div>

            <div class="p-4 sm:p-5 rounded-2xl max-w-[92%] leading-relaxed transition-all {msg.role === 'user' ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-br-xs font-medium shadow-xs' : 'bg-slate-50 dark:bg-[#0c1222] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-2xs'}">
              <div class="leading-relaxed font-sans prose-sm dark:prose-invert">
                {@html parseFormattedText(msg.text)}
              </div>
            </div>

            {#if msg.role === 'assistant'}
              <div class="flex items-center gap-2 px-1">
                <button 
                  onclick={() => copyMessage(idx, msg.text)}
                  class="px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer">
                  {#if copiedIndex === idx}
                    <svg class="w-3 h-3 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold">Copied to Clipboard</span>
                  {:else}
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span>Copy Solution</span>
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        {/each}

        {#if isLoading}
          <div class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#0c1222] border border-slate-200/80 dark:border-white/10 rounded-2xl max-w-sm text-xs font-mono text-slate-400">
            <div class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0"></div>
            <span>Synthesizing zero-VDOM technical solution...</span>
          </div>
        {/if}
      </div>

      <!-- Quick Prompt Suggestion Pills -->
      <div class="px-4 sm:px-6 py-2.5 bg-slate-50/80 dark:bg-[#0c1222]/80 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span class="text-[10px] font-mono font-bold uppercase text-slate-400 shrink-0">Ask:</span>
        {#each quickPrompts as qp}
          <button 
            type="button"
            onclick={() => pickPrompt(qp)}
            class="px-3 py-1 rounded-xl bg-white dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs">
            {qp}
          </button>
        {/each}
      </div>

      <!-- Input Text Bar -->
      <form 
        onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
        class="p-3 sm:p-4 bg-white dark:bg-[#090d19] border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
        <div class="relative flex-1">
          <input 
            type="text" 
            bind:value={prompt}
            placeholder="Ask Sola Arc (e.g. How do I connect Postgres signals?)..." 
            class="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-4 pr-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-sans transition-all" />
          {#if prompt}
            <button 
              type="button"
              onclick={() => (prompt = '')}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
              &times;
            </button>
          {/if}
        </div>

        <button 
          type="submit"
          disabled={isLoading || !prompt.trim()}
          aria-label="Send query"
          class="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-xs shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer shrink-0">
          <span>Send</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>

    </div>
  </div>
{/if}

<style>
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
