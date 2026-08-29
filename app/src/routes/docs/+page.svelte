<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let activeSection = $state('quickstart');
  let askQuery = $state('');
  let askLoading = $state(false);
  let aiAnswer = $state('');

  // Live Docs Sandbox State
  let sandboxTitle = $state('Active Cluster Telemetry');
  let sandboxValue = $state('1,420 RPS');

  // Copy Feedback State
  let copiedId = $state('');
  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    copiedId = id;
    setTimeout(() => {
      if (copiedId === id) copiedId = '';
    }, 2000);
  }

  const groups = [
    {
      name: 'GETTING STARTED',
      items: [
        { id: 'quickstart', title: 'Quickstart & Installation' },
        { id: 'syntax', title: 'The .sola Component Format' }
      ]
    },
    {
      name: 'DEVELOPER API REFERENCE',
      items: [
        { id: 'api-reactivity', title: 'Core Reactivity Primitives' },
        { id: 'api-macros', title: 'Compiler Macro Primitives' },
        { id: 'engine', title: 'Compiler & Zero-VDOM Engine' },
        { id: 'llm-spec', title: 'LLM & AI Agent Prompting Spec' }
      ]
    },
    {
      name: 'HOST EMBEDDING',
      items: [
        { id: 'host-embedding', title: 'Enterprise Platform & React Embedding' }
      ]
    },
    {
      name: 'SAAS ORCHESTRATION',
      items: [
        { id: 'relay-saas', title: 'Sola Relay SaaS Deployment' }
      ]
    }
  ];

  async function askSolaAi() {
    if (!askQuery.trim() || askLoading) return;
    askLoading = true;
    aiAnswer = '';

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          intent: `You are the Sola Framework AI Technical Assistant. Answer concisely with working code examples: ${askQuery}` 
        })
      });

      const data = await res.json();
      if (typeof data === 'string') {
        aiAnswer = data;
      } else if (data.components) {
        aiAnswer = "Generated Component Tree:\n\n" + JSON.stringify(data.components, null, 2);
      } else {
        aiAnswer = JSON.stringify(data, null, 2);
      }
    } catch (e: any) {
      aiAnswer = "Sola components compile directly into native reactive DOM nodes via @sola/compiler. Use createSignal() for local state, $intent for ambient generative resolution, and $data for live remote polling without virtual DOM overhead.";
    } finally {
      askLoading = false;
    }
  }

  const scaffoldCmd = `npm create sola@latest my-sola-app`;
  const installCmd = `npm install @sola/core @sola/compiler @sola/vite-plugin-sola`;
  
  const viteConfigCode = `import { defineConfig } from 'vite';
import sola from '@sola/vite-plugin-sola';

export default defineConfig({
  plugins: [sola()]
});`;

  const syntaxExample = `<` + `script>
  export let title = "Cluster Dashboard";
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
  }
</` + `script>

<div class="dashboard-card">
  <h3>{title}</h3>
  <p>Active workers: {count} (Capacity: {doubled})</p>
  <button onclick={increment}>Scale Node +1</button>
</div>

<style>
  .dashboard-card {
    padding: 24px;
    border-radius: 20px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  }
</style>`;

  const signalExample = `import { createSignal } from '@sola/core';

// 1. Initialize local reactive signal
const [count, setCount] = createSignal(10);

// 2. Read value (getter function invocation)
console.log(count()); // -> 10

// 3. Mutate value (setter function invocation)
setCount(25);
console.log(count()); // -> 25`;

  const derivedExample = `import { createSignal, createDerived } from '@sola/core';

const [width, setWidth] = createSignal(5);
const [height, setHeight] = createSignal(10);

// Derived value recalculates when either dependency updates
const area = createDerived(() => width() * height());

console.log(area()); // -> 50
setWidth(8);
console.log(area()); // -> 80`;

  const effectExample = `import { createSignal, createEffect } from '@sola/core';

const [volume, setVolume] = createSignal(80);

// Effect runs immediately, tracks dependency automatically
const cleanup = createEffect(() => {
  console.log(\`System volume changed to \${volume()}\`);
  
  // Return optional cleanup handler
  return () => {
    console.log('Cleaning up previous volume subscription listeners');
  };
});

setVolume(95); // Output: "System volume changed to 95"`;

  const mountExample = `import MyCard from './MyCard.sola';

// Mount the compiled component constructor into target container
const unmount = MyCard(document.getElementById('widget-dock'), {
  title: 'Active Load Balancers',
  nodes: 12
});

// To destroy component and clean up state/DOM:
// unmount();`;

  const intentMacroExample = `<` + `script>
  // Transpiles to createIntent("Show cluster metric graphs")
  const analyticsWidget = $intent("Show cluster metric graphs");
</` + `script>

<div class="app-stage">
  <svelte:component this={analyticsWidget} />
</div>`;

  const dataMacroExample = `<` + `script>
  // Transpiles to createData("postgres-primary:billing_summary")
  const fitness = $data("sheet://1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
</` + `script>

<div class="grid grid-cols-2 gap-4">
  <DataCard title="Daily Volume" value="{fitness.volume} lbs" trend="{fitness.delta}" />
</div>`;

  const dockerfileCode = `FROM node:20-alpine

WORKDIR /app

# Install standard dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle Sola Relay source
COPY src/ ./src
COPY relay.json ./

EXPOSE 4040

# Run in production cluster
CMD ["node", "./src/cli.js", "--config", "./relay.json", "--port", "4040"]`;

  const nginxCode = `server {
    listen 443 ssl http2;
    server_name relay.my-saas.com;

    ssl_certificate /etc/letsencrypt/live/relay.my-saas.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/relay.my-saas.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4040;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Enforce rate limits
        limit_req zone=one burst=20 nodelay;
    }
}`;

  const relayJsonCode = `{
  "datasources": {
    "googlesheet-main": {
      "type": "googlesheets",
      "sheetId": "1WwRxcYopR7nCVKiu3ZcYuPiqdeBASwkAtYAHjWV3x8w"
    },
    "customer-db": {
      "type": "postgres",
      "host": "database-internal.my-subnet.co",
      "port": 5432,
      "database": "billing_prod",
      "user": "sola_read_only",
      "password": "ENV_SOLA_DB_PASSWORD"
    }
  }
}`;

  const engineExample = '// Sola compiled output: Pure direct DOM node manipulation\n' +
    'export function mount(__target, props = {}) {\n' +
    '  const root = document.createElement("div");\n' +
    '  root.className = "sola-metric-card";\n\n' +
    '  const textNode = document.createTextNode(props.value || "0");\n' +
    '  root.appendChild(textNode);\n\n' +
    '  // Fine-grained signal subscription (No VDOM diffing loop!)\n' +
    '  createEffect(() => {\n' +
    '    textNode.data = props.value();\n' +
    '  });\n\n' +
    '  __target.appendChild(root);\n' +
    '  return () => __target.removeChild(root);\n' +
    '}';

  const llmSystemPrompt = '<' + 'sola_rules>\n' +
    'You are an expert developer building applications with Sola (zero-VDOM ambient runtime).\n' +
    'When writing Sola components (.sola files), strictly follow these language rules:\n\n' +
    '1. COMPONENT FORMAT (.sola):\n' +
    '   - Combine script, HTML markup, and scoped CSS in one file.\n' +
    '   - Use \'let count = $state(initialValue)\' for reactive signals.\n' +
    '   - Use \'let doubled = $derived(expression)\' for computed values.\n' +
    '   - Handlers attach directly: <button onclick={increment}>Scale +1</button>.\n\n' +
    '2. MACROS ($intent and $data):\n' +
    '   - Use $intent("natural language prompt") to dynamically generate UI sub-components.\n' +
    '   - Use $data("sheet://<sheetId>") or $data("servicenow://<table>") to auto-poll data sources.\n\n' +
    '3. MOUNTING CONTRACT:\n' +
    '   - Compiled components export a function: mount(domNode, props).\n' +
    '   - Mounting returns an unmount cleanup function: const unmount = MyComponent(el, props).\n' +
    '</' + 'sola_rules>';

  const serviceNowEmbedCode = '// Enterprise Platform Service Portal Widget (Client Controller)\n' +
    'function(c, $element, $scope) {\n' +
    '  // Import or bundle compiled Sola component\n' +
    '  var IncidentCard = window.SolaComponents.IncidentCard;\n\n' +
    '  // Mount directly to the Enterprise Platform widget DOM element\n' +
    '  var rootNode = $element.find("#sn-widget-mount")[0];\n' +
    '  var unmount = IncidentCard(rootNode, {\n' +
    '    incidentId: c.data.sys_id || "INC009481",\n' +
    '    severity: "P1 - Critical"\n' +
    '  });\n\n' +
    '  // Clean up reactive signal listeners when Enterprise Platform destroys widget\n' +
    '  $scope.$on("$destroy", function() {\n' +
    '    if (unmount) unmount();\n' +
    '  });\n' +
    '}';

  const reactHostCode = 'import React, { useEffect, useRef } from "react";\n' +
    'import { mount } from "@sola/core";\n' +
    'import IncidentTriageMatrix from "./IncidentTriageMatrix.sola";\n\n' +
    'export function SolaReactHost({ incidentId, severity }) {\n' +
    '  const containerRef = useRef(null);\n\n' +
    '  useEffect(() => {\n' +
    '    if (!containerRef.current) return;\n' +
    '    const unmount = mount(containerRef.current, IncidentTriageMatrix, { incidentId, severity });\n' +
    '    return () => unmount();\n' +
    '  }, [incidentId, severity]);\n\n' +
    '  return <div ref={containerRef} className="sola-react-host" />;\n' +
    '}';

  const vueHostCode = '<' + 'script setup>\n' +
    'import { ref, onMounted, onUnmounted, watch } from "vue";\n' +
    'import { mount } from "@sola/core";\n' +
    'import FlowWaterfall from "./FlowWaterfall.sola";\n\n' +
    'const props = defineProps(["mrr", "churn"]);\n' +
    'const container = ref(null);\n' +
    'let unmountFn = null;\n\n' +
    'onMounted(() => {\n' +
    '  unmountFn = mount(container.value, FlowWaterfall, { mrr: props.mrr, churn: props.churn });\n' +
    '});\n\n' +
    'watch(props, (newProps) => {\n' +
    '  if (unmountFn) unmountFn();\n' +
    '  unmountFn = mount(container.value, FlowWaterfall, newProps);\n' +
    '});\n\n' +
    'onUnmounted(() => { if (unmountFn) unmountFn(); });\n' +
    '</' + 'script>\n\n' +
    '<' + 'template>\n' +
    '  <div ref="container" class="sola-vue-host" />\n' +
    '</' + 'template>';

  const svelteHostCode = '<' + 'script lang="ts">\n' +
    '  import { mount } from "@sola/core";\n' +
    '  import DataCard from "./DataCard.sola";\n\n' +
    '  let { value = "1,420 RPS", title = "Edge Ingress" } = $props();\n' +
    '  let container: HTMLDivElement;\n\n' +
    '  $effect(() => {\n' +
    '    if (!container) return;\n' +
    '    const unmount = mount(container, DataCard, { value, title });\n' +
    '    return () => unmount();\n' +
    '  });\n' +
    '</' + 'script>\n\n' +
    '<div bind:this={container} class="sola-svelte-host" />';

  const angularHostCode = 'import { Component, ElementRef, Input, effect, viewChild } from "@angular/core";\n' +
    'import { mount } from "@sola/core";\n' +
    'import ClusterMatrix from "./ClusterMatrix.sola";\n\n' +
    '@Component({\n' +
    '  selector: "app-sola-host",\n' +
    '  standalone: true,\n' +
    '  template: `<div #container class="sola-angular-host"></div>`\n' +
    '})\n' +
    'export class SolaAngularHostComponent {\n' +
    '  container = viewChild.required<ElementRef<HTMLDivElement>>("container");\n' +
    '  @Input() nodes = 12;\n\n' +
    '  constructor() {\n' +
    '    effect((onCleanup) => {\n' +
    '      const el = this.container().nativeElement;\n' +
    '      const unmount = mount(el, ClusterMatrix, { nodes: this.nodes });\n' +
    '      onCleanup(() => unmount());\n' +
    '    });\n' +
    '  }\n' +
    '}';

  const webComponentCode = 'class SolaWidgetElement extends HTMLElement {\n' +
    '  connectedCallback() {\n' +
    '    const shadow = this.attachShadow({ mode: "open" });\n' +
    '    const props = JSON.parse(this.getAttribute("props") || "{}");\n' +
    '    this._unmount = mount(shadow, window.SolaWidgetComponent, props);\n' +
    '  }\n' +
    '  disconnectedCallback() {\n' +
    '    if (this._unmount) this._unmount();\n' +
    '  }\n' +
    '}\n' +
    'customElements.define("sola-widget", SolaWidgetElement);';

  const reactEmbedCode = 'import React, { useEffect, useRef } from "react";\n' +
    'import IncidentCard from "./IncidentCard.sola";\n\n' +
    'export function SolaWidgetWrapper({ incidentId }) {\n' +
    '  const containerRef = useRef(null);\n\n' +
    '  useEffect(() => {\n' +
    '    if (!containerRef.current) return;\n\n' +
    '    // Mount fine-grained Sola component directly into React DOM ref\n' +
    '    const unmount = IncidentCard(containerRef.current, {\n' +
    '      incidentId: incidentId\n' +
    '    });\n\n' +
    '    // Clean up when React unmounts component\n' +
    '    return () => unmount();\n' +
    '  }, [incidentId]);\n\n' +
    '  return <div ref={containerRef} className="sola-react-host-container" />;\n' +
    '}';;
