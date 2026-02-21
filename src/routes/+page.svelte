<script lang="ts">
	import ResortCard from '$lib/components/ResortCard.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function handleAlertCreated() {
		// Could show a toast or navigate to alerts
	}
</script>

<div class="grid gap-8 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-slate-900">Current Conditions</h1>
			<p class="text-slate-600">Live weather data for your favorite resorts</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.conditions as { resort, weather } (resort.id)}
				<ResortCard {resort} {weather} />
			{/each}
		</div>

		{#if data.fetchedAt}
			<p class="mt-4 text-xs text-slate-500">
				Last updated: {new Date(data.fetchedAt).toLocaleString()}
			</p>
		{/if}
	</div>

	<div class="lg:col-span-1">
		<div class="sticky top-8 h-[600px]">
			<Chat onAlertCreated={handleAlertCreated} />
		</div>
	</div>
</div>
