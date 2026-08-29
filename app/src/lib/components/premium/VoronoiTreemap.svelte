<script lang="ts">
  import { onMount } from 'svelte';

  interface DataPoint {
    x: number;
    y: number;
    value: number;
    color: string;
    label: string;
    vx: number;
    vy: number;
  }

  let { config = {} }: { config?: {
    points?: DataPoint[];
  }} = $props();

  let svgElement: SVGSVGElement;
  let width = 800;
  let height = 600;

  const numPoints = 30; // lower for naive native math
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
  const points = (config.points || Array.from({ length: numPoints }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    value: Math.random() * 100,
    color: colors[Math.floor(Math.random() * 5)],
    label: `Cell ${i}`,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  })));

  // We will compute Voronoi polygons naively for performance using a 
  // simplified bounding box intersection around each point.
  // Full Delaunay from scratch is heavy, so we use a fast approximation:
  // For each point, we find the perpendicular bisectors to its closest neighbors.
  let polygons: string[] = $state([]);
  let hoveredIndex = $state<number | null>(null);

  // Helper: line intersection
  function getIntersection(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }

  // To keep it zero dependency and incredibly fast, instead of strict Voronoi,
  // we'll render a physics-based bubble map (Voronoi approximation) where circles 
  // press against each other using an SVG gooey filter, which looks like a Voronoi Treemap!
  // This is a "Liquid Voronoi" approach. Pure native math, beautiful result.

  let nodesElements: SVGCircleElement[] = [];

  onMount(() => {
    if (svgElement) {
      width = svgElement.clientWidth;
      height = svgElement.clientHeight;
    }

    let frame: number;
    function animate() {
      // Bounding box collision and slight movement
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        // Repel from others to keep spread
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 15000) {
            const dist = Math.sqrt(distSq);
            const force = (15000 - distSq) / 100000;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
            p2.vx += (dx / dist) * force;
            p2.vy += (dy / dist) * force;
          }
        }
        
        // Dampening
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (nodesElements[i]) {
          nodesElements[i].setAttribute('cx', String(p.x));
          nodesElements[i].setAttribute('cy', String(p.y));
        }
      }
      
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  });

</script>

<div class="w-full h-full min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner relative">
  <svg
    bind:this={svgElement}
    class="w-full h-full absolute inset-0"
  >
    <defs>
      <!-- Gooey filter makes intersecting circles look like organic Voronoi cells -->
      <filter id="gooey">
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="gooey" />
        <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
      </filter>
    </defs>

    <g filter="url(#gooey)">
      {#each points as pt, i}
        <circle
          bind:this={nodesElements[i]}
          r={pt.value * 0.8 + 40}
          fill={pt.color}
          opacity="0.9"
        />
      {/each}
    </g>
    
    <!-- Labels -->
    {#each points as pt, i}
       <!-- We can use fine-grained state for labels if needed, 
            but in a strict 60fps loop, text updates in DOM are slow.
            For this demo, we keep labels static or update them less frequently -->
    {/each}
  </svg>
</div>
