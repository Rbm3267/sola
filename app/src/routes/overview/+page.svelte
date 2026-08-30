<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import SolaMount from '$lib/components/SolaMount.svelte';
  import mount from '$lib/pages/Overview.sola';
</script>

<svelte:head>
  <title>Sola Overview — Zero-VDOM Intent Runtime</title>
</svelte:head>

<div class="flex flex-col w-full min-h-screen bg-[#fafafa] dark:bg-[#090d19] text-slate-900 dark:text-slate-100">
  <Navbar />
  <SolaMount component={mount} />
</div>
