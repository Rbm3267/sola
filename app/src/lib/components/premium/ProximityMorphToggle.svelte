<script lang="ts">
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';

  let { checked = $bindable(false) } = $props();

  let containerElement: HTMLDivElement;
  let isHovered = $state(false);

  // Springs for morphing geometry
  const widthStr = spring(48, { stiffness: 0.1, damping: 0.4 });
  const heightStr = spring(4, { stiffness: 0.1, damping: 0.4 });
  const rxStr = spring(2, { stiffness: 0.1, damping: 0.4 });
  
  const knobX = spring(checked ? 24 : 0, { stiffness: 0.1, damping: 0.5 });
  const knobOpacity = spring(0, { stiffness: 0.1, damping: 0.5 });

  $effect(() => {
    if (checked) {
      knobX.set(isHovered ? 24 : 20);
    } else {
      knobX.set(isHovered ? -24 : -20);
    }
  });

  function handleMouseMove(e: MouseEvent) {
    if (!containerElement) return;
    const rect = containerElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
    
    // Ambient proximity detection (radius 150px)
    if (dist < 150) {
      const intensity = 1 - (dist / 150);
      widthStr.set(48 + intensity * 12);
      heightStr.set(4 + intensity * 24); // Morphs from 4px line to 28px pill
      rxStr.set(2 + intensity * 12);
      knobOpacity.set(intensity);
    } else {
      widthStr.set(48);
      heightStr.set(4);
      rxStr.set(2);
      knobOpacity.set(0);
    }
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  });

  function toggle() {
    checked = !checked;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  bind:this={containerElement}
  class="w-full min-h-[100px] flex items-center justify-center cursor-pointer"
  onclick={toggle}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <svg width="100" height="60" viewBox="0 0 100 60" class="overflow-visible">
    <defs>
      <filter id="morph-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background morphing track -->
    <rect
      x={50 - $widthStr / 2}
      y={30 - $heightStr / 2}
      width={$widthStr}
      height={$heightStr}
      rx={$rxStr}
      fill={checked ? '#10b981' : '#cbd5e1'}
      class="transition-colors duration-300"
    />

    <!-- Knob (only appears as it morphs into a pill) -->
    <circle
      cx={50 + $knobX}
      cy="30"
      r={$heightStr / 2 - 2}
      fill="#fff"
      opacity={$knobOpacity}
      filter={checked ? "url(#morph-glow)" : "none"}
    />
  </svg>
</div>
