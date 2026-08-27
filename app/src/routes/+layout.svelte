<script lang="ts">
	import 'virtual:uno.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { themeState, updateTheme } from '$lib/theme.svelte';

	let { children } = $props();

	onMount(() => {
		updateTheme(themeState.primary);
	});
</script>

<svelte:head>
	<title>Sola</title>
	<meta name="description" content="A reactive runtime and compiler for dynamic, ambient AI-driven user interfaces." />
	<meta property="og:title" content="Sola — The Ambient Intent Framework (AIR)" />
	<meta property="og:description" content="A reactive runtime and compiler for dynamic, ambient AI-driven user interfaces." />
	<meta property="og:url" content="https://sola-air.dev" />
	<meta property="og:image" content="/og-image.jpg" />
	<link rel="canonical" href="https://sola-air.dev" />
</svelte:head>

{@render children()}
