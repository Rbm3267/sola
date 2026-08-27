<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let { 
    state = 'idle', // 'idle' | 'synthesizing' | 'listening' | 'mounted'
    size = 240,
    showTelemetry = true
  } = $props<{
    state?: 'idle' | 'synthesizing' | 'listening' | 'mounted';
    size?: number;
    showTelemetry?: boolean;
  }>();

  let canvas: HTMLCanvasElement;
  let animationFrameId: number;
  let time = 0;

  // Particle flux system
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
  }

  let particles: Particle[] = [];

  onMount(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numTentacles = 8;
    const segmentsPerTentacle = 24;

    function render() {
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Speed & intensity based on state
      const isSynthesizing = state === 'synthesizing';
      const isListening = state === 'listening';
      const speed = isSynthesizing ? 0.06 : isListening ? 0.04 : 0.02;
      time += speed;

      // ─── 1. Background Aurora Bioluminescence ───
      const glowRadius = isSynthesizing ? size * 0.75 : size * 0.55;
      const radialGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      if (isSynthesizing) {
        radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        radialGlow.addColorStop(0.4, 'rgba(14, 165, 233, 0.3)');
        radialGlow.addColorStop(0.8, 'rgba(139, 92, 246, 0.15)');
        radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else if (isListening) {
        radialGlow.addColorStop(0, 'rgba(244, 63, 94, 0.5)');
        radialGlow.addColorStop(0.5, 'rgba(251, 146, 60, 0.25)');
        radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        radialGlow.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
        radialGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
        radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }

      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─── 2. Orbital Quantum Flux Rings ───
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.5);

      ctx.strokeStyle = isSynthesizing ? 'rgba(245, 158, 11, 0.5)' : 'rgba(14, 165, 233, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-time * 0.9);
      ctx.strokeStyle = isSynthesizing ? 'rgba(14, 165, 233, 0.6)' : 'rgba(139, 92, 246, 0.25)';
      ctx.setLineDash([4, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ─── 3. Organic Fluid Tentacles ───
      for (let i = 0; i < numTentacles; i++) {
        const baseAngle = (i / numTentacles) * Math.PI * 2 + (isSynthesizing ? time * 1.5 : time * 0.3);
        
        ctx.save();
        ctx.translate(centerX, centerY);

        ctx.beginPath();
        let prevX = 0;
        let prevY = 0;
        ctx.moveTo(0, 0);

        for (let s = 0; s < segmentsPerTentacle; s++) {
          const tProgress = s / segmentsPerTentacle;
          const length = (size * 0.34) * (1 + Math.sin(time * 2 + i) * 0.18);
          
          // Fluid wave formulas: curling spiral with harmonic oscillations
          const wave = Math.sin(time * 3 - s * 0.35 + i * 1.2) * (18 * tProgress);
          const curl = Math.cos(time * 2 - s * 0.25 + i * 0.8) * (24 * tProgress * tProgress);
          
          const angle = baseAngle + (wave + curl) * 0.05;
          const r = length * tProgress;
          
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            const cx = (prevX + x) / 2;
            const cy = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cx, cy);
          }

          prevX = x;
          prevY = y;
        }

        // Color gradient per tentacle (Cyan -> Sola Amber -> Deep Violet)
        const gradient = ctx.createLinearGradient(0, 0, prevX, prevY);
        if (isSynthesizing) {
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(0.5, '#0ea5e9');
          gradient.addColorStop(1, '#8b5cf6');
        } else if (isListening) {
          gradient.addColorStop(0, '#fb7185');
          gradient.addColorStop(0.5, '#f59e0b');
          gradient.addColorStop(1, '#e11d48');
        } else {
          gradient.addColorStop(0, '#0ea5e9');
          gradient.addColorStop(0.6, '#38bdf8');
          gradient.addColorStop(1, '#6366f1');
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = isSynthesizing ? 4.5 * (1 + Math.sin(time * 4 + i) * 0.2) : 3.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = isSynthesizing ? 'rgba(245, 158, 11, 0.8)' : 'rgba(14, 165, 233, 0.6)';
        ctx.shadowBlur = isSynthesizing ? 20 : 12;
        ctx.stroke();

        // Tip bioluminescent bulb
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(prevX, prevY, isSynthesizing ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ─── 4. Living Nucleus Core ───
      ctx.save();
      ctx.translate(centerX, centerY);

      // Core pulse
      const corePulse = 1 + Math.sin(time * 4) * (isSynthesizing ? 0.25 : 0.1);
      const coreRadius = (size * 0.11) * corePulse;

      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.3, isSynthesizing ? '#fbbf24' : '#38bdf8');
      coreGradient.addColorStop(0.8, isSynthesizing ? '#d97706' : '#0284c7');
      coreGradient.addColorStop(1, '#090d19');

      ctx.fillStyle = coreGradient;
      ctx.shadowColor = isSynthesizing ? 'rgba(245, 158, 11, 1)' : 'rgba(14, 165, 233, 0.9)';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Specular core ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // ─── 5. Particle Generator ───
      if (isSynthesizing && Math.random() < 0.6) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = size * 0.15;
        particles.push({
          x: centerX + Math.cos(pAngle) * pDist,
          y: centerY + Math.sin(pAngle) * pDist,
          vx: (Math.cos(pAngle) + (Math.random() - 0.5)) * 2.5,
          vy: (Math.sin(pAngle) + (Math.random() - 0.5)) * 2.5,
          life: 0,
          maxLife: 30 + Math.random() * 20,
          size: 1.5 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#f59e0b' : '#38bdf8'
        });
      }

      // Render particles
      for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
        const p = particles[pIdx];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const pAlpha = 1 - (p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, pAlpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife) {
          particles.splice(pIdx, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  });

  onDestroy(() => {
    if (animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(animationFrameId);
    }
  });
</script>

<div class="relative flex flex-col items-center justify-center select-none">
  <!-- Canvas Canvas Living Organism -->
  <div class="relative flex items-center justify-center">
    <canvas 
      bind:this={canvas} 
      width={size * 2} 
      height={size * 2} 
      style="width: {size}px; height: {size}px;"
      class="pointer-events-none drop-shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-transform duration-500"
    ></canvas>
  </div>

  <!-- Real-Time Quantum Telemetry Readout -->
  {#if showTelemetry}
    <div class="mt-2 flex flex-col items-center gap-1.5 text-center">
      <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur-md">
        <span class="w-2 h-2 rounded-full {state === 'synthesizing' ? 'bg-amber-400 animate-ping' : state === 'listening' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400 animate-pulse'}"></span>
        <span class="font-bold uppercase tracking-wider">
          {#if state === 'synthesizing'}
            Synthesizing Reactive DOM Tree...
          {:else if state === 'listening'}
            Listening to Ambient Voice Intent...
          {:else}
            Zero-VDOM Runtime Active
          {/if}
        </span>
      </div>
      <span class="text-[10px] font-mono text-slate-400">
        3.2 kB Core • Mathematical Signal Propagation
      </span>
    </div>
  {/if}
</div>