</script>

<div class="flex flex-col w-full">
  <Navbar />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- AI Documentation Assistant Bar -->
    <div class="mb-12 bg-white dark:bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/[0.04] shadow-xs relative overflow-hidden">
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-xs font-mono font-medium mb-3">
          <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>Sola API & Runtime Specification</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-[-0.03em] mb-2 font-sans">
          Documentation that explains itself.
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
          Ask any architectural or syntax question. Sola will generate live working examples on the fly.
        </p>

        <form class="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.04] p-1.5 rounded-2xl" onsubmit={(e) => { e.preventDefault(); askSolaAi(); }}>
          <input 
            id="ai-ask-input"
            type="text" 
            bind:value={askQuery}
            placeholder="e.g. 'How do I bind Google Sheets with $data?' or 'Explain zero-VDOM reactivity'"
            class="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={askLoading || !askQuery.trim()}
            style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff !important;"
            class="font-medium text-xs text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-sm shrink-0 active:scale-[0.97]">
            {#if askLoading}
              <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            {:else}
              <span>Ask AI</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            {/if}
          </button>
        </form>

        {#if aiAnswer}
          <div class="mt-6 p-6 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.04] rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-xs">
            {aiAnswer}
          </div>
        {/if}
      </div>
    </div>

    <!-- Documentation Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Table of Contents Sidebar -->
      <aside class="lg:col-span-4 sticky top-24 bg-white dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.04] rounded-3xl p-5 shadow-sm">
        <div class="text-xs font-mono font-medium text-slate-400 px-3 py-2">
          <span>DOCUMENTATION INDEX</span>
        </div>
        <nav class="flex flex-col gap-5 mt-4">
          {#each groups as grp}
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-mono font-bold text-slate-400/90 tracking-wider px-3">{grp.name}</span>
              {#each grp.items as item}
                <button 
                  onclick={() => activeSection = item.id}
                  class="w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer flex items-center justify-between {activeSection === item.id ? 'bg-amber-500/10 text-amber-950 font-semibold shadow-2xs border border-amber-500/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-white/[0.04] hover:text-slate-900 dark:text-white border border-transparent'}">
                  <span>{item.title}</span>
                  {#if activeSection === item.id}
                    <span class="w-1 h-3.5 rounded-full bg-amber-500"></span>
                  {/if}
                </button>
              {/each}
            </div>
          {/each}
        </nav>
      </aside>

      <!-- Main Content Reader -->
      <main class="lg:col-span-8 bg-white dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.04] rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col gap-8">
        
        {#if activeSection === 'quickstart'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Setup Guide</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">Quickstart & Installation</h1>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Get up and running with Sola in under 60 seconds using the automated CLI initializer or manual Vite integration.
            </p>

            <div class="flex flex-col gap-8">
              <!-- Step 1 -->
              <div class="flex gap-4 items-start">
                <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">1</div>
                <div class="flex-1">
                  <h3 class="font-bold text-slate-950 dark:text-white text-sm font-mono mb-1">Scaffold New Application</h3>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Create a pre-configured project with Vite, Sola compiler plugins, and Tailwind support:</p>
                  <div class="relative group">
                    <div class="bg-slate-950 text-amber-400 p-4 rounded-xl font-mono text-xs shadow-inner flex items-center justify-between border border-slate-800">
                      <code>$ {scaffoldCmd}</code>
                    </div>
                    <button 
                      onclick={() => handleCopy(scaffoldCmd, 'scaffold')}
                      class="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                      {#if copiedId === 'scaffold'}
                        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {:else}
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {/if}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="flex gap-4 items-start">
                <div class="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">2</div>
                <div class="flex-1">
                  <h3 class="font-bold text-slate-950 dark:text-white text-sm font-mono mb-1">Install Monorepo Packages (Existing App)</h3>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Add Sola runtime and compiler directly to any existing Vite frontend repository:</p>
                  <div class="relative group">
                    <div class="bg-slate-950 text-amber-400 p-4 rounded-xl font-mono text-xs shadow-inner flex items-center justify-between border border-slate-800">
                      <code>$ {installCmd}</code>
                    </div>
                    <button 
                      onclick={() => handleCopy(installCmd, 'install')}
                      class="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                      {#if copiedId === 'install'}
                        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {:else}
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {/if}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="flex gap-4 items-start">
                <div class="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">3</div>
                <div class="flex-1">
                  <h3 class="font-bold text-slate-950 dark:text-white text-sm font-mono mb-1">Register Vite Plugin</h3>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Add the AST compiler hook into <code>vite.config.js</code> to handle <code>.sola</code> file resolution:</p>
                  <div class="relative group">
                    <pre class="bg-slate-950 text-amber-200 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"><code>{viteConfigCode}</code></pre>
                    <button 
                      onclick={() => handleCopy(viteConfigCode, 'vite-config')}
                      class="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                      {#if copiedId === 'vite-config'}
                        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {:else}
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {/if}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {:else if activeSection === 'syntax'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Anatomy of .sola</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">The .sola Component Format</h1>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              A single-file <code>.sola</code> component encapsulates logic, HTML template structure, and scoped CSS into a zero-VDOM native ES module.
            </p>

            <!-- 3-Part Architecture Breakdown Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div class="p-4 border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-amber-500/5 border-amber-500/20">
                <span class="text-[10px] font-mono font-bold text-amber-900 uppercase">Part 1</span>
                <h4 class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1 mb-1">&lt;script&gt; Block</h4>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Defines reactive signals (<code>$state</code>, <code>$derived</code>), AI macros (<code>$intent</code>), and event handlers.</p>
              </div>

              <div class="p-4 border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                <span class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Part 2</span>
                <h4 class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1 mb-1">HTML Template</h4>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Declarative markup with fine-grained expression bindings <code>&#123;count&#125;</code> and logic blocks <code>&#123;#if&#125;</code>.</p>
              </div>

              <div class="p-4 border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                <span class="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Part 3</span>
                <h4 class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1 mb-1">&lt;style&gt; Scoped CSS</h4>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">Component styles are automatically hashed per-selector at compile time (zero global bleed).</p>
              </div>
            </div>

            <!-- Full Code Example -->
            <div class="relative group mb-8">
              <div class="bg-slate-900 text-slate-400 text-[10px] font-mono px-4 py-2 rounded-t-2xl border-b border-slate-800 flex items-center justify-between">
                <span>Component.sola</span>
                <span>Single-File Component</span>
              </div>
              <pre class="bg-slate-950 text-amber-200 p-6 rounded-b-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800 border-t-0"><code>{syntaxExample}</code></pre>
              <button 
                onclick={() => handleCopy(syntaxExample, 'syntax')}
                class="absolute top-10 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'syntax'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>

            <!-- Live Editable Component Sandbox -->
            <div class="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-4">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  <h3 class="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">Live Sandbox Preview</h3>
                </div>
                <span class="text-[10px] font-mono bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.04] px-2.5 py-0.5 rounded-full font-medium">Synchronized DOM</span>
              </div>

              <!-- Live Playground Sandbox Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div class="flex flex-col gap-3 bg-slate-50 dark:bg-white/[0.04] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.04]">
                  <label for="sandbox-metric-title" class="block text-[10px] font-mono font-bold text-slate-400 uppercase">Live Card Title</label>
                  <input 
                    id="sandbox-metric-title"
                    type="text" 
                    bind:value={sandboxTitle}
                    class="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white font-medium focus:outline-none focus:border-amber-400"
                  />

                  <label for="sandbox-metric-val" class="block text-[10px] font-mono font-bold text-slate-400 uppercase mt-2">Live Value</label>
                  <input 
                    id="sandbox-metric-val"
                    type="text" 
                    bind:value={sandboxValue}
                    class="w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>

                <!-- Actual Live Mounted Rendering -->
                <div class="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-slate-50 dark:bg-white/[0.04] min-h-[140px]">
                  <DataCard config={{ title: sandboxTitle, value: sandboxValue, trend: "+12.4% vs baseline", icon: "activity" }} />
                </div>
              </div>
            </div>

          </div>

        {:else if activeSection === 'api-reactivity'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Developer Reference</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">Core Reactivity API</h1>
            
            <!-- createSignal -->
            <div class="border-b border-slate-100 dark:border-white/[0.04] pb-6 mb-6">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white font-mono">createSignal(initialValue)</h2>
              <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Generates a reactive local state tuple. Reading invoking the getter subscribes current running effects. Calling setter triggers reactive execution.
              </p>
              <div class="relative group mt-3">
                <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto"><code>{signalExample}</code></pre>
                <button 
                  onclick={() => handleCopy(signalExample, 'api-sig')}
                  class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'api-sig'}
                    <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>

            <!-- createDerived -->
            <div class="border-b border-slate-100 dark:border-white/[0.04] pb-6 mb-6">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white font-mono">createDerived(fn)</h2>
              <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Establishes derived values that automatically track dependency changes. Computed value caches and recalculates only when dependencies mutate.
              </p>
              <div class="relative group mt-3">
                <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto"><code>{derivedExample}</code></pre>
                <button 
                  onclick={() => handleCopy(derivedExample, 'api-der')}
                  class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'api-der'}
                    <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>

            <!-- createEffect -->
            <div class="border-b border-slate-100 dark:border-white/[0.04] pb-6 mb-6">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white font-mono">createEffect(callback)</h2>
              <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Defines runtime side effects. Fires immediately on initialization and registers subscriptions on getters accessed inside callback.
              </p>
              <div class="relative group mt-3">
                <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto"><code>{effectExample}</code></pre>
                <button 
                  onclick={() => handleCopy(effectExample, 'api-eff')}
                  class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'api-eff'}
                    <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>

            <!-- mount -->
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white font-mono">Component Mount Instantiation</h2>
              <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Compiled Sola components export a default function executing mount. Arguments require target container node and properties schema map. Returns an unmount handler function.
              </p>
              <div class="relative group mt-3">
                <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto"><code>{mountExample}</code></pre>
                <button 
                  onclick={() => handleCopy(mountExample, 'api-mnt')}
                  class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'api-mnt'}
                    <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>

          </div>

        {:else if activeSection === 'api-macros'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Compiler Macros</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">Sola Compiler Macros</h1>

            <!-- $intent -->
            <div class="border-b border-slate-100 dark:border-white/[0.04] pb-6 mb-6">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white font-mono">$intent(prompt, options)</h2>
              <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Declared in script sections to resolve plain-text prompts into dynamically bound UI. Transpiles to core execution handler that polls Gemini AST models.
              </p>
              <div class="relative group mt-3">
                <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto"><code>{intentMacroExample}</code></pre>
                <button 
                  onclick={() => handleCopy(intentMacroExample, 'macro-int')}
                  class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'macro-int'}
                    <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>

            <!-- $data -->
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white font-mono">$data(sourceUri, options)</h2>
              <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Binds properties to remote live datasources. Transpiles to WebSocket signals polling target proxy configurations inside Sola Relay.
              </p>
              <div class="relative group mt-3">
                <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto"><code>{dataMacroExample}</code></pre>
                <button 
                  onclick={() => handleCopy(dataMacroExample, 'macro-dat')}
                  class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                  {#if copiedId === 'macro-dat'}
                    <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {:else}
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {/if}
                </button>
              </div>
            </div>
          </div>

        {:else if activeSection === 'relay-saas'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>SaaS Production Guide</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">Sola Relay SaaS Deployment</h1>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              To utilize Sola inside a production multi-tenant SaaS application, deploy Sola Relay close to your target databases and expose it via a secure reverse proxy with SSL termination.
            </p>

            <h3 class="font-bold text-slate-900 dark:text-white text-sm font-mono mt-6 mb-2">1. Docker Deployment (Containerization)</h3>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Orchestrate the Sola Relay server using a lightweight Node.js Docker container:
            </p>
            <div class="relative group mb-6">
              <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"><code>{dockerfileCode}</code></pre>
              <button 
                onclick={() => handleCopy(dockerfileCode, 'adm-dock')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'adm-dock'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>

            <h3 class="font-bold text-slate-900 dark:text-white text-sm font-mono mt-6 mb-2">2. Reverse Proxy SSL Routing (Nginx)</h3>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Map public requests securely to Sola Relay via an Nginx block with WebSockets upgrades support:
            </p>
            <div class="relative group mb-6">
              <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"><code>{nginxCode}</code></pre>
              <button 
                onclick={() => handleCopy(nginxCode, 'adm-ngx')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'adm-ngx'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>

            <h3 class="font-bold text-slate-900 dark:text-white text-sm font-mono mt-6 mb-2">3. Datasources Configuration</h3>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Use environment variables inside <code>relay.json</code> to load database passwords securely at runtime:
            </p>
            <div class="relative group mb-6">
              <pre class="bg-slate-900 text-amber-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800"><code>{relayJsonCode}</code></pre>
              <button 
                onclick={() => handleCopy(relayJsonCode, 'adm-json')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'adm-json'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>
          </div>

        {:else if activeSection === 'engine'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Architecture & Runtime</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">Compiler & Zero-VDOM Engine</h1>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Sola compiles template nodes into <strong>direct native DOM updates</strong> instead of running Virtual DOM diffing routines:
            </p>
            <div class="relative group mb-6">
              <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{engineExample}</code></pre>
              <button 
                onclick={() => handleCopy(engineExample, 'syntax-eng')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'syntax-eng'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-5 border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                <h4 class="font-bold text-slate-900 dark:text-white text-xs mb-1 font-mono">3.2 kB Core Bundle</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Zero third-party dependencies. Instant time-to-interactive on low-power devices.</p>
              </div>
              <div class="p-5 border border-slate-200 dark:border-white/[0.04] rounded-2xl bg-slate-50 dark:bg-white/[0.04]">
                <h4 class="font-bold text-slate-900 dark:text-white text-xs mb-1 font-mono">Fine-Grained Signals</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Only the precise text node or attribute that changed is modified in the DOM.</p>
              </div>
            </div>
          </div>

        {:else if activeSection === 'llm-spec'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>AI Integration</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">LLM & AI Agent Prompting Spec</h1>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-sans">
              Provide this exact system prompt context block to <strong>Claude 3.5/3.7</strong>, <strong>ChatGPT (GPT-4o)</strong>, or <strong>Gemini 2.5/3.0</strong> so any LLM can write valid Sola components, signals, and macro bindings without hallucinating:
            </p>

            <h3 class="font-bold text-slate-900 dark:text-white text-sm font-mono mt-6 mb-2">Copyable LLM Context Block</h3>
            <div class="relative group mb-8">
              <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{llmSystemPrompt}</code></pre>
              <button 
                onclick={() => handleCopy(llmSystemPrompt, 'llm-ctx')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'llm-ctx'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>
          </div>

        {:else if activeSection === 'host-embedding'}
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.04] text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold mb-3 uppercase tracking-wider">
              <span>Embedding Guide</span>
            </div>
            <h1 class="text-3xl font-black text-slate-950 dark:text-white tracking-[-0.03em] mb-4">Enterprise Platform & React Embedding</h1>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-sans">
              Because Sola compiles into pure, fine-grained DOM JavaScript (<code>~3.2 kB</code>), you can drop compiled Sola components directly into Enterprise Platform widgets or React applications without running a backend server or Docker container.
            </p>

            <h3 class="font-bold text-slate-900 dark:text-white text-sm font-mono mt-6 mb-2">1. Enterprise Platform Service Portal Widget Embedding</h3>
            <div class="relative group mb-8">
              <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{serviceNowEmbedCode}</code></pre>
              <button 
                onclick={() => handleCopy(serviceNowEmbedCode, 'sn-emb')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'sn-emb'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>

            <h3 class="font-bold text-slate-900 dark:text-white text-sm font-mono mt-6 mb-2">2. React Application Embedding (useEffect Hook)</h3>
            <div class="relative group mb-8">
              <pre class="bg-slate-900 text-amber-200 p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800"><code>{reactEmbedCode}</code></pre>
              <button 
                onclick={() => handleCopy(reactEmbedCode, 'react-emb')}
                class="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer">
                {#if copiedId === 'react-emb'}
                  <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {/if}
              </button>
            </div>
          </div>
        {/if}

      </main>

    </div>

  </div>
</div>
