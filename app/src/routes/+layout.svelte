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

{@render children()}
