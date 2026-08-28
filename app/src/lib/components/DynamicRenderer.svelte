<script lang="ts">
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import DynamicForm from './DynamicForm.svelte';
  import ListBlock from './ListBlock.svelte';
  import StreamView from './StreamView.svelte';
  import ClusterMatrix from './ClusterMatrix.svelte';
  import DiffAudit from './DiffAudit.svelte';
  import FlowWaterfall from './FlowWaterfall.svelte';
  import IncidentTriageMatrix from './IncidentTriageMatrix.svelte';
  import SchemaInspector from './SchemaInspector.svelte';
  import TactileDialCard from './TactileDialCard.svelte';

  const props = $props<{
    intentPayload?: any;
    data?: any;
  }>();

  const payload = $derived(props.data || props.intentPayload || null);

  const componentRegistry: Record<string, any> = {
    DataCard,
    GaugeCard,
    DynamicForm,
    ListBlock,
    StreamView,
    ClusterMatrix,
    DiffAudit,
    FlowWaterfall,
    IncidentTriageMatrix,
    SchemaInspector,
    TactileDialCard
  };

  const items = $derived<Array<{ component: string; config: any; colSpan?: number }>>(
    Array.isArray(payload) ? payload : payload && payload.component ? [payload] : []
  );

  function handleFormSubmit(formData: any) {
    console.log("Sola dynamic form dispatched:", formData);
  }
</script>

{#if items.length > 0}
  {#if items.length === 1}
    {@const item = items[0]}
    {@const Comp = componentRegistry[item.component]}
    {#if Comp}
      <Comp config={item.config || {}} onSubmit={handleFormSubmit} />
    {:else}
      <div class="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-mono">
        Unknown component primitive: {item.component}
      </div>
    {/if}
  {:else}
    <!-- Multi-Component Responsive Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {#each items as item}
        {@const Comp = componentRegistry[item.component]}
        <div class="{item.colSpan === 3 ? 'md:col-span-2 lg:col-span-3' : item.colSpan === 2 ? 'md:col-span-2' : 'col-span-1'} w-full">
          {#if Comp}
            <Comp config={item.config || {}} onSubmit={handleFormSubmit} />
          {:else}
            <div class="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-mono">
              Unknown primitive: {item.component}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
{/if}
