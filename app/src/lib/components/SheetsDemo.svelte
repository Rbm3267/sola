<script lang="ts">
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import { fade, fly } from 'svelte/transition';

  let activeMode = $state<'personal' | 'enterprise'>('personal');
  let sheetId = $state('1WwRxcYopR7nCVKiu3ZcYuPiqdeBASwkAtYAHjWV3x8w');
  let isSimulatingUpdate = $state(false);

  // Personal Mock Sheet State (Reta Tracker)
  let retaData = $state({
    date: 'Today',
    dose: 2.0,
    weight: 168.4,
    phase: 'Restart',
    delta: '-3.2 lbs',
    streak: 18
  });

  // Enterprise Mock Data
  let enterpriseData = $state({
    mrr: '$148,200',
    growth: '+24.8%',
    activeNodes: '64 / 64',
    clusterUptime: '99.99%',
    cpuLoad: 42
  });

  function simulateNewWeighIn() {
    isSimulatingUpdate = true;
    setTimeout(() => {
      const newWeight = (retaData.weight - 0.4).toFixed(1);
      retaData = {
        ...retaData,
        weight: parseFloat(newWeight),
        delta: '-3.6 lbs'
      };
      isSimulatingUpdate = false;
    }, 600);
  }
</script>

<section class="w-full py-16 border-t border-slate-200/80 relative">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Section Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold mb-3">
          <span>$data • Zero-Backend Data Surfacing</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-950 tracking-[-0.03em]">
          Connect any data source. In 1 line of code.
        </h2>
        <p class="text-slate-600 text-base max-w-xl mt-2 leading-relaxed">
          Whether you're building a <strong>personal bio-tracker from Google Sheets</strong> or an <strong>enterprise SaaS dashboard from PostgreSQL</strong>, Sola turns raw data into reactive luxury UI.
        </p>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="flex items-center gap-1 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/60 self-start md:self-auto">
        <button 
          onclick={() => activeMode = 'personal'}
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 {activeMode === 'personal' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}">
          <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Personal Bio & Logs</span>
        </button>
        <button 
          onclick={() => activeMode = 'enterprise'}
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 {activeMode === 'enterprise' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}">
          <svg class="w-3.5 h-3.5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>Enterprise SaaS</span>
        </button>
      </div>
    </div>

    <!-- Interactive Live Surface Display -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      
      <!-- Code View Column -->
      <div class="lg:col-span-5 bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-mono font-bold text-slate-300">
                {activeMode === 'personal' ? 'App.sola (Personal Tracker)' : 'App.sola (Enterprise Cluster)'}
              </span>
            </div>
            <span class="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-sky-300">
              zero-vdom
            </span>
          </div>

          <pre class="font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre"><code>{#if activeMode === 'personal'}&lt;script&gt;
  // 1 line Google Sheets reactive binding
  const reta = $data("sheet://{sheetId}");
&lt;/script&gt;

&lt;!-- Sola auto-mounts reactive UI --&gt;
&lt;DataCard 
  title="Weight" 
  value="&#123;reta.latest.weight&#125; lbs" 
  trend="&#123;reta.delta&#125;" 
/&gt;
&lt;DataCard 
  title="Active Dose" 
  value="&#123;reta.latest.dose&#125; mg" 
  trend="&#123;reta.phase&#125;" 
/&gt;{:else}&lt;script&gt;
  // Zero-knowledge DB connector (credentials stay local)
  const stats = $data("postgres://internal/metrics");
&lt;/script&gt;

&lt;DataCard title="MRR" value="&#123;stats.mrr&#125;" trend="&#123;stats.growth&#125;" /&gt;
&lt;GaugeCard title="Cluster CPU" value="&#123;stats.cpu&#125;%" /&gt;{/if}</code></pre>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Polling interval: 15s</span>
          <span class="text-emerald-400 font-bold">Auto-Synchronized</span>
        </div>
      </div>

      <!-- Live Rendered UI Column -->
      <div class="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
        
        <div>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                {activeMode === 'personal' ? 'Google Sheet Stream: Retatrutide Log' : 'PostgreSQL Stream: Cloud Nodes'}
              </span>
            </div>
            {#if activeMode === 'personal'}
              <button 
                onclick={simulateNewWeighIn}
                disabled={isSimulatingUpdate}
                class="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5">
                {#if isSimulatingUpdate}
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Syncing...</span>
                {:else}
                  <span>+ Log New Weigh-In</span>
                {/if}
              </button>
            {/if}
          </div>

          <!-- Live Rendered Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#if activeMode === 'personal'}
              <DataCard config={{
                title: "Weight (lbs)",
                value: `${retaData.weight} lbs`,
                trend: retaData.delta,
                icon: "trending-up"
              }} />
              <DataCard config={{
                title: "Active Protocol",
                value: `${retaData.dose} mg`,
                trend: `${retaData.phase} Phase`,
                icon: "activity"
              }} />
              <div class="sm:col-span-2">
                <GaugeCard config={{
                  title: "Hydration & Recovery Index",
                  value: "92 / 100",
                  percentage: 92,
                  subtext: `${retaData.streak}-Day Consistent Logging Streak`,
                  color: "emerald"
                }} />
              </div>
            {:else}
              <DataCard config={{
                title: "Monthly Recurring Revenue",
                value: enterpriseData.mrr,
                trend: enterpriseData.growth,
                icon: "trending-up"
              }} />
              <DataCard config={{
                title: "Edge Availability",
                value: enterpriseData.clusterUptime,
                trend: "64 Nodes Online",
                icon: "check"
              }} />
              <div class="sm:col-span-2">
                <GaugeCard config={{
                  title: "Cluster Compute Utilization",
                  value: `${enterpriseData.cpuLoad}%`,
                  percentage: enterpriseData.cpuLoad,
                  subtext: "Auto-scaled across 3 Availability Zones",
                  color: "sky"
                }} />
              </div>
            {/if}
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Source: {activeMode === 'personal' ? 'Google Sheets GID #922583776' : 'PostgreSQL Database pool'}</span>
          <span class="text-slate-900 font-bold">0 ms Latency</span>
        </div>

      </div>

    </div>

  </div>
</section>
