<script lang="ts">
	import 'virtual:uno.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	let { children } = $props();

	onMount(() => {
		theme.init();
		injectAnalytics();
		injectSpeedInsights();
	});
</script>

<svelte:head>
	<title>Sola</title>
	<meta name="google-site-verification" content="WcTmhJBtVJPU0tzzt4XiIY4AfSDAywCA6RTgfowxVcw" />
	<meta name="description" content="A reactive runtime and compiler for dynamic, ambient AI-driven user interfaces." />
	<meta property="og:title" content="Sola — The Ambient Intent Framework (AIR)" />
	<meta property="og:description" content="A reactive runtime and compiler for dynamic, ambient AI-driven user interfaces." />
	<meta property="og:url" content="https://sola-air.dev" />
	<meta property="og:image" content="/og-image.jpg" />
	<link rel="canonical" href="https://sola-air.dev" />
</svelte:head>

<div class="min-h-screen flex flex-col w-full transition-colors duration-200">
	{@render children()}
</div>

