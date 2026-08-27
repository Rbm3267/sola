<script lang="ts">
  import DataCard from './DataCard.svelte';
  import DynamicForm from './DynamicForm.svelte';
  import ListBlock from './ListBlock.svelte';

  const { intentPayload } = $props<{
    intentPayload: {
      component: string;
      config: any;
    } | null;
  }>();

  const componentRegistry: Record<string, any> = {
    DataCard: DataCard,
    DynamicForm: DynamicForm,
    ListBlock: ListBlock
  };

  const ResolvedComponent = $derived(
    intentPayload ? componentRegistry[intentPayload.component] : null
  );

  function handleFormSubmit(data: any) {
    console.log("Form submitted dynamically:", data);
  }
</script>

{#if ResolvedComponent && intentPayload}
  <ResolvedComponent config={intentPayload.config} onSubmit={handleFormSubmit} />
{:else if intentPayload}
  <div class="p-4 text-red-400 border border-red-500 rounded-lg">
    Unknown component requested: {intentPayload.component}
  </div>
{/if}
