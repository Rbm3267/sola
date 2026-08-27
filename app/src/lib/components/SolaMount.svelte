<script lang="ts">
  import { onMount } from 'svelte';
  import mountSolaPlayground from './SolaPlayground.sola';

  let container: HTMLDivElement;

  onMount(() => {
    if (container) {
      const cleanup = mountSolaPlayground(container);
      return cleanup;
    }
  });
</script>

<div bind:this={container} class="w-full"></div>
