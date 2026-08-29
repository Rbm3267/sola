<script lang="ts">
  import type { SolaAST, SolaASTNode } from '../types/ast';
  import { spring } from 'svelte/motion';
  import { onMount } from 'svelte';

  let { ast = { viewBox: '0 0 100 100', primitives: [] } as SolaAST } = $props();

  // Create a spring configuration for drawing/morphing animations
  // We don't apply springs to every single attribute yet to save overhead,
  // but we can apply it to paths if needed later.

  function applyAnimationHint(node: HTMLElement | SVGElement, hint: SolaASTNode['animationHint']) {
    if (!hint || hint === 'none') return;
    
    // Add simple CSS classes or inline animations based on hints
    if (hint === 'pulse') {
      node.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    } else if (hint === 'spin') {
      node.style.animation = 'spin 3s linear infinite';
      node.style.transformOrigin = 'center';
    } else if (hint === 'float') {
      node.style.animation = 'float 3s ease-in-out infinite';
    } else if (hint === 'draw') {
      if (node instanceof SVGPathElement) {
        const length = node.getTotalLength();
        node.style.strokeDasharray = `${length}`;
        node.style.strokeDashoffset = `${length}`;
        node.style.animation = 'draw 1.5s ease-out forwards';
      }
    }
  }

  function handleAction(node: Element, hint: SolaASTNode['animationHint']) {
    applyAnimationHint(node as HTMLElement | SVGElement, hint);
    return {
      update(newHint: SolaASTNode['animationHint']) {
        applyAnimationHint(node as HTMLElement | SVGElement, newHint);
      }
    };
  }
</script>

<style>
  @keyframes draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
</style>

{#snippet renderNode(node: SolaASTNode)}
  {#if node.type === 'path'}
    <path {...node.attrs} use:handleAction={node.animationHint} />
  {:else if node.type === 'circle'}
    <circle {...node.attrs} use:handleAction={node.animationHint} />
  {:else if node.type === 'rect'}
    <rect {...node.attrs} use:handleAction={node.animationHint} />
  {:else if node.type === 'line'}
    <line {...node.attrs} use:handleAction={node.animationHint} />
  {:else if node.type === 'text'}
    <text {...node.attrs} use:handleAction={node.animationHint}>{node.content || ''}</text>
  {:else if node.type === 'g'}
    <g {...node.attrs} use:handleAction={node.animationHint}>
      {#if node.children}
        {#each node.children as child}
          {@render renderNode(child)}
        {/each}
      {/if}
    </g>
  {/if}
{/snippet}

<svg
  viewBox={ast.viewBox}
  width={ast.width || '100%'}
  height={ast.height || '100%'}
  class="sola-generative-canvas"
  xmlns="http://www.w3.org/2000/svg"
>
  {#each ast.primitives as primitive}
    {@render renderNode(primitive)}
  {/each}
</svg>
