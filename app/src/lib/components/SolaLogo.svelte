<script lang="ts">
  import { onMount } from 'svelte';

  let { 
    size = 'md', 
    interactive = true,
    spinning = true,
    showGlow = true
  } = $props<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
    interactive?: boolean;
    spinning?: boolean;
    showGlow?: boolean;
  }>();

  let mounted = $state(false);

  onMount(() => {
    // Trigger emergence animation
    setTimeout(() => {
      mounted = true;
    }, 50);
  });

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    hero: 'w-32 h-32 md:w-40 md:h-40'
  };

  const glowSizes = {
    xs: 'w-12 h-12 -inset-2.5',
    sm: 'w-16 h-16 -inset-3.5',
    md: 'w-20 h-20 -inset-4.5',
    lg: 'w-28 h-28 -inset-6',
    xl: 'w-36 h-36 -inset-6',
    hero: 'w-56 h-56 -inset-8'
  };
</script>

<div class="relative inline-flex items-center justify-center select-none group/logo {interactive ? 'cursor-pointer' : ''}">
  
  <!-- Backlit Aurora Ambient Glow -->
  {#if showGlow}
    <div class="absolute {glowSizes[size]} rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-violet-500 opacity-20 group-hover/logo:opacity-50 blur-xl transition-all duration-700 pointer-events-none {mounted ? 'scale-100' : 'scale-50 opacity-0'}"></div>
    <div class="absolute {glowSizes[size]} rounded-full bg-gradient-to-bl from-cyan-300 via-sky-400 to-indigo-500 opacity-15 group-hover/logo:opacity-35 blur-2xl transition-all duration-700 pointer-events-none animate-sola-pulse"></div>
  {/if}

  <!-- Rotating Solar Container -->
  <div 
    class="relative z-10 flex items-center justify-center transition-all duration-1000 ease-out transform-gpu
      {mounted ? 'scale-100 opacity-100 rotate-0 blur-none' : 'scale-50 opacity-0 -rotate-90 blur-md'}
      {spinning ? 'animate-sola-spin' : ''}
      group-hover/logo:scale-105"
    style="will-change: transform;"
  >
    <img 
      src="/logo.png" 
      alt="Sola Sun Logo" 
      class="{sizeClasses[size]} object-contain drop-shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all duration-500"
    />
  </div>
</div>

<style>
  @keyframes sola-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes sola-pulse {
    0%, 100% {
      transform: scale(0.95);
      opacity: 0.2;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.4;
    }
  }

  :global(.animate-sola-spin) {
    animation: sola-spin 32s linear infinite;
  }

  :global(.group\/logo:hover .animate-sola-spin) {
    animation-duration: 12s; /* Gentle acceleration on hover */
  }

  :global(.animate-sola-pulse) {
    animation: sola-pulse 6s ease-in-out infinite;
  }
</style>
