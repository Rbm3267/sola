<script lang="ts">
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';

  let activeMode = $state<'personal' | 'enterprise'>('personal');
  let isSimulatingUpdate = $state(false);

  // Personal Mock Sheet State (Kettlebell & Athletic Performance Log)
  let fitnessData = $state({
    workout: 'Armor Building Complex',
    volumeMoved: '14,800 lbs',
    dailyVolumeDelta: '+1,200 lbs',
    weeklyTargetPct: 88,
    recoveryScore: 94,
    readiness: 'Optimal'
  });

  // Enterprise Mock Data
  let enterpriseData = $state({
    mrr: '$148,200',
    growth: '+24.8%',
    activeNodes: '64 / 64',
    clusterUptime: '99.99%',
    cpuLoad: 42
  });

  function simulateNewSession() {
    isSimulatingUpdate = true;
    setTimeout(() => {
      fitnessData = {
        ...fitnessData,
        volumeMoved: '16,200 lbs',
        dailyVolumeDelta: '+2,600 lbs',
        weeklyTargetPct: 96,
        recoveryScore: 96
      };
      isSimulatingUpdate = false;
    }, 500);
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
          Whether you're building a <strong>personal workout & volume tracker from Google Sheets</strong> or an <strong>enterprise SaaS dashboard from PostgreSQL</strong>, Sola turns raw data into reactive luxury UI.
        </p>
      </div>

      <!-- Segmented Mode Switcher -->
      <div class="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 self-start md:self-auto">
        <button 
          onclick={() => activeMode = 'personal'}
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 {activeMode === 'personal' ? 'bg-amber-500/10 text-amber-950 border border-amber-500/25 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'}">
          <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Personal Training & Fitness</span>
        </button>
        <button 
          onclick={() => activeMode = 'enterprise'}
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 {activeMode === 'enterprise' ? 'bg-amber-500/10 text-amber-950 border border-amber-500/25 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'}">
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
                {activeMode === 'personal' ? 'App.sola (Kettlebell Training Log)' : 'App.sola (Enterprise Cluster)'}
              </span>
            </div>
            <span class="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-sky-300">
              zero-vdom
            </span>
          </div>

          <pre class="font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre"><code>{#if activeMode === 'personal'}&lt;script&gt;
  // 1 line Google Sheets reactive binding
  const training = $data("sheet://1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms");
&lt;/script&gt;

&lt;!-- Sola auto-mounts reactive UI --&gt;
&lt;DataCard 
  title="Daily Volume" 
  value="&#123;training.volume&#125;" 
  trend="&#123;training.delta&#125;" 
/&gt;
&lt;GaugeCard 
  title="Recovery Index" 
  value="&#123;training.recovery&#125; / 100" 
  percentage=&#123;training.recovery&#125; 
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
                {activeMode === 'personal' ? 'Google Sheet Stream: Kettlebell Athletic Log' : 'PostgreSQL Stream: Cloud Nodes'}
              </span>
            </div>
            {#if activeMode === 'personal'}
              <button 
                onclick={simulateNewSession}
                disabled={isSimulatingUpdate}
                class="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5">
                {#if isSimulatingUpdate}
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Syncing...</span>
                {:else}
                  <span>+ Log Workout Set</span>
                {/if}
              </button>
            {/if}
          </div>

          <!-- Live Rendered Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#if activeMode === 'personal'}
              <DataCard config={{
                title: "Daily Volume Moved",
                value: fitnessData.volumeMoved,
                trend: fitnessData.dailyVolumeDelta,
                icon: "activity"
              }} />
              <DataCard config={{
                title: "Primary Protocol",
                value: fitnessData.workout,
                trend: "Heavy Bell Cycles",
                icon: "trending-up"
              }} />
              <div class="sm:col-span-2">
                <GaugeCard config={{
                  title: "Recovery & Readiness Score",
                  value: `${fitnessData.recoveryScore} / 100`,
                  percentage: fitnessData.recoveryScore,
                  subtext: `${fitnessData.readiness} State • HRV 78ms`,
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
          <span>Source: {activeMode === 'personal' ? 'Google Sheets • Training Tab' : 'PostgreSQL Database pool'}</span>
          <span class="text-slate-900 font-bold">0 ms Latency</span>
        </div>

      </div>

    </div>

  </div>
</section>
