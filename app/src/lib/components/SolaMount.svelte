<script lang="ts">
  import { onMount } from 'svelte';

  let {
    component = undefined,
    props = {}
  } = $props<{
    component?: (target: HTMLElement, props?: Record<string, any>) => (() => void) | void;
    props?: Record<string, any>;
  }>();

  let container = $state<HTMLDivElement | null>(null);

  onMount(() => {
    if (container && typeof component === 'function') {
      const cleanup = component(container, props);
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  });
</script>

<div bind:this={container} class="w-full"></div>
