<script lang="ts">
  export interface WaterfallStep {
    id: string;
    name: string;
    delta: number; // positive or negative value
    type: 'start' | 'credit' | 'debit' | 'subtotal' | 'total';
    unitLabel?: string;
    formattedValue?: string;
  }

  export interface FlowWaterfallConfig {
    title: string;
    subtitle?: string;
    unit?: string; // '$', 'ms', 'MB'
    steps?: WaterfallStep[];
  }

  let { config } = $props<{ config: FlowWaterfallConfig }>();

  let activeStep = $state<WaterfallStep | null>(null);

  const defaultSteps: WaterfallStep[] = [
    { id: 's-1', name: 'Gross Payment Volume', delta: 184200, type: 'start', formattedValue: '$184,200' },
    { id: 's-2', name: 'Stripe Interchange & Processing', delta: -5340, type: 'debit', formattedValue: '-$5,340' },
    { id: 's-3', name: 'AWS Cloud Compute Egress', delta: -1820, type: 'debit', formattedValue: '-$1,820' },
    { id: 's-4', name: 'Enterprise Contract Add-ons', delta: 14800, type: 'credit', formattedValue: '+$14,800' },
    { id: 's-5', name: 'Chargeback Reserve Buffer', delta: -800, type: 'debit', formattedValue: '-$800' },
    { id: 's-6', name: 'Net Settlement Payout', delta: 191040, type: 'total', formattedValue: '$191,040' }
  ];

  const steps = $derived(config.steps && config.steps.length > 0 ? config.steps : defaultSteps);

  const maxVal = $derived(Math.max(...steps.map(s => Math.abs(s.delta)), 200000));
</script>

<div class="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all">
  
  <!-- Header -->
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <h3 class="text-base font-black text-slate-950 tracking-tight font-mono">{config.title || 'Revenue Realization & Margin Breakdown'}</h3>
      </div>
      <p class="text-xs text-slate-500">{config.subtitle || 'End-to-end reconciliation across billing gateway and cloud infrastructure'}</p>
    </div>

    <!-- Final Value Highlight -->
    <div class="text-right">
      <span class="text-[10px] font-mono text-slate-400 block uppercase">Net Realized</span>
      <span class="text-lg font-black text-slate-950 font-mono tracking-tight text-emerald-600">
        {steps[steps.length - 1]?.formattedValue || '$191,040'}
      </span>
    </div>
  </div>

  <!-- Waterfall Bar Visualization -->
  <div class="space-y-3 mb-6">
    {#each steps as step, idx}
      {@const pct = Math.min(Math.max((Math.abs(step.delta) / maxVal) * 100, 12), 100)}
      <button 
        type="button"
        onmouseenter={() => activeStep = step}
        onmouseleave={() => activeStep = null}
        class="w-full text-left p-2.5 rounded-2xl transition-all cursor-pointer group flex items-center justify-between gap-4 border {activeStep?.id === step.id ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/60'}">
        
        <div class="flex items-center gap-2.5 min-w-[180px]">
          <span class="w-2 h-2 rounded-full {step.type === 'total' ? 'bg-indigo-600' : step.delta >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
          <span class="text-xs font-mono font-bold text-slate-800 truncate">{step.name}</span>
        </div>

        <!-- Relative Bar -->
        <div class="flex-1 max-w-xs h-3.5 bg-slate-200/80 rounded-full overflow-hidden flex items-center p-0.5">
          <div 
            class="h-full rounded-full transition-all duration-500 {step.type === 'total' ? 'bg-indigo-600' : step.delta >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}"
            style="width: {pct}%;">
          </div>
        </div>

        <!-- Value Metric -->
        <div class="text-right min-w-[90px]">
          <span class="text-xs font-mono font-black {step.type === 'total' ? 'text-indigo-600' : step.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
            {step.formattedValue || (step.delta >= 0 ? `+${step.delta}` : `${step.delta}`)}
          </span>
        </div>
      </button>
    {/each}
  </div>

  <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-100">
    <span>Zero-VDOM Financial Split Stream</span>
    <span>Auto-Reconciled • 0.2ms Signal</span>
  </div>

</div>
