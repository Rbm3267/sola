<script lang="ts">
  import DynamicRenderer from '$lib/components/DynamicRenderer.svelte';
  import SolaLogo from '$lib/components/SolaLogo.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  
  let intentQuery = $state('');
  let currentPayload = $state<any>(null);
  let isLoading = $state(false);
  let errorMsg = $state('');
  let isListening = $state(false);
  let speechSupported = $state(false);
  let recognition: any = null;

  const sampleIntents = [
    "Show Q3 revenue and churn rate for enterprise tier",
    "Build an onboarding form for new engineering hires",
    "List all active deployments with their status",
    "Create server load monitor with memory gauges"
  ];

  onMount(() => {
    // Check Speech Recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechSupported = true;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isListening = true;
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          intentQuery = transcript;
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          isListening = false;
        };

        recognition.onend = () => {
          isListening = false;
          if (intentQuery.trim()) {
            submitIntent();
          }
        };
      }
    }
  });

  function toggleSpeech() {
    if (!speechSupported || !recognition) {
      errorMsg = "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.";
      return;
    }

    if (isListening) {
      recognition.stop();
      isListening = false;
    } else {
      errorMsg = '';
      intentQuery = '';
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  }

  function pickSample(prompt: string) {
    intentQuery = prompt;
    submitIntent();
  }

  async function submitIntent() {
    if (!intentQuery.trim() || isLoading) return;
    
    isLoading = true;
    currentPayload = null;
    errorMsg = '';

    try {
      const apiUrl = '/api/intent';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentQuery })
      });

      const rawText = await res.text();

      if (!res.ok) {
        try {
          const parsedErr = JSON.parse(rawText);
          throw new Error(parsedErr.error || parsedErr.message || 'Intent execution failed');
        } catch {
          throw new Error(rawText || 'Failed to process intent');
        }
      }

      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      currentPayload = JSON.parse(cleanText);
    } catch (e: any) {
      console.error(e);
      errorMsg = e.message || 'An error occurred while generating UI components.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-200 selection:text-sky-900">
  <Navbar />
  
  <!-- Subtle Ambient Glows -->
  <div class="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-sky-100/50 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

  <div class="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8 z-10 relative">
    
    <!-- Title Area -->
    <div class="text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-sky-700 text-xs font-mono font-bold mb-3">
        <span>Sola Ambient Intent Engine • v0.2.0</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mb-2">
        Ambient Intent Playground
      </h1>
      <p class="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
        Speak or type your intent. Sola's compiler synthesizes and mounts reactive zero-VDOM components in real time.
      </p>
    </div>

    <!-- Luxury Command & Voice Input Bar -->
    <div class="max-w-2xl mx-auto w-full bg-white/95 backdrop-blur-3xl border {isListening ? 'border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.25)]' : 'border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.06)]'} rounded-2xl p-2 transition-all duration-300 relative">
      <form class="flex items-center gap-2 sm:gap-3 w-full relative z-10" onsubmit={(e) => { e.preventDefault(); submitIntent(); }}>
        
        <!-- Left Sparkle / Active Status -->
        <div class="pl-3 sm:pl-4 shrink-0 text-sky-500">
          {#if isLoading}
            <svg class="w-5 h-5 animate-spin text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93"/></svg>
          {:else if isListening}
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce"></span>
              <span class="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span class="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            </div>
          {:else}
            <svg class="w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
          {/if}
        </div>
        
        <!-- Clean Input Box with Zero Default Focus Border/Outline -->
        <input 
          type="text" 
          bind:value={intentQuery}
          placeholder={isListening ? "Listening... speak now" : "Speak or type intent (e.g. 'Show enterprise MRR and churn rate')"} 
          style="outline: none !important; box-shadow: none !important; border: none !important;"
          class="flex-1 bg-transparent py-4 px-2 text-slate-900 text-sm sm:text-base font-medium placeholder-slate-400 border-0 outline-none focus:outline-none focus:ring-0 appearance-none"
        />
        
        <!-- Voice Input Microphone Button -->
        <button 
          type="button"
          onclick={toggleSpeech}
          aria-label="Voice intent recognition"
          class="p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer {isListening ? 'bg-rose-500 text-white shadow-md animate-pulse' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}"
          title={isListening ? "Stop listening" : "Speak intent via microphone"}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>

        <!-- Submit Button -->
        <button 
          type="submit" 
          disabled={isLoading || !intentQuery.trim()}
          aria-label="Submit intent"
          class="bg-slate-950 text-white w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.97] disabled:opacity-40 flex items-center justify-center shadow-md shrink-0 cursor-pointer"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>
    </div>

    <!-- Live Speech Indicator Pill -->
    {#if isListening}
      <div transition:fly={{ y: -8, duration: 250 }} class="flex items-center justify-center gap-2 max-w-xs mx-auto bg-rose-50 border border-rose-200 text-rose-700 px-4 py-1.5 rounded-full text-xs font-mono font-bold shadow-sm">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Live Speech Recognition Active</span>
      </div>
    {/if}

    <!-- Sample Suggestions -->
    <div class="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
      <span class="text-xs font-semibold text-slate-400">Suggestions:</span>
      {#each sampleIntents as sample}
        <button 
          onclick={() => pickSample(sample)}
          class="text-xs font-medium text-slate-600 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-all cursor-pointer shadow-xs">
          {sample}
        </button>
      {/each}
    </div>

    <!-- Error Message Display -->
    {#if errorMsg}
      <div transition:fly={{ y: -10, duration: 300, easing: cubicOut }} class="mx-auto w-full max-w-lg p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-sm font-medium shadow-sm flex items-start gap-3">
        <svg class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>{errorMsg}</div>
      </div>
    {/if}

    <!-- The Canvas -->
    <div class="w-full bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.04)] relative overflow-hidden min-h-[360px] flex flex-col">
      <div class="relative z-10 w-full h-full flex flex-col gap-6">
        {#if isLoading}
          <div class="w-full flex-1 min-h-[260px] flex flex-col items-center justify-center text-slate-500 gap-4" in:fade={{ duration: 300 }}>
            <SolaLogo size="lg" spinning={true} showGlow={true} />
            <span class="text-xs font-bold text-slate-600 font-mono tracking-wider uppercase">Synthesizing Intent & Compiling UI...</span>
          </div>
        {:else if currentPayload}
          {#if Array.isArray(currentPayload)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" in:fade={{ duration: 400 }}>
              {#each currentPayload as block}
                <DynamicRenderer data={block} />
              {/each}
            </div>
          {:else}
            <div in:fade={{ duration: 400 }}>
              <DynamicRenderer data={currentPayload} />
            </div>
          {/if}
        {:else}
          <div class="w-full min-h-[260px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <svg class="w-12 h-12 text-slate-300 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span class="text-sm font-medium">Click the microphone to speak, or type what you need</span>
          </div>
        {/if}
      </div>
    </div>

  </div>
</div>
