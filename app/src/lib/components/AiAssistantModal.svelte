<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import SolaLogo from './SolaLogo.svelte';

  let { isOpen = $bindable(false) } = $props<{ isOpen: boolean }>();

  let prompt = $state('');
  let isLoading = $state(false);
  let messages = $state<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm Sola's Ambient Intelligence. Ask me anything about authoring `.sola` components, zero-VDOM signals, or streaming data pipelines."
    }
  ]);

  const quickPrompts = [
    "How do I bind a remote API with $data?",
    "Show me a reactive DataCard with a sparkline",
    "Explain how Sola compiles without a Virtual DOM",
    "How do I create an animated circular gauge?"
  ];

  function pickPrompt(p: string) {
    prompt = p;
    sendMessage();
  }

  async function sendMessage() {
    if (!prompt.trim() || isLoading) return;

    const userText = prompt.trim();
    prompt = '';
    messages.push({ role: 'user', text: userText });
    isLoading = true;

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: `You are the Sola Framework AI Technical Assistant. Answer concisely with working .sola code examples and clear explanations: ${userText}` 
        })
      });

      const data = await res.json();
      let reply = "";
      if (typeof data === 'string') {
        reply = data;
      } else if (data.components) {
        reply = "Here is the synthesized component configuration:\n\n```json\n" + JSON.stringify(data.components, null, 2) + "\n```";
      } else {
        reply = JSON.stringify(data, null, 2);
      }

      messages.push({ role: 'assistant', text: reply });
    } catch (e: any) {
      messages.push({
        role: 'assistant',
        text: "Sola components compile directly into native reactive DOM nodes via @sola/compiler. Use createSignal() for local state, $intent for ambient generative resolution, and $data for live remote polling without virtual DOM overhead."
      });
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isOpen = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div 
    transition:fade={{ duration: 200 }}
    onclick={() => isOpen = false}
    class="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
  >
    <!-- Floating Luxury Command Palette Dialog -->
    <div 
      transition:fly={{ y: 20, duration: 300, easing: cubicOut }}
      onclick={(e) => e.stopPropagation()}
      class="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <SolaLogo size="xs" spinning={true} showGlow={false} />
          <div>
            <h3 class="text-sm font-black text-slate-950 font-mono flex items-center gap-2">
              <span>Sola Ambient Assistant</span>
              <span class="text-[10px] font-sans font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200/80">AI Assistant</span>
            </h3>
          </div>
        </div>
        <button 
          onclick={() => isOpen = false}
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Message History Stream -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 min-h-[280px]">
        {#each messages as msg}
          <div class="flex flex-col gap-1 {msg.role === 'user' ? 'items-end' : 'items-start'}">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {msg.role === 'user' ? 'You' : 'Sola AI'}
            </span>
            <div class="max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap {msg.role === 'user' ? 'bg-slate-950 text-white rounded-br-xs' : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs font-mono'}">
              {msg.text}
            </div>
          </div>
        {/each}

        {#if isLoading}
          <div class="flex items-center gap-2 text-slate-400 text-xs font-mono py-2" in:fade={{ duration: 150 }}>
            <div class="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Synthesizing answer...</span>
          </div>
        {/if}
      </div>

      <!-- Quick Prompt Suggestions -->
      {#if messages.length <= 1}
        <div class="px-6 py-2 border-t border-slate-100 flex flex-wrap gap-1.5 bg-slate-50/30">
          {#each quickPrompts as qp}
            <button 
              onclick={() => pickPrompt(qp)}
              class="text-[11px] text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:border-amber-300 hover:text-amber-900 hover:bg-amber-50/50 transition-all cursor-pointer">
              {qp}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Input Bar -->
      <div class="p-4 border-t border-slate-100 bg-white">
        <form class="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/10 transition-all" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <input 
            type="text" 
            bind:value={prompt}
            placeholder="Ask about components, signals, or syntax..."
            class="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 border-0 outline-none focus:outline-none focus:ring-0"
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            class="bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>Send</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </form>
      </div>

    </div>
  </div>
{/if}
