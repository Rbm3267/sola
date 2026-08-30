<script lang="ts">
  let { 
    component, 
    props = {}, 
    class: className = '' 
  } = $props<{
    component: (target: HTMLElement, props?: any) => () => void;
    props?: any;
    class?: string;
  }>();

  let containerEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!containerEl || !component) return;
    containerEl.innerHTML = '';
    const unmount = component(containerEl, props);
    return () => {
      if (typeof unmount === 'function') unmount();
    };
  });
</script>

<div bind:this={containerEl} class="sola-native-host {className}"></div>
