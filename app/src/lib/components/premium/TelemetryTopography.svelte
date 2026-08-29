<script lang="ts">
  import { onMount } from 'svelte';

  let { config = {} }: { config?: {
    gridSize?: number;
  }} = $props();

  const size = config.gridSize || 15;
  let svgElement: SVGSVGElement;
  let polygons: SVGPolygonElement[] = [];

  // 2D height map
  const heights = Array.from({ length: size }, () => 
    Array.from({ length: size }, () => Math.random() * 50)
  );

  onMount(() => {
    let frameId: number;
    let time = 0;

    function tick() {
      time += 0.05;
      const width = svgElement?.clientWidth || 800;
      const height = svgElement?.clientHeight || 400;
      
      const tileW = width / (size * 1.5);
      const tileH = tileW * 0.5; // isometric ratio
      
      const startX = width / 2;
      const startY = height / 4;

      let index = 0;
      for (let y = 0; y < size - 1; y++) {
        for (let x = 0; x < size - 1; x++) {
          // Mutate height slightly with perlin-ish sine waves
          heights[y][x] += Math.sin(time + x * 0.5 + y * 0.5) * 1.5;
          heights[y][x] = Math.max(0, Math.min(100, heights[y][x]));

          // Isometric projection
          const project = (ix: number, iy: number, z: number) => {
            return {
              px: startX + (ix - iy) * tileW,
              py: startY + (ix + iy) * tileH - z
            };
          };

          const p1 = project(x, y, heights[y][x]);
          const p2 = project(x + 1, y, heights[y][x + 1]);
          const p3 = project(x + 1, y + 1, heights[y + 1][x + 1]);
          const p4 = project(x, y + 1, heights[y + 1][x]);

          if (polygons[index]) {
            polygons[index].setAttribute(
              'points', 
              `${p1.px},${p1.py} ${p2.px},${p2.py} ${p3.px},${p3.py} ${p4.px},${p4.py}`
            );
            
            // Dynamic color based on height
            const h = heights[y][x];
            const opacity = 0.2 + (h / 100) * 0.8;
            polygons[index].setAttribute('fill', `rgba(16, 185, 129, ${opacity})`);
          }
          index++;
        }
      }

      frameId = requestAnimationFrame(tick);
    }
    
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  });
</script>

<div class="w-full h-full min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner">
  <svg bind:this={svgElement} class="absolute inset-0 w-full h-full">
    <g stroke="rgba(255,255,255,0.1)" stroke-width="1">
      {#each Array((size - 1) * (size - 1)) as _, i}
        <polygon bind:this={polygons[i]} />
      {/each}
    </g>
  </svg>
</div>
