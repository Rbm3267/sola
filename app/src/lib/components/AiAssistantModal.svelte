<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import SolaLogo from './SolaLogo.svelte';
  import { onMount } from 'svelte';

  let { isOpen = $bindable(false) } = $props<{ isOpen?: boolean }>();

  let prompt = $state('');
  let messages = $state<Array<{ role: 'user' | 'assistant'; text: string; code?: string }>>([
    {
      role: 'assistant',
      text: "I am **Sola Arc**, your autonomous UI & Systems Solutions Consultant. Ask me how to embed Sola into your tech stack (React 19, Next.js, Svelte 5, Vue, or legacy monoliths), connect live data signals (Postgres, Stripe, Sheets), or eliminate VDOM re-rendering overhead."
    }
  ]);
  let isLoading = $state(false);
  let copiedIndex = $state<number | null>(null);

  const quickPrompts = [
    "How would Sola work in my existing UI?",
    "How do I embed Sola components in React 19 / Next.js?",
    "How do zero-VDOM signals eliminate re-rendering lag?",
    "How do I connect a private PostgreSQL database?"
  ];

  async function sendMessage() {
    if (!prompt.trim() || isLoading) return;

    const userText = prompt.trim();
    messages = [...messages, { role: 'user', text: userText }];
    prompt = '';
    isLoading = true;

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
        reply = "Synthesized Component Specification:\n\n" + JSON.stringify(data.components, null, 2);
      } else {
        reply = JSON.stringify(data, null, 2);
      }

      messages = [...messages, { role: 'assistant', text: reply }];
    } catch (e: any) {
      messages = [...messages, { 
        role: 'assistant', 
        text: "Sola components compile directly into native reactive DOM nodes via @sola/compiler. Use createSignal() for local state, and import components from @sola/ui for zero-VDOM mounting inside any host container." 
      }];
    } finally {
      isLoading = false;
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    transition:fade={{ duration: 150 }}
    onclick={() => isOpen = false}
    class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
    
    <!-- Modal Dialog Window -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      transition:fly={{ y: 20, duration: 250, easing: cubicOut }}
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      class="bg-white border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] max-w-2xl w-full flex flex-col overflow-hidden max-h-[85vh] relative">
      
      <!-- Top Title Header -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 id="assistant-title" class="text-sm font-black text-slate-950 tracking-tight">Sola Arc</h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 font-mono text-[9px] font-bold">Solutions AI</span>
            </div>
            <p class="text-xs text-slate-500 font-normal">Autonomous UI & Systems Solutions Intelligence</p>
          </div>
        </div>

        <button 
          type="button"
          onclick={() => isOpen = false}
          aria-label="Close modal"
          class="w-7 h-7 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Scrollable Message Conversation Stream -->
      <div class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm bg-white min-h-[260px]">
        {#each messages as msg, idx}
          <div class="flex flex-col gap-1.5 {msg.role === 'user' ? 'items-end' : 'items-start'}">
            
            <div class="flex items-center gap-1.5 px-1 text-[10px] font-mono text-slate-400 font-bold uppercase">
              <span>{msg.role === 'user' ? 'You' : 'Sola Arc'}</span>
            </div>

            <div class="p-4 rounded-2xl max-w-[92%] leading-relaxed {msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-xs shadow-xs' : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs'}">
              <div class="whitespace-pre-wrap font-sans">{msg.text}</div>
            </div>

            {#if msg.role === 'assistant'}
              <button 
                onclick={() => copyMessage(idx, msg.text)}
                class="px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer">
                {#if copiedIndex === idx}
                  <svg class="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="text-emerald-600 font-bold">Copied!</span>
                {:else}
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy Solution</span>
                {/if}
              </button>
            {/if}
          </div>
        {/each}

        {#if isLoading}
          <div class="flex items-center gap-2 text-xs font-mono text-slate-400 p-2">
            <div class="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Sola Arc is synthesizing technical solution...</span>
          </div>
        {/if}
      </div>

      <!-- Quick Prompt Suggestion Pills -->
      <div class="px-4 sm:px-6 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span class="text-[10px] font-mono font-bold uppercase text-slate-400 shrink-0">Ask:</span>
        {#each quickPrompts as qp}
          <button 
            type="button"
            onclick={() => pickPrompt(qp)}
            class="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-medium text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs">
            {qp}
          </button>
        {/each}
      </div>

      <!-- Input Text Bar -->
      <form 
        onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
        class="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <input 
          type="text" 
          bind:value={prompt}
          placeholder="Ask Sola Arc (e.g. How do I embed this into my React app?)..." 
          class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-sans transition-all" />
        <button 
          type="submit"
          disabled={isLoading || !prompt.trim()}
          aria-label="Send query"
          class="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
          <span>Ask</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>

    </div>
  </div>
{/if}
