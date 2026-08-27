<script lang="ts">
  import DataCard from './DataCard.svelte';
  import GaugeCard from './GaugeCard.svelte';
  import DynamicForm from './DynamicForm.svelte';
  import ListBlock from './ListBlock.svelte';

  const props = $props<{
    intentPayload?: { component: string; config: any } | null;
    data?: { component: string; config: any } | null;
  }>();

  const payload = $derived(props.data || props.intentPayload || null);

  const componentRegistry: Record<string, any> = {
    DataCard: DataCard,
    GaugeCard: GaugeCard,
    DynamicForm: DynamicForm,
    ListBlock: ListBlock
  };

  const ResolvedComponent = $derived(
    payload && payload.component ? componentRegistry[payload.component] : null
  );

  function handleFormSubmit(data: any) {
    console.log("Form submitted dynamically:", data);
  }
</script>

{#if ResolvedComponent && payload}
  <ResolvedComponent config={payload.config} onSubmit={handleFormSubmit} />
{:else if payload}
  <div class="p-4 text-red-400 border border-red-500 rounded-lg">
    Unknown component requested: {payload.component}
  </div>
{/if}
