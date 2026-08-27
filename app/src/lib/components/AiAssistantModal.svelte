<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import SolaLogo from './SolaLogo.svelte';
  import { onMount } from 'svelte';

  let { isOpen = $bindable(false) } = $props<{ isOpen?: boolean }>();

  let prompt = $state('');
  let messages = $state<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I am Sola's AI Technical Assistant. Ask me anything about zero-VDOM signals, $data Google Sheet relays, ambient $intent synthesis, or how to drop Sola into your stack."
    }
  ]);
  let isLoading = $state(false);

  const quickPrompts = [
    "How does $data bind to Google Sheets?",
    "Explain zero-VDOM signal reactivity",
    "Show example of $intent compiling components",
    "How do I use Sola with React or Vue?"
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
          intent: `You are the Sola Framework AI Technical Assistant. Answer concisely with working code examples: ${userText}` 
        })
      });

      const data = await res.json();
      let reply = '';
      if (typeof data === 'string') {
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
        text: "Sola components compile directly into native reactive DOM nodes via @sola/compiler. Use createSignal() for local state, $intent for ambient generative resolution, and $data for live remote polling without virtual DOM overhead." 
      }];
    } finally {
      isLoading = false;
    }
  }

  function pickPrompt(text: string) {
    prompt = text;
    sendMessage();
  }

  onMount(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen = !isOpen;
      } else if (e.key === 'Escape' && isOpen) {
        isOpen = false;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div 
    transition:fade={{ duration: 200 }}
    onclick={() => isOpen = false}
    onkeydown={(e) => { if (e.key === 'Escape') isOpen = false; }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    class="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
  >
    <!-- Floating Luxury Command Palette Dialog -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      transition:fly={{ y: 20, duration: 300, easing: cubicOut }}
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
      class="w-full max-w-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] min-h-[500px] relative z-10"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div class="flex items-center gap-3">
          <SolaLogo size="xs" spinning={true} showGlow={false} />
          <div>
            <h3 class="text-sm font-black text-slate-900 font-mono flex items-center gap-2">
              <span>Sola Ambient Intelligence Studio</span>
              <span class="text-[10px] font-sans font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">Live AI</span>
            </h3>
          </div>
        </div>
        <button 
          onclick={() => isOpen = false}
          class="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Message History Stream -->
      <div class="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-5 min-h-[320px]">
        {#each messages as msg}
          <div class="flex flex-col gap-1.5 {msg.role === 'user' ? 'items-end' : 'items-start'}">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {msg.role === 'user' ? 'You' : 'Sola AI Assistant'}
            </span>
            <div class="max-w-[88%] p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap {msg.role === 'user' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-br-xs shadow-md' : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs font-mono text-xs'}">
              {msg.text}
            </div>
          </div>
        {/each}

        {#if isLoading}
          <div class="flex items-center gap-2 text-slate-400 text-xs font-mono py-2" in:fade={{ duration: 150 }}>
            <div class="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Synthesizing architectural answer...</span>
          </div>
        {/if}
      </div>

      <!-- Quick Prompt Suggestions -->
      {#if messages.length <= 1}
        <div class="px-6 sm:px-8 py-3 border-t border-slate-100 flex flex-wrap gap-2 bg-slate-50/40">
          {#each quickPrompts as qp}
            <button 
              onclick={() => pickPrompt(qp)}
              class="text-xs text-slate-600 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-xl hover:border-amber-400 hover:text-amber-900 hover:bg-amber-50/60 transition-all cursor-pointer shadow-2xs">
              {qp}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Generous Input Bar -->
      <div class="p-4 sm:p-6 border-t border-slate-100 bg-white">
        <form class="flex items-center gap-3 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-2 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10 focus-within:bg-white transition-all shadow-xs" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <input 
            type="text" 
            bind:value={prompt}
            placeholder="Ask about zero-VDOM compiler, $data Google Sheets, or ambient signals..."
            class="flex-1 bg-transparent px-4 py-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 border-0 outline-none focus:outline-none focus:ring-0 font-medium"
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
            class="font-bold text-sm text-white px-6 py-3.5 rounded-xl disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.35)] shrink-0"
          >
            <span>Ask Sola</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </form>
      </div>

    </div>
  </div>
{/if}
